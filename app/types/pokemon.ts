/**
 * Pokemon type IDs mapping to type names
 * 1=normal, 2=fire, 3=water, 4=electric, 5=grass, 6=ice, 7=fighting, 8=poison,
 * 9=ground, 10=flying, 11=psychic, 12=bug, 13=rock, 14=ghost, 15=dragon,
 * 16=dark, 17=steel, 18=fairy
 */
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

/**
 * Compact Pokemon data stored as tuple for efficient storage
 * [name, genus, generation_id, pokedex_number, types]
 */
export type Pokemon = [
	/** Pokemon name in katakana (e.g., "ピカチュウ") */
	name: string,
	/** Pokemon genus without "ポケモン" suffix (e.g., "ねずみ") */
	genus: string,
	/** Generation ID (1-9) */
	generation_id: number,
	/** National Pokedex number */
	pokedex_number: number,
	/** Array of 1 or 2 type IDs */
	types: [PokemonType] | [PokemonType, PokemonType],
];

/**
 * Pokemon database structure - maps first katakana character to Pokemon array
 * Organized by first character for efficient shiritori word chain searches
 */
export type PokemonDatabase = {
	/** First katakana character as key, array of Pokemon starting with that character */
	[firstChar: string]: Pokemon[];
};

/**
 * Type information for display
 */
export interface PokemonTypeInfo {
	id: PokemonType;
	name: string;
	color: string;
}

/**
 * Pokemon hint visibility states
 */
export type HintType = "generation" | "type" | "image";

/**
 * Image visibility states
 */
export type ImageVisibility = "hidden" | "silhouette" | "blurred" | "full";

/**
 * Pokemon card state for managing hints and interactions
 */
export interface PokemonCardState {
	expandedHints: Set<HintType>;
	imageVisibility: ImageVisibility;
	isAnswerRevealed: boolean;
}

/**
 * Accordion group information
 */
export interface AccordionGroup {
	id: string;
	name: string;
	characters: string[];
	isExpanded: boolean;
	activeCharacter: string;
}

/**
 * Used Pokemon tracking
 */
export interface UsedPokemon {
	name: string;
	pokedexNumber: number;
	timestamp: number;
}
