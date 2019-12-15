require('dotenv').config();

module.exports = {
  awsKey: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },

  s3: {
    uploaderBucket: process.env.S3_UPLOADER_BUCKET
  }
};
