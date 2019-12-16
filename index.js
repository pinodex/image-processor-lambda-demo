const fs = require('fs');
const crypto = require('crypto');
const { parse } = require('lambda-multipart-parser');
const { Logger, LOG_INFO, LOG_ERROR } = require('./logger');
const { processImage } = require('./processor');
const { uploadFile } = require('./uploader');
const { downloadFile } = require('./downloader');

const SOURCE_S3 = 's3';
const SOURCE_GATEWAY = 'gateway';

/**
 * Create response object
 *
 * @param  {object} body       Response body
 * @param  {number} statusCode HTTP status code
 * @return {object}
 */
function response(body, statusCode = 200) {
  return {
    statusCode,
    body: JSON.stringify(body)
  }
}

/**
 * Generates random ID
 *
 * @return {string}
 */
function generateRandomId() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Determine trigger source
 *
 * @param  {object} event Event object
 * @return {string}       Trigger source
 */
function getTriggerSource(event) {
  // Discriminate against S3 trigger source
  if (typeof event.Records !== 'undefined'
      && event.Records.length > 0
      && event.Records[0].eventSource === 'aws:s3') {

      return SOURCE_S3;
  }

  // Discriminate against API Gateway trigger source
  if (typeof event.headers !== 'undefined'
      && typeof event.path !== 'undefined'
      && typeof event.httpMethod !== 'undefined') {

      return SOURCE_GATEWAY;
  }

  return null;
}

/**
 * Invoke processing of uploaded image
 *
 * @param  {Buffer} file File buffer
 * @return {object}      Processed URLs
 */
async function invokeProcessing(imageId, file) {
  // Get image and thumbnail from the processed output
  const { image, thumbnail } = await processImage(file);

  // Upload image to S3
  const imageUrl = await uploadFile(`${imageId}/image.jpg`, image, 'image/jpg');

  // Upload thumbnail to S3
  const thumbnailUrl = await uploadFile(`${imageId}/thumbnail.jpg`, thumbnail, 'image/jpg');

  // Return the S3 URLs to uploaded files
  return {
    image: {
      url: imageUrl
    },

    thumbnail: {
      url: thumbnailUrl
    }
  };
}

/**
 * Main Entrypoint
 *
 * @param  {object} event   Event object
 * @param  {object} context Context object
 * @return {object}         Response object
 */
async function main(event, context) {
  // Create logger object with request ID as log prefix
  const logger = new Logger(context.awsRequestId);

  logger.log('Receiving event');

  // Determine trigger source to use the correct handler for the trigger
  const triggerSource = getTriggerSource(event);
  logger.log(`Trigger source is: ${triggerSource}`);

  // Generate random ID for storage
  const imageId = generateRandomId();
  logger.log(`Generated image ID is: ${imageId}`);

  let imageFile = null;

  switch (triggerSource) {
    case SOURCE_GATEWAY:
      // Parse the incoming event to get the multipart form data
      const data = await parse(event);

      // Get file with field name "file"
      imageFile = data.files.find(({ fieldname }) => fieldname === 'file').content;

      break;

    case SOURCE_S3:
      // Get the uploaded file from the source bucket
      imageFile = await downloadFile(event.Records[0].s3.object.key);

      break;
  }

  logger.log(`Processing image ${imageId}...`);

  const output = await invokeProcessing(imageId, imageFile);

  logger.log(`Image ${imageId} processing complete`);

  // Return the S3 URLs to uploaded files
  return response(output);
}

module.exports = { main };
