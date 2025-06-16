import type { GameWarning, PokemonObject } from '../types/index.js';
import type { GameStateModel } from '../types/mvc.js';
import { createModel } from './createModel.js';

export interface GameStateModelState {
  usedPokemon: Set<string>;
  warnings: GameWarning[];
  lastUsedPokemon: PokemonObject | null;
}

export const createGameStateModel = (pokemonModel: {
  getAllPokemon: () => PokemonObject[];
}) => {
  const baseModel = createModel({
    id: 'game-state-model',
    initialState: {
      usedPokemon: new Set<string>(),
      warnings: [],
      lastUsedPokemon: null,
    } as GameStateModelState,
  });

  const state = baseModel.getState() as GameStateModelState;

  function updateWarnings(): void {
    const warnings: GameWarning[] = [];

    // Check for Pokemon ending with 'ん'
    const allPokemon = pokemonModel.getAllPokemon();
    const unusedPokemon = allPokemon.filter(
      (p) => !state.usedPokemon.has(p.name),
    );
    const nEndingPokemon = unusedPokemon.filter((p) => p.lastChar === 'ン');

    if (nEndingPokemon.length > 0) {
      warnings.push({
        type: 'ending_with_n',
        message: `${nEndingPokemon.length}匹の「ン」で終わるポケモンが残っています`,
        pokemon: nEndingPokemon[0],
      });
    }

    state.warnings = warnings;
    baseModel.setState(state);
  }

  return {
    ...baseModel,

    getUsedPokemon(): Set<string> {
      return state.usedPokemon;
    },

    getRemainingCount(): number {
      return pokemonModel.getAllPokemon().length - state.usedPokemon.size;
    },

    markPokemonAsUsed(pokemon: PokemonObject): void {
      try {
        state.usedPokemon.add(pokemon.name);
        state.lastUsedPokemon = pokemon;
        updateWarnings();
        baseModel.setState(state);
      } catch (error) {
        baseModel.handleError(error as Error);
      }
    },

    getWarnings(): GameWarning[] {
      return state.warnings;
    },

    getLastUsedPokemon(): PokemonObject | null {
      return state.lastUsedPokemon;
    },

    reset(): void {
      state.usedPokemon.clear();
      state.warnings = [];
      state.lastUsedPokemon = null;
      baseModel.setState(state);
    },
  } as GameStateModel;
};
