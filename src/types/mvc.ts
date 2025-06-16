import type { Pokemon } from './index.js';

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
  getAllPokemon(): Pokemon[];
  searchByFirstChar(char: string): Pokemon[];
  getPokemonByName(name: string): Pokemon | null;
  addPokemon(pokemon: Pokemon): void;
}

export interface GameStateModel extends Model {
  getUsedPokemon(): Set<string>;
  getRemainingCount(): number;
  markPokemonAsUsed(pokemon: Pokemon): void;
  getWarnings(): GameWarning[];
  getLastUsedPokemon(): Pokemon | null;
  reset(): void;
}

export interface SearchModel extends Model {
  search(query: string): Pokemon[];
  getCachedResults(): Pokemon[];
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
  onSelect(pokemon: Pokemon): void;
}

export interface SearchView extends View {
  onSearch(query: string): void;
  updateResults(pokemon: Pokemon[]): void;
  showError(message: string): void;
}

export interface GameStateView extends View {
  updateUsedPokemon(pokemon: Pokemon[]): void;
  updateRemainingCount(count: number): void;
  showWarnings(warnings: GameWarning[]): void;
}

// Controller Interfaces
export interface Controller {
  initialize(): void;
  destroy(): void;
}

export interface SearchController extends Controller {
  handleSearch(query: string): void;
  handlePokemonSelect(pokemon: Pokemon): void;
  handleHintToggle(pokemonId: string, hintType: string): void;
}

export interface GameController extends Controller {
  handlePokemonUse(pokemon: Pokemon): void;
  handleGameReset(): void;
  checkGameRules(pokemon: Pokemon): GameRuleViolation[];
}

// Common Types
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
