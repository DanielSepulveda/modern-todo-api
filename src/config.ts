import nconf from 'nconf';
import { buildMongoUrl } from './db';

nconf
  .argv() // loads from process.argv
  .env() // loads from process.env
  .file('../config.json');

nconf.required(['MONGO_USER', 'MONGO_PASSWORD']);

nconf.defaults({
  NODE_ENV: 'development',
  PORT: 3000,
  MONGO_HOST: 'localhost',
  MONGO_PORT: '27017',
  MONGO_DB: 'todos',
});

const constructConfig = () => {
  const node = nconf.get('NODE_ENV');
  const port = nconf.get('PORT');

  const mongoConfig = {
    user: nconf.get('MONGO_USER'),
    password: nconf.get('MONGO_PASSWORD'),
    host: nconf.get('MONGO_HOST'),
    port: nconf.get('MONGO_PORT'),
    db: nconf.get('MONGO_DB'),
  };

  return {
    node,
    isProduction: node === 'production',
    isDevelopment: node === 'development',
    port,
    mongo: mongoConfig,
    mongoUrl: buildMongoUrl({
      host: String(mongoConfig.host),
      port: String(mongoConfig.port),
      db: String(mongoConfig.db),
    }),
  };
};

export const config = constructConfig();
