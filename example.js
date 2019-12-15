const fs = require('fs');
const crypto = require('crypto');
const { uploadFile } = require('./uploader');
const { processImage } = require('./processor');

function generateRandomId() {
  return crypto.randomBytes(16).toString('hex');
}

async function main() {
  const file = fs.readFileSync('...');
  const id = generateRandomId();

  const { image, thumbnail } = await processImage(file);

  const imageUrl = await uploadFile(`${id}/image.jpg`, image, 'image/jpg');
  const thumbnailUrl = await uploadFile(`${id}/thumbnail.jpg`, thumbnail, 'image/jpg');

  console.log(imageUrl, thumbnailUrl);
}

main();
