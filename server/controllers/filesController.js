const gridfs = require('../app');

const getFiles = (_req, res) =>
{
  gridfs.files.find().toArray((err, files) =>
  {
    if(err) console.log(err);
    if (!files || files.length === 0) return res.status(404).json({err: 'No files exist'});
    return res.json(files);
  });
}

const getFile = (req, res) =>
{
  gridfs.files.findOne({ filename: req.params.filename }, (err, file) =>
  {
    if(err) console.log(err);
    if (!file || file.length === 0) return res.status(404).json({err: 'No file exists'});

    const readstream = gridfs.createReadStream(file.filename);
    readstream.pipe(res);
    //return res.json(file);
  });
}

const deleteFile = (req, res) =>
{
  gridfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) => {
    if (err) return res.status(404).json({ err: err });
    res.redirect('/');
  });
}

module.exports = { getFiles, getFile, getImage, deleteFile };