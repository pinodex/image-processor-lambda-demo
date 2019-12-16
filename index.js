const fs = require('fs');
const crypto = require('crypto');
const { parse } = require('lambda-multipart-parser');
const { Logger, LOG_INFO, LOG_ERROR } = require('./logger');
const { processImage } = require('./processor');
const { uploadFile } = require('./uploader');

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
 * Main Entrypoint
 *
 * @param  {object} event   Event object
 * @param  {object} context Context object
 * @return {object}         Response object
 */
async function main(event, context) {
  // Create logger object with request ID as log prefix
  const logger = new Logger(context.awsRequestId);

  // Parse the incoming event to get the multipart form data
  const data = await parse(event);

  logger.log('Receiving event');

  // Get file with field name "file"
  const imageFile = data.files.find(({ fieldname }) => fieldname === 'file');

  // Generate random ID for storage
  const imageId = generateRandomId();

  logger.log(`Using generated image ID: ${imageId}`);
  logger.log(`Processing image: ${imageId}`);

  // Get image and thumbnail from the processed output
  const { image, thumbnail } = await processImage(imageFile.content);

  logger.log(`Uploading image: ${imageId}`);

  // Upload image to S3
  const imageUrl = await uploadFile(`${imageId}/image.jpg`, image, 'image/jpg');

  logger.log(`Uploading thumbnail: ${imageId}`);

  // Upload thumbnail to S3
  const thumbnailUrl = await uploadFile(`${imageId}/thumbnail.jpg`, thumbnail, 'image/jpg');

  logger.log(`Image ${imageId} upload complete`);

  // Return the S3 URLs to uploaded files
  return response({
    imageUrl,
    thumbnailUrl
  });
}

module.exports = { main };
