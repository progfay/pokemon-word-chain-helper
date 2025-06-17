/**
 * Global error handling system for the Pokemon Word Chain application
 * Provides centralized error reporting, logging, and recovery mechanisms
 */

/** Error severity levels */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/** Error categories for better organization */
export enum ErrorCategory {
  MODEL = 'model',
  VIEW = 'view',
  CONTROLLER = 'controller',
  NETWORK = 'network',
  USER_INPUT = 'user_input',
  SYSTEM = 'system',
}

/** Structured error information */
export interface ApplicationError {
  id: string;
  message: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  timestamp: Date;
  stack?: string;
  context?: Record<string, unknown>;
  userMessage?: string;
  recoverable: boolean;
}

/** Error handler function signature */
type ErrorHandler = (error: ApplicationError) => void;

/** Recovery strategy function signature */
type RecoveryStrategy = (error: ApplicationError) => boolean;

/**
 * Global error handling system
 */
class GlobalErrorHandler {
  private handlers: Map<ErrorCategory, ErrorHandler[]> = new Map();
  private recoveryStrategies: Map<ErrorCategory, RecoveryStrategy[]> =
    new Map();
  private errorLog: ApplicationError[] = [];
  private maxLogSize = 100;

  /**
   * Register an error handler for a specific category
   */
  onError(category: ErrorCategory, handler: ErrorHandler): void {
    if (!this.handlers.has(category)) {
      this.handlers.set(category, []);
    }
    this.handlers.get(category)?.push(handler);
  }

  /**
   * Register a recovery strategy for a specific category
   */
  addRecoveryStrategy(
    category: ErrorCategory,
    strategy: RecoveryStrategy,
  ): void {
    if (!this.recoveryStrategies.has(category)) {
      this.recoveryStrategies.set(category, []);
    }
    this.recoveryStrategies.get(category)?.push(strategy);
  }

  /**
   * Handle an error through the global system
   */
  handleError(
    error: Error | ApplicationError,
    context?: {
      category?: ErrorCategory;
      severity?: ErrorSeverity;
      userMessage?: string;
      context?: Record<string, unknown>;
      recoverable?: boolean;
    },
  ): void {
    const appError = this.normalizeError(error, context);

    // Log the error
    this.logError(appError);

    // Try recovery strategies first
    if (appError.recoverable && this.tryRecovery(appError)) {
      console.info(`Successfully recovered from error: ${appError.id}`);
      return;
    }

    // Run registered handlers
    this.executeHandlers(appError);

    // For critical errors, notify user
    if (appError.severity === ErrorSeverity.CRITICAL) {
      this.notifyUser(appError);
    }
  }

  /**
   * Convert any error to ApplicationError format
   */
  private normalizeError(
    error: Error | ApplicationError,
    context?: {
      category?: ErrorCategory;
      severity?: ErrorSeverity;
      userMessage?: string;
      context?: Record<string, unknown>;
      recoverable?: boolean;
    },
  ): ApplicationError {
    if (this.isApplicationError(error)) {
      return error;
    }

    return {
      id: this.generateErrorId(),
      message: error.message || 'Unknown error occurred',
      severity: context?.severity || ErrorSeverity.MEDIUM,
      category: context?.category || ErrorCategory.SYSTEM,
      timestamp: new Date(),
      stack: error.stack,
      context: context?.context,
      userMessage: context?.userMessage,
      recoverable: context?.recoverable ?? true,
    };
  }

  /**
   * Type guard for ApplicationError
   */
  private isApplicationError(error: unknown): error is ApplicationError {
    return (
      error !== null &&
      typeof error === 'object' &&
      'id' in error &&
      'severity' in error
    );
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log error to internal storage
   */
  private logError(error: ApplicationError): void {
    this.errorLog.unshift(error);

    // Maintain max log size
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Console logging based on severity
    switch (error.severity) {
      case ErrorSeverity.LOW:
        console.debug('Low severity error:', error);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn('Medium severity error:', error);
        break;
      case ErrorSeverity.HIGH:
        console.error('High severity error:', error);
        break;
      case ErrorSeverity.CRITICAL:
        console.error('CRITICAL ERROR:', error);
        break;
    }
  }

  /**
   * Try recovery strategies for the error
   */
  private tryRecovery(error: ApplicationError): boolean {
    const strategies = this.recoveryStrategies.get(error.category) || [];

    for (const strategy of strategies) {
      try {
        if (strategy(error)) {
          return true;
        }
      } catch (recoveryError) {
        console.warn('Recovery strategy failed:', recoveryError);
      }
    }

    return false;
  }

  /**
   * Execute registered error handlers
   */
  private executeHandlers(error: ApplicationError): void {
    const handlers = this.handlers.get(error.category) || [];

    for (const handler of handlers) {
      try {
        handler(error);
      } catch (handlerError) {
        console.error('Error handler failed:', handlerError);
      }
    }
  }

  /**
   * Notify user of critical errors
   */
  private notifyUser(error: ApplicationError): void {
    const message =
      error.userMessage ||
      'A critical error occurred. Please refresh the page.';

    // Try to show user-friendly notification
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(message);
    } else {
      console.error('Critical error notification:', message);
    }
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(count = 10): ApplicationError[] {
    return this.errorLog.slice(0, count);
  }

  /**
   * Get errors by category
   */
  getErrorsByCategory(category: ErrorCategory): ApplicationError[] {
    return this.errorLog.filter((error) => error.category === category);
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Get error statistics
   */
  getErrorStats(): Record<ErrorCategory, { count: number; recent: number }> {
    const stats: Record<string, { count: number; recent: number }> = {};
    const recentThreshold = Date.now() - 24 * 60 * 60 * 1000; // 24 hours

    for (const error of this.errorLog) {
      if (!stats[error.category]) {
        stats[error.category] = { count: 0, recent: 0 };
      }
      stats[error.category].count++;
      if (error.timestamp.getTime() > recentThreshold) {
        stats[error.category].recent++;
      }
    }

    return stats as Record<ErrorCategory, { count: number; recent: number }>;
  }
}

// Global instance
export const globalErrorHandler = new GlobalErrorHandler();

/**
 * Convenience function for handling errors
 */
export function handleError(
  error: Error | ApplicationError,
  category: ErrorCategory = ErrorCategory.SYSTEM,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  userMessage?: string,
  context?: Record<string, unknown>,
): void {
  globalErrorHandler.handleError(error, {
    category,
    severity,
    userMessage,
    context,
    recoverable: severity !== ErrorSeverity.CRITICAL,
  });
}

/**
 * Initialize global error handlers for unhandled errors
 */
export function initializeGlobalErrorHandling(): void {
  // Handle unhandled Promise rejections
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      handleError(
        new Error(event.reason?.message || 'Unhandled Promise rejection'),
        ErrorCategory.SYSTEM,
        ErrorSeverity.HIGH,
        'An unexpected error occurred. Please try again.',
        { reason: event.reason },
      );
    });

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      handleError(
        new Error(event.message || 'Global JavaScript error'),
        ErrorCategory.SYSTEM,
        ErrorSeverity.HIGH,
        'An unexpected error occurred. Please refresh the page.',
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      );
    });
  }
}

/**
 * Set up default recovery strategies
 */
export function setupDefaultRecoveryStrategies(): void {
  // Model recovery: retry operations
  globalErrorHandler.addRecoveryStrategy(ErrorCategory.MODEL, (error) => {
    if (
      error.context?.retryCount &&
      typeof error.context.retryCount === 'number' &&
      error.context.retryCount >= 3
    ) {
      return false; // Max retries reached
    }

    // Could implement automatic retry logic here
    console.info(`Attempting recovery for model error: ${error.message}`);
    return false; // For now, don't auto-retry
  });

  // View recovery: re-render components
  globalErrorHandler.addRecoveryStrategy(ErrorCategory.VIEW, (error) => {
    if (
      error.context?.component &&
      typeof error.context.component === 'object' &&
      'render' in error.context.component &&
      typeof error.context.component.render === 'function'
    ) {
      try {
        error.context.component.render();
        return true;
      } catch (renderError) {
        console.warn('Failed to re-render component:', renderError);
      }
    }
    return false;
  });

  // Network recovery: suggest refresh
  globalErrorHandler.addRecoveryStrategy(ErrorCategory.NETWORK, () => {
    // For network errors, usually best to let user decide to retry
    console.info('Network error occurred, user should retry manually');
    return false;
  });
}

/**
 * Create a wrapped function that automatically handles errors
 */
function withErrorHandling<T extends (...args: unknown[]) => unknown>(
  fn: T,
  category: ErrorCategory,
  context?: Record<string, unknown>,
): T {
  return ((...args: unknown[]) => {
    try {
      const result = fn(...args);

      // Handle async functions
      if (
        result &&
        typeof result === 'object' &&
        'catch' in result &&
        typeof result.catch === 'function'
      ) {
        return result.catch((error: Error) => {
          handleError(
            error,
            category,
            ErrorSeverity.MEDIUM,
            undefined,
            context,
          );
          throw error; // Re-throw for caller to handle
        });
      }

      return result;
    } catch (error) {
      handleError(
        error as Error,
        category,
        ErrorSeverity.MEDIUM,
        undefined,
        context,
      );
      throw error; // Re-throw for caller to handle
    }
  }) as T;
}
