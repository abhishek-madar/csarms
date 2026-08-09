let app;
let connectDB;
let initialized = false;

module.exports = async (req, res) => {
  // Health check — minimal, no dependencies
  if (req.url === '/api/health') {
    try {
      return res.status(200).json({
        status: 'ok',
        initialized,
        env: {
          hasMongo: !!process.env.MONGODB_URI,
          hasJwt: !!process.env.JWT_SECRET,
          nodeVersion: process.version
        }
      });
    } catch (e) {
      return res.end(JSON.stringify({ error: e.message }));
    }
  }

  // Lazy load everything on first real request
  if (!initialized) {
    try {
      connectDB = require('../config/db');
      await connectDB();
      app = require('../app');
      initialized = true;
    } catch (err) {
      console.error('Initialization failed:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        error: 'Initialization failed',
        message: err.message
      }));
    }
  }

  return app(req, res);
};

// Disable body parsing for Vercel functions to allow multer to handle multipart/form-data
module.exports.config = {
  api: {
    bodyParser: false,
  },
};
