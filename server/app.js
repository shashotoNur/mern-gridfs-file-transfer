const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const databaseURI = require('./config');

const app = express();

// Middleware
app.use(bodyParser.json());

// Create mongo connection
const connection = mongoose.connect(databaseURI,
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex:true,
    useFindAndModify: false
  })
  .then((_res) =>
  {
    // let gridfs = Grid(connection.db, mongoose.mongo);
    // gridfs.collection('uploads');
    const port = 5000;
    app.listen(port, () => console.log(`Server started on port ${port}`));
  })
  .catch((err) => console.log(err));

// Initialize storage engine
const storage = new GridFsStorage({
  url: databaseURI,
  file: (_req, file) =>
  {
    return new Promise((resolve, reject) =>
    {
      crypto.randomBytes(16, (err, buf) =>
      {
        if (err)
          return reject(err);

        const filename = buf.toString('hex') + path.extname(file.filename);
        
        const fileInfo =
        {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  },
  options: {
    useUnifiedTopology: true,
  }
});

//Access the storage engine using multer to upload files
const upload = multer({ storage });

//Initial page (loads form and uploaded files)
app.get('/', (req, res) =>
{
  gridfs.files.find().toArray((err, files) =>
  {
    if (!files || files.length === 0)
      res.render('index', { files: false });
    else
    {
      files.map(file =>
        {
          if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') file.isImage = true;
          else file.isImage = false;
        });
      return res.json({ files: files });
    }
  });
});

//Uploads file to DB
app.post('/upload', upload.single('file'), (req, res) =>
{
  res.redirect('/');
});

//Display all files in JSON
app.get('/files', (_req, res) =>
{
  gridfs.files.find().toArray((_err, files) =>
  {
    if (!files || files.length === 0)
      return res.status(404).json({err: 'No files exist'});
    return res.json(files);
  });
});

//Display single file object from DB
app.get('/files/:filename', (req, res) =>
{
  gridfs.files.findOne({ filename: req.params.filename }, (err, file) =>
  {
    if (!file || file.length === 0)
      return res.status(404).json({err: 'No file exists'});
    return res.json(file);
  });
});

//Delete file from DB
app.delete('/files/:id', (req, res) =>
{
  gridfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) =>
  {
    if (err) return res.status(404).json({ err: err });
    res.redirect('/');
  });
});