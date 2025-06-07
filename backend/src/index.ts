// backend/src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import './config/db';

import authRoutes from './routes/authRoutes';
import candidateRoutes from './routes/candidateRoutes';
import jobPostingRoutes from './routes/jobPostingRoutes';
import companyPolicyRoutes from './routes/companyPolicyRoutes';
import aiTaskRoutes from './routes/aiTaskRoutes';
import onboardingItemRoutes from './routes/onboardingItemRoutes';
import offboardingCaseRoutes from './routes/offboardingCaseRoutes';
import clientSubscriptionRoutes from './routes/clientSubscriptionRoutes';
import supportQueryRoutes from './routes/supportQueryRoutes';
import aiRoutes from './routes/aiRoutes'; // Import AI routes

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('HR IntelliHub Backend is running!');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/jobpostings', jobPostingRoutes);
app.use('/api/policies', companyPolicyRoutes);
app.use('/api/aitasks', aiTaskRoutes);
app.use('/api/onboardingitems', onboardingItemRoutes);
app.use('/api/offboardingcases', offboardingCaseRoutes);

// Admin specific routes
app.use('/api/admin/subscriptions', clientSubscriptionRoutes);
app.use('/api/admin/supportqueries', supportQueryRoutes);

// AI routes
app.use('/api/ai', aiRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
