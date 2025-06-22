"use client";

import { useState } from "react";
import { useUsedPokemon } from "../hooks/useUsedPokemon";
import { ACCORDION_GROUPS } from "../lib/accordion-groups";
import type {
	AccordionGroup as AccordionGroupType,
	PokemonDatabase,
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
	const { usedPokemon, usedPokemonSet, addPokemon, removePokemon, clearAll } =
		useUsedPokemon();

	const handleSetActiveCharacter = (groupId: string, character: string) => {
		setAccordionGroups((groups) =>
			groups.map((group) =>
				group.id === groupId ? { ...group, activeCharacter: character } : group,
			),
		);
	};

	return (
		<main className="min-h-screen bg-background">
			<div className="max-w-4xl mx-auto bg-card min-h-screen flex flex-col">
				{/* Usage History Section */}
				<UsageHistory
					usedPokemon={usedPokemon}
					onClearAll={clearAll}
					onRemoveUsed={removePokemon}
				/>

				{/* Accordion Section */}
				<section className="flex-1 pt-8 pb-24 px-0">
					{accordionGroups.map((group) => (
						<AccordionGroup
							key={group.id}
							group={group}
							pokemonDatabase={pokemonDatabase}
							usedPokemonSet={usedPokemonSet}
							onSetActiveCharacter={handleSetActiveCharacter}
							onMarkAsUsed={addPokemon}
						/>
					))}
				</section>

				{/* Footer Input */}
				<div className="fixed bottom-0 left-0 right-0 z-10 max-w-4xl mx-auto">
					<FooterInput
						pokemonDatabase={pokemonDatabase}
						onAddUsed={addPokemon}
					/>
				</div>
			</div>
		</main>
	);
}
