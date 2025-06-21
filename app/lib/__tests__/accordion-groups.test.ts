/** biome-ignore-all lint/complexity/useLiteralKeys: for readability */
import { describe, expect, it } from "vitest";
import { ACCORDION_GROUPS } from "../accordion-groups";

describe("accordion-groups", () => {
	describe("ACCORDION_GROUPS", () => {
		it("should have 15 accordion groups", () => {
			expect(ACCORDION_GROUPS).toHaveLength(15);
		});

		it("should have correct group names", () => {
			const groupNames = ACCORDION_GROUPS.map((group) => group.name);
			expect(groupNames).toEqual([
				"ア行",
				"カ行",
				"ガ行",
				"サ行",
				"ザ行",
				"タ行",
				"ダ行",
				"ナ行",
				"ハ行",
				"バ行",
				"パ行",
				"マ行",
				"ヤ行",
				"ラ行",
				"ワ行",
			]);
		});

		it("should have correct characters for ア行", () => {
			const aGroup = ACCORDION_GROUPS.find((group) => group.id === "a");
			expect(aGroup?.characters).toEqual(["ア", "イ", "ウ", "エ", "オ"]);
		});

		it("should have correct characters for ヤ行", () => {
			const yaGroup = ACCORDION_GROUPS.find((group) => group.id === "ya");
			expect(yaGroup?.characters).toEqual(["ヤ", "ユ", "ヨ"]);
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
});
