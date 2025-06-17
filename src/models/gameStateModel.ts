import type { PokemonObject } from '../types/index.js';
import type { GameStateModel } from '../types/mvc.js';
import { createModel } from './createModel.js';

export interface GameStateModelState {
  usedPokemon: Set<string>;
}

export const createGameStateModel = (pokemonModel: {
  getAllPokemon: () => PokemonObject[];
}) => {
  const baseModel = createModel({
    id: 'game-state-model',
    initialState: {
      usedPokemon: new Set<string>(),
    } as GameStateModelState,
  });

  const state = baseModel.getState() as GameStateModelState;

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
        baseModel.setState(state);
      } catch (error) {
        baseModel.handleError(error as Error);
      }
    },

    reset(): void {
      state.usedPokemon.clear();
      baseModel.setState(state);
    },
  } as GameStateModel;
};
