import { writeFile } from "node:fs/promises";
import path from "node:path";

const query = `
{
  pokemon_v2_pokemonspeciesname(where: {language_id: {_eq: 1}}) {
    name
    genus
    pokemon_v2_pokemonspecy {
      generation_id
      pokemon_v2_pokemondexnumbers(where: {pokedex_id: {_eq: 1}}) {
        pokedex_number
      }
      pokemon_v2_pokemons(where: {is_default: {_eq:true}}) {
        pokemon_v2_pokemontypes {
          pokemon_v2_type{
            name
          }
        }
      }
    }
  }
}`.replaceAll("\n", "");

const main = async () => {
  const response = await fetch("https://beta.pokeapi.co/graphql/v1beta", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const { data } = await response.json();

  const transformed = data.pokemon_v2_pokemonspeciesname.map((pokemon) => ({
    name: pokemon.name,
    genus: pokemon.genus,
    generation_id: pokemon.pokemon_v2_pokemonspecy.generation_id,
    pokedex_number:
      pokemon.pokemon_v2_pokemonspecy.pokemon_v2_pokemondexnumbers[0]
        .pokedex_number,
    types:
      pokemon.pokemon_v2_pokemonspecy.pokemon_v2_pokemons[0].pokemon_v2_pokemontypes.map(
        (type) => type.pokemon_v2_type.name
      ),
  }));

  await writeFile(
    path.resolve(import.meta.dirname, "../src/pokemon_database.json"),
    JSON.stringify(transformed)
  );
};

main();
