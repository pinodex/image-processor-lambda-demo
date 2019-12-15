const sharp = require('sharp');

/**
 * Process image and thumbnail
 *
 * @param  {Buffer} input Input image
 * @return {Object}       Processed image and thumbnail buffers
 */
async function processImage(input) {
  let image, thumbnail;

  image = await sharp(input)
    .jpeg()
    .toBuffer();

  thumbnail = await sharp(input)
    .resize({
      width: 64,
      height: 64
    })
    .jpeg()
    .toBuffer()

  return { image, thumbnail };
}

module.exports = { processImage };
