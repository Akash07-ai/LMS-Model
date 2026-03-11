import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';
import rateLimit from 'express-rate-limit';

// ========================================
// INPUT VALIDATION
// ========================================

export const validateRegister: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail()
    .trim(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
  body('name')
    .trim()
    .escape()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces')
];

export const validateLogin: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail()
    .trim(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const validateProgress: ValidationChain[] = [
  body('watchedDuration')
    .isInt({ min: 0 })
    .withMessage('Watched duration must be a positive integer'),
  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed must be a boolean')
];

// Validation error handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// ========================================
// RATE LIMITING
// ========================================

// Strict rate limit for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many attempts, please try again later',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// General API rate limit
export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please slow down',
  standardHeaders: true,
  legacyHeaders: false
});

// Progress tracking rate limit (more lenient)
export const progressRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute (every 3 seconds)
  message: 'Progress updates too frequent',
  standardHeaders: true,
  legacyHeaders: false
});

// ========================================
// SECURITY HEADERS
// ========================================

export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.youtube.com; frame-src https://www.youtube.com; style-src 'self' 'unsafe-inline';"
  );
  
  next();
};

// ========================================
// REQUEST SANITIZATION
// ========================================

export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  // Remove any potential XSS from query params
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = (req.query[key] as string)
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .trim();
      }
    });
  }
  
  next();
};

// ========================================
// IP TRACKING
// ========================================

export const trackIP = (req: Request, res: Response, next: NextFunction) => {
  // Get real IP (considering proxies)
  const ip = req.headers['x-forwarded-for'] || 
             req.headers['x-real-ip'] || 
             req.connection.remoteAddress || 
             req.socket.remoteAddress;
  
  req.clientIP = Array.isArray(ip) ? ip[0] : ip;
  next();
};

// ========================================
// PASSWORD STRENGTH CHECKER
// ========================================

export const checkPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;
  
  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  
  // Character variety
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;
  
  // Feedback
  if (password.length < 8) feedback.push('Password too short');
  if (!/[a-z]/.test(password)) feedback.push('Add lowercase letters');
  if (!/[A-Z]/.test(password)) feedback.push('Add uppercase letters');
  if (!/\d/.test(password)) feedback.push('Add numbers');
  if (!/[@$!%*?&]/.test(password)) feedback.push('Add special characters');
  
  // Common patterns
  if (/^(?:password|123456|qwerty)/i.test(password)) {
    feedback.push('Password too common');
    score = 0;
  }
  
  return { score, feedback };
};

// ========================================
// SQL INJECTION PREVENTION
// ========================================

export const preventSQLInjection = (req: Request, res: Response, next: NextFunction) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(UNION.*SELECT)/gi,
    /(OR\s+1\s*=\s*1)/gi,
    /(--|\#|\/\*|\*\/)/g
  ];
  
  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return sqlPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };
  
  // Check body
  if (req.body) {
    for (const key in req.body) {
      if (checkValue(req.body[key])) {
        return res.status(400).json({ message: 'Invalid input detected' });
      }
    }
  }
  
  // Check query params
  if (req.query) {
    for (const key in req.query) {
      if (checkValue(req.query[key])) {
        return res.status(400).json({ message: 'Invalid input detected' });
      }
    }
  }
  
  next();
};

// ========================================
// EXTEND EXPRESS REQUEST TYPE
// ========================================

declare global {
  namespace Express {
    interface Request {
      clientIP?: string;
      rateLimit?: {
        limit: number;
        current: number;
        remaining: number;
        resetTime: Date;
      };
    }
  }
}

export default {
  validateRegister,
  validateLogin,
  validateProgress,
  handleValidationErrors,
  authRateLimiter,
  apiRateLimiter,
  progressRateLimiter,
  securityHeaders,
  sanitizeRequest,
  trackIP,
  checkPasswordStrength,
  preventSQLInjection
};
