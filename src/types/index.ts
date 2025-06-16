export type PokemonType =
  | 'grass'
  | 'poison'
  | 'fire'
  | 'flying'
  | 'water'
  | 'bug'
  | 'normal'
  | 'electric'
  | 'ground'
  | 'fairy'
  | 'fighting'
  | 'psychic'
  | 'rock'
  | 'steel'
  | 'ice'
  | 'ghost'
  | 'dragon'
  | 'dark';

export interface Pokemon {
  /** Name of Pokemon (e.g.: "ピカチュウ") */
  name: string;
  /** Genus of Pokemon (e.g.: "ねずみポケモン") */
  genus: string;
  /** The first generation that the Pokemon appear (e.g.: 1) */
  generation_id: number;
  /** Pokedex number (e.g.: 25) */
  pokedex_number: number;
  /** Type name that the Pokemon has (e.g.: "electric") */
  types: PokemonType[];
  /** Added for search functionality */
  firstChar?: string;
  /** Added for search functionality */
  lastChar?: string;
}

export interface CharacterMap {
  [key: string]: string;
}

export interface GameWarning {
  type: 'ending_with_n' | 'already_used' | 'invalid_chain';
  message: string;
  pokemon?: Pokemon;
}

export interface GameRuleViolation {
  rule: string;
  message: string;
  pokemon?: Pokemon;
}
