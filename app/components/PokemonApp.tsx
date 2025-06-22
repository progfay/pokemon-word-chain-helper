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
	const usedPokemonSet = new Set(usedPokemon.map((p) => p[1]));

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
			const exists = prev.some((p) => p[1] === pokemon[1]);
			if (exists) return prev;
			return [...prev, pokemon];
		});
	};

	const handleAddUsed = (pokemon: UsedPokemon) => {
		setUsedPokemon((prev) => {
			// Check if already exists to avoid duplicates
			const exists = prev.some((p) => p[1] === pokemon[1]);
			if (exists) return prev;
			return [...prev, pokemon];
		});
	};

	const handleRemoveUsed = (pokemonName: string) => {
		setUsedPokemon((prev) => prev.filter((p) => p[1] !== pokemonName));
	};

	const handleClearAll = () => {
		setUsedPokemon([]);
	};

	return (
		<main className="min-h-screen bg-background">
			<div className="max-w-4xl mx-auto bg-card min-h-screen flex flex-col">
				{/* Usage History Section */}
				<UsageHistory
					usedPokemon={usedPokemon}
					onClearAll={handleClearAll}
					onRemoveUsed={handleRemoveUsed}
				/>

				{/* Accordion Section */}
				<div className="flex-1 pt-8 pb-32 md:pb-24 px-2 md:px-0">
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
				<div className="fixed bottom-0 left-0 right-0 z-10 max-w-4xl mx-auto">
					<FooterInput
						pokemonDatabase={pokemonDatabase}
						onAddUsed={handleAddUsed}
					/>
				</div>
			</div>
		</main>
	);
}
