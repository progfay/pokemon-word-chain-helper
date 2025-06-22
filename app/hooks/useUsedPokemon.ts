import { useCallback, useMemo } from "react";
import {
	addPokemon as addPokemonToArray,
	clearAll as clearAllPokemon,
	createUsedPokemonSet,
	isPokemonUsed as isPokemonInArray,
	removePokemon as removePokemonFromArray,
} from "../lib/used-pokemon/used-pokemon-manager";
import { fromJson, toJson } from "../lib/used-pokemon/used-pokemon-serializer";
import type { UsedPokemon } from "../types/pokemon";
import { useSessionStorage } from "./useSessionStorage";

/**
 * Custom hook for managing used Pokemon state
 * Follows Single Responsibility Principle by handling only state management concerns
 */
export function useUsedPokemon() {
	const [usedPokemonString, setUsedPokemonString] =
		useSessionStorage("usedPokemon");

	// Parse stored string to get the actual array
	const usedPokemon: UsedPokemon[] = useMemo(() => {
		return fromJson(usedPokemonString);
	}, [usedPokemonString]);

	// Create a Set for faster lookup of used Pokemon names
	const usedPokemonSet = useMemo(() => {
		return createUsedPokemonSet(usedPokemon);
	}, [usedPokemon]);

	// Helper function to update used Pokemon
	const setUsedPokemon = useCallback(
		(newValue: UsedPokemon[] | ((prev: UsedPokemon[]) => UsedPokemon[])) => {
			const valueToStore =
				typeof newValue === "function" ? newValue(usedPokemon) : newValue;
			setUsedPokemonString(toJson(valueToStore));
		},
		[usedPokemon, setUsedPokemonString],
	);

	// Business logic operations
	const addPokemon = useCallback(
		(pokemon: UsedPokemon) => {
			setUsedPokemon((prev) => addPokemonToArray(prev, pokemon));
		},
		[setUsedPokemon],
	);

	const removePokemon = useCallback(
		(pokemonName: string) => {
			setUsedPokemon((prev) => removePokemonFromArray(prev, pokemonName));
		},
		[setUsedPokemon],
	);

	const clearAll = useCallback(() => {
		setUsedPokemon(clearAllPokemon());
	}, [setUsedPokemon]);

	const isPokemonUsed = useCallback(
		(pokemonName: string) => {
			return isPokemonInArray(usedPokemon, pokemonName);
		},
		[usedPokemon],
	);

	return {
		usedPokemon,
		usedPokemonSet,
		addPokemon,
		removePokemon,
		clearAll,
		isPokemonUsed,
	};
}
