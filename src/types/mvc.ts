import type { PokemonObject, PokemonDatabase } from './index.js';

// Model Interfaces
export interface EventEmitter {
  on(event: string, callback: (data: unknown) => void): void;
  off(event: string, callback: (data: unknown) => void): void;
  emit(event: string, data: unknown): void;
}

export interface Model extends EventEmitter {
  getId(): string;
  getState(): unknown;
}

export interface PokemonModel extends Model {
  getAllPokemon(): PokemonObject[];
  searchByFirstChar(char: string): PokemonObject[];
  getPokemonByName(name: string): PokemonObject | null;
  addPokemon(pokemon: PokemonObject): void;
  loadFromDatabase(database: PokemonDatabase): void;
  getTypeName(typeId: number): string;
}

export interface GameStateModel extends Model {
  getUsedPokemon(): Set<string>;
  getRemainingCount(): number;
  markPokemonAsUsed(pokemon: PokemonObject): void;
  reset(): void;
}

export interface SearchModel extends Model {
  search(query: string): PokemonObject[];
  getCachedResults(): PokemonObject[];
  clearCache(): void;
}

// View Interfaces
export interface View {
  render(): HTMLElement;
  update(data: unknown): void;
  destroy(): void;
}

export interface PokemonCardView extends View {
  onImagePhaseChange(phase: number): void;
  onHintToggle(type: string): void;
  onSelect(pokemon: PokemonObject): void;
}

export interface SearchView extends View {
  onSearch(query: string): void;
  updateResults(pokemon: PokemonObject[]): void;
  showError(message: string): void;
}

export interface GameStateView extends View {
  updateUsedPokemon(pokemon: PokemonObject[]): void;
  updateRemainingCount(count: number): void;
}

// Controller Interfaces
export interface Controller {
  initialize(): void;
  destroy(): void;
}

export interface SearchController extends Controller {
  handleSearch(query: string): void;
  handlePokemonSelect(pokemon: PokemonObject): void;
  handleHintToggle(pokemonId: string, hintType: string): void;
}

export interface GameController extends Controller {
  handlePokemonUse(pokemon: PokemonObject): void;
  handleGameReset(): void;
}


// Event Types
export type ModelEventMap = {
  'state:changed': unknown;
  error: Error;
  [key: string]: unknown;
};

export type ViewEventMap = {
  'view:mounted': HTMLElement;
  'view:updated': unknown;
  'view:destroyed': undefined;
  [key: string]: unknown;
};

export type ControllerEventMap = {
  initialized: undefined;
  destroyed: undefined;
  [key: string]: unknown;
};
