export function buildMongoUrl(params: {
  host: string;
  port: string;
  db: string;
}) {
  return `mongodb://${params.host}:${params.port}/${params.db}`;
}
