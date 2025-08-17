const express = require('express');
const multer = require('multer');
const matchController = require('../controllers/matchController');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory as Buffer
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
  },
  fileFilter: (req, file, cb) => {
    // Accept only JSON files
    if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
      cb(null, true);
    } else {
      cb(new Error('Only JSON files are allowed'), false);
    }
  }
});

// Routes
router.post('/upload', upload.array('files'), matchController.uploadMatches);
router.get('/tournaments', matchController.getTournaments);
router.get('/years/:tournamentName', matchController.getYears);
router.get('/matches/:tournamentName/:year', matchController.getMatches);
router.get('/matches/:tournamentName/all', matchController.getAllMatches);
router.get('/match/:id', matchController.getMatchJson);

module.exports = router;