import { AppError, DatabaseError } from './errors'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'

export type ActionResult<T = any> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }

export function handleActionError(error: unknown): ActionResult {
  console.error('[Action Error]:', error)

  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      code: error.code
    }
  }

  if (error instanceof ZodError) {
    const firstError = error.errors[0]
    return {
      success: false,
      error: firstError.message,
      code: 'VALIDATION_ERROR'
    }
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return {
          success: false,
          error: 'Registro duplicado. Este item já existe.',
          code: 'DUPLICATE_ERROR'
        }
      case 'P2025':
        return {
          success: false,
          error: 'Registro não encontrado.',
          code: 'NOT_FOUND'
        }
      default:
        return {
          success: false,
          error: 'Erro ao acessar o banco de dados.',
          code: 'DATABASE_ERROR'
        }
    }
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: error.message || 'Erro inesperado.',
      code: 'INTERNAL_ERROR'
    }
  }

  return {
    success: false,
    error: 'Erro inesperado. Tente novamente.',
    code: 'UNKNOWN_ERROR'
  }
}

export async function safeAction<T>(
  action: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const data = await action()
    return { success: true, data }
  } catch (error) {
    return handleActionError(error)
  }
}
