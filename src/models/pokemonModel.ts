import type { Pokemon, PokemonType } from '../types/index.js';
import type { PokemonModel } from '../types/mvc.js';
import { normalizeCharacters } from '../utils/characterUtils.js';
import { createModel } from './createModel.js';

/**
 * State interface for Pokemon model data storage
 * @interface PokemonModelState
 */
export interface PokemonModelState {
  /** Array of all Pokemon */
  allPokemon: Pokemon[];
  /** Map of Pokemon grouped by first character for efficient search */
  pokemonByFirstChar: Map<string, Pokemon[]>;
  /** Map of Pokemon grouped by last character for chain validation */
  pokemonByLastChar: Map<string, Pokemon[]>;
}

/**
 * Validate if a type is a valid Pokemon type
 */
function isPokemonType(type: string): type is PokemonType {
  const validTypes: PokemonType[] = [
    'grass',
    'poison',
    'fire',
    'flying',
    'water',
    'bug',
    'normal',
    'electric',
    'ground',
    'fairy',
    'fighting',
    'psychic',
    'rock',
    'steel',
    'ice',
    'ghost',
    'dragon',
    'dark',
  ];
  return validTypes.includes(type as PokemonType);
}

/**
 * Process a Pokemon object to add first and last character information
 */
function processPokemon(pokemon: Pokemon): Pokemon {
  const normalizedName = normalizeCharacters(pokemon.name);
  const validatedTypes = pokemon.types.filter(isPokemonType);

  if (validatedTypes.length === 0) {
    console.warn(`Pokemon ${pokemon.name} has no valid types`);
  }

  return {
    ...pokemon,
    types: validatedTypes as PokemonType[],
    firstChar: normalizedName[0],
    lastChar: normalizedName[normalizedName.length - 1],
  };
}

/**
 * Creates a Pokemon model for managing Pokemon data and search operations
 * @returns PokemonModel instance with data management and search capabilities
 */
export const createPokemonModel = () => {
  const baseModel = createModel({
    id: 'pokemon-model',
    initialState: {
      allPokemon: [],
      pokemonByFirstChar: new Map(),
      pokemonByLastChar: new Map(),
    } as PokemonModelState,
  });

  const state = baseModel.getState() as PokemonModelState;

  return {
    ...baseModel,

    getAllPokemon(): Pokemon[] {
      return state.allPokemon;
    },

    searchByFirstChar(char: string): Pokemon[] {
      const normalizedChar = normalizeCharacters(char);
      return state.pokemonByFirstChar.get(normalizedChar) || [];
    },

    getPokemonByName(name: string): Pokemon | null {
      return state.allPokemon.find((p) => p.name === name) || null;
    },

    addPokemon(pokemon: Pokemon): void {
      try {
        const processedPokemon = processPokemon(pokemon);

        // Add to all Pokemon list
        state.allPokemon.push(processedPokemon);

        // Index by first character
        if (processedPokemon.firstChar) {
          const existingFirst =
            state.pokemonByFirstChar.get(processedPokemon.firstChar) || [];
          existingFirst.push(processedPokemon);
          state.pokemonByFirstChar.set(
            processedPokemon.firstChar,
            existingFirst,
          );
        }

        // Index by last character
        if (processedPokemon.lastChar) {
          const existingLast =
            state.pokemonByLastChar.get(processedPokemon.lastChar) || [];
          existingLast.push(processedPokemon);
          state.pokemonByLastChar.set(processedPokemon.lastChar, existingLast);
        }

        baseModel.setState(state);
      } catch (error) {
        baseModel.handleError(error as Error);
      }
    },

    /**
     * Get Pokemon that end with a specific character
     */
    getPokemonByLastChar(char: string): Pokemon[] {
      const normalizedChar = normalizeCharacters(char);
      return state.pokemonByLastChar.get(normalizedChar) || [];
    },

    /**
     * Check if a Pokemon chain is valid (last character matches first character)
     */
    isValidChain(previous: Pokemon, next: Pokemon): boolean {
      if (!previous.lastChar || !next.firstChar) return false;
      return (
        normalizeCharacters(previous.lastChar) ===
        normalizeCharacters(next.firstChar)
      );
    },
  } as PokemonModel;
};
