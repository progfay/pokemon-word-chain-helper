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
		<div className="bg-card border-b border-border flex flex-col gap-4 py-6 px-6">
			{/* History Header */}
			<div className="flex justify-between items-center">
				<h2 className="text-lg font-bold text-card-foreground">
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
			<div className="bg-muted rounded-xl p-4 max-h-60 overflow-y-auto">
				<div className="flex flex-col gap-3">
					{usedPokemon.length > 0 ? (
						usedPokemon
							.sort((a, b) => b.timestamp - a.timestamp) // Sort by newest first
							.map((pokemon) => (
								<div
									key={`${pokemon.name}-${pokemon.timestamp}`}
									className="bg-card border border-border rounded-lg p-4 hover:bg-secondary flex justify-between items-center"
								>
									<span className="text-base font-bold text-card-foreground">
										{pokemon.name}
									</span>
									<button
										type="button"
										onClick={() => onRemoveUsed(pokemon.name)}
										className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full p-1 transition-colors"
										aria-label={`${pokemon.name}を履歴から削除`}
									>
										<svg
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											role="img"
										>
											<title>削除</title>
											<path d="M18 6 6 18" />
											<path d="m6 6 12 12" />
										</svg>
									</button>
								</div>
							))
					) : (
						<div className="text-center py-6 text-muted-foreground">
							まだ使用したポケモンはありません
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
