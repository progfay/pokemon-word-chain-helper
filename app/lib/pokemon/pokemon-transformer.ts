import type {
	Pokemon,
	PokemonDatabase,
	PokemonType,
} from "../../types/pokemon";
import type { GetPokemonDataQuery } from "../__generated__/pokemon-database-loader";

/**
 * Configuration for Pokemon type signatures
 */
const TYPE_SIGNATURE_MAP: Record<string, number> = {
	normal: 1,
	fire: 2,
	water: 3,
	electric: 4,
	grass: 5,
	ice: 6,
	fighting: 7,
	poison: 8,
	ground: 9,
	flying: 10,
	psychic: 11,
	bug: 12,
	rock: 13,
	ghost: 14,
	dragon: 15,
	dark: 16,
	steel: 17,
	fairy: 18,
} as const;

/**
 * Configuration for Pokemon genus corrections
 */
const GENUS_MAP: Record<string, string> = {
	カミッチュ: "りんごあめポケモン",
	チャデス: "まっちゃポケモン",
	ヤバソチャ: "まっちゃポケモン",
	イイネイヌ: "けらいポケモン",
	マシマシラ: "けらいポケモン",
	キチキギス: "けらいポケモン",
	オーガポン: "おめんポケモン",
} as const;

/**
 * Interface for transformed Pokemon data
 */
interface TransformedPokemon {
	name: string;
	genus: string;
	generation_id: number;
	pokedex_number: number;
	types: PokemonType[];
}

/**
 * Utility function to throw errors with consistent format
 * @param message - Error message
 * @throws Error with the provided message
 */
function throwError(message: string): never {
	throw new Error(message);
}

/**
 * Transform Pokemon types from GraphQL format to application format
 * @param pokemon - Pokemon data from GraphQL
 * @returns Array of PokemonType
 */
function transformTypes(
	pokemon: GetPokemonDataQuery["pokemonspeciesname"][0],
): PokemonType[] {
	return (
		pokemon.pokemonspecy?.pokemons[0]?.pokemontypes.map((type) => {
			const typeName = type.type?.name || "";
			const typeSignature = TYPE_SIGNATURE_MAP[typeName];
			if (typeSignature === undefined) {
				throwError(`Type not found: ${pokemon.name}, ${typeName}`);
			}
			return typeSignature as PokemonType;
		}) || []
	);
}

/**
 * Transform genus information, applying corrections if needed
 * @param name - Pokemon name
 * @param genus - Original genus
 * @returns Transformed genus
 */
function transformGenus(name: string, genus: string | null): string {
	const correctedGenus = genus || GENUS_MAP[name];
	if (!correctedGenus) {
		throwError(`Genus not found: ${name}`);
	}
	return correctedGenus.replace(/ポケモン$/, "");
}

/**
 * Transform raw GraphQL data into structured Pokemon data
 * @param data - Raw GraphQL response data
 * @returns Array of transformed Pokemon
 */
export function transformGraphQLData(
	data: GetPokemonDataQuery,
): TransformedPokemon[] {
	return data.pokemonspeciesname.map((pokemon) => ({
		name: pokemon.name || throwError("Name not found"),
		genus: transformGenus(pokemon.name, pokemon.genus),
		generation_id:
			pokemon.pokemonspecy?.generation_id ||
			throwError(`Generation ID not found: ${pokemon.name}`),
		pokedex_number:
			pokemon.pokemonspecy?.pokemondexnumbers[0]?.pokedex_number ||
			throwError("Pokedex number not found"),
		types: transformTypes(pokemon),
	}));
}

/**
 * Transform structured Pokemon data into database format
 * @param pokemonList - Array of transformed Pokemon
 * @returns Pokemon database organized by first character
 */
export function createDatabase(
	pokemonList: TransformedPokemon[],
): PokemonDatabase {
	return pokemonList.reduce((acc: PokemonDatabase, pokemon) => {
		// Skip Pokemon ending with 'ン' (word chain rule)
		if (pokemon.name.endsWith("ン")) {
			return acc;
		}

		const firstChar = pokemon.name.charAt(0);
		const pokemonEntry: Pokemon = [
			pokemon.name,
			pokemon.genus,
			pokemon.generation_id,
			pokemon.pokedex_number,
			pokemon.types as [PokemonType] | [PokemonType, PokemonType],
		];

		acc[firstChar] = [...(acc[firstChar] || []), pokemonEntry];
		return acc;
	}, {});
}
