const { Router } = require('express');

const home = require('../controllers/home');
const uploadFile = require('../controllers/uploadFile');
const { getFiles, getFile, getImage, deleteFile } = require('../controllers/filesController');

const router = Router();

router.get('/', home);
router.post('/upload', uploadFile);

router.get('/files', getFiles);
router.get('/files/:filename', getFile);
router.get('/image/:filename', getImage);
router.post('/files/:id', deleteFile);

module.exports = router;