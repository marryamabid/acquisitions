import express from 'express';
import logger from '#config/winston.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoute from '#routes/auth.routes.js';
import { securityMiddleware } from '#middlewares/security.middleware.js';

const app = express();
app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan('combined', {
    stream: {
      write: message => logger.info(message.trim()),
    },
  })
);

app.use(securityMiddleware);
app.get('/', (req, res) => {
  logger.info('hello from acqusitions');
  res.status(200).send('hello from acqusitions');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timeStamp: Date.now().toISOString,
    uptime: process.uptime(),
  });
});
app.get('/api', (req, res) => {
  res.status(200).json({ mesage: 'acquisition api is running' });
});
app.use('/api/auth', authRoute);
export default app;
