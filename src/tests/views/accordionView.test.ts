import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAccordionView } from '../../views/accordionView.js';

describe('AccordionView', () => {
  let container: HTMLElement;
  let accordionView: ReturnType<typeof createAccordionView>;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    accordionView = createAccordionView();
    container.appendChild(accordionView.render());
  });

  it('should render accordion with all row headers using details/summary', () => {
    const element = accordionView.render();

    // Check that accordion exists
    expect(element.querySelector('.accordion')).toBeTruthy();

    // Check that row details elements are present
    const rowDetailsElements = element.querySelectorAll(
      'details.accordion-row',
    );
    expect(rowDetailsElements.length).toBeGreaterThan(0);

    // Check that character details elements are present
    const charDetailsElements = element.querySelectorAll(
      'details.accordion-char',
    );
    expect(charDetailsElements.length).toBeGreaterThan(0);

    // Check that summary elements are present
    const summaryElements = element.querySelectorAll(
      'summary.accordion-row-header',
    );
    expect(summaryElements.length).toBeGreaterThan(0);

    // Check that Japanese row headers are present
    expect(element.textContent).toContain('ア行');
    expect(element.textContent).toContain('カ行');
    expect(element.textContent).toContain('サ行');
    expect(element.textContent).toContain('ハ行');
    expect(element.textContent).toContain('マ行');
    expect(element.textContent).toContain('ラ行');
    expect(element.textContent).toContain('ワ行');
  });

  it('should have header text', () => {
    const element = accordionView.render();
    const header = element.querySelector('.accordion-header');

    expect(header).toBeTruthy();
    expect(header?.textContent).toContain('文字を選択してください');
  });

  it('should expand row when updated with openRowIndex', () => {
    const element = accordionView.render();

    // Initially should be closed
    const firstDetails = element.querySelector(
      'details.accordion-row[data-row-index="0"]',
    ) as HTMLDetailsElement;
    expect(firstDetails).toBeTruthy();
    expect(firstDetails.open).toBe(false);

    // Update to open
    accordionView.update({
      openRowIndex: 0,
      pokemonData: {},
      usedPokemon: [],
      isLoading: false,
    });

    expect(firstDetails.open).toBe(true);

    // Should show character accordions
    expect(element.textContent).toContain('ア');
    expect(element.textContent).toContain('イ');
    expect(element.textContent).toContain('ウ');
    expect(element.textContent).toContain('エ');
    expect(element.textContent).toContain('オ');
  });

  it('should close row when updated with undefined openRowIndex', () => {
    accordionView.update({
      openRowIndex: 0,
      pokemonData: {},
      usedPokemon: [],
      isLoading: false,
    });

    const element = accordionView.render();
    const firstDetails = element.querySelector(
      'details.accordion-row[data-row-index="0"]',
    ) as HTMLDetailsElement;

    expect(firstDetails.open).toBe(true);

    // Update to close
    accordionView.update({
      openRowIndex: undefined,
      pokemonData: {},
      usedPokemon: [],
      isLoading: false,
    });

    expect(firstDetails.open).toBe(false);
  });

  it('should emit accordion:character-select event when character is opened', () => {
    const mockCallback = vi.fn();
    accordionView.on('accordion:character-select', mockCallback);

    // First open the row accordion
    accordionView.update({
      openRowIndex: 0,
      pokemonData: {},
      usedPokemon: [],
      isLoading: false,
    });

    const element = accordionView.render();
    const charDetails = element.querySelector(
      '[data-char="ア"]',
    ) as HTMLDetailsElement;

    expect(charDetails).toBeTruthy();
    charDetails.open = true;

    // Trigger the toggle event manually
    const toggleEvent = new Event('toggle');
    charDetails.dispatchEvent(toggleEvent);

    expect(mockCallback).toHaveBeenCalledWith('ア');
  });

  it('should update selected character state', () => {
    accordionView.update({
      openRowIndex: 0,
      openCharacter: 'ア',
      pokemonData: {},
      usedPokemon: [],
      isLoading: false,
    });

    const element = accordionView.render();
    const charDetails = element.querySelector(
      '[data-char="ア"]',
    ) as HTMLDetailsElement;

    expect(charDetails.open).toBe(true);

    // Other characters should not be open
    const otherCharDetails = element.querySelector(
      '[data-char="イ"]',
    ) as HTMLDetailsElement;
    expect(otherCharDetails.open).toBe(false);
  });

  it('should clear selected character when updated with undefined', () => {
    // First select a character
    accordionView.update({
      openRowIndex: 0,
      openCharacter: 'ア',
      pokemonData: {},
      usedPokemon: [],
      isLoading: false,
    });

    let element = accordionView.render();
    let charDetails = element.querySelector(
      '[data-char="ア"]',
    ) as HTMLDetailsElement;
    expect(charDetails.open).toBe(true);

    // Then clear selection
    accordionView.update({
      openRowIndex: 0,
      openCharacter: undefined,
      pokemonData: {},
      usedPokemon: [],
      isLoading: false,
    });

    element = accordionView.render();
    charDetails = element.querySelector(
      '[data-char="ア"]',
    ) as HTMLDetailsElement;
    expect(charDetails.open).toBe(false);
  });

  it('should display error messages', () => {
    accordionView.update({
      errorMessage: 'Test error message',
      pokemonData: {},
      usedPokemon: [],
      isLoading: false,
    });

    const element = accordionView.render();
    const errorElement = element.querySelector('.accordion-error');

    expect(errorElement).toBeTruthy();
    expect(errorElement?.textContent).toBe('Test error message');
    expect(errorElement?.classList.contains('hidden')).toBe(false);
  });

  it('should hide error messages when cleared', () => {
    accordionView.update({
      errorMessage: undefined,
      pokemonData: {},
      usedPokemon: [],
      isLoading: false,
    });

    const element = accordionView.render();
    const errorElement = element.querySelector('.accordion-error');

    expect(errorElement?.classList.contains('hidden')).toBe(true);
  });

  it('should only show one open row at a time', () => {
    const element = accordionView.render();

    // Open first row
    accordionView.update({
      openRowIndex: 0,
      pokemonData: {},
      usedPokemon: [],
      isLoading: false,
    });

    const rowDetailsElements = element.querySelectorAll(
      'details.accordion-row',
    );
    expect((rowDetailsElements[0] as HTMLDetailsElement).open).toBe(true);
    expect((rowDetailsElements[1] as HTMLDetailsElement).open).toBe(false);

    // Open second row - first should close
    accordionView.update({
      openRowIndex: 1,
      pokemonData: {},
      usedPokemon: [],
      isLoading: false,
    });

    expect((rowDetailsElements[0] as HTMLDetailsElement).open).toBe(false);
    expect((rowDetailsElements[1] as HTMLDetailsElement).open).toBe(true);
  });

  it('should show correct characters for each row', () => {
    // Test ア行
    accordionView.update({
      openRowIndex: 0,
      pokemonData: {},
      usedPokemon: [],
      isLoading: false,
    });

    let element = accordionView.render();
    expect(element.querySelector('[data-char="ア"]')).toBeTruthy();
    expect(element.querySelector('[data-char="イ"]')).toBeTruthy();
    expect(element.querySelector('[data-char="ウ"]')).toBeTruthy();
    expect(element.querySelector('[data-char="エ"]')).toBeTruthy();
    expect(element.querySelector('[data-char="オ"]')).toBeTruthy();

    // Test カ行
    accordionView.update({
      openRowIndex: 1,
      pokemonData: {},
      usedPokemon: [],
      isLoading: false,
    });

    element = accordionView.render();
    expect(element.querySelector('[data-char="カ"]')).toBeTruthy();
    expect(element.querySelector('[data-char="キ"]')).toBeTruthy();
    expect(element.querySelector('[data-char="ク"]')).toBeTruthy();
    expect(element.querySelector('[data-char="ケ"]')).toBeTruthy();
    expect(element.querySelector('[data-char="コ"]')).toBeTruthy();
  });
});
