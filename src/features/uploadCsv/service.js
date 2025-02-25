const { Product } = require('../../models/Product');
const { Request } = require('../../models/Request');
const fs = require('fs');
const csv = require('csv-parser');
const { v4: uuidv4 } = require('uuid');
const { BadRequestError } = require('../../lib/Errors');
const { triggerWebhook } = require('../../utils/webTrigger');
const path = require('path');
const { createObjectCsvWriter: createCsvWriter } = require('csv-writer');
const validator = require('validator');

class UploadService {
  async upload(file) {
    const requestId = uuidv4();
    await Request.create({ id: requestId, status: 'PENDING' });
    const products = await this.parseCSV(file.path);

    for (const product of products) {
      console.log('Inserting Product:', {
        requestId,
        serialNumber: product.serialNumber,
        productName: product.productName,
        inputImageUrls: product.inputImageUrls.join(','),
      });
      
      await this.processImages(product);
      const newProduct = await Product.create({
        requestId,
        serialNumber: product.serialNumber,
        productName: product.productName,
        inputImageUrls: product.inputImageUrls.join(','),
      });
      await this.webhookTrigger(requestId, newProduct);
    }
    try {
      await triggerWebhook('https://webhook.site/06493294-b4da-46d6-920c-9cacfd6c6d47', { requestId, status: 'COMPLETED' });
    } catch (error) {
      console.error('🚨 Webhook Trigger Failed:', error);
    }

    return requestId;
  }

  async processImages(product) {
    for (const imageUrl of product.inputImageUrls) {
      try {
        console.log(`Processing image URL: ${imageUrl}`);
        if (!this.isValidUrl(imageUrl)) {
          console.warn(`Skipping invalid URL: ${imageUrl}`);
          continue;
        }
        // Compress the image
        // const x = await compressImage(imageUrl);
        // This will be done once we get an actual blob storage so that the image gets uploaded there.
        // await this.uploadToStorage(x);
      } catch (error) {
        console.error(`Error processing image ${imageUrl}:`, error);
      }
    }
  }

  async generateOutputCSV(requestId, outputData) {
    const outputFilePath = path.join(__dirname, `../../outputs/output_${requestId}.csv`);
    const csvWriter = createCsvWriter({
      path: outputFilePath,
      header: [
        { id: 'serialNumber', title: 'S. No.' },
        { id: 'productName', title: 'Product Name' },
        { id: 'inputImageUrls', title: 'Input Image Urls' },
        { id: 'outputImageUrls', title: 'Output Image Urls' },
      ],
    });
    await csvWriter.writeRecords(outputData);
    console.log(`Output CSV generated successfully at ${outputFilePath}`);
  }

  generateOutputImageUrl(inputUrl) {
    console.log('Processing URL:', inputUrl);
    return inputUrl.replace(/(public-image-)(url\d+)/, '$1output-$2');
  }

  async generateOutputData(requestId) {
    const products = await Product.findAll({ where: { requestId } });
    return products.map((product) => ({
      serialNumber: product.serialNumber,
      productName: product.productName,
      inputImageUrls: product.inputImageUrls,
      outputImageUrls: product.outputImageUrls,
    }));
  }

  async parseCSV(filePath) {
    const products = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          try {
            console.log('CSV Row:', row);
            const serialNumber = parseInt(row['S.No.'] || row['S. No.'] || row['Serial Number']);
            const productName = row['Product Name'];
            const inputImageUrls = Array.isArray(row['Input Image Urls'])
              ? row['Input Image Urls']
              : row['Input Image Urls'].split(',').map((url) => url.trim()).filter((url) => url.length > 0);

            if (isNaN(serialNumber) || !productName || inputImageUrls.length === 0) {
              console.warn('Skipping invalid row:', row);
              return;
            }
            
            console.log('Parsed Product:', { serialNumber, productName, inputImageUrls });
            products.push({ serialNumber, productName, inputImageUrls });
          } catch (err) {
            console.error('Error parsing row:', err);
          }
        })
        .on('end', () => resolve(products))
        .on('error', (error) => reject(error));
    });
  }

  async status(reqId) {
    const existingStatus = await Request.findOne({ where: { id: reqId } });
    if (!existingStatus) {
      throw new BadRequestError('No status found');
    }
    return existingStatus;
  }

  isValidUrl(url) {
    return validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true });
  }

  async webhookTrigger(requestId, product) {
    const existingStatus = await Request.findOne({ where: { id: requestId } });
    if (!existingStatus) {
      throw new BadRequestError('Status not found');
    }

    const inputImageUrls = Array.isArray(product.inputImageUrls)
      ? product.inputImageUrls
      : product.inputImageUrls.split(',').map((url) => url.trim());
    
    const outputImageUrls = inputImageUrls.map((imageUrl) => this.generateOutputImageUrl(imageUrl));
    product.set({ outputImageUrls: outputImageUrls.join(',') });
    await product.save();

    const outputData = await this.generateOutputData(requestId);
    await this.generateOutputCSV(requestId, outputData);
    
    existingStatus.status = 'COMPLETED';
    await existingStatus.save();
    
    
  }
}

module.exports = UploadService;
