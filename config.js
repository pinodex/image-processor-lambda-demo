require('dotenv').config();

module.exports = {
  buckets: {
    sourceBucket: process.env.S3_SOURCE_BUCKET,
    sinkBucket: process.env.S3_SINK_BUCKET
  }
};
