
// Conditional logger for production optimization
interface LogData {
  [key: string]: any;
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development';

  info(message: string, data?: LogData) {
    if (this.isDev) {
      console.log(`[INFO] ${message}`, data || '');
    }
  }

  warn(message: string, data?: LogData) {
    if (this.isDev) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  }

  error(message: string, data?: LogData) {
    if (this.isDev) {
      console.error(`[ERROR] ${message}`, data || '');
    }
    // In production, you might want to send to error tracking service
  }

  debug(message: string, data?: LogData) {
    if (this.isDev) {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  }
}

export const logger = new Logger();
