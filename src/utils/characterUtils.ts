import type { CharacterMap } from '../types';

const kanaMap: CharacterMap = {
  あ: 'ア',
  い: 'イ',
  う: 'ウ',
  え: 'エ',
  お: 'オ',
  か: 'カ',
  き: 'キ',
  く: 'ク',
  け: 'ケ',
  こ: 'コ',
  さ: 'サ',
  し: 'シ',
  す: 'ス',
  せ: 'セ',
  そ: 'ソ',
  た: 'タ',
  ち: 'チ',
  つ: 'ツ',
  て: 'テ',
  と: 'ト',
  な: 'ナ',
  に: 'ニ',
  ぬ: 'ヌ',
  ね: 'ネ',
  の: 'ノ',
  は: 'ハ',
  ひ: 'ヒ',
  ふ: 'フ',
  へ: 'ヘ',
  ほ: 'ホ',
  ま: 'マ',
  み: 'ミ',
  む: 'ム',
  め: 'メ',
  も: 'モ',
  や: 'ヤ',
  ゆ: 'ユ',
  よ: 'ヨ',
  ら: 'ラ',
  り: 'リ',
  る: 'ル',
  れ: 'レ',
  ろ: 'ロ',
  わ: 'ワ',
  を: 'ヲ',
  ん: 'ン',
  が: 'ガ',
  ぎ: 'ギ',
  ぐ: 'グ',
  げ: 'ゲ',
  ご: 'ゴ',
  ざ: 'ザ',
  じ: 'ジ',
  ず: 'ズ',
  ぜ: 'ゼ',
  ぞ: 'ゾ',
  だ: 'ダ',
  ぢ: 'ヂ',
  づ: 'ヅ',
  で: 'デ',
  ど: 'ド',
  ば: 'バ',
  び: 'ビ',
  ぶ: 'ブ',
  べ: 'ベ',
  ぼ: 'ボ',
  ぱ: 'パ',
  ぴ: 'ピ',
  ぷ: 'プ',
  ぺ: 'ペ',
  ぽ: 'ポ',
  ぁ: 'ァ',
  ぃ: 'ィ',
  ぅ: 'ゥ',
  ぇ: 'ェ',
  ぉ: 'ォ',
  ゃ: 'ャ',
  ゅ: 'ュ',
  ょ: 'ョ',
};

const katakanaMap: CharacterMap = Object.fromEntries(
  Object.entries(kanaMap).map(([hira, kata]) => [kata, hira]),
);

export const CharacterUtils = {
  isJapaneseChar(char: string): boolean {
    return /^[\u3040-\u309F\u30A0-\u30FF]$/.test(char);
  },

  toHiragana(text: string): string {
    return Array.from(text)
      .map((char) => katakanaMap[char] || char)
      .join('');
  },

  toKatakana(text: string): string {
    return Array.from(text)
      .map((char) => kanaMap[char] || char)
      .join('');
  },

  normalize(char: string): string {
    return this.toKatakana(this.toHiragana(char));
  },
};

const isEndingWithN = (str: string): boolean => {
  return str.endsWith('ん') || str.endsWith('ン');
};

const isValidJapanese = (str: string): boolean => {
  return Array.from(str).every((char) => CharacterUtils.isJapaneseChar(char));
};

/**
 * Convert any mix of katakana and hiragana to normalized hiragana
 */
export function normalizeCharacters(text: string): string {
  let normalized = text;
  // First convert all katakana to hiragana using the kanaMap in reverse
  for (const [hiragana, katakana] of Object.entries(kanaMap)) {
    normalized = normalized.replace(new RegExp(katakana, 'g'), hiragana);
  }
  return normalized;
}

/**
 * Convert a character to katakana if it exists in the map
 */
function toKatakana(char: string): string {
  return kanaMap[char] || char;
}

/**
 * Convert a string to katakana
 */
function convertToKatakana(text: string): string {
  return text.split('').map(toKatakana).join('');
}
