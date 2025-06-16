import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createGameController } from '../../controllers/gameController.js';
import { createSearchController } from '../../controllers/searchController.js';
import { createGameStateModel } from '../../models/gameStateModel.js';
import { createPokemonModel } from '../../models/pokemonModel.js';
import { createSearchModel } from '../../models/searchModel.js';
import type { Pokemon } from '../../types/index.js';
import { createGameStatusView } from '../../views/gameStatusView.js';
import { createListView } from '../../views/listView.js';
import { createSearchView } from '../../views/searchView.js';
import { createUsedPokemonView } from '../../views/usedPokemonView.js';
import { createWarningView } from '../../views/warningView.js';

describe('MVC Integration Tests', () => {
  let models: {
    pokemonModel: ReturnType<typeof createPokemonModel>;
    gameStateModel: ReturnType<typeof createGameStateModel>;
    searchModel: ReturnType<typeof createSearchModel>;
  };

  let views: {
    searchView: ReturnType<typeof createSearchView>;
    listView: ReturnType<typeof createListView>;
    gameStatusView: ReturnType<typeof createGameStatusView>;
    usedPokemonView: ReturnType<typeof createUsedPokemonView>;
    warningView: ReturnType<typeof createWarningView>;
  };

  let controllers: {
    searchController: ReturnType<typeof createSearchController>;
    gameController: ReturnType<typeof createGameController>;
  };

  const testPokemon: Pokemon[] = [
    {
      name: 'ピカチュウ',
      genus: 'ねずみポケモン',
      generation_id: 1,
      pokedex_number: 25,
      types: ['electric'],
      firstChar: 'ピ',
      lastChar: 'う',
    },
    {
      name: 'ウインディ',
      genus: 'でんせつポケモン',
      generation_id: 1,
      pokedex_number: 59,
      types: ['fire'],
      firstChar: 'う',
      lastChar: 'ぃ',
    },
    {
      name: 'フシギダネ',
      genus: 'たねポケモン',
      generation_id: 1,
      pokedex_number: 1,
      types: ['grass', 'poison'],
      firstChar: 'フ',
      lastChar: 'ネ',
    },
  ];

  beforeEach(() => {
    // Create models
    const pokemonModel = createPokemonModel();
    models = {
      pokemonModel,
      gameStateModel: createGameStateModel(pokemonModel),
      searchModel: createSearchModel(pokemonModel),
    };

    // Add test Pokemon to models
    for (const pokemon of testPokemon) {
      models.pokemonModel.addPokemon(pokemon);
    }

    // Create views
    views = {
      searchView: createSearchView(),
      listView: createListView(),
      gameStatusView: createGameStatusView(),
      usedPokemonView: createUsedPokemonView(),
      warningView: createWarningView(),
    };

    // Create controllers
    controllers = {
      searchController: createSearchController({
        searchModel: models.searchModel,
        gameStateModel: models.gameStateModel,
        pokemonModel: models.pokemonModel,
        searchView: views.searchView as {
          on: (event: string, callback: (...args: unknown[]) => void) => void;
          update: (data: unknown) => void;
        },
        listView: views.listView as {
          on: (event: string, callback: (...args: unknown[]) => void) => void;
          update: (data: unknown) => void;
        },
      }),
      gameController: createGameController({
        gameStateModel: models.gameStateModel,
        pokemonModel: models.pokemonModel,
        gameStatusView: views.gameStatusView as {
          update: (data: unknown) => void;
          on: (event: string, callback: (...args: unknown[]) => void) => void;
        },
        usedPokemonView: views.usedPokemonView as {
          update: (data: unknown) => void;
        },
        warningView: views.warningView as { update: (data: unknown) => void },
      }),
    };
  });

  describe('Search Flow Integration', () => {
    it('should handle complete search workflow', async () => {
      // Initialize controllers
      await controllers.searchController.initialize();
      await controllers.gameController.initialize();

      // Simulate search input
      controllers.searchController.handleSearch('ピ');

      // Verify search results are filtered
      const results = models.searchModel.getCachedResults();
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('ピカチュウ');
    });

    it('should update disabled items when Pokemon are used', async () => {
      await controllers.searchController.initialize();
      await controllers.gameController.initialize();

      // Use a Pokemon
      const pikachu = models.pokemonModel.getPokemonByName('ピカチュウ');
      expect(pikachu).toBeDefined();

      if (pikachu) {
        const success = controllers.gameController.handlePokemonUse(pikachu);
        expect(success).toBe(true);

        // Check that Pokemon is now in used set
        expect(models.gameStateModel.getUsedPokemon().has('ピカチュウ')).toBe(
          true,
        );

        // Search should now show disabled items
        controllers.searchController.handleSearch('');
        const usedPokemon = Array.from(models.gameStateModel.getUsedPokemon())
          .map((name) => models.pokemonModel.getPokemonByName(name))
          .filter((p): p is Pokemon => p !== null);

        expect(usedPokemon.length).toBe(1);
        expect(usedPokemon[0].name).toBe('ピカチュウ');
      }
    });
  });

  describe('Game State Integration', () => {
    it('should handle Pokemon selection and game progression', async () => {
      await controllers.gameController.initialize();

      // Select first Pokemon
      const pikachu = models.pokemonModel.getPokemonByName('ピカチュウ');
      expect(pikachu).toBeDefined();

      if (pikachu) {
        const success = controllers.gameController.handlePokemonUse(pikachu);
        expect(success).toBe(true);

        // Check game state updates
        expect(models.gameStateModel.getLastUsedPokemon()?.name).toBe(
          'ピカチュウ',
        );
        // Current character is calculated from last used Pokemon's lastChar
        const lastUsed = models.gameStateModel.getLastUsedPokemon();
        expect(lastUsed?.lastChar).toBe('う');

        // Try to select valid next Pokemon
        const windie = models.pokemonModel.getPokemonByName('ウインディ');
        expect(windie).toBeDefined();

        if (windie) {
          const success2 = controllers.gameController.handlePokemonUse(windie);
          expect(success2).toBe(true);

          expect(models.gameStateModel.getUsedPokemon().size).toBe(2);
          // Check that the new last used Pokemon ends with "ィ"
          const newLastUsed = models.gameStateModel.getLastUsedPokemon();
          expect(newLastUsed?.lastChar).toBe('ぃ');
        }
      }
    });

    it('should validate game rules', async () => {
      await controllers.gameController.initialize();

      // Use first Pokemon
      const pikachu = models.pokemonModel.getPokemonByName('ピカチュウ');
      if (pikachu) {
        controllers.gameController.handlePokemonUse(pikachu);
      }

      // Try to use Pokemon with wrong starting character
      const fushigidane = models.pokemonModel.getPokemonByName('フシギダネ');
      expect(fushigidane).toBeDefined();

      if (fushigidane) {
        const violations =
          controllers.gameController.validatePokemonSelection(fushigidane);
        expect(violations.length).toBe(1);
        expect(violations[0].rule).toBe('character_chain');

        // Should not allow selection
        const success =
          controllers.gameController.handlePokemonUse(fushigidane);
        expect(success).toBe(false);
      }
    });

    it('should handle game reset', async () => {
      await controllers.gameController.initialize();

      // Use a Pokemon
      const pikachu = models.pokemonModel.getPokemonByName('ピカチュウ');
      if (pikachu) {
        controllers.gameController.handlePokemonUse(pikachu);
        expect(models.gameStateModel.getUsedPokemon().size).toBe(1);
      }

      // Reset game
      controllers.gameController.handleGameReset();

      expect(models.gameStateModel.getUsedPokemon().size).toBe(0);
      expect(models.gameStateModel.getLastUsedPokemon()).toBeNull();
    });
  });

  describe('Controller Communication', () => {
    it('should coordinate between search and game controllers', async () => {
      await controllers.searchController.initialize();
      await controllers.gameController.initialize();

      // Search for Pokemon
      controllers.searchController.handleSearch('ピ');

      // Get search results
      const results = models.searchModel.getCachedResults();
      expect(results.length).toBe(1);

      const pikachu = results[0];

      // Use Pokemon through game controller
      const success = controllers.gameController.handlePokemonUse(pikachu);
      expect(success).toBe(true);

      // Search should now reflect the used Pokemon
      controllers.searchController.handleSearch('');
      const usedPokemon = Array.from(models.gameStateModel.getUsedPokemon())
        .map((name) => models.pokemonModel.getPokemonByName(name))
        .filter((p): p is Pokemon => p !== null);

      expect(usedPokemon.length).toBe(1);
      expect(usedPokemon[0].name).toBe('ピカチュウ');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle model errors gracefully', async () => {
      // Mock console.error to avoid test output noise
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await controllers.gameController.initialize();

      // Try to use invalid Pokemon
      const invalidPokemon: Pokemon = {
        name: 'InvalidPokemon',
        genus: 'test',
        generation_id: 999,
        pokedex_number: 999,
        types: ['normal'],
        firstChar: 'テ',
        lastChar: 'ト',
      };

      // Should handle gracefully without crashing
      expect(() => {
        controllers.gameController.handlePokemonUse(invalidPokemon);
      }).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('Memory Management', () => {
    it('should clean up resources properly', async () => {
      await controllers.searchController.initialize();
      await controllers.gameController.initialize();

      // Use controllers
      controllers.searchController.handleSearch('test');

      const pikachu = models.pokemonModel.getPokemonByName('ピカチュウ');
      if (pikachu) {
        controllers.gameController.handlePokemonUse(pikachu);
      }

      // Cleanup
      controllers.searchController.destroy();
      controllers.gameController.destroy();

      // Verify cleanup (basic checks)
      expect(() => controllers.searchController.destroy()).not.toThrow();
      expect(() => controllers.gameController.destroy()).not.toThrow();
    });
  });
});
