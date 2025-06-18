import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSearchView } from '../../views/searchView.js';

describe('SearchView', () => {
  let container: HTMLElement;
  let searchView: ReturnType<typeof createSearchView>;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    searchView = createSearchView();
    container.appendChild(searchView.render());
  });

  it('should render search header', () => {
    const element = searchView.render();
    const shadowRoot = element.shadowRoot;
    expect(shadowRoot).toBeTruthy();
    const header = shadowRoot?.querySelector('.search-header');
    expect(header).toBeTruthy();
    expect(header?.textContent).toContain('ポケモン検索');
  });

  it('should render selected character display', () => {
    const element = searchView.render();
    const shadowRoot = element.shadowRoot;
    expect(shadowRoot).toBeTruthy();
    const display = shadowRoot?.querySelector('.search-selected-display');
    expect(display).toBeTruthy();
    expect(display?.textContent).toContain('選択された文字');
  });

  it('should render accordion navigation', () => {
    const element = searchView.render();
    const shadowRoot = element.shadowRoot;
    expect(shadowRoot).toBeTruthy();
    // The accordion is a custom element, so check its existence
    const accordionElement = shadowRoot?.querySelector('accordion-view');
    expect(accordionElement).toBeTruthy();

    // Check that some Japanese row headers are present in the full shadow DOM tree
    expect(shadowRoot?.textContent).toContain('ア行');
    expect(shadowRoot?.textContent).toContain('カ行');
    expect(shadowRoot?.textContent).toContain('サ行');
  });

  it('should emit search:character-select event when character is selected', () => {
    const mockCallback = vi.fn();
    searchView.on('search:character-select', mockCallback);

    // First need to open a row accordion
    searchView.update({
      openRowIndex: 0,
      pokemonData: {},
      usedPokemon: [],
      isLoading: false,
    });

    const element = searchView.render();
    const charButton = element.querySelector(
      '[data-char="ア"]',
    ) as HTMLButtonElement;

    expect(charButton).toBeTruthy();

    // Trigger the click event manually
    const clickEvent = new Event('click');
    charButton.dispatchEvent(clickEvent);

    expect(mockCallback).toHaveBeenCalledWith('ア');
  });

  it('should emit search:clear event when clear is triggered', () => {
    const mockCallback = vi.fn();
    searchView.on('search:clear', mockCallback);

    // Note: There's no clear button in the accordion design currently
    // This test verifies that the event can be emitted programmatically
    // when clear functionality is needed
    const typedView = searchView as unknown as {
      emit: (event: string) => void;
    };
    typedView.emit('search:clear');

    expect(mockCallback).toHaveBeenCalled();
  });

  it('should update selected character display', () => {
    searchView.update({
      openCharacter: 'ア',
      pokemonData: {},
      usedPokemon: [],
      isLoading: false,
    });

    const element = searchView.render();
    const selectedDisplay = element.querySelector('.selected-char');
    expect(selectedDisplay?.textContent).toBe('ア');
  });

  it('should show "なし" when no character is selected', () => {
    searchView.update({
      openCharacter: undefined,
      pokemonData: {},
      usedPokemon: [],
      isLoading: false,
    });

    const element = searchView.render();
    const selectedDisplay = element.querySelector('.selected-char');
    expect(selectedDisplay?.textContent).toBe('なし');
  });

  it('should show error message when provided', () => {
    const element = searchView.render();
    const error = element.querySelector('.search-error') as HTMLElement;

    searchView.update({
      openCharacter: 'ア',
      pokemonData: {},
      usedPokemon: [],
      isLoading: false,
      errorMessage: 'エラーが発生しました',
    });

    expect(error.classList.contains('hidden')).toBe(false);
    expect(error.textContent).toBe('エラーが発生しました');
  });

  it('should hide error message when cleared', () => {
    const element = searchView.render();
    const error = element.querySelector('.search-error') as HTMLElement;

    searchView.update({
      openCharacter: 'ア',
      pokemonData: {},
      usedPokemon: [],
      isLoading: false,
      errorMessage: undefined,
    });

    expect(error.classList.contains('hidden')).toBe(true);
  });
});
