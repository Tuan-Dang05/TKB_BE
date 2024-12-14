const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const upload = require('../config/multer');

router.post('/upload-timetable', upload.single('file'), timetableController.uploadTimetable);
router.get('/timetable', timetableController.getTimetable);

module.exports = router;