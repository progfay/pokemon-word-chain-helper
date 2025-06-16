import type { Pokemon } from '../types/index.js';
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
  const { searchModel, gameStateModel, pokemonModel, searchView, listView } =
    deps;

  /**
   * Handles search input and updates the list view with filtered results
   * @param query - Search query string
   */
  const handleSearch = (query: string) => {
    try {
      const results = searchModel.search(query);
      const usedPokemon = Array.from(gameStateModel.getUsedPokemon())
        .map((name) => pokemonModel.getPokemonByName(name))
        .filter((p): p is Pokemon => p !== null);

      listView.update({
        items: results,
        disabledItems: usedPokemon,
      });
    } catch (error) {
      handleError(
        error as Error,
        ErrorCategory.CONTROLLER,
        ErrorSeverity.MEDIUM,
        '検索中にエラーが発生しました',
        { operation: 'search', query },
      );
      searchView.update({
        errorMessage: '検索中にエラーが発生しました',
      });
    }
  };

  /**
   * Handles Pokemon selection from the list view
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
      query: '',
      errorMessage: undefined,
    });

    // Refresh search with empty query to show all available Pokemon
    handleSearch('');
  };

  const handleSearchSubmit = (_query: string) => {
    const results = searchModel.getCachedResults();
    const usedPokemon = gameStateModel.getUsedPokemon();

    // Find first valid Pokemon from search results
    const validPokemon = results.find((p) => {
      return !usedPokemon.has(p.name);
    });

    if (validPokemon) {
      handlePokemonSelect(validPokemon);
    } else {
      searchView.update({
        errorMessage: '該当するポケモンが見つかりません',
      });
    }
  };

  const handleSearchClear = () => {
    searchModel.clearCache();
    handleSearch('');
  };

  const handleHintToggle = (pokemonId: string, hintType: string) => {
    // TODO: Implement hint toggle logic
    console.log(`Toggling ${hintType} hint for Pokemon ${pokemonId}`);
  };

  const controller = createController({
    setupController: async () => {
      // Set up search event handlers
      searchView.on('search:input', ((...args: unknown[]) =>
        handleSearch(args[0] as string)) as (...args: unknown[]) => void);
      searchView.on('search:submit', ((...args: unknown[]) =>
        handleSearchSubmit(args[0] as string)) as (...args: unknown[]) => void);
      searchView.on('search:clear', ((..._args: unknown[]) =>
        handleSearchClear()) as (...args: unknown[]) => void);

      // Set up list view event handlers
      listView.on('item:click', ((...args: unknown[]) =>
        handlePokemonSelect(args[0] as Pokemon)) as (
        ...args: unknown[]
      ) => void);

      // Initialize with empty search (show all Pokemon)
      handleSearch('');
    },

    cleanupController: () => {
      // Event cleanup is handled by the view components
    },
  });

  return {
    ...controller,
    handleSearch,
    handlePokemonSelect,
    handleHintToggle,
  };
};
