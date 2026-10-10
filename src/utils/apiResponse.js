/**
 * Standardized API response format for SuperUI
 * 
 * Success: { success: true, message?: string, data?: any, meta?: object }
 * Error:   { success: false, message: string, error?: { code, message, details } }
 */

function sendSuccess(res, data = null, { status = 200, message = null, meta = null } = {}) {
  const payload = {
    success: true
  };

  if (message) payload.message = message;
  if (data !== null && data !== undefined) payload.data = data;
  if (meta) payload.meta = meta;

  return res.status(status).json(payload);
}

function sendError(res, message, { status = 400, code = 'ERROR', details = null } = {}) {
  const payload = {
    success: false,
    message,
    error: {
      code,
      message,
      ...(details ? { details } : {})
    }
  };

  return res.status(status).json(payload);
}

module.exports = {
  sendSuccess,
  sendError
};

