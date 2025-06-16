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

  it('should render search form with input', () => {
    const element = searchView.render();
    const input = element.querySelector('input');
    expect(input).toBeTruthy();
    expect(input?.className).toBe('search-input');
    expect(input?.placeholder).toBe('ポケモンの名前を入力...');
  });

  it('should emit search:input event when typing', () => {
    const mockCallback = vi.fn();
    searchView.on('search:input', mockCallback);

    const element = searchView.render();
    const input = element.querySelector('input') as HTMLInputElement;

    input.value = 'ピカ';
    input.dispatchEvent(new Event('input'));

    expect(mockCallback).toHaveBeenCalledWith('ピカ');
  });

  it('should emit search:submit event on form submit', () => {
    const mockCallback = vi.fn();
    searchView.on('search:submit', mockCallback);

    const element = searchView.render();
    const form = element.querySelector('form') as HTMLFormElement;
    const input = element.querySelector('input') as HTMLInputElement;

    input.value = 'ピカチュウ';
    form.dispatchEvent(new Event('submit'));

    expect(mockCallback).toHaveBeenCalledWith('ピカチュウ');
  });

  it('should show/hide clear button based on input value', () => {
    searchView.update({
      query: 'ピカチュウ',
      isLoading: false,
    });

    const element = searchView.render();
    const clearButton = element.querySelector(
      '.search-clear-button',
    ) as HTMLButtonElement;
    expect(clearButton.classList.contains('hidden')).toBe(false);

    searchView.update({
      query: '',
      isLoading: false,
    });

    expect(clearButton.classList.contains('hidden')).toBe(true);
  });

  it('should emit search:clear event when clear button is clicked', () => {
    const mockCallback = vi.fn();
    searchView.on('search:clear', mockCallback);

    searchView.update({
      query: 'ピカチュウ',
      isLoading: false,
    });

    const element = searchView.render();
    const clearButton = element.querySelector(
      '.search-clear-button',
    ) as HTMLButtonElement;
    clearButton.click();

    expect(mockCallback).toHaveBeenCalled();
  });

  it('should show/hide loading spinner', () => {
    const element = searchView.render();
    const spinner = element.querySelector('.search-spinner') as HTMLElement;

    searchView.update({
      query: 'ピカ',
      isLoading: true,
    });
    expect(spinner.classList.contains('hidden')).toBe(false);

    searchView.update({
      query: 'ピカ',
      isLoading: false,
    });
    expect(spinner.classList.contains('hidden')).toBe(true);
  });

  it('should show error message when provided', () => {
    const element = searchView.render();
    const error = element.querySelector('.search-error') as HTMLElement;

    searchView.update({
      query: 'ピカ',
      isLoading: false,
      errorMessage: 'エラーが発生しました',
    });

    expect(error.classList.contains('hidden')).toBe(false);
    expect(error.textContent).toBe('エラーが発生しました');

    searchView.update({
      query: 'ピカ',
      isLoading: false,
      errorMessage: undefined,
    });

    expect(error.classList.contains('hidden')).toBe(true);
  });
});
