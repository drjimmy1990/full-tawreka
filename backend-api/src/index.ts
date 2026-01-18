import dotenv from 'dotenv';
dotenv.config(); // Load env vars before other imports

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
// v2.1 - Force restart at 2026-01-18 23:15 - Updated geoController with is_available flag
import apiRoutes from './routes/api'; // <--- Import Routes

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Mount the API Routes
app.use('/api', apiRoutes); // <--- Use Routes

// Basic Health Check
app.get('/', (req, res) => {
    res.send('Geo-Aware RMS Backend is Running');
});

app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 Server listening on http://0.0.0.0:${PORT}`);
});
