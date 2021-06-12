const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const cors = require('cors');

const databaseURI = require('./config/config');
let gridfs;

const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.createConnection(databaseURI,
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex:true,
    useFindAndModify: false
  })
  .then((res) =>
  {
    gridfs = Grid(res.db, mongoose.mongo);
    gridfs.collection('uploads');
    const port = 5000;
    app.listen(port, () => console.log(`Server listening on port ${port}`));
  })
  .catch((err) => console.log(err));

const storageEngine = new GridFsStorage(
  {
    url: databaseURI,
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
    },
    options: { useUnifiedTopology: true }
  });
const upload = multer({ storage: storageEngine });

// Controllers -----------------------------------------------------------------------------
const getFiles = (_req, res) =>
{
  gridfs.files.find().toArray((err, files) =>
  {
    if (err) return res.status(500).json({ err: err });
    if (!files || files.length === 0) return res.status(200).json({ err: 'Storage is empty' });
    return res.status(200).json({ files: files });
  });
};

const uploadResponse = (req, res) =>
{
  const filename = req.file.filename;
  const id = req.file.id;
  return res.status(200).json({ filename, id });
}

const downloadOrDelete = (req, res) =>
{
  if(req.body.delete)
  {
    gridfs.remove({ _id: req.params.id, root: 'uploads' }, (err) =>
    {
      if (err) return res.status(404).json({ err: err });
      return res.status(200).json({ msg: 'File Deleted'});
    });
  }
  else
  {
    gridfs.files.findOne({ filename: req.params.id }, (err, file) =>
    {
      if (err) return res.status(500).json({ err: err });
      if (!file || file.length === 0) return res.status(404).json({ err: 'No file exists' });

      const fileStream = gridfs.createReadStream(file.filename);
      fileStream.pipe(res);
    });
  }
}

// Routes ----------------------------------------------------------------------------------
app.get('/', getFiles);
app.post('/', upload.single('file'), uploadResponse);
app.post('/:id', downloadOrDelete);