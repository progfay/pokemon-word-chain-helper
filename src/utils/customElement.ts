/**
 * Base Custom Element utilities for creating secure, performant views
 * Replaces innerHTML-based views with proper DOM manipulation
 */

export interface BaseCustomElement {
  /** Get the root element */
  getElement(): HTMLElement;
  /** Render component */
  render(): HTMLElement;
  /** Update component state */
  update(data: Record<string, unknown>): void;
  /** Destroy the component */
  destroy(): void;
  /** Check if component is connected to DOM */
  isElementConnected(): boolean;
  /** Get current state */
  getState(): Record<string, unknown>;
  /** Event handling */
  on(event: string, callback: (...args: unknown[]) => void): void;
  off(event: string, callback: (...args: unknown[]) => void): void;
  emit(event: string, ...args: unknown[]): void;
}

/**
 * Register a custom element with the browser
 */
export function registerCustomElement(
  tagName: string, 
  elementClass: CustomElementConstructor
): void {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, elementClass);
  }
}

/**
 * Create and safely set text content (prevents XSS)
 */
export function createTextElement(tagName: string, text: string): HTMLElement {
  const element = document.createElement(tagName);
  element.textContent = text; // Safe from XSS
  return element;
}

/**
 * Create element with safe attributes
 */
export function createElement(
  tagName: string, 
  attributes?: Record<string, string | number | boolean>,
  children?: (HTMLElement | string)[]
): HTMLElement {
  const element = document.createElement(tagName);
  
  // Set attributes safely
  if (attributes) {
    for (const [key, value] of Object.entries(attributes)) {
      if (typeof value === 'boolean') {
        if (value) {
          element.setAttribute(key, '');
        }
      } else {
        element.setAttribute(key, String(value));
      }
    }
  }
  
  // Append children safely
  if (children) {
    for (const child of children) {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child)); // Safe from XSS
      } else {
        element.appendChild(child);
      }
    }
  }
  
  return element;
}

/**
 * Safely update element content without innerHTML
 */
export function updateElementContent(
  element: HTMLElement, 
  content: HTMLElement | string
): void {
  // Clear existing content
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
  
  // Add new content safely
  if (typeof content === 'string') {
    element.appendChild(document.createTextNode(content)); // Safe from XSS
  } else {
    element.appendChild(content);
  }
}

/**
 * Safely toggle CSS classes
 */
export function toggleClass(
  element: HTMLElement, 
  className: string, 
  condition: boolean
): void {
  element.classList.toggle(className, condition);
}