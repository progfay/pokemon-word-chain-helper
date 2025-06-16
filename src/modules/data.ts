import type { Pokemon, PokemonType } from '../types';
import pokemonDatabase from '../pokemon_database.json' with { type: "json" };
import { normalizeCharacters } from './characterUtils.js';

// Create a type guard to validate Pokemon types
function isPokemonType(type: string): type is PokemonType {
  const validTypes: PokemonType[] = [
    "grass", "poison", "fire", "flying", "water", "bug", 
    "normal", "electric", "ground", "fairy", "fighting",
    "psychic", "rock", "steel", "ice", "ghost", "dragon", "dark"
  ];
  return validTypes.includes(type as PokemonType);
}

// Create indexed structures for faster lookups
export const pokemonByFirstChar = new Map<string, Pokemon[]>();
export const pokemonByLastChar = new Map<string, Pokemon[]>();

// Process Pokemon data, adding first and last char for search functionality
export const initialPokemonData: Pokemon[] = pokemonDatabase.map(pokemon => {
  const normalizedName = normalizeCharacters(pokemon.name);
  // Validate types
  const validatedTypes = pokemon.types.filter(isPokemonType);
  if (validatedTypes.length === 0) {
    console.warn(`Pokemon ${pokemon.name} has no valid types`);
  }

  const processedPokemon: Pokemon = {
    ...pokemon,
    types: validatedTypes as PokemonType[],
    firstChar: normalizedName[0],
    lastChar: normalizedName[normalizedName.length - 1],
  };

  // Index by first character
  const firstChar = processedPokemon.firstChar;
  if (firstChar) {
    const existing = pokemonByFirstChar.get(firstChar) || [];
    existing.push(processedPokemon);
    pokemonByFirstChar.set(firstChar, existing);
  }

  // Index by last character
  const lastChar = processedPokemon.lastChar;
  if (lastChar) {
    const existing = pokemonByLastChar.get(lastChar) || [];
    existing.push(processedPokemon);
    pokemonByLastChar.set(lastChar, existing);
  }

  return processedPokemon;
});
