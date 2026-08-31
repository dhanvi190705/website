import { HttpError } from '../lib/errors.js';
import { env } from '../lib/env.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
}

// eslint-disable-next-line no-unused-vars -- Express identifies error middleware by arity.
export function errorHandler(err, req, res, next) {
  const status = err instanceof HttpError ? err.status : 500;

  if (status >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}`, err);
  }

  res.status(status).json({
    error: status >= 500 && env.nodeEnv === 'production' ? 'Internal server error' : err.message,
    ...(err.details ? { details: err.details } : {}),
  });
}
