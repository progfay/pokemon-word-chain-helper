"use client";

import React, { useState } from "react";
import { useSessionStorage } from "../hooks/useSessionStorage";
import { ACCORDION_GROUPS } from "../lib/accordion-groups";
import type {
	AccordionGroup as AccordionGroupType,
	PokemonDatabase,
	UsedPokemon,
} from "../types/pokemon";
import { AccordionGroup } from "./AccordionGroup";
import { FooterInput } from "./FooterInput";
import { UsageHistory } from "./UsageHistory";

interface PokemonAppProps {
	pokemonDatabase: PokemonDatabase;
}

export function PokemonApp({ pokemonDatabase }: PokemonAppProps) {
	const [accordionGroups, setAccordionGroups] =
		useState<AccordionGroupType[]>(ACCORDION_GROUPS);
	const [usedPokemonString, setUsedPokemonString] =
		useSessionStorage("usedPokemon");

	// Parse the stored string to get the actual array
	const usedPokemon: UsedPokemon[] = React.useMemo(() => {
		try {
			return usedPokemonString ? JSON.parse(usedPokemonString) : [];
		} catch {
			return [];
		}
	}, [usedPokemonString]);

	// Helper function to update used Pokemon
	const setUsedPokemon = React.useCallback(
		(newValue: UsedPokemon[] | ((prev: UsedPokemon[]) => UsedPokemon[])) => {
			const valueToStore =
				typeof newValue === "function" ? newValue(usedPokemon) : newValue;
			setUsedPokemonString(JSON.stringify(valueToStore));
		},
		[usedPokemon, setUsedPokemonString],
	);

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
