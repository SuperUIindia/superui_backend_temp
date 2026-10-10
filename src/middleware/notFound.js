/**
 * 404 handler for undefined API routes
 */
function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `API route ${req.method} ${req.originalUrl} not found`
  });
}

module.exports = notFound;

