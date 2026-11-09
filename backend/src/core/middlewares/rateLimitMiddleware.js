const requests = new Map();
const WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_REQUESTS = 120; // 120 peticiones por minuto por IP

export function rateLimitMiddleware(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
  const now = Date.now();

  const record = requests.get(ip) || { count: 0, resetTime: now + WINDOW_MS };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + WINDOW_MS;
  } else {
    record.count++;
  }

  requests.set(ip, record);

  if (record.count > MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: 'Demasiadas solicitudes. Por favor intente más tarde.'
    });
  }

  next();
}

