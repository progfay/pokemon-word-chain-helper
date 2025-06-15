import type { Pokemon } from "../types";
import { CharacterUtils } from "./characterUtils.js";

interface PokemonDatabase {
  database: Pokemon[];
  usedPokemon: Set<string>;
  addPokemon(pokemon: Pokemon): void;
  searchByFirstChar(char: string): Pokemon[];
  markAsUsed(pokemonName: string): void;
}

export const PokemonData: PokemonDatabase = {
  database: [],
  usedPokemon: new Set(),

  addPokemon(pokemon: Pokemon): void {
    const name = pokemon.name.trim();
    this.database.push({
      ...pokemon,
      name,
      firstChar: CharacterUtils.normalize(name.charAt(0)),
      lastChar: CharacterUtils.normalize(name.charAt(name.length - 1))
    });
  },

  searchByFirstChar(char: string): Pokemon[] {
    const normalizedChar = CharacterUtils.normalize(char);
    return this.database.filter(
      (pokemon) =>
        !this.usedPokemon.has(pokemon.name) &&
        pokemon.firstChar === normalizedChar
    );
  },

  markAsUsed(pokemonName: string): void {
    this.usedPokemon.add(pokemonName);
  },
};
