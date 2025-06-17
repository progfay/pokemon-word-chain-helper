/**
 * Common reusable UI components
 * These components can be used across different views for consistent UI patterns
 */

import { type BaseComponent, createBaseComponent } from './baseComponent.js';

/** Button component configuration */
interface ButtonConfig {
  text: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

/** Button component interface */
interface Button extends BaseComponent<ButtonConfig> {
  /** Set button loading state */
  setLoading(loading: boolean): void;
  /** Enable or disable the button */
  setDisabled(disabled: boolean): void;
}

/**
 * Create a reusable button component
 */
export function createButton(config: ButtonConfig): Button {
  const updateButtonClasses = (
    element: HTMLElement,
    state: Partial<ButtonConfig>,
  ): void => {
    const classes = ['button'];

    if (state.variant) {
      classes.push(`button--${state.variant}`);
    }

    if (state.size) {
      classes.push(`button--${state.size}`);
    }

    if (state.disabled) {
      classes.push('button--disabled');
    }

    if (state.loading) {
      classes.push('button--loading');
    }

    if (state.className) {
      classes.push(state.className);
    }

    element.className = classes.join(' ');
  };

  const baseComponent = createBaseComponent<ButtonConfig>({
    initialState: config,
    tagName: 'button',
    createElement: () => {
      const button = document.createElement('button');
      button.textContent = config.text;
      updateButtonClasses(button, config);
      return button;
    },
    updateElement: (element, state) => {
      const button = element as HTMLButtonElement;

      if (state.text !== undefined) {
        button.textContent = state.text;
      }

      if (state.disabled !== undefined) {
        button.disabled = state.disabled;
      }

      if (state.loading !== undefined) {
        if (state.loading) {
          button.textContent = 'Loading...';
          button.disabled = true;
        }
      }

      updateButtonClasses(element, state);
    },
    setupEventListeners: (element) => {
      const handleClick = () => {
        const currentState = baseComponent.getState();
        if (!currentState.disabled && !currentState.loading) {
          currentState.onClick?.();
          baseComponent.emit('button:click', undefined);
        }
      };

      element.addEventListener('click', handleClick);

      return () => {
        element.removeEventListener('click', handleClick);
      };
    },
  });

  return {
    ...baseComponent,

    setLoading(loading: boolean): void {
      baseComponent.setState({ loading });
    },

    setDisabled(disabled: boolean): void {
      baseComponent.setState({ disabled });
    },
  };
}

/** Modal dialog configuration */
interface ModalConfig {
  title?: string;
  content?: string | HTMLElement;
  className?: string;
  closable?: boolean;
  backdrop?: boolean;
  onClose?: () => void;
}

/** Modal component interface */
interface Modal extends BaseComponent<ModalConfig> {
  /** Show the modal */
  show(): void;
  /** Hide the modal */
  close(): void;
}

/**
 * Create a modal dialog component
 */
export function createModal(config: ModalConfig): Modal {
  let backdrop: HTMLDivElement | undefined;
  let dialog: HTMLDivElement;
  let header: HTMLDivElement | undefined;
  let body: HTMLDivElement;
  let closeButton: HTMLButtonElement | undefined;

  const baseComponent = createBaseComponent<ModalConfig>({
    initialState: config,
    className: 'modal',
    createElement: () => {
      const container = document.createElement('div');
      container.className = 'modal';
      container.style.display = 'none';

      // Create backdrop if enabled
      if (config.backdrop !== false) {
        backdrop = document.createElement('div');
        backdrop.className = 'modal__backdrop';
        container.appendChild(backdrop);
      }

      // Create dialog
      dialog = document.createElement('div');
      dialog.className = 'modal__dialog';
      if (config.className) {
        dialog.classList.add(config.className);
      }
      container.appendChild(dialog);

      // Create header if title provided
      if (config.title) {
        header = document.createElement('div');
        header.className = 'modal__header';

        const titleElement = document.createElement('h3');
        titleElement.className = 'modal__title';
        titleElement.textContent = config.title;
        header.appendChild(titleElement);

        // Add close button if closable
        if (config.closable !== false) {
          closeButton = document.createElement('button');
          closeButton.className = 'modal__close';
          closeButton.innerHTML = '&times;';
          header.appendChild(closeButton);
        }

        dialog.appendChild(header);
      }

      // Create body
      body = document.createElement('div');
      body.className = 'modal__body';
      dialog.appendChild(body);

      // Set initial content
      if (config.content !== undefined) {
        body.innerHTML = '';
        if (typeof config.content === 'string') {
          body.innerHTML = config.content;
        } else if (config.content instanceof HTMLElement) {
          body.appendChild(config.content);
        }
      }

      return container;
    },
    updateElement: (_element, state) => {
      if (state.content !== undefined) {
        body.innerHTML = '';
        if (typeof state.content === 'string') {
          body.innerHTML = state.content;
        } else if (state.content instanceof HTMLElement) {
          body.appendChild(state.content);
        }
      }

      if (state.className) {
        dialog.classList.add(state.className);
      }
    },
    setupEventListeners: (_element) => {
      const handleClose = () => {
        modal.close();
      };

      const handleBackdropClick = (e: Event) => {
        if (e.target === backdrop) {
          modal.close();
        }
      };

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          modal.close();
        }
      };

      if (closeButton) {
        closeButton.addEventListener('click', handleClose);
      }

      if (backdrop) {
        backdrop.addEventListener('click', handleBackdropClick);
      }

      document.addEventListener('keydown', handleEscape);

      return () => {
        if (closeButton) {
          closeButton.removeEventListener('click', handleClose);
        }
        if (backdrop) {
          backdrop.removeEventListener('click', handleBackdropClick);
        }
        document.removeEventListener('keydown', handleEscape);
      };
    },
  });

  const modal: Modal = {
    ...baseComponent,

    show(): void {
      document.body.appendChild(baseComponent.render());
      baseComponent.render().style.display = 'flex';
      baseComponent.emit('modal:show', undefined);
    },

    close(): void {
      config.onClose?.();
      baseComponent.render().style.display = 'none';
      const element = baseComponent.render();
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      baseComponent.emit('modal:close', undefined);
    },
  };

  return modal;
}
