require('dotenv').config();

module.exports = {
  s3Uploads: {
    uploaderBucket: process.env.S3_UPLOADER_BUCKET
  }
};
