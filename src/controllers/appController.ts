import { createGameStateModel } from '../models/gameStateModel.js';
import { createPokemonModel } from '../models/pokemonModel.js';
import { createSearchModel } from '../models/searchModel.js';
import pokemonDatabase from '../pokemon_database.json' with { type: 'json' };
import type { Pokemon } from '../types/index.js';
import {
  ErrorCategory,
  globalErrorHandler,
  initializeGlobalErrorHandling,
  setupDefaultRecoveryStrategies,
} from '../utils/errorHandler.js';
import { initializeErrorReporting } from '../utils/errorReporting.js';
import { createGameStatusView } from '../views/gameStatusView.js';
import { createListView } from '../views/listView.js';
import { createSearchView } from '../views/searchView.js';
import { createUsedPokemonView } from '../views/usedPokemonView.js';
import { createWarningView } from '../views/warningView.js';
import { createController } from './createController.js';
import { createGameController } from './gameController.js';
import { createSearchController } from './searchController.js';

export const createAppController = () => {
  // Initialize models
  const pokemonModel = createPokemonModel();
  for (const pokemon of pokemonDatabase) {
    pokemonModel.addPokemon(pokemon as Pokemon);
  }

  const gameStateModel = createGameStateModel(pokemonModel);
  const searchModel = createSearchModel(pokemonModel);

  // Initialize views
  const searchView = createSearchView();
  const listView = createListView();
  const gameStatusView = createGameStatusView();
  const usedPokemonView = createUsedPokemonView();
  const warningView = createWarningView();

  // Initialize controllers
  const searchController = createSearchController({
    searchModel,
    gameStateModel,
    pokemonModel,
    searchView: searchView as {
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      update: (data: unknown) => void;
    },
    listView: listView as {
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      update: (data: unknown) => void;
    },
  });

  const gameController = createGameController({
    gameStateModel,
    pokemonModel,
    gameStatusView: gameStatusView as {
      update: (data: unknown) => void;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
    },
    usedPokemonView: usedPokemonView as { update: (data: unknown) => void },
    warningView: warningView as { update: (data: unknown) => void },
  });

  // Create root layout
  const createLayout = () => {
    const container = document.createElement('div');
    container.className = 'app-container';

    const header = document.createElement('header');
    header.className = 'app-header';
    header.innerHTML = '<h1>ポケモンしりとり</h1>';

    const main = document.createElement('main');
    main.className = 'app-main';

    // Mount views
    main.appendChild(searchView.render());
    main.appendChild(gameStatusView.render());
    main.appendChild(usedPokemonView.render());
    main.appendChild(warningView.render());
    main.appendChild(listView.render());

    container.appendChild(header);
    container.appendChild(main);
    document.body.appendChild(container);
  };

  const controller = createController({
    setupController: async () => {
      // Initialize global error handling and reporting
      initializeGlobalErrorHandling();
      setupDefaultRecoveryStrategies();
      initializeErrorReporting({
        showUserNotifications: true,
        enableConsoleLogging: true,
        enableRemoteReporting: false, // Set to true when you have a reporting endpoint
        appVersion: '1.0.0',
        maxErrorsPerSession: 10,
      });

      // Set up error handlers for controllers
      globalErrorHandler.onError(ErrorCategory.CONTROLLER, (error) => {
        console.error('Controller error:', error);
        // Could show user notification here
      });

      // Create and mount the UI
      createLayout();

      // Initialize controllers
      await searchController.initialize();
      await gameController.initialize();

      // Connect search and game controllers
      listView.on('item:click', (selectedPokemon: Pokemon) => {
        const success = gameController.handlePokemonUse(selectedPokemon);
        if (success) {
          // Refresh search results after successful Pokemon selection
          searchController.handleCharacterSelect('');
        }
      });

      // Listen for game state changes to update search view
      gameStateModel.on('state:updated', () => {
        gameController.handleGameStateChange();
        // Refresh search results to reflect new disabled items
        searchController.handleCharacterSelect('');
      });

      // Handle error propagation
      searchController.on('error', ((...args: unknown[]) => {
        const error = args[0] as Error;
        console.error('Search controller error:', error);
      }) as (...args: unknown[]) => void);

      gameController.on('error', ((...args: unknown[]) => {
        const error = args[0] as Error;
        console.error('Game controller error:', error);
      }) as (...args: unknown[]) => void);

      // Initial setup
      gameStateModel.reset();
    },

    cleanupController: () => {
      // Cleanup controllers
      searchController.destroy();
      gameController.destroy();

      // Cleanup views
      searchView.destroy();
      listView.destroy();
      gameStatusView.destroy();
      usedPokemonView.destroy();
      warningView.destroy();

      // Reset models
      gameStateModel.reset();
      searchModel.clearCache();
    },
  });

  return controller;
};
