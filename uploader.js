const { buckets } = require('./config');
const { S3 } = require('aws-sdk');

const service = new S3();

/**
 * Upload image to sink s3 bucket
 *
 * @param  {string} key       S3 object key
 * @param  {Buffer} file      File buffer
 * @param  {string} mimeType  Mime type
 * @return                    Pre-signed URL for the uploaded S3 object
 */
async function uploadFile(key, file, mimeType) {
  const params = {
    Bucket: buckets.sinkBucket,
    Key: key
  };

  await service.putObject({
    ...params,
    Body: file,
    ContentType: mimeType
  }).promise();

  return service.getSignedUrl('getObject', params);
}

module.exports = { uploadFile };
