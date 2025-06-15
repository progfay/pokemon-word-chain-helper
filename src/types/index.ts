export interface Pokemon {
  name: string;
  types: string[];
  generation: number;
  classification: string;
  firstChar?: string;
  lastChar?: string;
}

export interface CharacterMap {
  [key: string]: string;
}
