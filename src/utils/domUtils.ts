type ElementAttributes = {
  className?: string;
  id?: string;
  textContent?: string;
  type?: string;
  src?: string;
  alt?: string;
  title?: string;
  [key: string]: string | undefined;
};

type DataAttributes = {
  [key: string]: string | number | boolean;
};

/**
 * Creates a DOM element with the specified attributes and data attributes
 */
export const createElement = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes: ElementAttributes = {},
  dataAttributes: DataAttributes = {},
): HTMLElementTagNameMap[K] => {
  const element = document.createElement(tag);

  // Set regular attributes
  for (const [key, value] of Object.entries(attributes)) {
    if (value !== undefined) {
      if (key in element && typeof value === 'string') {
        // Type assertion is safe here because we checked that the key exists on element
        // and value is a string, which is what ElementAttributes allows
        (element as { [key: string]: string })[key] = value;
      } else {
        element.setAttribute(key, value);
      }
    }
  }

  // Set data attributes
  for (const [key, value] of Object.entries(dataAttributes)) {
    element.dataset[key] = String(value);
  }

  return element;
};

/**
 * Appends multiple children to a parent element
 */
export const appendChildren = (
  parent: HTMLElement,
  children: (HTMLElement | string)[],
): void => {
  for (const child of children) {
    if (typeof child === 'string') {
      parent.appendChild(document.createTextNode(child));
    } else {
      parent.appendChild(child);
    }
  }
};
