import type { PokemonObject } from '../types/index.js';
import {
  ErrorCategory,
  ErrorSeverity,
  handleError,
} from '../utils/errorHandler.js';
import { JAPANESE_ROWS, findRowForChar } from '../utils/japaneseConstants.js';
import { createController } from './createController.js';

// Properly typed event interfaces
export interface SearchViewInterface {
  on(event: 'search:character-select', callback: (char: string) => void): void;
  on(
    event: 'search:pokemon-select',
    callback: (pokemon: PokemonObject) => void,
  ): void;
  on(event: 'search:clear', callback: () => void): void;
  update(data: {
    openCharacter?: string;
    openRowIndex?: number;
    pokemonData?: { [char: string]: PokemonObject[] };
    usedPokemon?: PokemonObject[];
    errorMessage?: string;
    isLoading?: boolean;
  }): void;
}

export interface ListViewInterface {
  on(
    event: 'list:pokemon-select',
    callback: (pokemon: PokemonObject) => void,
  ): void;
  update(data: unknown): void;
}

/**
 * Dependencies required by the SearchController
 * @interface SearchControllerDependencies
 */
export interface SearchControllerDependencies {
  /** Model for Pokemon search operations */
  searchModel: {
    /** Search for Pokemon by query string */
    search: (query: string) => PokemonObject[];
    /** Get previously cached search results */
    getCachedResults: () => PokemonObject[];
    /** Clear the search cache */
    clearCache: () => void;
  };
  /** Model for game state management */
  gameStateModel: {
    /** Get set of Pokemon names that have been used */
    getUsedPokemon: () => Set<string>;
    /** Mark a Pokemon as used in the game */
    markPokemonAsUsed: (pokemon: PokemonObject) => void;
    /** Get the last used Pokemon name */
    getLastUsedPokemon: () => string | null;
  };
  /** Model for Pokemon data access */
  pokemonModel: {
    /** Get Pokemon by name, returns null if not found */
    getPokemonByName: (name: string) => PokemonObject | null;
    /** Check if two Pokemon form a valid chain */
    isValidChain: (previous: PokemonObject, next: PokemonObject) => boolean;
  };
  /** View for search input and error display */
  searchView: SearchViewInterface;
  /** View for displaying Pokemon list */
  listView: ListViewInterface;
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
      // The database uses katakana characters as keys, so search directly with katakana
      const results = searchModel.search(char);
      const usedPokemon = Array.from(gameStateModel.getUsedPokemon())
        .map((name) => pokemonModel.getPokemonByName(name))
        .filter((p): p is PokemonObject => p !== null);

      // Group Pokemon by their first character for the accordion (using original katakana char)
      const pokemonData: { [char: string]: PokemonObject[] } = {};
      pokemonData[char] = results;

      // Find which row contains this character
      const matchingRow = findRowForChar(char);
      const openRowIndex = matchingRow
        ? JAPANESE_ROWS.indexOf(matchingRow)
        : undefined;

      searchView.update({
        openCharacter: char,
        openRowIndex,
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
  const handlePokemonSelect = (pokemon: PokemonObject) => {
    const usedPokemon = gameStateModel.getUsedPokemon();

    if (usedPokemon.has(pokemon.name)) {
      searchView.update({
        errorMessage: 'このポケモンはすでに使用されています',
      });
      return;
    }

    // Check if it's a valid chain (if this isn't the first Pokemon)
    if (usedPokemon.size > 0) {
      const lastUsedPokemonName = gameStateModel.getLastUsedPokemon();
      if (lastUsedPokemonName) {
        const lastUsedPokemon =
          pokemonModel.getPokemonByName(lastUsedPokemonName);
        if (
          lastUsedPokemon &&
          !pokemonModel.isValidChain(lastUsedPokemon, pokemon)
        ) {
          searchView.update({
            errorMessage: `チェーンが無効です。「${lastUsedPokemon.name}」の最後の文字「${lastUsedPokemon.lastChar}」で始まるポケモンを選択してください。`,
          });
          return;
        }
      }
    }

    gameStateModel.markPokemonAsUsed(pokemon);
    searchView.update({
      openCharacter: undefined,
      openRowIndex: undefined,
      pokemonData: {},
      usedPokemon: Array.from(gameStateModel.getUsedPokemon())
        .map((name) => pokemonModel.getPokemonByName(name))
        .filter((p): p is PokemonObject => p !== null),
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
        .filter((p): p is PokemonObject => p !== null),
      isLoading: false,
      errorMessage: undefined,
    });
  };

  const controller = createController({
    setupController: async () => {
      // Set up search event handlers
      searchView.on('search:character-select', handleCharacterSelect);
      searchView.on('search:pokemon-select', handlePokemonSelect);
      searchView.on('search:clear', handleSearchClear);

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
  };
};
