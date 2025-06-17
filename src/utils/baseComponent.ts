/**
 * Base component utilities for creating reusable UI components
 * Provides common functionality and patterns for view components
 */

import { createEventEmitter } from './eventEmitter.js';

/** Component lifecycle hooks */
interface ComponentLifecycle<TState = unknown> {
  /** Called when component is mounted to DOM */
  onMount?(): void;
  /** Called when component is updated */
  onUpdate?(data: TState): void;
  /** Called when component is unmounted from DOM */
  onUnmount?(): void;
  /** Called when component encounters an error */
  onError?(error: Error): void;
}

/** Base component configuration */
interface BaseComponentConfig<TState = unknown>
  extends ComponentLifecycle<TState> {
  /** Initial state for the component */
  initialState?: TState;
  /** CSS classes to apply to root element */
  className?: string;
  /** Component tag name (default: div) */
  tagName?: string;
  /** Function to create the DOM element */
  createElement?: () => HTMLElement;
  /** Function to update the DOM element when state changes */
  updateElement?: (element: HTMLElement, state: Partial<TState>) => void;
  /** Function to set up event listeners */
  setupEventListeners?: (element: HTMLElement) => (() => void) | undefined;
}

/** Base component interface */
export interface BaseComponent<TState = unknown> {
  /** Get current component state */
  getState(): TState;
  /** Update component state and trigger re-render */
  setState(newState: Partial<TState>): void;
  /** Render the component and return its DOM element */
  render(): HTMLElement;
  /** Mount the component to a parent element */
  mount(parent: HTMLElement): void;
  /** Unmount the component from its parent */
  unmount(): void;
  /** Destroy the component and clean up resources */
  destroy(): void;
  /** Register event listener */
  on(event: string, callback: (data: unknown) => void): void;
  /** Remove event listener */
  off(event: string, callback: (data: unknown) => void): void;
  /** Emit event */
  emit(event: string, data: unknown): void;
  /** Check if component is mounted */
  isMounted(): boolean;
  /** Check if component is destroyed */
  isDestroyed(): boolean;
}

/**
 * Create a base component with common functionality
 */
export function createBaseComponent<TState = unknown>(
  config: BaseComponentConfig<TState>,
): BaseComponent<TState> {
  let state: TState = config.initialState || ({} as TState);
  let mounted = false;
  let destroyed = false;
  let cleanupFunction: (() => void) | null = null;

  const eventEmitter = createEventEmitter();

  const createElement = (): HTMLElement => {
    if (config.createElement) {
      return config.createElement();
    }

    const element = document.createElement(config.tagName || 'div');
    if (config.className) {
      element.className = config.className;
    }
    return element;
  };

  const element = createElement();

  const updateElement = (newState: Partial<TState>): void => {
    if (config.updateElement) {
      config.updateElement(element, newState);
    }
  };

  const setupEventListeners = (): void => {
    if (config.setupEventListeners) {
      cleanupFunction = config.setupEventListeners(element) || null;
    }
  };

  const handleError = (error: Error): void => {
    console.error('Component error:', error);
    config.onError?.(error);
    eventEmitter.emit('component:error', error);
  };

  // Initial setup
  try {
    updateElement(state);
  } catch (error) {
    handleError(error as Error);
  }

  return {
    getState(): TState {
      return { ...state };
    },

    setState(newState: Partial<TState>): void {
      if (destroyed) {
        console.warn('Attempted to set state on destroyed component');
        return;
      }

      const prevState = { ...state };
      state = { ...state, ...newState };

      try {
        updateElement(newState);
        config.onUpdate?.(state);
        eventEmitter.emit('state:updated', { prevState, newState: state });
      } catch (error) {
        handleError(error as Error);
      }
    },

    render(): HTMLElement {
      if (destroyed) {
        throw new Error('Cannot render destroyed component');
      }
      return element;
    },

    mount(parent: HTMLElement): void {
      if (destroyed) {
        throw new Error('Cannot mount destroyed component');
      }

      if (mounted) {
        console.warn('Component is already mounted');
        return;
      }

      try {
        parent.appendChild(element);
        mounted = true;

        // Set up event listeners
        setupEventListeners();

        config.onMount?.();
        eventEmitter.emit('component:mounted', element);
      } catch (error) {
        handleError(error as Error);
      }
    },

    unmount(): void {
      if (!mounted || destroyed) {
        return;
      }

      try {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }

        mounted = false;
        config.onUnmount?.();
        eventEmitter.emit('component:unmounted', undefined);
      } catch (error) {
        handleError(error as Error);
      }
    },

    destroy(): void {
      if (destroyed) {
        return;
      }

      try {
        if (mounted) {
          this.unmount();
        }

        // Cleanup event listeners
        if (cleanupFunction) {
          cleanupFunction();
        }

        // Clear all event listeners
        eventEmitter.removeAllListeners();

        destroyed = true;
        eventEmitter.emit('component:destroyed', undefined);
      } catch (error) {
        console.error('Error during component destruction:', error);
      }
    },

    on(event: string, callback: (data: unknown) => void): void {
      eventEmitter.on(event, callback);
    },

    off(event: string, callback: (data: unknown) => void): void {
      eventEmitter.off(event, callback);
    },

    emit(event: string, data: unknown): void {
      eventEmitter.emit(event, data);
    },

    isMounted(): boolean {
      return mounted && !destroyed;
    },

    isDestroyed(): boolean {
      return destroyed;
    },
  };
}
