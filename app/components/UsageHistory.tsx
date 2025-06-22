"use client";

import type { UsedPokemon } from "../types/pokemon";
import { ClockIcon } from "./icons/ClockIcon";
import { CloseIcon } from "./icons/CloseIcon";

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
		<section
			className="border-b-2 border-border flex flex-col gap-4 py-6 px-6 shadow-sm"
			aria-labelledby="usage-history-heading"
		>
			{/* History Header */}
			<div className="flex justify-between items-center">
				<h2
					id="usage-history-heading"
					className="text-xl font-bold text-accent-foreground flex items-center gap-2"
				>
					<ClockIcon className="w-6 h-6" />
					使用履歴
					<span aria-live="polite">({usedPokemon.length}件)</span>
				</h2>
				<button
					type="button"
					onClick={onClearAll}
					aria-label="すべての使用履歴をクリア"
					className="bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-700 shadow-sm transition-all hover:shadow-md"
				>
					クリア
				</button>
			</div>

			{/* History List */}
			<section
				className="bg-card rounded-xl p-4 max-h-60 overflow-y-auto border border-border shadow-sm"
				aria-label="使用済みポケモンのリスト"
			>
				<ul className="flex flex-col gap-3">
					{usedPokemon.length > 0 ? (
						usedPokemon.map((pokemon, index) => (
							<li
								key={`${pokemon[1]}-${index}`}
								className="bg-card border border-border rounded-lg p-4 hover:bg-secondary focus-within:bg-secondary flex justify-between items-center"
							>
								<span className="text-base font-bold text-card-foreground">
									{pokemon[1]}
								</span>
								<button
									type="button"
									onClick={() => onRemoveUsed(pokemon[1])}
									className="text-card-foreground hover:bg-red-50 rounded-full p-1 transition-colors"
									aria-label={`${pokemon[1]}を履歴から削除`}
								>
									<CloseIcon width="16" height="16" role="img" />
								</button>
							</li>
						))
					) : (
						<li className="text-center py-6 text-muted-foreground">
							まだ使用したポケモンはありません
						</li>
					)}
				</ul>
			</section>
		</section>
	);
}
