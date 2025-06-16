import type { PokemonObject } from '../types/index.js';
import {
  ErrorCategory,
  ErrorSeverity,
  handleError,
} from '../utils/errorHandler.js';
import { createController } from './createController.js';

/**
 * Dependencies required by the GameController
 * @interface GameControllerDependencies
 */
export interface GameControllerDependencies {
  gameStateModel: {
    getUsedPokemon: () => Set<string>;
    getRemainingCount: () => number;
    markPokemonAsUsed: (pokemon: PokemonObject) => void;
    reset: () => void;
  };
  pokemonModel: {
    getAllPokemon: () => PokemonObject[];
    getPokemonByName: (name: string) => PokemonObject | null;
  };
  gameStatusView: {
    update: (data: unknown) => void;
  };
  usedPokemonView: {
    update: (data: unknown) => void;
  };
}

/**
 * Creates a game controller that manages used Pokemon tracking
 * @param deps - Dependencies required by the controller
 * @returns GameController instance with used Pokemon management
 */
export const createGameController = (deps: GameControllerDependencies) => {
  const {
    gameStateModel,
    pokemonModel,
    gameStatusView,
    usedPokemonView,
  } = deps;

  const updateAllViews = () => {
    const usedPokemonArray = Array.from(gameStateModel.getUsedPokemon())
      .map((name) => pokemonModel.getPokemonByName(name))
      .filter((p): p is PokemonObject => p !== null);

    const remainingCount = gameStateModel.getRemainingCount();

    // Update game status view (just remaining count)
    gameStatusView.update({
      remainingCount,
    });

    // Update used Pokemon view
    usedPokemonView.update({
      usedPokemon: usedPokemonArray,
    });
  };

  const handlePokemonUse = (pokemon: PokemonObject) => {
    try {
      // Simply mark Pokemon as used
      gameStateModel.markPokemonAsUsed(pokemon);

      // Update all views
      updateAllViews();

      return true;
    } catch (error) {
      handleError(
        error as Error,
        ErrorCategory.CONTROLLER,
        ErrorSeverity.HIGH,
        'ポケモンの選択中にエラーが発生しました',
        { operation: 'pokemon_use', pokemon: pokemon.name },
      );
      return false;
    }
  };

  const handleGameReset = () => {
    gameStateModel.reset();
    updateAllViews();
  };

  const handleGameStateChange = () => {
    updateAllViews();
  };

  const controller = createController({
    setupController: async () => {
      // Initialize views
      updateAllViews();
    },

    cleanupController: () => {
      // Event cleanup is handled by the view components
    },
  });

  return {
    ...controller,
    handlePokemonUse,
    handleGameReset,
    handleGameStateChange,
    updateAllViews,
  };
};
