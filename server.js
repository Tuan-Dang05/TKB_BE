require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDatabase } = require('./config/database');
const timetableRoutes = require('./routes/timetableRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối database
connectDatabase();

// Routes
app.use('/api', timetableRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại cổng ${PORT}`);
});