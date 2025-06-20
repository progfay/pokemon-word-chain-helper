"use client";

import type { UsedPokemon } from "../types/pokemon";

interface UsageHistoryProps {
	usedPokemon: UsedPokemon[];
	onClearAll: () => void;
	onRemoveUsed: (pokemonName: string) => void;
}

export function UsageHistory({
	usedPokemon,
	onClearAll,
	onRemoveUsed,
}: UsageHistoryProps) {
	return (
		<div className="bg-white border-b border-gray-300 flex flex-col gap-4 py-6 px-6">
			{/* History Header */}
			<div className="flex justify-between items-center">
				<h2 className="text-lg font-bold text-gray-900">
					使用履歴 ({usedPokemon.length}件)
				</h2>
				<button
					type="button"
					onClick={onClearAll}
					className="bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-700"
				>
					クリア
				</button>
			</div>

			{/* History List */}
			<div className="bg-gray-50 rounded-xl p-4 max-h-60 overflow-y-auto">
				<div className="flex flex-col gap-3">
					{usedPokemon.length > 0 ? (
						usedPokemon
							.sort((a, b) => b.timestamp - a.timestamp) // Sort by newest first
							.map((pokemon) => (
								<button
									type="button"
									key={`${pokemon.name}-${pokemon.timestamp}`}
									onClick={() => onRemoveUsed(pokemon.name)}
									className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 text-left"
								>
									<span className="text-base font-bold text-gray-900">
										{pokemon.name}
									</span>
								</button>
							))
					) : (
						<div className="text-center py-6 text-gray-500">
							まだ使用したポケモンはありません
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
