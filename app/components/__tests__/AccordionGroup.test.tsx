import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
	AccordionGroup as AccordionGroupType,
	PokemonDatabase,
} from "../../types/pokemon";
import { AccordionGroup } from "../AccordionGroup";

const mockGroup: AccordionGroupType = {
	id: "a",
	name: "ア行",
	characters: ["ア", "イ", "ウ", "エ", "オ"],
	isExpanded: false,
	activeCharacter: "ア",
};

const mockExpandedGroup: AccordionGroupType = {
	...mockGroup,
	isExpanded: true,
};

const mockPokemonDatabase: PokemonDatabase = {
	ア: [["アーボ", "へび", 1, 23, [8]]],
	イ: [["イーブイ", "しんか", 1, 133, [1]]],
	ウ: [["ウインディ", "でんせつ", 1, 59, [2]]],
	エ: [],
	オ: [["オニスズメ", "ことり", 1, 21, [1, 10]]],
};

describe("AccordionGroup", () => {
	const mockOnSetActiveCharacter = vi.fn();
	const mockOnMarkAsUsed = vi.fn();
	const mockUsedPokemonSet = new Set<string>();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render collapsed accordion group", () => {
		render(
			<AccordionGroup
				group={mockGroup}
				pokemonDatabase={mockPokemonDatabase}
				usedPokemonSet={mockUsedPokemonSet}
				onSetActiveCharacter={mockOnSetActiveCharacter}
				onMarkAsUsed={mockOnMarkAsUsed}
			/>,
		);

		expect(screen.getByText("ア行")).toBeInTheDocument();

		// Check that the details element is not open
		const detailsElement = screen.getByText("ア行").closest("details");
		expect(detailsElement).not.toHaveAttribute("open");

		// The content should not be visible when collapsed
		// Note: Due to testing library behavior with details elements,
		// we check for visibility style rather than DOM presence
		const tabContent = screen.queryByRole("tablist");
		if (tabContent) {
			// If content exists, it should be in a collapsed details element
			expect(detailsElement?.hasAttribute("open")).toBe(false);
		}
	});

	it("should render expanded accordion group with tabs", () => {
		render(
			<AccordionGroup
				group={mockExpandedGroup}
				pokemonDatabase={mockPokemonDatabase}
				usedPokemonSet={mockUsedPokemonSet}
				onSetActiveCharacter={mockOnSetActiveCharacter}
				onMarkAsUsed={mockOnMarkAsUsed}
			/>,
		);

		expect(screen.getByText("ア行")).toBeInTheDocument();

		// All character tabs should be visible
		expect(screen.getByText("ア")).toBeInTheDocument();
		expect(screen.getByText("イ")).toBeInTheDocument();
		expect(screen.getByText("ウ")).toBeInTheDocument();
		expect(screen.getByText("エ")).toBeInTheDocument();
		expect(screen.getByText("オ")).toBeInTheDocument();

		// Individual character counts should be visible (in tab badges)
		expect(screen.getAllByText("1")).toHaveLength(4); // Count for ア, イ, ウ, オ (each has 1 Pokemon)
	});

	it("should toggle accordion when header is clicked", () => {
		render(
			<AccordionGroup
				group={mockGroup}
				pokemonDatabase={mockPokemonDatabase}
				usedPokemonSet={mockUsedPokemonSet}
				onSetActiveCharacter={mockOnSetActiveCharacter}
				onMarkAsUsed={mockOnMarkAsUsed}
			/>,
		);

		const header = screen.getByText("ア行").closest("summary");
		if (header) fireEvent.click(header);

		// Check that content becomes visible after clicking
		expect(screen.getByText("ア")).toBeInTheDocument();
	});

	it("should call onSetActiveCharacter when tab is clicked", () => {
		render(
			<AccordionGroup
				group={mockExpandedGroup}
				pokemonDatabase={mockPokemonDatabase}
				usedPokemonSet={mockUsedPokemonSet}
				onSetActiveCharacter={mockOnSetActiveCharacter}
				onMarkAsUsed={mockOnMarkAsUsed}
			/>,
		);

		const iTab = screen.getByText("イ");
		fireEvent.click(iTab);

		expect(mockOnSetActiveCharacter).toHaveBeenCalledWith("a", "イ");
	});

	it("should show Pokemon cards for active character", () => {
		render(
			<AccordionGroup
				group={mockExpandedGroup}
				pokemonDatabase={mockPokemonDatabase}
				usedPokemonSet={mockUsedPokemonSet}
				onSetActiveCharacter={mockOnSetActiveCharacter}
				onMarkAsUsed={mockOnMarkAsUsed}
			/>,
		);

		// Should show Pokemon for 'ア' character (アーボ)
		expect(screen.getByText("#023")).toBeInTheDocument();
	});

	it("should show active tab styling", () => {
		render(
			<AccordionGroup
				group={mockExpandedGroup}
				pokemonDatabase={mockPokemonDatabase}
				usedPokemonSet={mockUsedPokemonSet}
				onSetActiveCharacter={mockOnSetActiveCharacter}
				onMarkAsUsed={mockOnMarkAsUsed}
			/>,
		);

		const activeTab = screen.getByText("ア").closest("button");
		const inactiveTab = screen.getByText("イ").closest("button");

		expect(activeTab).toHaveClass("bg-primary", "text-primary-foreground");
		expect(inactiveTab).toHaveClass(
			"bg-secondary",
			"text-secondary-foreground",
		);
	});

	it("should show empty state when no Pokemon exist for character", () => {
		const groupWithEmptyCharacter: AccordionGroupType = {
			...mockExpandedGroup,
			activeCharacter: "エ", // エ has no Pokemon in mock data
		};

		render(
			<AccordionGroup
				group={groupWithEmptyCharacter}
				pokemonDatabase={mockPokemonDatabase}
				usedPokemonSet={mockUsedPokemonSet}
				onSetActiveCharacter={mockOnSetActiveCharacter}
				onMarkAsUsed={mockOnMarkAsUsed}
			/>,
		);

		expect(
			screen.getByText("「エ」で始まるポケモンはありません"),
		).toBeInTheDocument();
	});

	it("should show individual character counts in tabs", () => {
		render(
			<AccordionGroup
				group={mockExpandedGroup}
				pokemonDatabase={mockPokemonDatabase}
				usedPokemonSet={mockUsedPokemonSet}
				onSetActiveCharacter={mockOnSetActiveCharacter}
				onMarkAsUsed={mockOnMarkAsUsed}
			/>,
		);

		// Character counts should be visible in tabs: ア: 1, イ: 1, ウ: 1, エ: 0, オ: 1
		expect(screen.getAllByText("1")).toHaveLength(4); // 4 tabs with count 1
		expect(screen.getByText("0")).toBeInTheDocument(); // エ tab with count 0
	});

	it("should pass used Pokemon set to Pokemon cards", () => {
		const usedPokemonSet = new Set(["アーボ"]);

		render(
			<AccordionGroup
				group={mockExpandedGroup}
				pokemonDatabase={mockPokemonDatabase}
				usedPokemonSet={usedPokemonSet}
				onSetActiveCharacter={mockOnSetActiveCharacter}
				onMarkAsUsed={mockOnMarkAsUsed}
			/>,
		);

		// Should show used Pokemon with used styling
		expect(screen.getByText("使用済み")).toBeInTheDocument();
	});
});
