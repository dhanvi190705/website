import 'dotenv/config';

const toList = (value) =>
  String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: toList(process.env.CORS_ORIGIN || 'http://localhost:5173'),
  databaseUrl: process.env.DATABASE_URL || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  assistantModel: process.env.ASSISTANT_MODEL || 'claude-sonnet-4-5',
};

/** With no DATABASE_URL the service layer serves the bundled seed dataset. */
export const usePrisma = Boolean(env.databaseUrl);

export default env;
