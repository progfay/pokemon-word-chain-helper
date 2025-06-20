/** biome-ignore-all lint/complexity/useLiteralKeys: for readability */
import { describe, expect, it } from "vitest";
import { ACCORDION_GROUPS, HIRAGANA_TO_KATAKANA } from "../accordion-groups";

describe("accordion-groups", () => {
	describe("ACCORDION_GROUPS", () => {
		it("should have 15 accordion groups", () => {
			expect(ACCORDION_GROUPS).toHaveLength(15);
		});

		it("should have correct group names", () => {
			const groupNames = ACCORDION_GROUPS.map((group) => group.name);
			expect(groupNames).toEqual([
				"あ行",
				"か行",
				"が行",
				"さ行",
				"ざ行",
				"た行",
				"だ行",
				"な行",
				"は行",
				"ば行",
				"ぱ行",
				"ま行",
				"や行",
				"ら行",
				"わ行",
			]);
		});

		it("should have correct characters for あ行", () => {
			const aGroup = ACCORDION_GROUPS.find((group) => group.id === "a");
			expect(aGroup?.characters).toEqual(["あ", "い", "う", "え", "お"]);
		});

		it("should have correct characters for や行", () => {
			const yaGroup = ACCORDION_GROUPS.find((group) => group.id === "ya");
			expect(yaGroup?.characters).toEqual(["や", "ゆ", "よ"]);
		});

		it("should have all groups collapsed by default", () => {
			ACCORDION_GROUPS.forEach((group) => {
				expect(group.isExpanded).toBe(false);
			});
		});

		it("should have first character as active character for each group", () => {
			ACCORDION_GROUPS.forEach((group) => {
				expect(group.activeCharacter).toBe(group.characters[0]);
			});
		});
	});

	describe("HIRAGANA_TO_KATAKANA", () => {
		it("should convert basic hiragana to katakana", () => {
			expect(HIRAGANA_TO_KATAKANA["あ"]).toBe("ア");
			expect(HIRAGANA_TO_KATAKANA["か"]).toBe("カ");
			expect(HIRAGANA_TO_KATAKANA["さ"]).toBe("サ");
		});

		it("should convert voiced sounds correctly", () => {
			expect(HIRAGANA_TO_KATAKANA["が"]).toBe("ガ");
			expect(HIRAGANA_TO_KATAKANA["ざ"]).toBe("ザ");
			expect(HIRAGANA_TO_KATAKANA["だ"]).toBe("ダ");
		});

		it("should convert semi-voiced sounds correctly", () => {
			expect(HIRAGANA_TO_KATAKANA["ぱ"]).toBe("パ");
			expect(HIRAGANA_TO_KATAKANA["ぴ"]).toBe("ピ");
			expect(HIRAGANA_TO_KATAKANA["ぽ"]).toBe("ポ");
		});

		it("should have mappings for all hiragana characters", () => {
			const expectedCount = 73; // Includes all variants (voiced, semi-voiced, etc.)
			expect(Object.keys(HIRAGANA_TO_KATAKANA).length).toBe(expectedCount);
		});

		it("should map ん correctly", () => {
			expect(HIRAGANA_TO_KATAKANA["ん"]).toBe("ン");
		});
	});
});
