export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(code: string, message: string, statusCode = 500, details?: any) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'AppError';
  }
}

export const ErrorCodes = {
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TABLE_NOT_FOUND: 'TABLE_NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  BASEROW_ERROR: 'BASEROW_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const;

export function createErrorResponse(error: AppError): ApiError {
  return {
    code: error.code,
    message: error.message,
    details: error.details
  };
}
