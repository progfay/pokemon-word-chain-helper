import type { PokemonDatabase } from "../types/pokemon";
import type { GetPokemonDataQuery } from "./__generated__/pokemon-database-loader";
import { createDatabase, transformGraphQLData } from "./pokemon";

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

		const transformed = transformGraphQLData(data);
		const pokemonDatabase = createDatabase(transformed);

		return pokemonDatabase;
	} catch (error) {
		console.error("Error loading Pokemon database:", error);
		return {};
	}
}
