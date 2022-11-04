const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const fileController = require('../controllers/fileController');

const router = express.Router();

router.post('', authMiddleware, fileController.createDir);
router.get('', authMiddleware, fileController.getFile);

module.exports = router;
