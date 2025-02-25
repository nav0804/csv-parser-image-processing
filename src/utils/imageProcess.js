const axios = require('axios');
const sharp = require('sharp');

async function compressImage(imageUrl) {
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data, 'binary');
  const compressedImage = await sharp(buffer).jpeg({ quality: 50 }).toBuffer();
  return compressedImage;
}

module.exports = { compressImage };
