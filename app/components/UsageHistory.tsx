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
					<svg
						className="w-6 h-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<title>履歴アイコン</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
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
			<div
				className="bg-card rounded-xl p-4 max-h-60 overflow-y-auto border border-border shadow-sm"
				aria-label="使用済みポケモンのリスト"
				role="region"
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
									className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full p-1 transition-colors"
									aria-label={`${pokemon[1]}を履歴から削除`}
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
							</li>
						))
					) : (
						<li
							className="text-center py-6 text-muted-foreground"
							role="status"
						>
							まだ使用したポケモンはありません
						</li>
					)}
				</ul>
			</div>
		</section>
	);
}
