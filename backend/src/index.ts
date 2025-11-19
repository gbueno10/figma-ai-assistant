import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import designRoutes from './routes/designRoutes';
import imageRoutes from './routes/imageRoutes';
import driveRoutes from './routes/driveRoutes';

const app = express();

const configuredOrigins = process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()).filter(Boolean);

app.use((req, _res, next) => {
  console.log(`[HTTP] ${req.method} ${req.originalUrl} (origin: ${req.headers.origin ?? 'unknown'})`);
  next();
});

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Figma plugins send origin as 'null' string, so we need to allow it
    if (!origin || origin === 'null') {
      return callback(null, true);
    }

    const normalizedOrigin = origin;

    if (!configuredOrigins || configuredOrigins.length === 0) {
      // Default: allow localhost and HTTPS origins
      if (normalizedOrigin.startsWith('http://localhost') || normalizedOrigin.startsWith('https://localhost') || normalizedOrigin.startsWith('https://')) {
        return callback(null, true);
      }
      return callback(null, false);
    }

    if (configuredOrigins.includes('*')) {
      return callback(null, true);
    }

    if (configuredOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    callback(null, false);
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/design', designRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/drive', driveRoutes);

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Backend error:', error);
  if (error instanceof Error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = Number(process.env.PORT) || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Figma AI Assistant backend listening on port ${PORT}`);
  });
}

export default app;
