// Pokemon data structure and utilities
import { CharacterUtils } from "./characterUtils.js";

export const PokemonData = {
  database: [],
  usedPokemon: new Set(),

  addPokemon(pokemon) {
    const name = pokemon.name.trim();
    this.database.push({
      ...pokemon,
      name,
      firstChar: CharacterUtils.normalize(name.charAt(0)),
      lastChar: CharacterUtils.normalize(name.charAt(name.length - 1)),
    });
  },

  searchByFirstChar(char) {
    const normalizedChar = CharacterUtils.normalize(char);
    return this.database.filter(
      (pokemon) =>
        !this.usedPokemon.has(pokemon.name) &&
        pokemon.firstChar === normalizedChar
    );
  },

  markAsUsed(pokemonName) {
    this.usedPokemon.add(pokemonName);
  },
};
