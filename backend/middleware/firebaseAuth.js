const admin = require('firebase-admin');
const path = require('path');
const dotenv = require('dotenv');

// Load .env if not already done
dotenv.config();

const credentialPath = process.env.GOOGLE_CREDENTIAL_PATH;
if (!credentialPath) {
  throw new Error('GOOGLE_CREDENTIAL_PATH is not set in .env');
}

const serviceAccount = require(path.resolve(__dirname, '..', credentialPath));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const verifyFirebaseToken = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
 
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

module.exports = verifyFirebaseToken;
