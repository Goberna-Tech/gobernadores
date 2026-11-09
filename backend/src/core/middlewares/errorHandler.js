/**
 * Manejador centralizado de errores con Cero Exposición Técnica
 */
export function errorHandler(err, req, res, next) {
  // Log detallado seguro en consola de servidor
  console.error('[SERVER ERROR]', {
    message: err.message,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  const statusCode = err.status || err.statusCode || 500;
  
  // Mensaje amigable de negocio al usuario final
  res.status(statusCode).json({
    success: false,
    message: err.userMessage || 'No se pudo procesar la solicitud en este momento. Inténtelo nuevamente.'
  });
}

