const mongoose = require('mongoose');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// File model
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

const File = mongoose.model('File', fileSchema);

// Update existing files
async function updateExistingFiles() {
  try {
    const filesWithoutPublicId = await File.find({ publicId: { $exists: false } });
    
    for (const file of filesWithoutPublicId) {
      file.publicId = crypto.randomBytes(16).toString('hex');
      await file.save();
      console.log(`Updated file: ${file.originalname} with publicId: ${file.publicId}`);
    }
    
    console.log(`Updated ${filesWithoutPublicId.length} files`);
  } catch (error) {
    console.error('Error updating files:', error);
  } finally {
    mongoose.connection.close();
  }
}

updateExistingFiles(); 