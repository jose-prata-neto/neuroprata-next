import { AppError } from './app-error';

export const AppErrorFactory = {
  userAlreadyExists(email: string) {
    return new AppError({
      code: 'CONFLICT',
      message: `User with email ${email} already exists`,
      resource: 'user',
      field: 'email',
      actual: email,
      expected: 'unique email',
    });
  },

  invalidCredentials() {
    return new AppError({
      code: 'UNAUTHORIZED',
      message: 'Invalid email or password',
      resource: 'auth',
    });
  },

  unauthorized(action?: string) {
    return new AppError({
      code: 'UNAUTHORIZED',
      message: action ? `Unauthorized to ${action}` : 'Authentication required',
      resource: 'auth',
    });
  },

  forbidden(action?: string, resource?: string) {
    return new AppError({
      code: 'FORBIDDEN',
      message:
        action && resource
          ? `Forbidden to ${action} on ${resource}`
          : 'Access denied',
      resource,
    });
  },

  sessionExpired() {
    return new AppError({
      code: 'UNAUTHORIZED',
      message: 'Session has expired',
      resource: 'auth',
    });
  },

  validation(field: string, expected: string, actual: string) {
    return new AppError({
      code: 'UNPROCESSABLE_CONTENT',
      field,
      expected,
      actual,
    });
  },

  requiredField(field: string) {
    return new AppError({
      code: 'UNPROCESSABLE_CONTENT',
      message: `Field '${field}' is required`,
      field,
      expected: 'value',
      actual: 'null/undefined',
    });
  },

  invalidFormat(field: string, format: string, value?: string) {
    return new AppError({
      code: 'UNPROCESSABLE_CONTENT',
      message: `Invalid ${format} format for field '${field}'`,
      field,
      expected: format,
      actual: value,
    });
  },

  invalidDateRange(startDate: string, endDate: string) {
    return new AppError({
      code: 'UNPROCESSABLE_CONTENT',
      message: 'End date must be after start date',
      field: 'dateRange',
      expected: `start date before ${endDate}`,
      actual: `start: ${startDate}, end: ${endDate}`,
    });
  },

  notFound(resource: string, id: string) {
    return new AppError({
      code: 'NOT_FOUND',
      resource,
      resourceId: id,
    });
  },

  userNotFound(id: string) {
    return new AppError({
      code: 'NOT_FOUND',
      message: `User with id ${id} not found`,
      resource: 'user',
      resourceId: id,
    });
  },

  patientNotFound(id: string) {
    return new AppError({
      code: 'NOT_FOUND',
      message: `Patient with id ${id} not found`,
      resource: 'patient',
      resourceId: id,
    });
  },

  sessionNotFound(id: string) {
    return new AppError({
      code: 'NOT_FOUND',
      message: `Session with id ${id} not found`,
      resource: 'session',
      resourceId: id,
    });
  },

  paymentNotFound(id: string) {
    return new AppError({
      code: 'NOT_FOUND',
      message: `Payment with id ${id} not found`,
      resource: 'payment',
      resourceId: id,
    });
  },

  sessionAlreadyCompleted(sessionId: string) {
    return new AppError({
      code: 'CONFLICT',
      message: 'Cannot modify a completed session',
      resource: 'session',
      resourceId: sessionId,
      expected: 'scheduled or in-progress session',
      actual: 'completed session',
    });
  },

  sessionAlreadyCancelled(sessionId: string) {
    return new AppError({
      code: 'CONFLICT',
      message: 'Session is already cancelled',
      resource: 'session',
      resourceId: sessionId,
      expected: 'active session',
      actual: 'cancelled session',
    });
  },

  patientNotAssigned(patientId: string, psychologistId: string) {
    return new AppError({
      code: 'FORBIDDEN',
      message: 'Patient is not assigned to this psychologist',
      resource: 'patient',
      resourceId: patientId,
      meta: { psychologistId },
    });
  },

  invalidSessionTime(time: string) {
    return new AppError({
      code: 'UNPROCESSABLE_CONTENT',
      message: 'Session time must be during business hours',
      field: 'time',
      expected: 'business hours (8 AM - 6 PM)',
      actual: time,
    });
  },

  sessionConflict(time: string, existingSessionId?: string) {
    return new AppError({
      code: 'CONFLICT',
      message: 'Session time conflicts with existing appointment',
      field: 'time',
      actual: time,
      meta: { existingSessionId },
    });
  },

  paymentAlreadyCompleted(paymentId: string) {
    return new AppError({
      code: 'CONFLICT',
      message: 'Payment has already been completed',
      resource: 'payment',
      resourceId: paymentId,
      expected: 'pending payment',
      actual: 'completed payment',
    });
  },

  insufficientPayment(expected: number, actual: number, currency = 'BRL') {
    return new AppError({
      code: 'UNPROCESSABLE_CONTENT',
      message: 'Payment amount is insufficient',
      field: 'amount',
      expected: `${currency} ${expected}`,
      actual: `${currency} ${actual}`,
    });
  },

  paymentMethodNotSupported(method: string, category: string) {
    return new AppError({
      code: 'UNPROCESSABLE_CONTENT',
      message: `Payment method '${method}' not supported for category '${category}'`,
      field: 'paymentMethod',
      expected: 'supported payment method',
      actual: method,
      meta: { category },
    });
  },

  fileTooLarge(maxSize: string, actualSize: string) {
    return new AppError({
      code: 'PAYLOAD_TOO_LARGE',
      message: 'File size exceeds maximum allowed',
      expected: `max ${maxSize}`,
      actual: actualSize,
    });
  },

  unsupportedFileType(allowedTypes: string[], actualType: string) {
    return new AppError({
      code: 'UNPROCESSABLE_CONTENT',
      message: 'File type not supported',
      field: 'fileType',
      expected: allowedTypes.join(', '),
      actual: actualType,
    });
  },

  fileNotFound(filename: string) {
    return new AppError({
      code: 'NOT_FOUND',
      message: `File '${filename}' not found`,
      resource: 'file',
      resourceId: filename,
    });
  },

  rateLimitExceeded(limit: number, window: string) {
    return new AppError({
      code: 'TOO_MANY_REQUESTS',
      message: `Rate limit exceeded: ${limit} requests per ${window}`,
      expected: `max ${limit} requests per ${window}`,
      meta: { limit, window },
    });
  },

  externalServiceUnavailable(service: string) {
    return new AppError({
      code: 'SERVICE_UNAVAILABLE',
      message: `External service '${service}' is currently unavailable`,
      resource: service,
    });
  },

  externalServiceTimeout(service: string, timeout: number) {
    return new AppError({
      code: 'GATEWAY_TIMEOUT',
      message: `External service '${service}' timed out after ${timeout}ms`,
      resource: service,
      meta: { timeout },
    });
  },

  databaseConnectionError() {
    return new AppError({
      code: 'SERVICE_UNAVAILABLE',
      message: 'Database connection failed',
      resource: 'database',
    });
  },

  databaseTimeout() {
    return new AppError({
      code: 'TIMEOUT',
      message: 'Database operation timed out',
      resource: 'database',
    });
  },

  duplicateEntry(field: string, value: string) {
    return new AppError({
      code: 'CONFLICT',
      message: `Duplicate entry for field '${field}'`,
      field,
      actual: value,
      expected: 'unique value',
    });
  },

  internalServerError(details?: string) {
    return new AppError({
      code: 'INTERNAL_SERVER_ERROR',
      message: details || 'An unexpected error occurred',
      meta: { details },
    });
  },

  notImplemented(feature: string) {
    return new AppError({
      code: 'NOT_IMPLEMENTED',
      message: `Feature '${feature}' is not yet implemented`,
      meta: { feature },
    });
  },

  serviceUnavailable(service?: string) {
    return new AppError({
      code: 'SERVICE_UNAVAILABLE',
      message: service
        ? `Service '${service}' is temporarily unavailable`
        : 'Service temporarily unavailable',
      resource: service,
    });
  },

  invalidCPF(cpf: string) {
    return new AppError({
      code: 'UNPROCESSABLE_CONTENT',
      message: 'Invalid CPF format',
      field: 'cpf',
      expected: 'valid CPF (000.000.000-00)',
      actual: cpf,
    });
  },

  invalidCRP(crp: string) {
    return new AppError({
      code: 'UNPROCESSABLE_CONTENT',
      message: 'Invalid CRP (Psychology Registration) format',
      field: 'crp',
      expected: 'valid CRP format',
      actual: crp,
    });
  },

  healthPlanNotAccepted(planCode: string) {
    return new AppError({
      code: 'UNPROCESSABLE_CONTENT',
      message: `Health plan '${planCode}' is not accepted`,
      field: 'healthPlan',
      actual: planCode,
      expected: 'accepted health plan',
    });
  },

  authorizationRequired(procedure: string) {
    return new AppError({
      code: 'PRECONDITION_FAILED',
      message: `Prior authorization required for procedure '${procedure}'`,
      expected: 'valid authorization',
      meta: { procedure },
    });
  },
};
