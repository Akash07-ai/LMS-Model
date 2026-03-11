# 🚀 Production Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Security (CRITICAL)
- [ ] Change JWT secrets to 64+ character random strings
- [ ] Enable HTTPS only
- [ ] Add rate limiting to all endpoints
- [ ] Add input validation to all forms
- [ ] Enable CORS whitelist (not *)
- [ ] Add security headers (helmet.js)
- [ ] Implement CSRF protection
- [ ] Add SQL injection prevention
- [ ] Enable refresh token rotation
- [ ] Set secure cookie flags

### ✅ Performance
- [ ] Add database indexes (run schema-production.sql)
- [ ] Enable response compression
- [ ] Add Redis caching
- [ ] Optimize database queries
- [ ] Enable CDN for static assets
- [ ] Add request size limits
- [ ] Implement lazy loading
- [ ] Optimize images

### ✅ Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Add performance monitoring
- [ ] Configure log aggregation
- [ ] Set up uptime monitoring
- [ ] Add analytics
- [ ] Configure alerts

### ✅ Database
- [ ] Set up automated backups
- [ ] Configure connection pooling
- [ ] Add audit logging
- [ ] Implement soft deletes
- [ ] Set up replication (optional)

---

## 🔧 Installation Steps

### 1. Install Additional Dependencies

**Backend:**
```bash
cd backend
npm install express-rate-limit express-validator helmet compression ioredis
npm install --save-dev @types/express-rate-limit
```

**Frontend:**
```bash
cd frontend
npm install next-pwa
```

### 2. Update Database Schema

```bash
# Backup current database
mysqldump -u root -p lms_db > backup_before_production.sql

# Run production schema
mysql -u root -p lms_db < schema-production.sql
```

### 3. Update Environment Variables

**Backend `.env`:**
```env
PORT=5000
NODE_ENV=production

# Database
DB_HOST=your-production-db-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-strong-password
DB_NAME=lms_db

# JWT (GENERATE NEW SECRETS!)
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_ACCESS_SECRET=<64-char-random-hex>
JWT_REFRESH_SECRET=<64-char-random-hex>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# Frontend
FRONTEND_URL=https://your-domain.com

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### 4. Update app.ts with Security Middleware

```typescript
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { corsOptions } from './config/security';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import {
  apiRateLimiter,
  securityHeaders,
  sanitizeRequest,
  trackIP,
  preventSQLInjection
} from './middleware/security';

const app = express();

// Security middleware
app.use(helmet());
app.use(securityHeaders);
app.use(compression());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(trackIP);
app.use(sanitizeRequest);
app.use(preventSQLInjection);
app.use(apiRateLimiter);
app.use(requestLogger);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/subjects', subjectRoutes);
app.use('/api/v1/videos', videoRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/users', userRoutes);

app.use(errorHandler);

export default app;
```

### 5. Update Auth Routes with Validation

```typescript
import { Router } from 'express';
import { register, login, refresh, logout } from './auth.controller';
import {
  validateRegister,
  validateLogin,
  handleValidationErrors,
  authRateLimiter
} from '../../middleware/security';

const router = Router();

router.post('/register', 
  authRateLimiter,
  validateRegister,
  handleValidationErrors,
  register
);

router.post('/login',
  authRateLimiter,
  validateLogin,
  handleValidationErrors,
  login
);

router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
```

---

## 🌐 Deployment

### Option 1: Render + Vercel (Recommended for MVP)

**Backend (Render):**
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repo
4. Set environment variables
5. Deploy

**Frontend (Vercel):**
1. Push code to GitHub
2. Import project on Vercel
3. Set environment variables
4. Deploy

**Database (Aiven):**
1. Create MySQL service
2. Copy connection details
3. Update backend .env

**Cost:** ~$0-25/month

---

### Option 2: AWS (Recommended for Scale)

**Backend (EC2):**
```bash
# SSH into EC2
ssh -i key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repo
git clone your-repo
cd backend

# Install dependencies
npm install

# Build
npm run build

# Install PM2
npm install -g pm2

# Start with PM2
pm2 start dist/server.js --name lms-api
pm2 startup
pm2 save
```

**Frontend (Vercel):**
- Same as Option 1

**Database (RDS):**
1. Create MySQL RDS instance
2. Configure security groups
3. Update backend .env

**Redis (ElastiCache):**
1. Create Redis cluster
2. Update backend .env

**Cost:** ~$50-100/month

---

## 📊 Monitoring Setup

### Sentry (Error Tracking)

**Backend:**
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

**Frontend:**
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: curl ${{ secrets.RENDER_DEPLOY_HOOK }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 🧪 Testing

### Run Tests Before Deploy

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e

# Load tests
k6 run load-test.js
```

---

## 📈 Performance Optimization

### Enable Caching

```typescript
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Cache subject tree
const cacheKey = `subject:${subjectId}:tree`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const data = await fetchFromDB();
await redis.setex(cacheKey, 300, JSON.stringify(data));
return data;
```

### Database Query Optimization

```sql
-- Use EXPLAIN to analyze queries
EXPLAIN SELECT * FROM videos WHERE section_id = 1;

-- Add missing indexes
CREATE INDEX idx_name ON table(column);

-- Optimize slow queries
SHOW PROCESSLIST;
```

---

## 🔒 Security Hardening

### SSL/TLS Certificate

```bash
# Using Let's Encrypt
sudo apt-get install certbot
sudo certbot --nginx -d your-domain.com
```

### Firewall Rules

```bash
# Allow only necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### Database Security

```sql
-- Create limited user
CREATE USER 'lms_app'@'%' IDENTIFIED BY 'strong-password';
GRANT SELECT, INSERT, UPDATE, DELETE ON lms_db.* TO 'lms_app'@'%';
FLUSH PRIVILEGES;
```

---

## 📝 Post-Deployment

### 1. Verify Deployment

```bash
# Check backend
curl https://api.your-domain.com/health

# Check frontend
curl https://your-domain.com

# Check database
mysql -h your-db-host -u user -p
```

### 2. Monitor Logs

```bash
# Backend logs
pm2 logs lms-api

# Database logs
tail -f /var/log/mysql/error.log
```

### 3. Set Up Alerts

- Uptime monitoring (UptimeRobot)
- Error alerts (Sentry)
- Performance alerts (New Relic)
- Database alerts (CloudWatch)

---

## 🆘 Rollback Plan

### If Deployment Fails

```bash
# Backend rollback
pm2 stop lms-api
git checkout previous-commit
npm install
npm run build
pm2 restart lms-api

# Database rollback
mysql -u root -p lms_db < backup_before_production.sql

# Frontend rollback
vercel rollback
```

---

## 📊 Success Metrics

### Monitor These KPIs

- **Uptime:** > 99.9%
- **Response Time:** < 200ms
- **Error Rate:** < 0.1%
- **User Satisfaction:** > 4.5/5
- **Video Completion Rate:** > 70%

---

## 🎯 Next Steps After Deployment

1. **Week 1:** Monitor errors and performance
2. **Week 2:** Gather user feedback
3. **Week 3:** Implement improvements
4. **Week 4:** Scale infrastructure if needed

---

**Your LMS is now production-ready!** 🚀🔒

For support: Check AUDIT_REPORT.md for detailed improvements.
