import type { PokemonObject } from '../types/index.js';
import type { SearchModel } from '../types/mvc.js';
import { createModel } from './createModel.js';

interface SearchModelState {
  lastQuery: string;
  results: PokemonObject[];
  isSearching: boolean;
}

export const createSearchModel = (pokemonModel: {
  searchByFirstChar: (char: string) => PokemonObject[];
  getAllPokemon: () => PokemonObject[];
}) => {
  const baseModel = createModel({
    id: 'search-model',
    initialState: {
      lastQuery: '',
      results: pokemonModel.getAllPokemon(), // Start with all Pokemon
      isSearching: false,
    } as SearchModelState,
  });

  const state = baseModel.getState() as SearchModelState;

  return {
    ...baseModel,

    search(query: string): PokemonObject[] {
      try {
        state.isSearching = true;
        state.lastQuery = query;

        if (query.trim() === '') {
          // Empty query returns all Pokemon
          state.results = pokemonModel.getAllPokemon();
        } else {
          // Character search uses first character search
          const firstChar = query.charAt(0);
          state.results = pokemonModel.searchByFirstChar(firstChar);
        }

        state.isSearching = false;
        baseModel.setState(state);

        return state.results;
      } catch (error) {
        baseModel.handleError(error as Error);
        state.isSearching = false;
        state.results = [];
        baseModel.setState(state);
        return [];
      }
    },

    getCachedResults(): PokemonObject[] {
      return state.results;
    },

    clearCache(): void {
      state.lastQuery = '';
      state.results = pokemonModel.getAllPokemon(); // Reset to all Pokemon
      baseModel.setState(state);
    },

    isSearchInProgress(): boolean {
      return state.isSearching;
    },

    getLastQuery(): string {
      return state.lastQuery;
    },
  } as SearchModel;
};
