import type { PokemonDatabase, PokemonObject } from './index.js';

// Model Interfaces
interface EventEmitter {
  on(event: string, callback: (data: unknown) => void): void;
  off(event: string, callback: (data: unknown) => void): void;
  emit(event: string, data: unknown): void;
}

interface Model extends EventEmitter {
  getId(): string;
  getState(): unknown;
}

export interface PokemonModel extends Model {
  getAllPokemon(): PokemonObject[];
  searchByFirstChar(char: string): PokemonObject[];
  searchByName(query: string): PokemonObject[];
  getPokemonByName(name: string): PokemonObject | null;
  addPokemon(pokemon: PokemonObject): void;
  loadFromDatabase(database: PokemonDatabase): void;
  getTypeName(typeId: number): string;
  isValidChain(previous: PokemonObject, next: PokemonObject): boolean;
}

export interface GameStateModel extends Model {
  getUsedPokemon(): Set<string>;
  getRemainingCount(): number;
  markPokemonAsUsed(pokemon: PokemonObject): void;
  getLastUsedPokemon(): string | null;
  getUsedPokemonInOrder(): string[];
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

interface PokemonCardView extends View {
  onImagePhaseChange(phase: number): void;
  onHintToggle(type: string): void;
  onSelect(pokemon: PokemonObject): void;
}

interface SearchView extends View {
  onSearch(query: string): void;
  updateResults(pokemon: PokemonObject[]): void;
  showError(message: string): void;
}

interface GameStateView extends View {
  updateUsedPokemon(pokemon: PokemonObject[]): void;
  updateRemainingCount(count: number): void;
}

// Controller Interfaces
interface Controller {
  initialize(): void;
  destroy(): void;
}

interface SearchController extends Controller {
  handleSearch(query: string): void;
  handlePokemonSelect(pokemon: PokemonObject): void;
}

interface GameController extends Controller {
  handlePokemonUse(pokemon: PokemonObject): void;
  handleGameReset(): void;
}

// Event Types
type ModelEventMap = {
  'state:changed': unknown;
  error: Error;
  [key: string]: unknown;
};

type ViewEventMap = {
  'view:mounted': HTMLElement;
  'view:updated': unknown;
  'view:destroyed': undefined;
  [key: string]: unknown;
};

type ControllerEventMap = {
  initialized: undefined;
  destroyed: undefined;
  [key: string]: unknown;
};
