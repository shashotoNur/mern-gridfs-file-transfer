const home = (_req, res) =>
{
  gridfs.files.find().toArray((err, files) =>
  {
    if (err) console.log(err);
    if (!files || files.length === 0) res.json({ files: null });
    else
    {
      files.map(file =>
        {
          file.isImage = (file.contentType === 'image/jpeg' || file.contentType === 'image/png')
                        ? true
                        : false;
        });
      res.json({ files: files });
    }
  });
}

module.exports = home;