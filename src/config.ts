import dotenv from 'dotenv';

dotenv.config();

const constructConfig = () => {
  const node = process.env['NODE_ENV'] ?? 'development';
  const port = process.env['PORT'] ?? 3000;

  const mongoConfig = {
    user: process.env['MONGO_USER'],
    password: process.env['MONGO_PASSWORD'],
    host: process.env['MONGO_HOST'] ?? 'localhost',
    port: process.env['MONGO_PORT'] ?? '27017',
    db: process.env['MONGO_DB'] ?? 'todos',
  };

  return {
    node,
    isProduction: node === 'production',
    isDevelopment: node === 'development',
    port,
    mongo: mongoConfig,
    mongoUrl: `mongodb://${mongoConfig.host}:${mongoConfig.port}/${mongoConfig.db}`,
  };
};

export const validateConfig = (
  config: ReturnType<typeof constructConfig>,
  onError: () => void
) => {
  if (config.mongo.user == null || config.mongo.password == null) {
    onError();
  }
};

export const config = constructConfig();
