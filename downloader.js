const { buckets } = require('./config');
const { S3 } = require('aws-sdk');

const service = new S3();

/**
 * Download image from source s3 bucket
 *
 * @param  {string} key       S3 object key
 * @return {Buffer}
 */
async function downloadFile(key) {
  const params = {
    Bucket: buckets.sourceBucket,
    Key: key
  };

  const response = await service.getObject(params).promise();

  return response.Body;
}

module.exports = { downloadFile };
