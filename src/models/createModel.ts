import { createEventEmitter } from '../utils/eventEmitter.js';

export type ModelOptions = {
  id: string;
  initialState?: unknown;
};

/**
 * Create a base model with common functionality
 */
export const createModel = ({ id, initialState = null }: ModelOptions) => {
  const eventEmitter = createEventEmitter();
  let state = initialState;

  return {
    ...eventEmitter,

    getId(): string {
      return id;
    },

    getState(): unknown {
      return state;
    },

    setState(newState: unknown): void {
      state = newState;
      eventEmitter.emit('state:updated', state);
    },

    handleError(error: Error): void {
      console.error(`Error in model ${id}:`, error);
      eventEmitter.emit('error', error);
    },
  };
};
