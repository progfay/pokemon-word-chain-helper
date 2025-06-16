/**
 * Base component utilities for creating reusable UI components
 * Provides common functionality and patterns for view components
 */

import { createEventEmitter } from './eventEmitter.js';

/** Component lifecycle hooks */
export interface ComponentLifecycle<TState = unknown> {
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
export interface BaseComponentConfig<TState = unknown>
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

/** Form validation function type */
export type FieldValidator<T = unknown> = (value: T) => string | null;

/** Form component configuration */
export interface FormComponentConfig<TState = unknown>
  extends BaseComponentConfig<TState> {
  /** Field validators */
  validators?: Record<string, FieldValidator>;
  /** Function to get field element by name */
  getFieldElement?: (fieldName: string) => HTMLElement | null;
  /** Function to get field value from element */
  getFieldValue?: (element: HTMLElement) => unknown;
  /** Function to show error for a field */
  showFieldError?: (fieldName: string, error: string) => void;
  /** Function to clear error for a field */
  clearFieldError?: (fieldName: string) => void;
}

/** Form component interface */
export interface FormComponent<TState = unknown> extends BaseComponent<TState> {
  /** Add a validator for a field */
  addValidator(fieldName: string, validator: FieldValidator): void;
  /** Validate a field value */
  validateField(fieldName: string, value: unknown): boolean;
  /** Validate all fields */
  validateForm(): boolean;
  /** Get all current validation errors */
  getErrors(): Record<string, string>;
  /** Check if form has any validation errors */
  hasErrors(): boolean;
}

/**
 * Create a form component with validation support
 */
export function createFormComponent<TState = unknown>(
  config: FormComponentConfig<TState>,
): FormComponent<TState> {
  const baseComponent = createBaseComponent(config);
  const validators = new Map<string, FieldValidator>(
    Object.entries(config.validators || {}),
  );
  const errors = new Map<string, string>();

  return {
    ...baseComponent,

    addValidator(fieldName: string, validator: FieldValidator): void {
      validators.set(fieldName, validator);
    },

    validateField(fieldName: string, value: unknown): boolean {
      const validator = validators.get(fieldName);
      if (!validator) return true;

      const error = validator(value);
      if (error) {
        errors.set(fieldName, error);
        config.showFieldError?.(fieldName, error);
        return false;
      }

      errors.delete(fieldName);
      config.clearFieldError?.(fieldName);
      return true;
    },

    validateForm(): boolean {
      let isValid = true;
      for (const [fieldName] of validators) {
        const fieldElement = config.getFieldElement?.(fieldName);
        if (fieldElement) {
          const value = config.getFieldValue?.(fieldElement);
          if (!this.validateField(fieldName, value)) {
            isValid = false;
          }
        }
      }
      return isValid;
    },

    getErrors(): Record<string, string> {
      return Object.fromEntries(errors);
    },

    hasErrors(): boolean {
      return errors.size > 0;
    },
  };
}

/** List component configuration */
export interface ListComponentConfig<TItem = unknown, TState = unknown>
  extends BaseComponentConfig<TState> {
  /** Function to render a single item */
  renderItem?: (item: TItem, index: number) => HTMLElement;
  /** Called when an item is selected */
  onItemSelected?: (item: TItem) => void;
  /** Called when an item is deselected */
  onItemDeselected?: (item: TItem) => void;
}

/** List component interface */
export interface ListComponent<TItem = unknown, TState = unknown>
  extends BaseComponent<TState> {
  /** Set the items to display in the list */
  setItems(items: TItem[]): void;
  /** Add item to the list */
  addItem(item: TItem): void;
  /** Remove item from the list */
  removeItem(item: TItem): void;
  /** Select an item */
  selectItem(item: TItem): void;
  /** Deselect an item */
  deselectItem(item: TItem): void;
  /** Set disabled items */
  setDisabledItems(items: TItem[]): void;
  /** Check if item is selected */
  isSelected(item: TItem): boolean;
  /** Check if item is disabled */
  isDisabled(item: TItem): boolean;
  /** Get all selected items */
  getSelectedItems(): TItem[];
  /** Clear all selections */
  clearSelection(): void;
}

/**
 * Create a list component for displaying collections of items
 */
export function createListComponent<TItem = unknown, TState = unknown>(
  config: ListComponentConfig<TItem, TState>,
): ListComponent<TItem, TState> {
  const baseComponent = createBaseComponent(config);
  let items: TItem[] = [];
  const selectedItems = new Set<TItem>();
  const disabledItems = new Set<TItem>();

  return {
    ...baseComponent,

    setItems(newItems: TItem[]): void {
      items = [...newItems];
      baseComponent.setState({ items } as unknown as Partial<TState>);
    },

    addItem(item: TItem): void {
      items.push(item);
      baseComponent.setState({ items } as unknown as Partial<TState>);
    },

    removeItem(item: TItem): void {
      const index = items.indexOf(item);
      if (index > -1) {
        items.splice(index, 1);
        selectedItems.delete(item);
        disabledItems.delete(item);
        baseComponent.setState({ items } as unknown as Partial<TState>);
      }
    },

    selectItem(item: TItem): void {
      if (!disabledItems.has(item)) {
        selectedItems.add(item);
        config.onItemSelected?.(item);
        baseComponent.emit('item:selected', item);
      }
    },

    deselectItem(item: TItem): void {
      selectedItems.delete(item);
      config.onItemDeselected?.(item);
      baseComponent.emit('item:deselected', item);
    },

    setDisabledItems(newDisabledItems: TItem[]): void {
      disabledItems.clear();
      for (const item of newDisabledItems) {
        disabledItems.add(item);
      }
      baseComponent.setState({
        disabledItems: newDisabledItems,
      } as unknown as Partial<TState>);
    },

    isSelected(item: TItem): boolean {
      return selectedItems.has(item);
    },

    isDisabled(item: TItem): boolean {
      return disabledItems.has(item);
    },

    getSelectedItems(): TItem[] {
      return Array.from(selectedItems);
    },

    clearSelection(): void {
      const previouslySelected = Array.from(selectedItems);
      selectedItems.clear();
      for (const item of previouslySelected) {
        config.onItemDeselected?.(item);
      }
      baseComponent.emit('selection:cleared', previouslySelected);
    },
  };
}
