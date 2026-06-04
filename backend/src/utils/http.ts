import { Response } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
  };
}

export function ok<T>(res: Response, data: T, statusCode = 200): Response {
  return res.status(statusCode).json({
    success: true,
    data,
  } as ApiResponse<T>);
}

export function fail(res: Response, error: string, code?: string, statusCode = 400): Response {
  return res.status(statusCode).json({
    success: false,
    error,
    code,
  });
}

export function paginated<T>(res: Response, data: T[], page: number, perPage: number, total: number, statusCode = 200): Response {
  return res.status(statusCode).json({
    success: true,
    data,
    pagination: { page, perPage, total },
  } as PaginatedResponse<T>);
}
