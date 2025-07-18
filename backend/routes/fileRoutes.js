const express = require('express');
const multer = require('multer');
const File = require('../models/File');
const verifyFirebaseToken = require('../middleware/firebaseAuth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

router.post('/upload', verifyFirebaseToken, upload.single('file'), async (req, res) => {
  const file = new File({
    filename: req.file.filename,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: req.file.path,
    userId: req.user.uid
  });

  await file.save();
  res.status(201).json(file);
});

router.get('/', verifyFirebaseToken, async (req, res) => {
  const files = await File.find({ userId: req.user.uid });
  res.json(files);
});

router.get('/download/:id', verifyFirebaseToken, async (req, res) => {
  const file = await File.findById(req.params.id);
  if (!file || file.userId !== req.user.uid) {
    return res.status(403).json({ error: 'Access denied' });
  }
  res.download(file.path, file.originalname);
});

module.exports = router;
