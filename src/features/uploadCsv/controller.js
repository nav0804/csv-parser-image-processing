const { Request, Response, NextFunction } = require('express');
const { BadRequestError } = require('../../lib/Errors');
const UploadService = require('./service');

class UploadController {
  constructor() {
    this.uploadService = new UploadService();
    this.uploadCSV = this.uploadCSV.bind(this);
    this.status = this.status.bind(this);
  }

  async uploadCSV(req, res, next) {
    console.log('📂 File received:', req.file);
    console.log('📦 Request body:', req.body);
    console.log('📁 Request headers:', req.headers);

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'File not found' });
      }

      // Validate file type
      if (req.file.mimetype !== 'text/csv') {
        return res.status(400).json({ error: 'Invalid file type. Only CSV files are allowed.' });
      }

      const requestId = await this.uploadService.upload(req.file);
      res.status(201).json({ requestId });
    } catch (err) {
      next(err);
    }
  }


  async status(req, res, next) {
    const { reqId } = req.params;
    try {
      const result = await this.uploadService.status(reqId);
      res.status(202).json({ result });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UploadController();
