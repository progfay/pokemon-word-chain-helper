import type { Pokemon } from '../types/index.js';
import { normalizeCharacters } from '../utils/characterUtils.js';
import {
  ErrorCategory,
  ErrorSeverity,
  handleError,
} from '../utils/errorHandler.js';
import { createController } from './createController.js';

/**
 * Dependencies required by the SearchController
 * @interface SearchControllerDependencies
 */
export interface SearchControllerDependencies {
  /** Model for Pokemon search operations */
  searchModel: {
    /** Search for Pokemon by query string */
    search: (query: string) => Pokemon[];
    /** Get previously cached search results */
    getCachedResults: () => Pokemon[];
    /** Clear the search cache */
    clearCache: () => void;
  };
  /** Model for game state management */
  gameStateModel: {
    /** Get set of Pokemon names that have been used */
    getUsedPokemon: () => Set<string>;
    /** Mark a Pokemon as used in the game */
    markPokemonAsUsed: (pokemon: Pokemon) => void;
  };
  /** Model for Pokemon data access */
  pokemonModel: {
    /** Get Pokemon by name, returns null if not found */
    getPokemonByName: (name: string) => Pokemon | null;
  };
  /** View for search input and error display */
  searchView: {
    /** Register event listener */
    on: (event: string, callback: (...args: unknown[]) => void) => void;
    /** Update view with new data */
    update: (data: unknown) => void;
  };
  /** View for displaying Pokemon list */
  listView: {
    /** Register event listener */
    on: (event: string, callback: (...args: unknown[]) => void) => void;
    /** Update view with new data */
    update: (data: unknown) => void;
  };
}

/**
 * Creates a search controller that handles Pokemon search interactions
 * @param deps - Dependencies required by the controller
 * @returns SearchController instance with event handling and search management
 */
export const createSearchController = (deps: SearchControllerDependencies) => {
  const { searchModel, gameStateModel, pokemonModel, searchView } = deps;

  /**
   * Handles character selection and updates the accordion view with Pokemon data
   * @param char - Selected character from accordion (katakana)
   */
  const handleCharacterSelect = (char: string) => {
    try {
      // Convert katakana to hiragana for search since Pokemon model indexes by hiragana
      const normalizedChar = normalizeCharacters(char);
      const results = searchModel.search(normalizedChar);
      const usedPokemon = Array.from(gameStateModel.getUsedPokemon())
        .map((name) => pokemonModel.getPokemonByName(name))
        .filter((p): p is Pokemon => p !== null);

      // Group Pokemon by their first character for the accordion (using original katakana char)
      const pokemonData: { [char: string]: Pokemon[] } = {};
      pokemonData[char] = results;

      searchView.update({
        openCharacter: char,
        pokemonData,
        usedPokemon,
        errorMessage: undefined,
      });
    } catch (error) {
      handleError(
        error as Error,
        ErrorCategory.CONTROLLER,
        ErrorSeverity.MEDIUM,
        '検索中にエラーが発生しました',
        { operation: 'search', char },
      );
      searchView.update({
        errorMessage: '検索中にエラーが発生しました',
      });
    }
  };

  /**
   * Handles Pokemon selection from the accordion view
   * @param pokemon - Selected Pokemon object
   */
  const handlePokemonSelect = (pokemon: Pokemon) => {
    const usedPokemon = gameStateModel.getUsedPokemon();

    if (usedPokemon.has(pokemon.name)) {
      searchView.update({
        errorMessage: 'このポケモンはすでに使用されています',
      });
      return;
    }

    // Check if it's a valid chain (if this isn't the first Pokemon)
    if (usedPokemon.size > 0) {
      // TODO: Add chain validation logic here
      // For now, just accept any Pokemon
    }

    gameStateModel.markPokemonAsUsed(pokemon);
    searchView.update({
      openCharacter: undefined,
      openRowIndex: undefined,
      pokemonData: {},
      usedPokemon: Array.from(gameStateModel.getUsedPokemon())
        .map((name) => pokemonModel.getPokemonByName(name))
        .filter((p): p is Pokemon => p !== null),
      errorMessage: undefined,
    });

    // Clear selection to refresh the view
    handleSearchClear();
  };

  const handleSearchClear = () => {
    searchModel.clearCache();
    searchView.update({
      openCharacter: undefined,
      openRowIndex: undefined,
      pokemonData: {},
      usedPokemon: Array.from(gameStateModel.getUsedPokemon())
        .map((name) => pokemonModel.getPokemonByName(name))
        .filter((p): p is Pokemon => p !== null),
      isLoading: false,
      errorMessage: undefined,
    });
  };

  const handleHintToggle = (pokemonId: string, hintType: string) => {
    // TODO: Implement hint toggle logic
    console.log(`Toggling ${hintType} hint for Pokemon ${pokemonId}`);
  };

  const controller = createController({
    setupController: async () => {
      // Set up search event handlers
      searchView.on('search:character-select', ((...args: unknown[]) =>
        handleCharacterSelect(args[0] as string)) as (
        ...args: unknown[]
      ) => void);
      searchView.on('search:pokemon-select', ((...args: unknown[]) =>
        handlePokemonSelect(args[0] as Pokemon)) as (
        ...args: unknown[]
      ) => void);
      searchView.on('search:clear', ((..._args: unknown[]) =>
        handleSearchClear()) as (...args: unknown[]) => void);

      // Initialize with clear state
      handleSearchClear();
    },

    cleanupController: () => {
      // Event cleanup is handled by the view components
    },
  });

  return {
    ...controller,
    handleCharacterSelect,
    handlePokemonSelect,
    handleHintToggle,
  };
};
