import { type Response } from 'express'
import { ZodError, type ZodSchema } from 'zod'

export function parseBody<T>(schema: ZodSchema<T>, body: unknown, res: Response): T | null {
  try {
    return schema.parse(body)
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({
        error: 'Invalid request body',
        details: err.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      })
      return null
    }
    throw err
  }
}
