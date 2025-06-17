export type PokemonType =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18;

export type Pokemon = [
  name: string,
  genus: string,
  generation_id: number,
  pokedex_number: number,
  types: [PokemonType] | [PokemonType, PokemonType],
];

export type PokemonDatabase = { [firstChar: string]: Pokemon[] };

export interface PokemonObject {
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

interface GameWarning {
  type: 'ending_with_n' | 'already_used' | 'invalid_chain';
  message: string;
  pokemon?: PokemonObject;
}

interface GameRuleViolation {
  rule: string;
  message: string;
  pokemon?: PokemonObject;
}
