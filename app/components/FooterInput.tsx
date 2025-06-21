"use client";

import { useState } from "react";
import type { PokemonDatabase, UsedPokemon } from "../types/pokemon";

interface FooterInputProps {
	pokemonDatabase: PokemonDatabase;
	onAddUsed: (usedPokemon: UsedPokemon) => void;
}

export function FooterInput({ pokemonDatabase, onAddUsed }: FooterInputProps) {
	const [inputValue, setInputValue] = useState("");

	const findPokemonByName = (name: string) => {
		const trimmedName = name.trim();
		if (!trimmedName) return null;

		// Search through all Pokemon in the database
		for (const [_firstChar, pokemonList] of Object.entries(pokemonDatabase)) {
			const found = pokemonList.find((pokemon) => pokemon[0] === trimmedName);
			if (found) {
				return found;
			}
		}
		return null;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const pokemon = findPokemonByName(inputValue);
		if (pokemon) {
			const [name, , , pokedexNumber] = pokemon;
			onAddUsed({
				name,
				pokedexNumber,
				timestamp: Date.now(),
			});
			setInputValue("");
		} else {
			alert(
				"そのポケモンは見つかりませんでした。正確な名前を入力してください。",
			);
		}
	};

	return (
		<div className="bg-card border-t border-border flex flex-col gap-4 py-5 px-6">
			<h3 className="text-base font-bold text-card-foreground">
				ポケモンを使用する
			</h3>

			<form onSubmit={handleSubmit} className="flex items-center gap-3">
				<div className="flex-1 bg-muted border border-border rounded-lg px-4 h-12 flex items-center">
					<input
						type="text"
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						placeholder="ポケモン名を入力..."
						className="flex-1 bg-transparent text-base text-card-foreground placeholder-muted-foreground outline-none"
					/>
				</div>
				<button
					type="submit"
					className="bg-blue-600 text-white text-base font-bold px-5 h-12 rounded-lg hover:bg-blue-700"
				>
					追加
				</button>
			</form>
		</div>
	);
}
