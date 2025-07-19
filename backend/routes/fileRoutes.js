const express = require('express');
const multer = require('multer');
const File = require('../models/File');
const verifyFirebaseToken = require('../middleware/firebaseAuth');
const fs = require('fs');
const path = require('path');

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

// Delete a single file
router.delete('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    if (file.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Delete the physical file from filesystem
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    
    // Delete the file record from database
    await File.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Bulk delete files
router.delete('/bulk', verifyFirebaseToken, async (req, res) => {
  try {
    const { fileIds } = req.body;
    
    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ error: 'File IDs array is required' });
    }
    
    // Find all files that belong to the user
    const files = await File.find({
      _id: { $in: fileIds },
      userId: req.user.uid
    });
    
    if (files.length === 0) {
      return res.status(404).json({ error: 'No files found to delete' });
    }
    
    // Delete physical files from filesystem
    files.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });
    
    // Delete file records from database
    await File.deleteMany({
      _id: { $in: fileIds },
      userId: req.user.uid
    });
    
    res.json({ 
      message: `${files.length} file(s) deleted successfully`,
      deletedCount: files.length
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ error: 'Failed to delete files' });
  }
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
