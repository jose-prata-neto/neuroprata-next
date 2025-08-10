import { type AppErrorCode, AppErrorHttpStatusMap } from './status';

interface AppErrorOptions {
  code: AppErrorCode;
  message?: string;
  cause?: unknown;
  meta?: Record<string, unknown>;
  resource?: string;
  resourceId?: string;
  field?: string;
  expected?: string;
  actual?: string;
}

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly httpStatus: number;
  readonly cause?: unknown;
  readonly meta?: Record<string, unknown>;
  readonly resource?: string;
  readonly resourceId?: string;
  readonly field?: string;
  readonly expected?: string;
  readonly actual?: string;
  readonly name = 'AppError';

  constructor(opts: AppErrorOptions) {
    const defaultMessage = AppError.buildDefaultMessage(opts);
    super(defaultMessage);

    this.httpStatus = AppErrorHttpStatusMap[opts.code];
    this.code = opts.code;
    this.cause = opts.cause;
    this.resource = opts.resource;
    this.resourceId = opts.resourceId;
    this.field = opts.field;
    this.expected = opts.expected;
    this.actual = opts.actual;
    this.meta = AppError.buildMeta(opts);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  private static buildDefaultMessage(
    opts: AppErrorOptions
  ): string | undefined {
    if (opts.message) {
      return opts.message;
    }

    if (opts.field && opts.expected && opts.actual) {
      return `Invalid value for '${opts.field}': expected ${opts.expected}, got ${opts.actual}`;
    }

    if (opts.resource && opts.resourceId) {
      return `Operation failed on ${opts.resource} with id '${opts.resourceId}'`;
    }

    if (opts.resource) {
      return `Operation failed on ${opts.resource}`;
    }

    return;
  }

  private static buildMeta(
    opts: AppErrorOptions
  ): Record<string, unknown> | undefined {
    const newMeta: Record<string, unknown> = {};

    if (opts.resource) {
      newMeta.resource = opts.resource;
    }
    if (opts.resourceId) {
      newMeta.resourceId = opts.resourceId;
    }
    if (opts.field) {
      newMeta.field = opts.field;
    }
    if (opts.expected) {
      newMeta.expected = opts.expected;
    }
    if (opts.actual) {
      newMeta.actual = opts.actual;
    }

    if (opts.meta) {
      return { ...newMeta, ...opts.meta };
    }

    if (Object.keys(newMeta).length > 0) {
      return newMeta;
    }

    return;
  }

  toJSON() {
    return {
      name: this.name,
      httpStatus: this.httpStatus,
      code: this.code,
      message: this.message,
      ...(this.resource ? { resource: this.resource } : {}),
      ...(this.resourceId ? { resourceId: this.resourceId } : {}),
      ...(this.field ? { field: this.field } : {}),
      ...(this.expected ? { expected: this.expected } : {}),
      ...(this.actual ? { actual: this.actual } : {}),
      ...(this.meta ? { meta: this.meta } : {}),
      ...(this.cause
        ? {
            cause:
              this.cause instanceof Error
                ? {
                    name: (this.cause as Error).name,
                    message: (this.cause as Error).message,
                  }
                : this.cause,
          }
        : {}),
    };
  }

  static from(
    error: unknown,
    defaultCode: AppErrorCode = 'INTERNAL_SERVER_ERROR'
  ): AppError {
    if (error instanceof AppError) {
      return error;
    }

    const message =
      error instanceof Error ? error.message : String(error ?? 'Unkown error');

    return new AppError({ code: defaultCode, message, cause: error });
  }
}
