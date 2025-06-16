import { writeFile } from "node:fs/promises";
import { type } from "node:os";
import path from "node:path";

const TYPE_SIGNATURE_MAP = {
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
};

const GENUS_MAP = {
  カミッチュ: "りんごあめポケモン",
  チャデス: "まっちゃポケモン",
  ヤバソチャ: "まっちゃポケモン",
  イイネイヌ: "けらいポケモン",
  マシマシラ: "けらいポケモン",
  キチキギス: "けらいポケモン",
  オーガポン: "おめんポケモン",
};

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

const throwError = (message) => {
  throw new Error(`${message}`);
};

const main = async () => {
  const response = await fetch("https://beta.pokeapi.co/graphql/v1beta", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const { data } = await response.json();

  const transformed = data.pokemon_v2_pokemonspeciesname.map((pokemon) => [
    pokemon.name || throwError("Name not found"),
    (pokemon.genus || GENUS_MAP[pokemon.name]).replace(/ポケモン$/, "") ||
      throwError(
        `Genus not found: ${pokemon.name}, ${pokemon.pokemon_v2_pokemonspecy.pokemon_v2_pokemondexnumbers[0]?.pokedex_number}`
      ),
    pokemon.pokemon_v2_pokemonspecy.generation_id ||
      throwError(`Generation ID not found: ${pokemon.name}`),
    pokemon.pokemon_v2_pokemonspecy.pokemon_v2_pokemondexnumbers[0]
      ?.pokedex_number || throwError("Pokedex number not found"),
    pokemon.pokemon_v2_pokemonspecy.pokemon_v2_pokemons[0].pokemon_v2_pokemontypes.map(
      (type) =>
        TYPE_SIGNATURE_MAP[type.pokemon_v2_type.name] ??
        throwError(
          `Type not found: ${pokemon.name}, ${type.pokemon_v2_type.name}`
        )
    ),
  ]);

  await writeFile(
    path.resolve(import.meta.dirname, "../src/pokemon_database.json"),
    JSON.stringify(transformed)
  );
};

main();
