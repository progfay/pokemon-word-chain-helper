import type { PokemonObject } from '../types/index.js';
import type { GameStateModel } from '../types/mvc.js';
import { createModel } from './createModel.js';

export interface GameStateModelState {
  usedPokemon: Set<string>;
  usedPokemonOrder: string[]; // Maintains the order of Pokemon selection
}

export const createGameStateModel = (pokemonModel: {
  getAllPokemon: () => PokemonObject[];
}) => {
  const baseModel = createModel({
    id: 'game-state-model',
    initialState: {
      usedPokemon: new Set<string>(),
      usedPokemonOrder: [],
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
        state.usedPokemonOrder.push(pokemon.name);
        baseModel.setState(state);
      } catch (error) {
        baseModel.handleError(error as Error);
      }
    },

    getLastUsedPokemon(): string | null {
      return state.usedPokemonOrder.length > 0
        ? state.usedPokemonOrder[state.usedPokemonOrder.length - 1]
        : null;
    },

    getUsedPokemonInOrder(): string[] {
      return [...state.usedPokemonOrder];
    },

    reset(): void {
      state.usedPokemon.clear();
      state.usedPokemonOrder = [];
      baseModel.setState(state);
    },
  } as GameStateModel;
};
