"use client";

import { useState } from "react";
import { getTypesInfo } from "../../lib/pokemon-types";
import type {
	ImageVisibility,
	Pokemon,
	UsedPokemon,
} from "../../types/pokemon";
import { GenerationIcon } from "../icons/GenerationIcon";
import { GenusIcon } from "../icons/GenusIcon";
import { ImageIcon } from "../icons/ImageIcon";
import { TypeIcon } from "../icons/TypeIcon";
import { Hint } from "./Hint";

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
	const [name, genus, generation, pokedexNumber, types] = pokemon;
	const [imageVisibility, setImageVisibility] =
		useState<ImageVisibility>("hidden");
	const [isAnswerRevealed, setIsAnswerRevealed] = useState(isUsed);
	const [showConfirmModal, setShowConfirmModal] = useState(false);

	const typeInfos = getTypesInfo(types);
	const paddedNumber = pokedexNumber.toString().padStart(3, "0");
	const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokedexNumber}.png`;

	const handleAnswerClick = () => {
		if (isAnswerRevealed) return;
		setShowConfirmModal(true);
	};

	const confirmAnswer = () => {
		setIsAnswerRevealed(true);
		setShowConfirmModal(false);
		onMarkAsUsed([pokedexNumber, name]);
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
					<div className="flex items-center gap-3">
						<span
							className={`text-lg font-bold ${isAnswerRevealed || isUsed ? "text-muted-foreground" : "text-card-foreground"}`}
						>
							#{paddedNumber}
						</span>
						{isUsed && (
							<div className="bg-muted-foreground text-background text-xs font-bold px-3 py-1.5 rounded-full">
								使用済み
							</div>
						)}
					</div>

					{isAnswerRevealed || isUsed ? (
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
				<section className="flex flex-col gap-2">
					{/* Generation Hint */}
					<Hint
						icon={
							<GenerationIcon className="w-4.5 h-4.5 stroke-muted-foreground" />
						}
						label="世代"
					>
						<div className="px-4 pb-3">
							<span className="text-sm font-bold text-muted-foreground">
								{GENERATION_NAME_MAP[generation] || `第${generation}世代`}
							</span>
						</div>
					</Hint>

					{/* Genus Hint */}
					<Hint
						icon={<GenusIcon className="w-4.5 h-4.5 stroke-muted-foreground" />}
						label="分類"
					>
						<div className="px-4 pb-3">
							<span className="text-sm font-bold text-muted-foreground">
								{genus}ポケモン
							</span>
						</div>
					</Hint>

					{/* Type Hint */}
					<Hint
						icon={<TypeIcon className="w-4.5 h-4.5 stroke-muted-foreground" />}
						label="タイプ"
					>
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
					</Hint>

					{/* Image Hint */}
					<Hint
						icon={<ImageIcon className="w-4.5 h-4.5 stroke-muted-foreground" />}
						label="画像"
					>
						<div className="flex flex-col gap-3 px-4 pb-4">
							{/* Image Type Selector */}
							<div
								className="flex items-center gap-2"
								role="radiogroup"
								aria-label="画像の表示方法"
							>
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
									loading="lazy"
									src={imageUrl}
									alt={isAnswerRevealed ? name : "Pokemon"}
									className="max-h-full max-w-full"
									style={getImageStyle()}
								/>
							</div>
						</div>
					</Hint>
				</section>
			</div>

			{/* Confirmation Modal */}
			{showConfirmModal && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
					role="dialog"
					aria-modal="true"
					aria-labelledby="modal-title"
					aria-describedby="modal-description"
				>
					<div className="bg-card rounded-lg p-6 max-w-sm mx-4">
						<h3
							id="modal-title"
							className="text-lg font-bold text-card-foreground mb-2"
						>
							答えを確認
						</h3>
						<p id="modal-description" className="text-muted-foreground mb-4">
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
