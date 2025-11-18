export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'APP_ERROR',
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Não autenticado') {
    super(message, 'UNAUTHORIZED', 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Acesso negado') {
    super(message, 'FORBIDDEN', 403)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso não encontrado') {
    super(message, 'NOT_FOUND', 404)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message, 'VALIDATION_ERROR', 400)
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Muitas requisições. Tente novamente mais tarde.') {
    super(message, 'RATE_LIMIT', 429)
  }
}

export class InsufficientCreditsError extends AppError {
  constructor(
    message: string = 'Créditos insuficientes',
    public required: number = 0,
    public available: number = 0
  ) {
    super(message, 'INSUFFICIENT_CREDITS', 402)
  }
}

export class ExternalAPIError extends AppError {
  constructor(
    message: string,
    public service: string,
    public originalError?: any
  ) {
    super(message, 'EXTERNAL_API_ERROR', 502)
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Erro de banco de dados', public originalError?: any) {
    super(message, 'DATABASE_ERROR', 500, false)
  }
}

export class ConfigError extends AppError {
  constructor(message: string = 'Erro de configuração') {
    super(message, 'CONFIG_ERROR', 500, false)
  }
}
