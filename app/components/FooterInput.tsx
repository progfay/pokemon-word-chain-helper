"use client";

import { useState } from "react";
import { findPokemonByName } from "../lib/pokemon";
import type { PokemonDatabase, UsedPokemon } from "../types/pokemon";

interface FooterInputProps {
	pokemonDatabase: PokemonDatabase;
	onAddUsed: (usedPokemon: UsedPokemon) => void;
}

export function FooterInput({ pokemonDatabase, onAddUsed }: FooterInputProps) {
	const [inputValue, setInputValue] = useState("");
	// const [errorMessage, setErrorMessage] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const pokemon = findPokemonByName(pokemonDatabase, inputValue);
		if (pokemon) {
			const [name, , , pokedexNumber] = pokemon;
			onAddUsed([pokedexNumber, name]);
			setInputValue("");
		} else {
			alert(
				"そのポケモンは見つかりませんでした。正確な名前を入力してください。",
			);
		}
	};

	return (
		<section
			className="bg-card border-t border-border flex flex-col gap-4 py-5 px-6"
			aria-labelledby="pokemon-input-heading"
		>
			<h3
				id="pokemon-input-heading"
				className="text-base font-bold text-card-foreground"
			>
				ポケモンを使用する
			</h3>

			<form onSubmit={handleSubmit} className="flex items-center gap-3">
				<div className="flex-1 bg-muted border border-border rounded-lg px-4 h-12 flex items-center">
					<input
						type="text"
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						placeholder="ポケモン名を入力..."
						aria-labelledby="pokemon-input-heading"
						className="flex-1 bg-transparent text-base text-card-foreground placeholder-muted-foreground outline-none"
					/>
				</div>
				<button
					type="submit"
					aria-describedby="pokemon-input-description"
					className="bg-blue-600 text-white text-base font-bold px-5 h-12 rounded-lg hover:bg-blue-700"
				>
					追加
				</button>
			</form>
			<div id="pokemon-input-description" className="sr-only">
				ポケモンの正確な名前を入力して追加ボタンを押してください
			</div>
		</section>
	);
}
