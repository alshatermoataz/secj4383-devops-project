import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Load environment variables
dotenv.config();

// Firebase Admin initialization (using the provided Firebase service account JSON)
const firebaseServiceAccount = {
    "type": "service_account",
    "project_id": "altf4riends-sc-3fd4a",
    "private_key_id": "0958388d7ef7ca35212360bde4888065f8084d6d",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCoAsqII3WMWt8d\nEvTrsA8vhMAKdR6QeusYKKirftCbBue/yUfIGlarBDnfWY2NbGX6UAeMKTLVY0E7\nWwcILtyEyhLb+3wA22HSnyzj9cHCGrWVY70GAjtzU3YOw5DKMu/sAk6VpPY8J7zw\nfoYODEwgZFmkJU0Mqp4upRYIgZvpjsyC8NhG5RtQ9tws8BrUa+jixQcp7JsSMqJf\nzOroeJHGRpt1L4l5euLVzG0BI24SE1s2NE4jlUMQ9TjNQrEuje2PI9T8kPTx7KPD\nKeKLflOM4Qgb4vebJ6syRY4+WYu8ZgtNL5HOCoAH6EcePbZOslGbqhbSOr4xC49T\nN4Rvi5HbAgMBAAECggEAGnGOBQ1ns/adhUr1h58HVNhVDZBPhjgChqPnoE5ucOgO\nU85PYPxcRcB9h1zl/athBZvRBEt7t8BOhRQXsD8H8FKJ01vqsYvWAruQ6jRFEdL4\nX5H6L1bsmoM5Yqt/P4Py5TebvMvhAajTgRq46L8gwDxrK32/ec3k5byQEjisHH9e\nrEnB1OPrqvO67BvhgUpfne5FzDGGNi3r+RvzIyNswWgHy57AMlHK9tXwR4FCKa5L\nPPHUmJ/QLMRYrmqtbKOZY+f6h9tGXtJS2H4kN5GTHsFwBGyKSs1AKVFKzQJcc5+1\nZ4CNHOupjz27d+EPB6bpmahYrksXcso3rURm/sDJwQKBgQDlhOIYle4CG0lYEHpm\nVrE9YFF2Pw7s6Zinm0zlRjnv1aVbj//I8nqSDlbvU+ANEC5TYTj+kroIAGKIWq6Y\n6aeluWF1+Gx62Nnlj3TQyDpXd1rtrku2KsNZnC1uKNbj1T6slGuLekWbGaxqFjFG\nCxlJ7Dc38uE4D5nWieSc9oVnIQKBgQC7ZTEFESRaYrAsuu3Vt+5RqPjYwTAqgVkg\nMVR1vEozVE4g2ziK0aebsJQ2iWmOv7fJ+qEVSAePoX+eIznJBEW0uY59fz7nGOHb\n/Qh3QG3WATVswOqm4zAAtuSGef7PXUJ+4YSyukx9N7afHp6+henbUi7ilE4W0ucg\nEV6DOmNlewKBgQCeazjvxVSxiYn3SfBiAMZ3WasAlgfESHwAe/X4bp+AxhNLfroL\nRiqJ83HX4SnNenSvQnTnafkTmshn20eV7fi0L59woNaneFP12i3ECeATDSPq2BoU\nE7IggObumSuxuDd5QTx12iB/LJpP4x+BfBmpZ2y5pmADpOkHJshv+swbYQKBgFuY\nNWKVo2AudpAWeiOJOIpffepsWv+bo5WRpwe5FceLAHkczcFEgpkdsQQLHDYyzUGD\nKHL/dvqkZH1GGHuBhBS20cfTh0prphHh1t569nSwuI1Eqi0SRKdEveRhAsQWgGcG\nEddOKg7WSYPy8oKLb+fMfrAu7xBG28OX2ctooaa7AoGAQU+Qda6WTOtTsKJh5Dro\nTBL65ygd+4U6Tt9shpe1PImC6l7I6CAr1Wu98B/EeN+rJa9gnR/PHmp3Cge1e/+o\nknwnfWT9eK558xeIOpYp4mY3sEYQsUJqZSerXGzc1tWsfY4aZYrmV7jEQCGe0w2Y\nyHeo+qd4xyVud1646UXtA40=\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-fbsvc@altf4riends-sc-3fd4a.iam.gserviceaccount.com",
    "client_id": "118371034237567339923",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40altf4riends-sc-3fd4a.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
} as admin.ServiceAccount;

admin.initializeApp({
  credential: admin.credential.cert(firebaseServiceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

// Initialize Firestore
export const db = getFirestore();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());

// Routes
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import userRoutes from './routes/users';

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 