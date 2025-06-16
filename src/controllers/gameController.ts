import type {
  GameRuleViolation,
  GameWarning,
  Pokemon,
} from '../types/index.js';
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
    markPokemonAsUsed: (pokemon: Pokemon) => void;
    reset: () => void;
    getLastUsedPokemon: () => Pokemon | null;
    getWarnings: () => GameWarning[];
  };
  pokemonModel: {
    getAllPokemon: () => Pokemon[];
    getPokemonByName: (name: string) => Pokemon | null;
  };
  gameStatusView: {
    update: (data: unknown) => void;
    on: (event: string, callback: (...args: unknown[]) => void) => void;
  };
  usedPokemonView: {
    update: (data: unknown) => void;
  };
  warningView: {
    update: (data: unknown) => void;
  };
}

/**
 * Creates a game controller that manages Pokemon game logic and rules
 * @param deps - Dependencies required by the controller
 * @returns GameController instance with game state management and rule validation
 */
export const createGameController = (deps: GameControllerDependencies) => {
  const {
    gameStateModel,
    pokemonModel,
    gameStatusView,
    usedPokemonView,
    warningView,
  } = deps;

  /**
   * Gets the current character that the next Pokemon should start with
   * @returns The last character of the most recently used Pokemon, or null if no Pokemon used
   */
  const getCurrentCharacter = (): string | null => {
    const lastUsed = gameStateModel.getLastUsedPokemon();
    return lastUsed?.lastChar ?? null;
  };

  const isGameOver = (): boolean => {
    const warnings = gameStateModel.getWarnings();
    return warnings.some((w) => w.type === 'ending_with_n');
  };

  const validatePokemonSelection = (pokemon: Pokemon): GameRuleViolation[] => {
    const violations: GameRuleViolation[] = [];
    const usedPokemon = gameStateModel.getUsedPokemon();
    const currentChar = getCurrentCharacter();

    // Check if already used
    if (usedPokemon.has(pokemon.name)) {
      violations.push({
        rule: 'unique_pokemon',
        message: 'このポケモンはすでに使用されています',
        pokemon,
      });
    }

    // Check character chain rule (if not first Pokemon)
    if (currentChar && pokemon.firstChar !== currentChar) {
      violations.push({
        rule: 'character_chain',
        message: `「${currentChar}」から始まるポケモンを選んでください`,
        pokemon,
      });
    }

    return violations;
  };

  const generateGameWarnings = (pokemon: Pokemon): GameWarning[] => {
    const warnings: GameWarning[] = [];

    // Warning for Pokemon ending with 'ン'
    if (pokemon.lastChar === 'ン') {
      warnings.push({
        type: 'ending_with_n',
        message:
          '「ン」で終わるポケモンです。次のプレイヤーが困るかもしれません',
        pokemon,
      });
    }

    return warnings;
  };

  const updateAllViews = () => {
    const usedPokemonArray = Array.from(gameStateModel.getUsedPokemon())
      .map((name) => pokemonModel.getPokemonByName(name))
      .filter((p): p is Pokemon => p !== null);

    const lastUsed = gameStateModel.getLastUsedPokemon();
    const currentChar = getCurrentCharacter();
    const remainingCount = gameStateModel.getRemainingCount();
    const gameIsOver = isGameOver();

    // Update game status view
    gameStatusView.update({
      lastUsed,
      currentChar,
      remainingCount,
      isGameOver: gameIsOver,
    });

    // Update used Pokemon view
    usedPokemonView.update({
      usedPokemon: usedPokemonArray,
    });

    // Clear warnings initially
    warningView.update({
      warnings: [],
    });
  };

  const handlePokemonUse = (pokemon: Pokemon) => {
    try {
      const violations = validatePokemonSelection(pokemon);

      if (violations.length > 0) {
        // Convert violations to warnings for display
        const warnings: GameWarning[] = violations.map((v) => ({
          type: v.rule === 'unique_pokemon' ? 'already_used' : 'invalid_chain',
          message: v.message,
          pokemon: v.pokemon,
        }));

        warningView.update({ warnings });
        return false;
      }

      // Mark Pokemon as used
      gameStateModel.markPokemonAsUsed(pokemon);

      // Generate and display warnings
      const warnings = generateGameWarnings(pokemon);
      warningView.update({ warnings });

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
      // Set up game status view event handlers
      gameStatusView.on('game:restart', handleGameReset);

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
    validatePokemonSelection,
    generateGameWarnings,
    updateAllViews,
  };
};
