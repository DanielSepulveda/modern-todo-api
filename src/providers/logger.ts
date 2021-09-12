import pino from 'pino';
import { config } from '../config';

const Logger = pino({
  prettyPrint: config.isDevelopment,
  level: config.isDevelopment ? 'trace' : 'info',
});

export { Logger };
