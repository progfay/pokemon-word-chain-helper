import { describe, it, expect } from 'vitest';
import { CharacterUtils } from '../js/modules/characterUtils.js';

describe('CharacterUtils', () => {
  describe('toHiragana', () => {
    it('should convert katakana to hiragana', () => {
      expect(CharacterUtils.toHiragana('ピカチュウ')).toBe('ぴかちゅう');
      expect(CharacterUtils.toHiragana('フシギダネ')).toBe('ふしぎだね');
    });

    it('should leave hiragana unchanged', () => {
      expect(CharacterUtils.toHiragana('ぴかちゅう')).toBe('ぴかちゅう');
    });
  });

  describe('toKatakana', () => {
    it('should convert hiragana to katakana', () => {
      expect(CharacterUtils.toKatakana('ぴかちゅう')).toBe('ピカチュウ');
      expect(CharacterUtils.toKatakana('ふしぎだね')).toBe('フシギダネ');
    });

    it('should leave katakana unchanged', () => {
      expect(CharacterUtils.toKatakana('ピカチュウ')).toBe('ピカチュウ');
    });
  });

  describe('isJapaneseChar', () => {
    it('should return true for hiragana', () => {
      expect(CharacterUtils.isJapaneseChar('あ')).toBe(true);
      expect(CharacterUtils.isJapaneseChar('ん')).toBe(true);
    });

    it('should return true for katakana', () => {
      expect(CharacterUtils.isJapaneseChar('ア')).toBe(true);
      expect(CharacterUtils.isJapaneseChar('ン')).toBe(true);
    });

    it('should return false for non-Japanese characters', () => {
      expect(CharacterUtils.isJapaneseChar('a')).toBe(false);
      expect(CharacterUtils.isJapaneseChar('1')).toBe(false);
    });
  });
});
