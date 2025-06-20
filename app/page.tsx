import { PokemonApp } from "./components/PokemonApp";
import { loadPokemonDatabase } from "./lib/pokemon-database-loader";

export default async function Home() {
	const pokemonDatabase = await loadPokemonDatabase();

	return <PokemonApp pokemonDatabase={pokemonDatabase} />;
}
