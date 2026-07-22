import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error('❌ Error:', err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  if (err.message.includes('Unauthorized')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
    });
  }

  if (err.message.includes('Forbidden')) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden',
    });
  }

  if (err.message.includes('Not found')) {
    return res.status(404).json({
      success: false,
      error: 'Not found',
    });
  }

  return res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
}
