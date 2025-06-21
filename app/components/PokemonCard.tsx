"use client";

import { useState } from "react";
import { getTypesInfo } from "../lib/pokemon-types";
import type {
	HintType,
	ImageVisibility,
	Pokemon,
	UsedPokemon,
} from "../types/pokemon";

interface PokemonCardProps {
	pokemon: Pokemon;
	isUsed: boolean;
	onMarkAsUsed: (usedPokemon: UsedPokemon) => void;
}

const GENERATION_NAME_MAP: Record<number, string> = {
	1: "赤・緑",
	2: "金・銀",
	3: "ルビーサファイア・エメラルド",
	4: "ダイアモンド・パール・プラチナ",
	5: "ブラック・ホワイト",
	6: "X・Y",
	7: "サン・ムーン",
	8: "ソード・シールド",
	9: "スカーレット・バイオレット",
};

export function PokemonCard({
	pokemon,
	isUsed,
	onMarkAsUsed,
}: PokemonCardProps) {
	const [name, _genus, generation, pokedexNumber, types] = pokemon;
	const [expandedHints, setExpandedHints] = useState<Set<HintType>>(new Set());
	const [imageVisibility, setImageVisibility] =
		useState<ImageVisibility>("hidden");
	const [isAnswerRevealed, setIsAnswerRevealed] = useState(isUsed);
	const [showConfirmModal, setShowConfirmModal] = useState(false);

	const typeInfos = getTypesInfo(types);
	const paddedNumber = pokedexNumber.toString().padStart(3, "0");
	const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokedexNumber}.png`;

	const toggleHint = (hintType: HintType) => {
		setExpandedHints((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(hintType)) {
				newSet.delete(hintType);
			} else {
				newSet.add(hintType);
			}
			return newSet;
		});
	};

	const handleAnswerClick = () => {
		if (isAnswerRevealed) return;
		setShowConfirmModal(true);
	};

	const confirmAnswer = () => {
		setIsAnswerRevealed(true);
		setShowConfirmModal(false);
		onMarkAsUsed({
			name,
			pokedexNumber,
			timestamp: Date.now(),
		});
	};

	const cancelAnswer = () => {
		setShowConfirmModal(false);
	};

	const getImageStyle = () => {
		switch (imageVisibility) {
			case "hidden":
				return { display: "none" };
			case "silhouette":
				return { filter: "brightness(0)", opacity: 0.3 };
			case "blurred":
				return { filter: "blur(16px)" };
			case "full":
				return {};
			default:
				return { display: "none" };
		}
	};

	return (
		<>
			<div
				className={`bg-card border rounded-xl p-5 gap-4 flex flex-col ${isUsed ? "border-muted-foreground border-2" : "border-border"}`}
			>
				{/* Card Header */}
				<div className="flex justify-between items-center">
					{isAnswerRevealed ? (
						<div className="flex items-center gap-3">
							<span
								className={`text-lg font-bold ${isUsed ? "text-muted-foreground" : "text-card-foreground"}`}
							>
								#{paddedNumber}
							</span>
							{isUsed && (
								<span className="bg-muted-foreground text-background text-xs font-bold px-3 py-1.5 rounded-full">
									使用済み
								</span>
							)}
						</div>
					) : (
						<span className="text-lg font-bold text-card-foreground">
							#{paddedNumber}
						</span>
					)}

					{isAnswerRevealed ? (
						<span
							className={`text-base font-bold ${isUsed ? "text-muted-foreground" : "text-card-foreground"}`}
						>
							{name}
						</span>
					) : (
						<button
							type="button"
							onClick={handleAnswerClick}
							className="bg-green-500 text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-green-600"
						>
							答えを見る
						</button>
					)}
				</div>

				{/* Hints List */}
				<div className="flex flex-col gap-2">
					{/* Generation Hint */}
					<div
						className={`border rounded-lg ${expandedHints.has("generation") ? "border-blue-200" : "border-border"}`}
					>
						<button
							type="button"
							onClick={() => toggleHint("generation")}
							className="w-full flex justify-between items-center p-3"
						>
							<div className="flex items-center gap-3">
								<svg
									className={`w-4.5 h-4.5 ${expandedHints.has("generation") ? "stroke-blue-600" : "stroke-muted-foreground"}`}
									fill="none"
									viewBox="0 0 18 18"
								>
									<title>世代アイコン</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="1.5"
										d="M6 1.5v3M12 1.5v3M2.25 3h13.5v13.5H2.25V3zM2.25 7.5h13.5"
									/>
								</svg>
								<span
									className={`text-sm font-medium ${expandedHints.has("generation") && !isUsed ? "text-blue-600" : isUsed ? "text-muted-foreground" : "text-muted-foreground"}`}
								>
									世代
								</span>
							</div>
							<svg
								className={`w-4.5 h-4.5 transition-transform ${expandedHints.has("generation") ? "rotate-180" : ""} ${expandedHints.has("generation") ? "stroke-blue-600" : "stroke-muted-foreground"}`}
								fill="none"
								viewBox="0 0 18 18"
							>
								<title>展開アイコン</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="1.5"
									d="M4.5 6.75L9 11.25l4.5-4.5"
								/>
							</svg>
						</button>
						{expandedHints.has("generation") && (
							<div className="px-4 pb-3">
								<span
									className={`text-sm font-bold ${isUsed ? "text-muted-foreground" : "text-card-foreground"}`}
								>
									{GENERATION_NAME_MAP[generation] || `第${generation}世代`}
								</span>
							</div>
						)}
					</div>

					{/* Type Hint */}
					<div
						className={`border rounded-lg ${expandedHints.has("type") ? "border-blue-200" : "border-border"}`}
					>
						<button
							type="button"
							onClick={() => toggleHint("type")}
							className="w-full flex justify-between items-center p-3"
						>
							<div className="flex items-center gap-3">
								<svg
									className={`w-4.5 h-4.5 ${expandedHints.has("type") ? "stroke-blue-600" : "stroke-muted-foreground"}`}
									fill="none"
									viewBox="0 0 18 18"
								>
									<title>タイプアイコン</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="1.5"
										d="M5.25 5.25h7.5v7.5h-7.5v-7.5z"
									/>
									<circle cx="5.25" cy="5.25" r="0.75" fill="currentColor" />
								</svg>
								<span
									className={`text-sm font-medium ${expandedHints.has("type") && !isUsed ? "text-blue-600" : isUsed ? "text-muted-foreground" : "text-muted-foreground"}`}
								>
									タイプ
								</span>
							</div>
							<svg
								className={`w-4.5 h-4.5 transition-transform ${expandedHints.has("type") ? "rotate-180" : ""} ${expandedHints.has("type") ? "stroke-blue-600" : "stroke-muted-foreground"}`}
								fill="none"
								viewBox="0 0 18 18"
							>
								<title>展開アイコン</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="1.5"
									d="M4.5 6.75L9 11.25l4.5-4.5"
								/>
							</svg>
						</button>
						{expandedHints.has("type") && (
							<div className="px-4 pb-2">
								<div className="flex items-center gap-2">
									{typeInfos.map((typeInfo) => (
										<span
											key={typeInfo.id}
											className="text-white text-xs font-bold px-3 py-1.5 rounded-full"
											style={{ backgroundColor: typeInfo.color }}
										>
											{typeInfo.name}
										</span>
									))}
								</div>
							</div>
						)}
					</div>

					{/* Image Hint */}
					<div
						className={`border rounded-lg ${expandedHints.has("image") ? "border-blue-200" : "border-border"}`}
					>
						<button
							type="button"
							onClick={() => toggleHint("image")}
							className="w-full flex justify-between items-center p-3"
						>
							<div className="flex items-center gap-3">
								<svg
									className={`w-4.5 h-4.5 ${expandedHints.has("image") ? "stroke-blue-600" : "stroke-muted-foreground"}`}
									fill="none"
									viewBox="0 0 18 18"
								>
									<title>画像アイコン</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="1.5"
										d="M2.25 2.25h13.5v13.5H2.25V2.25zM5.25 5.25h3v3h-3v-3zM4.5 8.5l11.25 7.25"
									/>
								</svg>
								<span
									className={`text-sm font-medium ${expandedHints.has("image") && !isUsed ? "text-blue-600" : isUsed ? "text-muted-foreground" : "text-muted-foreground"}`}
								>
									画像
								</span>
							</div>
							<svg
								className={`w-4.5 h-4.5 transition-transform ${expandedHints.has("image") ? "rotate-180" : ""} ${expandedHints.has("image") ? "stroke-blue-600" : "stroke-muted-foreground"}`}
								fill="none"
								viewBox="0 0 18 18"
							>
								<title>展開アイコン</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="1.5"
									d="M4.5 6.75L9 11.25l4.5-4.5"
								/>
							</svg>
						</button>
						{expandedHints.has("image") && (
							<div className="flex flex-col gap-3 px-4 pb-4">
								{/* Image Type Selector */}
								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={() => setImageVisibility("silhouette")}
										className={`px-3 py-2 text-xs font-medium rounded-lg ${
											imageVisibility === "silhouette"
												? "bg-blue-600 text-white"
												: "bg-muted text-muted-foreground border border-border"
										}`}
									>
										シルエット
									</button>
									<button
										type="button"
										onClick={() => setImageVisibility("blurred")}
										className={`px-3 py-2 text-xs font-medium rounded-lg ${
											imageVisibility === "blurred"
												? "bg-blue-600 text-white"
												: "bg-muted text-muted-foreground border border-border"
										}`}
									>
										ぼかし
									</button>
									<button
										type="button"
										onClick={() => setImageVisibility("full")}
										className={`px-3 py-2 text-xs font-medium rounded-lg ${
											imageVisibility === "full"
												? "bg-blue-600 text-white"
												: "bg-muted text-muted-foreground border border-border"
										}`}
									>
										フルカラー
									</button>
								</div>
								{/* Image Container */}
								<div className="bg-muted h-30 rounded-xl flex justify-center items-center overflow-hidden">
									<img
										src={imageUrl}
										alt={isAnswerRevealed ? name : "Pokemon"}
										className="max-h-full max-w-full"
										style={getImageStyle()}
									/>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Confirmation Modal */}
			{showConfirmModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-card rounded-lg p-6 max-w-sm mx-4">
						<h3 className="text-lg font-bold text-card-foreground mb-2">
							答えを確認
						</h3>
						<p className="text-muted-foreground mb-4">
							答えを見ると、このポケモンは使用済みとしてマークされます。よろしいですか？
						</p>
						<div className="flex gap-3">
							<button
								type="button"
								onClick={cancelAnswer}
								className="flex-1 bg-secondary text-secondary-foreground py-2 px-4 rounded-lg font-medium"
							>
								キャンセル
							</button>
							<button
								type="button"
								onClick={confirmAnswer}
								className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium"
							>
								確認
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
