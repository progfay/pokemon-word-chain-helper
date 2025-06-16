import { createEventEmitter } from '../utils/eventEmitter.js';

export type ControllerOptions = {
  setupController: () => void;
  cleanupController: () => void;
};

/**
 * Create a base controller with common functionality
 */
export const createController = ({
  setupController,
  cleanupController,
}: ControllerOptions) => {
  const eventEmitter = createEventEmitter();
  let isInitialized = false;

  return {
    ...eventEmitter,

    initialize(): void {
      if (isInitialized) return;

      try {
        setupController();
        isInitialized = true;
        eventEmitter.emit('initialized', undefined);
      } catch (error) {
        this.handleError(error as Error);
      }
    },

    destroy(): void {
      if (!isInitialized) return;

      try {
        cleanupController();
        isInitialized = false;
        eventEmitter.removeAllListeners();
        eventEmitter.emit('destroyed', undefined);
      } catch (error) {
        this.handleError(error as Error);
      }
    },

    handleError(error: Error): void {
      console.error('Controller error:', error);
      eventEmitter.emit('error', error);
    },
  };
};
