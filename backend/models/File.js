const mongoose = require('mongoose');
const crypto = require('crypto');

const fileSchema = new mongoose.Schema({
  filename: String,
  originalname: String,
  mimetype: String,
  size: Number,
  path: String,
  userId: String,
  publicId: {
    type: String,
    unique: true,
    default: () => crypto.randomBytes(16).toString('hex')
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('File', fileSchema);
