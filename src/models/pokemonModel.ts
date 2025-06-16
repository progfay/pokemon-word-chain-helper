import type { Pokemon, PokemonType, PokemonObject, PokemonDatabase } from '../types/index.js';
import type { PokemonModel } from '../types/mvc.js';
import { normalizeCharacters, CharacterUtils } from '../utils/characterUtils.js';
import { createModel } from './createModel.js';

/**
 * State interface for Pokemon model data storage
 * @interface PokemonModelState
 */
export interface PokemonModelState {
  /** Array of all Pokemon */
  allPokemon: PokemonObject[];
  /** Map of Pokemon grouped by first character for efficient search */
  pokemonByFirstChar: Map<string, PokemonObject[]>;
  /** Map of Pokemon grouped by last character for chain validation */
  pokemonByLastChar: Map<string, PokemonObject[]>;
}

/**
 * Map numeric type IDs to type names
 */
const TYPE_ID_TO_NAME: Record<PokemonType, string> = {
  1: 'normal',
  2: 'fire',
  3: 'water',
  4: 'electric',
  5: 'grass',
  6: 'ice',
  7: 'fighting',
  8: 'poison',
  9: 'ground',
  10: 'flying',
  11: 'psychic',
  12: 'bug',
  13: 'rock',
  14: 'ghost',
  15: 'dragon',
  16: 'dark',
  17: 'steel',
  18: 'fairy',
};

/**
 * Convert a Pokemon tuple to a PokemonObject
 */
function tupleToObject(tuple: Pokemon): PokemonObject {
  const [name, genus, generation_id, pokedex_number, types] = tuple;
  return {
    name,
    genus,
    generation_id,
    pokedex_number,
    types,
  };
}


/**
 * Process a Pokemon object to add first and last character information
 */
function processPokemon(pokemon: PokemonObject): PokemonObject {
  // Convert to katakana since database uses katakana keys
  const katakanaName = CharacterUtils.toKatakana(pokemon.name);

  return {
    ...pokemon,
    firstChar: katakanaName[0],
    lastChar: katakanaName[katakanaName.length - 1],
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

    getAllPokemon(): PokemonObject[] {
      return state.allPokemon;
    },

    searchByFirstChar(char: string): PokemonObject[] {
      // The database uses katakana characters as keys, so search directly with the provided character
      return state.pokemonByFirstChar.get(char) || [];
    },

    getPokemonByName(name: string): PokemonObject | null {
      return state.allPokemon.find((p) => p.name === name) || null;
    },

    /**
     * Load Pokemon data from the new tuple-based database format
     */
    loadFromDatabase(database: PokemonDatabase): void {
      try {
        // Clear existing data
        state.allPokemon = [];
        state.pokemonByFirstChar.clear();
        state.pokemonByLastChar.clear();

        // Process each character group
        for (const [char, pokemonTuples] of Object.entries(database)) {
          const pokemonObjects = pokemonTuples.map(tuple => {
            const pokemonObj = tupleToObject(tuple);
            return processPokemon(pokemonObj);
          });

          // Add to all Pokemon list
          state.allPokemon.push(...pokemonObjects);

          // Index by first character
          state.pokemonByFirstChar.set(char, pokemonObjects);

          // Index by last character
          for (const pokemon of pokemonObjects) {
            if (pokemon.lastChar) {
              const existingLast = state.pokemonByLastChar.get(pokemon.lastChar) || [];
              existingLast.push(pokemon);
              state.pokemonByLastChar.set(pokemon.lastChar, existingLast);
            }
          }
        }

        baseModel.setState(state);
      } catch (error) {
        baseModel.handleError(error as Error);
      }
    },

    addPokemon(pokemon: PokemonObject): void {
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
    getPokemonByLastChar(char: string): PokemonObject[] {
      // Search directly with the provided character (should be katakana)
      return state.pokemonByLastChar.get(char) || [];
    },

    /**
     * Check if a Pokemon chain is valid (last character matches first character)
     */
    isValidChain(previous: PokemonObject, next: PokemonObject): boolean {
      if (!previous.lastChar || !next.firstChar) return false;
      return (
        normalizeCharacters(previous.lastChar) ===
        normalizeCharacters(next.firstChar)
      );
    },

    /**
     * Get type name from numeric type ID
     */
    getTypeName(typeId: PokemonType): string {
      return TYPE_ID_TO_NAME[typeId] || 'unknown';
    },
  } as PokemonModel;
};
