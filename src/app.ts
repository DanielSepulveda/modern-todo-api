import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

export const app = express();

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());

app.get('/', (req, res) => {
  res.send({ hello: 'world' });
});
