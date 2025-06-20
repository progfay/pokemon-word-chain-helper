import { describe, expect, it } from "vitest";
import { getTypeInfo, getTypesInfo, POKEMON_TYPES } from "../pokemon-types";

describe("pokemon-types", () => {
	describe("getTypeInfo", () => {
		it("should return correct type info for fire type", () => {
			const fireType = getTypeInfo(2);
			expect(fireType).toEqual({
				id: 2,
				name: "ほのお",
				color: "#F08030",
			});
		});

		it("should return correct type info for water type", () => {
			const waterType = getTypeInfo(3);
			expect(waterType).toEqual({
				id: 3,
				name: "みず",
				color: "#6890F0",
			});
		});

		it("should return correct type info for electric type", () => {
			const electricType = getTypeInfo(4);
			expect(electricType).toEqual({
				id: 4,
				name: "でんき",
				color: "#F8D030",
			});
		});
	});

	describe("getTypesInfo", () => {
		it("should return array with single type", () => {
			const types = getTypesInfo([2]);
			expect(types).toHaveLength(1);
			expect(types[0]).toEqual({
				id: 2,
				name: "ほのお",
				color: "#F08030",
			});
		});

		it("should return array with dual types", () => {
			const types = getTypesInfo([5, 8]); // grass/poison
			expect(types).toHaveLength(2);
			expect(types[0]).toEqual({
				id: 5,
				name: "くさ",
				color: "#78C850",
			});
			expect(types[1]).toEqual({
				id: 8,
				name: "どく",
				color: "#A040A0",
			});
		});
	});

	describe("POKEMON_TYPES", () => {
		it("should have all 18 Pokemon types", () => {
			expect(Object.keys(POKEMON_TYPES)).toHaveLength(18);
		});

		it("should have correct type names in Japanese", () => {
			expect(POKEMON_TYPES[1].name).toBe("ノーマル");
			expect(POKEMON_TYPES[11].name).toBe("エスパー");
			expect(POKEMON_TYPES[18].name).toBe("フェアリー");
		});

		it("should have valid hex color codes", () => {
			Object.values(POKEMON_TYPES).forEach((type) => {
				expect(type.color).toMatch(/^#[0-9A-F]{6}$/);
			});
		});
	});
});
