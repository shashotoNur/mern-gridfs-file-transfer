const path = require('path');
const crypto = require('crypto');

const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');

const dbURI = require('../config');

// Initialize storage engine
const storage = new GridFsStorage(
    {
      url: dbURI,
      file: (_req, file) =>
      {
        return new Promise((resolve, reject) =>
        {
          crypto.randomBytes(16, (err, buf) =>
          {
            if (err) return reject(err);
    
            const filename = buf.toString('hex') + path.extname(file.originalname);
            const fileInfo =
            {
              filename: filename,
              bucketName: 'uploads'
            };

            resolve(fileInfo);
          });
        });
      }
    });

// Upload files to the storage engine using multer
const upload = multer({ storage });
const uploadFile = (_req, res) =>
{
    upload.single('file');
    return res.status(200);
}

module.exports = uploadFile ;