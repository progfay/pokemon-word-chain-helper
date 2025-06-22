"use client";

import type {
	AccordionGroup as AccordionGroupType,
	Pokemon,
	PokemonDatabase,
	UsedPokemon,
} from "../types/pokemon";
import { ChevronIcon } from "./icons/ChevronIcon";
import { PokemonCard } from "./PokemonCard";

interface AccordionGroupProps {
	group: AccordionGroupType;
	pokemonDatabase: PokemonDatabase;
	usedPokemonSet: Set<string>;
	onSetActiveCharacter: (groupId: string, character: string) => void;
	onMarkAsUsed: (usedPokemon: UsedPokemon) => void;
}

export function AccordionGroup({
	group,
	pokemonDatabase,
	usedPokemonSet,
	onSetActiveCharacter,
	onMarkAsUsed,
}: AccordionGroupProps) {
	const getPokemonForCharacter = (character: string): Pokemon[] => {
		return pokemonDatabase[character] || [];
	};

	const activeCharacterPokemon = getPokemonForCharacter(group.activeCharacter);

	return (
		<details
			name="accordion-group"
			open={group.isExpanded}
			className="bg-card border-b border-border mx-2 md:mx-0 mb-2 md:mb-0 rounded-lg md:rounded-none shadow-sm md:shadow-none"
		>
			<summary className="w-full flex justify-between items-center py-5 px-6 hover:bg-accent cursor-pointer list-none [&::-webkit-details-marker]:hidden">
				<div className="flex items-center gap-3">
					<span className="text-base font-bold text-card-foreground">
						{group.name}
					</span>
				</div>
				<ChevronIcon className="w-5 h-5 stroke-muted-foreground transition-transform [details[open]_&]:rotate-180" />
			</summary>

			{/* Accordion Content */}
			<div className="bg-muted border-t border-border py-5 px-6 flex flex-col gap-5">
				{/* Tab Navigation */}
				<div
					className="flex overflow-x-auto scrollbar-hide gap-0 pb-2"
					role="tablist"
					aria-label="ポケモンの文字選択"
				>
					{group.characters.map((character, index) => {
						const isActive = character === group.activeCharacter;
						const isFirst = index === 0;
						const isLast = index === group.characters.length - 1;
						const allCharacterPokemon = getPokemonForCharacter(character);
						const unusedPokemonCount = allCharacterPokemon.filter(
							(pokemon) => !usedPokemonSet.has(pokemon[0]),
						).length;

						let borderRadius = "";
						if (isFirst && isLast) {
							borderRadius = "rounded-lg";
						} else if (isFirst) {
							borderRadius = "rounded-l-lg";
						} else if (isLast) {
							borderRadius = "rounded-r-lg";
						}

						return (
							<button
								id={`tab-${group.id}-${character}`}
								type="button"
								key={character}
								onClick={() => onSetActiveCharacter(group.id, character)}
								role="tab"
								aria-selected={isActive}
								aria-controls={`tabpanel-${group.id}-${character}`}
								tabIndex={isActive ? 0 : -1}
								className={`min-w-[60px] h-11 flex flex-col justify-center items-center text-sm font-bold border ${borderRadius} ${
									isActive
										? "bg-primary text-primary-foreground border-primary"
										: "bg-secondary text-secondary-foreground border-border hover:bg-accent"
								} ${!isFirst ? "border-l-0" : ""}`}
							>
								<span>{character}</span>
								<span
									className={`text-xs font-medium ${
										isActive
											? "text-primary-foreground/80"
											: "text-muted-foreground"
									}`}
									title={`${unusedPokemonCount}匹の未使用ポケモン`}
								>
									{unusedPokemonCount}
								</span>
							</button>
						);
					})}
				</div>

				{/* Pokemon Grid */}
				<div
					id={`tabpanel-${group.id}-${group.activeCharacter}`}
					role="tabpanel"
					aria-labelledby={`tab-${group.id}-${group.activeCharacter}`}
					className="flex flex-col gap-3"
				>
					{activeCharacterPokemon.length > 0 ? (
						activeCharacterPokemon.map((pokemon) => (
							<PokemonCard
								key={pokemon[3]} // pokedex number as key
								pokemon={pokemon}
								isUsed={usedPokemonSet.has(pokemon[0])} // check by name
								onMarkAsUsed={onMarkAsUsed}
							/>
						))
					) : (
						<output className="text-center py-8 text-muted-foreground">
							「{group.activeCharacter}」で始まるポケモンはありません
						</output>
					)}
				</div>
			</div>
		</details>
	);
}
