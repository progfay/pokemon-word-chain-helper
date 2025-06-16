import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSyllabaryView } from '../../views/syllabaryView.js';

describe('SyllabaryView', () => {
  let container: HTMLElement;
  let syllabaryView: ReturnType<typeof createSyllabaryView>;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    syllabaryView = createSyllabaryView();
    container.appendChild(syllabaryView.render());
  });

  it('should render syllabary table with all characters', () => {
    const element = syllabaryView.render();

    // Check that syllabary table exists
    expect(element.querySelector('.syllabary-table')).toBeTruthy();

    // Check that some characters are present
    expect(element.textContent).toContain('あ');
    expect(element.textContent).toContain('か');
    expect(element.textContent).toContain('さ');
    expect(element.textContent).toContain('ん');
  });

  it('should have a clear button', () => {
    const element = syllabaryView.render();
    const clearButton = element.querySelector('.syllabary-clear-button');

    expect(clearButton).toBeTruthy();
    expect(clearButton?.textContent).toContain('クリア');
  });

  it('should emit syllabary:select event when character is clicked', () => {
    const mockCallback = vi.fn();
    syllabaryView.on('syllabary:select', mockCallback);

    const element = syllabaryView.render();
    const charButton = element.querySelector(
      '[data-char="あ"]',
    ) as HTMLButtonElement;

    expect(charButton).toBeTruthy();
    charButton.click();

    expect(mockCallback).toHaveBeenCalledWith('あ');
  });

  it('should emit syllabary:clear event when clear button is clicked', () => {
    const mockCallback = vi.fn();
    syllabaryView.on('syllabary:clear', mockCallback);

    const element = syllabaryView.render();
    const clearButton = element.querySelector(
      '.syllabary-clear-button',
    ) as HTMLButtonElement;

    clearButton.click();

    expect(mockCallback).toHaveBeenCalled();
  });

  it('should update selected character state', () => {
    syllabaryView.update({
      selectedChar: 'あ',
      isLoading: false,
    });

    const element = syllabaryView.render();
    const charButton = element.querySelector(
      '[data-char="あ"]',
    ) as HTMLButtonElement;

    expect(charButton.classList.contains('selected')).toBe(true);

    // Other characters should not be selected
    const otherButton = element.querySelector(
      '[data-char="か"]',
    ) as HTMLButtonElement;
    expect(otherButton.classList.contains('selected')).toBe(false);
  });

  it.skip('should clear selected character when updated with undefined', () => {
    // First select a character
    syllabaryView.update({
      selectedChar: 'あ',
      isLoading: false,
    });

    let element = syllabaryView.render();
    let charButton = element.querySelector(
      '[data-char="あ"]',
    ) as HTMLButtonElement;
    expect(charButton.classList.contains('selected')).toBe(true);

    // Then clear selection
    syllabaryView.update({
      selectedChar: undefined,
      isLoading: false,
    });

    element = syllabaryView.render();
    charButton = element.querySelector('[data-char="あ"]') as HTMLButtonElement;
    expect(charButton.classList.contains('selected')).toBe(false);
  });

  it('should display error messages', () => {
    syllabaryView.update({
      errorMessage: 'Test error message',
      isLoading: false,
    });

    const element = syllabaryView.render();
    const errorElement = element.querySelector('.syllabary-error');

    expect(errorElement).toBeTruthy();
    expect(errorElement?.textContent).toBe('Test error message');
    expect(errorElement?.classList.contains('hidden')).toBe(false);
  });

  it('should hide error messages when cleared', () => {
    syllabaryView.update({
      errorMessage: undefined,
      isLoading: false,
    });

    const element = syllabaryView.render();
    const errorElement = element.querySelector('.syllabary-error');

    expect(errorElement?.classList.contains('hidden')).toBe(true);
  });

  it('should handle empty cells correctly', () => {
    const element = syllabaryView.render();
    const emptyCells = element.querySelectorAll('.syllabary-cell.empty');

    // There should be some empty cells in the syllabary table
    expect(emptyCells.length).toBeGreaterThan(0);

    // Empty cells should not have data-char attribute
    for (const cell of emptyCells) {
      expect((cell as HTMLElement).dataset.char).toBeUndefined();
    }
  });
});
