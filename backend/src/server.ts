import app from './app';
import { env } from './config/env';
import { testConnection } from './config/db';

const startServer = async () => {
  await testConnection();
  
  let port = env.port;
  const maxAttempts = 10;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await new Promise<void>((resolve, reject) => {
        const server = app.listen(port, () => {
          console.log(`🚀 Server running on port ${port}`);
          console.log(`📝 Environment: ${env.nodeEnv}`);
          resolve();
        });
        server.on('error', (err: any) => {
          reject(err);
        });
      });
      // started successfully
      break;
    } catch (err: any) {
      if (err.code === 'EADDRINUSE') {
        console.warn(`Port ${port} in use, trying ${port + 1}`);
        port++;
      } else {
        console.error('Failed to start server:', err);
        process.exit(1);
      }
    }
  }
};

startServer();
