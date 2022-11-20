const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const fileController = require('../controllers/fileController');

const router = express.Router();

router.post('', authMiddleware, fileController.createDir);
router.post('/upload', authMiddleware, fileController.uploadFile);
router.get('', authMiddleware, fileController.getFile);
router.get('/download', authMiddleware, fileController.downloadFile);
router.delete('/', authMiddleware, fileController.deleteFile);

module.exports = router;
