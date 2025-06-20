"use client";

import { useEffect, useState } from "react";
import { AccordionGroup } from "./components/AccordionGroup";
import { FooterInput } from "./components/FooterInput";
import { UsageHistory } from "./components/UsageHistory";
import { ACCORDION_GROUPS } from "./lib/accordion-groups";
import type {
	AccordionGroup as AccordionGroupType,
	PokemonDatabase,
	UsedPokemon,
} from "./types/pokemon";

export default function Home() {
	const [pokemonDatabase, setPokemonDatabase] = useState<PokemonDatabase>({});
	const [accordionGroups, setAccordionGroups] =
		useState<AccordionGroupType[]>(ACCORDION_GROUPS);
	const [usedPokemon, setUsedPokemon] = useState<UsedPokemon[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Load Pokemon database
	useEffect(() => {
		const loadPokemonDatabase = async () => {
			try {
				const response = await fetch("/data/pokemon_database.json");
				if (!response.ok) {
					throw new Error("Failed to load Pokemon database");
				}
				const data = await response.json();
				setPokemonDatabase(data);
			} catch (error) {
				console.error("Error loading Pokemon database:", error);
			} finally {
				setIsLoading(false);
			}
		};

		void loadPokemonDatabase();
	}, []);

	// Create a Set for faster lookup of used Pokemon names
	const usedPokemonSet = new Set(usedPokemon.map((p) => p.name));

	const handleToggleExpanded = (groupId: string) => {
		setAccordionGroups((groups) =>
			groups.map((group) =>
				group.id === groupId
					? { ...group, isExpanded: !group.isExpanded }
					: group,
			),
		);
	};

	const handleSetActiveCharacter = (groupId: string, character: string) => {
		setAccordionGroups((groups) =>
			groups.map((group) =>
				group.id === groupId ? { ...group, activeCharacter: character } : group,
			),
		);
	};

	const handleMarkAsUsed = (pokemon: UsedPokemon) => {
		setUsedPokemon((prev) => {
			// Check if already exists to avoid duplicates
			const exists = prev.some((p) => p.name === pokemon.name);
			if (exists) return prev;
			return [...prev, pokemon];
		});
	};

	const handleAddUsed = (pokemon: UsedPokemon) => {
		setUsedPokemon((prev) => {
			// Check if already exists to avoid duplicates
			const exists = prev.some((p) => p.name === pokemon.name);
			if (exists) return prev;
			return [...prev, pokemon];
		});
	};

	const handleRemoveUsed = (pokemonName: string) => {
		setUsedPokemon((prev) => prev.filter((p) => p.name !== pokemonName));
	};

	const handleClearAll = () => {
		setUsedPokemon([]);
	};

	if (isLoading) {
		return (
			<main className="min-h-screen bg-slate-50 flex items-center justify-center">
				<div className="text-lg font-medium text-gray-600">読み込み中...</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-slate-50">
			<div className="max-w-md mx-auto bg-white min-h-screen flex flex-col">
				{/* Usage History Section */}
				<UsageHistory
					usedPokemon={usedPokemon}
					onClearAll={handleClearAll}
					onRemoveUsed={handleRemoveUsed}
				/>

				{/* Accordion Section */}
				<div className="flex-1">
					{accordionGroups.map((group) => (
						<AccordionGroup
							key={group.id}
							group={group}
							pokemonDatabase={pokemonDatabase}
							usedPokemonSet={usedPokemonSet}
							onToggleExpanded={handleToggleExpanded}
							onSetActiveCharacter={handleSetActiveCharacter}
							onMarkAsUsed={handleMarkAsUsed}
						/>
					))}
				</div>

				{/* Footer Input */}
				<FooterInput
					pokemonDatabase={pokemonDatabase}
					onAddUsed={handleAddUsed}
				/>
			</div>
		</main>
	);
}
