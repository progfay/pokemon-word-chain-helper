import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type SearchControllerDependencies,
  createSearchController,
} from '../../controllers/searchController.js';
import type { Pokemon } from '../../types/index.js';

describe('SearchController', () => {
  let searchController: ReturnType<typeof createSearchController>;
  let mockDependencies: SearchControllerDependencies;

  const testPokemon: Pokemon[] = [
    {
      name: 'ピカチュウ',
      genus: 'ねずみポケモン',
      generation_id: 1,
      pokedex_number: 25,
      types: ['electric'],
      firstChar: 'ピ',
      lastChar: 'ウ',
    },
    {
      name: 'ウインディ',
      genus: 'でんせつポケモン',
      generation_id: 1,
      pokedex_number: 59,
      types: ['fire'],
      firstChar: 'ウ',
      lastChar: 'ィ',
    },
  ];

  beforeEach(() => {
    mockDependencies = {
      searchModel: {
        search: vi.fn().mockReturnValue(testPokemon),
        getCachedResults: vi.fn().mockReturnValue(testPokemon),
        clearCache: vi.fn(),
      },
      gameStateModel: {
        getUsedPokemon: vi.fn().mockReturnValue(new Set()),
        markPokemonAsUsed: vi.fn(),
      },
      pokemonModel: {
        getPokemonByName: vi
          .fn()
          .mockImplementation(
            (name: string) => testPokemon.find((p) => p.name === name) || null,
          ),
      },
      searchView: {
        on: vi.fn(),
        update: vi.fn(),
      },
      listView: {
        on: vi.fn(),
        update: vi.fn(),
      },
    };

    searchController = createSearchController(mockDependencies);
  });

  describe('Search Handling', () => {
    it('should handle search input', () => {
      const query = 'ピ';

      searchController.handleSearch(query);

      expect(mockDependencies.searchModel.search).toHaveBeenCalledWith(query);
      expect(mockDependencies.listView.update).toHaveBeenCalledWith({
        items: testPokemon,
        disabledItems: [],
      });
    });

    it('should filter out used Pokemon from results', () => {
      const usedPokemon = new Set(['ピカチュウ']);
      (mockDependencies.gameStateModel.getUsedPokemon as Mock).mockReturnValue(
        usedPokemon,
      );

      searchController.handleSearch('test');

      const updateCall = (mockDependencies.listView.update as Mock).mock
        .calls[0][0];
      expect(updateCall.disabledItems).toHaveLength(1);
      expect(updateCall.disabledItems[0].name).toBe('ピカチュウ');
    });
  });

  describe('Pokemon Selection', () => {
    it('should handle valid Pokemon selection', () => {
      const pokemon = testPokemon[0];

      searchController.handlePokemonSelect(pokemon);

      expect(
        mockDependencies.gameStateModel.markPokemonAsUsed,
      ).toHaveBeenCalledWith(pokemon);
      expect(mockDependencies.searchView.update).toHaveBeenCalledWith({
        query: '',
        errorMessage: undefined,
      });
    });

    it('should reject already used Pokemon', () => {
      const pokemon = testPokemon[0];
      const usedPokemon = new Set([pokemon.name]);
      (mockDependencies.gameStateModel.getUsedPokemon as Mock).mockReturnValue(
        usedPokemon,
      );

      searchController.handlePokemonSelect(pokemon);

      expect(
        mockDependencies.gameStateModel.markPokemonAsUsed,
      ).not.toHaveBeenCalled();
      expect(mockDependencies.searchView.update).toHaveBeenCalledWith({
        errorMessage: 'このポケモンはすでに使用されています',
      });
    });
  });

  describe('Search Submit', () => {
    it('should select first valid Pokemon on submit', async () => {
      await searchController.initialize();

      // Find and call the search:submit event handler
      const submitHandler = (
        mockDependencies.searchView.on as Mock
      ).mock.calls.find((call: unknown[]) => call[0] === 'search:submit')?.[1];

      if (submitHandler) {
        submitHandler('test');
        expect(
          mockDependencies.gameStateModel.markPokemonAsUsed,
        ).toHaveBeenCalledWith(testPokemon[0]);
      } else {
        throw new Error('Search submit handler not found');
      }
    });

    it('should show error when no valid Pokemon found', async () => {
      const usedPokemon = new Set(testPokemon.map((p) => p.name));
      (mockDependencies.gameStateModel.getUsedPokemon as Mock).mockReturnValue(
        usedPokemon,
      );

      await searchController.initialize();

      const submitHandler = (
        mockDependencies.searchView.on as Mock
      ).mock.calls.find((call: unknown[]) => call[0] === 'search:submit')?.[1];

      if (submitHandler) {
        submitHandler('test');
        expect(mockDependencies.searchView.update).toHaveBeenCalledWith({
          errorMessage: '該当するポケモンが見つかりません',
        });
      } else {
        throw new Error('Search submit handler not found');
      }
    });
  });

  describe('Initialization', () => {
    it('should set up event listeners on initialization', async () => {
      await searchController.initialize();

      expect(mockDependencies.searchView.on).toHaveBeenCalledWith(
        'search:input',
        expect.any(Function),
      );
      expect(mockDependencies.searchView.on).toHaveBeenCalledWith(
        'search:submit',
        expect.any(Function),
      );
      expect(mockDependencies.searchView.on).toHaveBeenCalledWith(
        'search:clear',
        expect.any(Function),
      );
      expect(mockDependencies.listView.on).toHaveBeenCalledWith(
        'item:click',
        expect.any(Function),
      );
    });

    it('should perform initial search on initialization', async () => {
      await searchController.initialize();

      expect(mockDependencies.searchModel.search).toHaveBeenCalledWith('');
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', () => {
      (mockDependencies.searchModel.search as Mock).mockImplementation(() => {
        throw new Error('Search failed');
      });

      expect(() => {
        searchController.handleSearch('test');
      }).not.toThrow();
    });
  });
});
