import type { Metadata } from "next";
import { PokemonApp } from "./components/PokemonApp";
import { loadPokemonDatabase } from "./lib/pokemon-database-loader";

export const metadata: Metadata = {
	title: "ポケモンしりとりヘルパー",
	description: 'Web application that assists players in "ポケモンしりとり".',
	authors: [{ name: "@progfay", url: "https://github.com/progfay" }],
};

export default async function Home() {
	const pokemonDatabase = await loadPokemonDatabase();

	return <PokemonApp pokemonDatabase={pokemonDatabase} />;
}
