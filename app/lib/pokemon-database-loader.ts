import type { PokemonDatabase, PokemonType } from "../types/pokemon";
import type { GetPokemonDataQuery } from "./pokemon-database-loader.graphql";

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

const GENUS_MAP: Record<string, string> = {
	カミッチュ: "りんごあめポケモン",
	チャデス: "まっちゃポケモン",
	ヤバソチャ: "まっちゃポケモン",
	イイネイヌ: "けらいポケモン",
	マシマシラ: "けらいポケモン",
	キチキギス: "けらいポケモン",
	オーガポン: "おめんポケモン",
} as const;

const query = /* GraphQL */ `
  query GetPokemonData {
    pokemonspeciesname(where: { language_id: { _eq: 1 } }) {
      name
      genus
      pokemonspecy {
        generation_id
        pokemondexnumbers(where: { pokedex_id: { _eq: 1 } }) {
          pokedex_number
        }
        pokemons(where: { is_default: { _eq: true } }) {
          pokemontypes {
            type {
              name
            }
          }
        }
      }
    }
  }
`;

const throwError = (message: string): never => {
	throw new Error(message);
};

interface TransformedPokemon {
	name: string;
	genus: string;
	generation_id: number;
	pokedex_number: number;
	types: PokemonType[];
}

/**
 * Loads Pokemon database by making a GraphQL request to PokeAPI
 * and transforming the data into the required format for the application
 */
export async function loadPokemonDatabase(): Promise<PokemonDatabase> {
	try {
		const response = await fetch("https://graphql.pokeapi.co/v1beta2", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ query }),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const { data }: { data: GetPokemonDataQuery } = await response.json();

		const transformed: TransformedPokemon[] = data.pokemonspeciesname.map(
			(pokemon) => ({
				name: pokemon.name || throwError("Name not found"),
				genus:
					(pokemon.genus || GENUS_MAP[pokemon.name])?.replace(
						/ポケモン$/,
						"",
					) ||
					throwError(
						`Genus not found: ${pokemon.name}, ${pokemon.pokemonspecy?.pokemondexnumbers[0]?.pokedex_number}`,
					),
				generation_id:
					pokemon.pokemonspecy?.generation_id ||
					throwError(`Generation ID not found: ${pokemon.name}`),
				pokedex_number:
					pokemon.pokemonspecy?.pokemondexnumbers[0]?.pokedex_number ||
					throwError("Pokedex number not found"),
				types:
					pokemon.pokemonspecy?.pokemons[0]?.pokemontypes.map(
						(type) =>
							(TYPE_SIGNATURE_MAP[type.type?.name || ""] ??
								throwError(
									`Type not found: ${pokemon.name}, ${type.type?.name}`,
								)) as PokemonType,
					) || [],
			}),
		);

		const pokemonDatabase: PokemonDatabase = transformed.reduce(
			(acc: PokemonDatabase, pokemon) => {
				if (pokemon.name.endsWith("ン")) {
					return acc;
				}

				const firstChar = pokemon.name.charAt(0);
				acc[firstChar] = [
					...(acc[firstChar] || []),
					[
						pokemon.name,
						pokemon.genus,
						pokemon.generation_id,
						pokemon.pokedex_number,
						pokemon.types as [PokemonType] | [PokemonType, PokemonType],
					],
				];
				return acc;
			},
			{},
		);

		return pokemonDatabase;
	} catch (error) {
		console.error("Error loading Pokemon database:", error);
		return {};
	}
}
