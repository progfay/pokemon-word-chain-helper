/**
 * Error reporting mechanism for the Pokemon Word Chain application
 * Provides user-friendly error notifications and optional remote error reporting
 */

import { createButton, createModal } from './commonComponents.js';
import {
  type ApplicationError,
  ErrorCategory,
  ErrorSeverity,
  globalErrorHandler,
} from './errorHandler.js';

/** Error reporting configuration */
interface ErrorReportingConfig {
  /** Enable user notifications */
  showUserNotifications: boolean;
  /** Enable console logging */
  enableConsoleLogging: boolean;
  /** Enable remote error reporting */
  enableRemoteReporting: boolean;
  /** Remote reporting endpoint */
  reportingEndpoint?: string;
  /** User identification for error reports */
  userId?: string;
  /** Application version */
  appVersion?: string;
  /** Maximum number of errors to report per session */
  maxErrorsPerSession?: number;
}

/** Error report data structure */
interface ErrorReport {
  error: ApplicationError;
  userAgent: string;
  url: string;
  timestamp: string;
  userId?: string;
  appVersion?: string;
  sessionId: string;
  additionalContext?: Record<string, unknown>;
}

/**
 * Error reporting service
 */
class ErrorReportingService {
  private config: ErrorReportingConfig = {
    showUserNotifications: true,
    enableConsoleLogging: true,
    enableRemoteReporting: false,
    maxErrorsPerSession: 20,
  };

  private sessionId = this.generateSessionId();
  private reportedErrorsCount = 0;
  private reportedErrorIds = new Set<string>();

  /**
   * Initialize error reporting with configuration
   */
  initialize(config: Partial<ErrorReportingConfig>): void {
    this.config = { ...this.config, ...config };
    this.setupErrorHandlers();
  }

  /**
   * Set up error handlers for different categories
   */
  private setupErrorHandlers(): void {
    // Handle all error categories
    for (const category of Object.values(ErrorCategory)) {
      globalErrorHandler.onError(category, (error) => {
        this.reportError(error);
      });
    }
  }

  /**
   * Report an error through all enabled channels
   */
  private reportError(error: ApplicationError): void {
    // Avoid duplicate reporting
    if (this.reportedErrorIds.has(error.id)) {
      return;
    }

    // Check session limit
    if (this.reportedErrorsCount >= (this.config.maxErrorsPerSession || 20)) {
      console.warn(
        'Maximum errors per session reached, skipping error reporting',
      );
      return;
    }

    this.reportedErrorIds.add(error.id);
    this.reportedErrorsCount++;

    // Console logging
    if (this.config.enableConsoleLogging) {
      this.logToConsole(error);
    }

    // User notifications
    if (this.config.showUserNotifications) {
      this.showUserNotification(error);
    }

    // Remote reporting
    if (this.config.enableRemoteReporting && this.config.reportingEndpoint) {
      this.sendToRemote(error);
    }
  }

  /**
   * Log error to console with formatting
   */
  private logToConsole(error: ApplicationError): void {
    const logMethod = this.getConsoleMethod(error.severity);

    logMethod(`[${error.category.toUpperCase()}] ${error.message}`);

    if (error.context) {
      console.group('Error Context:');
      for (const [key, value] of Object.entries(error.context)) {
        console.log(`${key}:`, value);
      }
      console.groupEnd();
    }

    if (error.stack) {
      console.group('Stack Trace:');
      console.log(error.stack);
      console.groupEnd();
    }
  }

  /**
   * Get appropriate console method based on severity
   */
  private getConsoleMethod(
    severity: ErrorSeverity,
  ): (...args: unknown[]) => void {
    switch (severity) {
      case ErrorSeverity.LOW:
        return console.debug;
      case ErrorSeverity.MEDIUM:
        return console.warn;
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return console.error;
      default:
        return console.log;
    }
  }

  /**
   * Show user-friendly error notification
   */
  private showUserNotification(error: ApplicationError): void {
    // Only show notifications for medium and above severity
    if (error.severity === ErrorSeverity.LOW) {
      return;
    }

    // Use user message if provided, otherwise create generic message
    const userMessage = error.userMessage || this.generateUserMessage(error);

    if (error.severity === ErrorSeverity.CRITICAL) {
      this.showCriticalErrorModal(error, userMessage);
    } else {
      this.showErrorToast(error, userMessage);
    }
  }

  /**
   * Show critical error modal dialog
   */
  private showCriticalErrorModal(
    error: ApplicationError,
    message: string,
  ): void {
    const modal = createModal({
      title: '重要なエラーが発生しました',
      content: `
        <div class="error-modal">
          <div class="error-modal__icon">⚠️</div>
          <div class="error-modal__message">${message}</div>
          <div class="error-modal__actions">
            <p>以下のオプションから選択してください：</p>
          </div>
        </div>
      `,
      closable: false,
      className: 'error-modal--critical',
    });

    // Add action buttons
    const actionsContainer = modal
      .render()
      .querySelector('.error-modal__actions') as HTMLElement;

    const reloadButton = createButton({
      text: 'ページを再読み込み',
      variant: 'primary',
      onClick: () => {
        window.location.reload();
      },
    });

    const reportButton = createButton({
      text: 'エラーを報告',
      variant: 'secondary',
      onClick: () => {
        this.showErrorReportDialog(error);
        modal.close();
      },
    });

    const continueButton = createButton({
      text: '続行 (推奨しません)',
      variant: 'danger',
      onClick: () => {
        modal.close();
      },
    });

    actionsContainer.appendChild(reloadButton.render());
    actionsContainer.appendChild(reportButton.render());
    actionsContainer.appendChild(continueButton.render());

    modal.show();
  }

  /**
   * Show error toast notification
   */
  private showErrorToast(error: ApplicationError, message: string): void {
    const toast = document.createElement('div');
    toast.className = `error-toast error-toast--${error.severity}`;
    toast.innerHTML = `
      <div class="error-toast__icon">${this.getErrorIcon(error.severity)}</div>
      <div class="error-toast__content">
        <div class="error-toast__message">${message}</div>
        <button class="error-toast__close">&times;</button>
      </div>
    `;

    // Position toast
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      max-width: 400px;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      background: white;
      border-left: 4px solid ${this.getSeverityColor(error.severity)};
    `;

    // Auto-remove after delay
    const removeToast = () => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    };

    // Close button
    const closeButton = toast.querySelector(
      '.error-toast__close',
    ) as HTMLButtonElement;
    closeButton.addEventListener('click', removeToast);

    // Auto-remove based on severity
    const delay = error.severity === ErrorSeverity.HIGH ? 8000 : 5000;
    setTimeout(removeToast, delay);

    document.body.appendChild(toast);
  }

  /**
   * Show error report dialog for user feedback
   */
  private showErrorReportDialog(error: ApplicationError): void {
    const modal = createModal({
      title: 'エラーレポートの送信',
      content: `
        <div class="error-report-dialog">
          <p>エラーの詳細情報を開発者に送信して、問題の解決にご協力ください。</p>
          <div class="error-details">
            <h4>エラー情報:</h4>
            <p><strong>カテゴリ:</strong> ${error.category}</p>
            <p><strong>重要度:</strong> ${error.severity}</p>
            <p><strong>時刻:</strong> ${error.timestamp.toLocaleString()}</p>
          </div>
          <div class="user-feedback">
            <label for="user-description">何をしていた時にエラーが発生しましたか？ (任意)</label>
            <textarea id="user-description" rows="3" placeholder="エラーが発生した際の状況を教えてください..."></textarea>
          </div>
        </div>
      `,
      className: 'error-report-modal',
    });

    // Add action buttons
    const content = modal
      .render()
      .querySelector('.error-report-dialog') as HTMLElement;
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'error-report-actions';

    const sendButton = createButton({
      text: 'レポートを送信',
      variant: 'primary',
      onClick: () => {
        const description = (
          document.getElementById('user-description') as HTMLTextAreaElement
        )?.value;
        this.sendErrorReport(error, { userDescription: description });
        modal.close();
        this.showSuccessToast(
          'エラーレポートが送信されました。ありがとうございます！',
        );
      },
    });

    const cancelButton = createButton({
      text: 'キャンセル',
      variant: 'secondary',
      onClick: () => {
        modal.close();
      },
    });

    actionsDiv.appendChild(sendButton.render());
    actionsDiv.appendChild(cancelButton.render());
    content.appendChild(actionsDiv);

    modal.show();
  }

  /**
   * Send error report to remote endpoint
   */
  private async sendToRemote(error: ApplicationError): Promise<void> {
    if (!this.config.reportingEndpoint) {
      return;
    }

    try {
      const report = this.createErrorReport(error);

      const response = await fetch(this.config.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });

      if (!response.ok) {
        console.warn('Failed to send error report:', response.statusText);
      }
    } catch (reportingError) {
      console.error('Error while reporting error:', reportingError);
    }
  }

  /**
   * Send user-submitted error report
   */
  private async sendErrorReport(
    error: ApplicationError,
    additionalData: Record<string, unknown> = {},
  ): Promise<void> {
    try {
      const report = this.createErrorReport(error, additionalData);

      if (this.config.enableRemoteReporting && this.config.reportingEndpoint) {
        await this.sendToRemote(error);
      } else {
        // Fallback: log detailed report
        console.log('Error Report (would be sent to server):', report);
      }
    } catch (err) {
      console.error('Failed to send error report:', err);
    }
  }

  /**
   * Create structured error report
   */
  private createErrorReport(
    error: ApplicationError,
    additionalContext: Record<string, unknown> = {},
  ): ErrorReport {
    return {
      error,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userId: this.config.userId,
      appVersion: this.config.appVersion,
      sessionId: this.sessionId,
      additionalContext,
    };
  }

  /**
   * Generate user-friendly error message
   */
  private generateUserMessage(error: ApplicationError): string {
    switch (error.category) {
      case ErrorCategory.NETWORK:
        return 'ネットワーク接続に問題があります。インターネット接続を確認してください。';
      case ErrorCategory.MODEL:
        return 'データの処理中にエラーが発生しました。';
      case ErrorCategory.VIEW:
        return '画面の表示中にエラーが発生しました。';
      case ErrorCategory.CONTROLLER:
        return 'アプリケーションの処理中にエラーが発生しました。';
      case ErrorCategory.USER_INPUT:
        return '入力された内容に問題があります。入力内容を確認してください。';
      default:
        return '予期しないエラーが発生しました。';
    }
  }

  /**
   * Get error icon based on severity
   */
  private getErrorIcon(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'ℹ️';
      case ErrorSeverity.MEDIUM:
        return '⚠️';
      case ErrorSeverity.HIGH:
        return '❌';
      case ErrorSeverity.CRITICAL:
        return '🚨';
      default:
        return '❓';
    }
  }

  /**
   * Get color based on severity
   */
  private getSeverityColor(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.LOW:
        return '#3498db'; // Blue
      case ErrorSeverity.MEDIUM:
        return '#f39c12'; // Orange
      case ErrorSeverity.HIGH:
        return '#e74c3c'; // Red
      case ErrorSeverity.CRITICAL:
        return '#8e44ad'; // Purple
      default:
        return '#95a5a6'; // Gray
    }
  }

  /**
   * Show success toast
   */
  private showSuccessToast(message: string): void {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.innerHTML = `
      <div class="success-toast__icon">✅</div>
      <div class="success-toast__message">${message}</div>
    `;

    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      max-width: 400px;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      background: #2ecc71;
      color: white;
    `;

    document.body.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3000);
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get error reporting statistics
   */
  getStats(): {
    reportedErrorsCount: number;
    sessionId: string;
    maxErrorsPerSession: number;
  } {
    return {
      reportedErrorsCount: this.reportedErrorsCount,
      sessionId: this.sessionId,
      maxErrorsPerSession: this.config.maxErrorsPerSession || 20,
    };
  }

  /**
   * Reset error reporting state
   */
  reset(): void {
    this.reportedErrorsCount = 0;
    this.reportedErrorIds.clear();
    this.sessionId = this.generateSessionId();
  }
}

// Global instance
const errorReporting = new ErrorReportingService();

/**
 * Initialize error reporting with configuration
 */
export function initializeErrorReporting(
  config: Partial<ErrorReportingConfig> = {},
): void {
  errorReporting.initialize(config);
}

/**
 * Manually report an error
 */
function reportError(
  error: Error,
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
