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

// Public file download route (no authentication required)
router.get('/public/:publicId', async (req, res) => {
  try {
    const file = await File.findOne({ publicId: req.params.publicId });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.download(file.path, file.originalname);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get public link for a file
router.get('/public-link/:id', verifyFirebaseToken, async (req, res) => {
  const file = await File.findById(req.params.id);
  if (!file || file.userId !== req.user.uid) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const publicUrl = `${req.protocol}://${req.get('host')}/api/files/public/${file.publicId}`;
  res.json({ publicUrl, publicId: file.publicId });
});

module.exports = router;
