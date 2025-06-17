/**
 * Japanese character constants for the Pokemon Word Chain Helper
 */

interface JapaneseRow {
  name: string;
  chars: string[];
}

/**
 * Japanese character rows organized by gojūon (fifty-sound table)
 * Used for accordion organization and character validation
 */
export const JAPANESE_ROWS: JapaneseRow[] = [
  { name: 'ア行', chars: ['ア', 'イ', 'ウ', 'エ', 'オ'] },
  { name: 'カ行', chars: ['カ', 'キ', 'ク', 'ケ', 'コ'] },
  { name: 'ガ行', chars: ['ガ', 'ギ', 'グ', 'ゲ', 'ゴ'] },
  { name: 'サ行', chars: ['サ', 'シ', 'ス', 'セ', 'ソ'] },
  { name: 'ザ行', chars: ['ザ', 'ジ', 'ズ', 'ゼ', 'ゾ'] },
  { name: 'タ行', chars: ['タ', 'チ', 'ツ', 'テ', 'ト'] },
  { name: 'ダ行', chars: ['ダ', 'ヂ', 'ヅ', 'デ', 'ド'] },
  { name: 'ナ行', chars: ['ナ', 'ニ', 'ヌ', 'ネ', 'ノ'] },
  { name: 'ハ行', chars: ['ハ', 'ヒ', 'フ', 'ヘ', 'ホ'] },
  { name: 'バ行', chars: ['バ', 'ビ', 'ブ', 'ベ', 'ボ'] },
  { name: 'パ行', chars: ['パ', 'ピ', 'プ', 'ペ', 'ポ'] },
  { name: 'マ行', chars: ['マ', 'ミ', 'ム', 'メ', 'モ'] },
  { name: 'ヤ行', chars: ['ヤ', 'ユ', 'ヨ'] },
  { name: 'ラ行', chars: ['ラ', 'リ', 'ル', 'レ', 'ロ'] },
  { name: 'ワ行', chars: ['ワ', 'ヲ', 'ン'] },
];

/**
 * Get all Japanese characters as a flat array
 */
const getAllJapaneseChars = (): string[] => {
  return JAPANESE_ROWS.flatMap((row) => row.chars);
};

/**
 * Find which row contains a specific character
 */
export const findRowForChar = (char: string): JapaneseRow | undefined => {
  return JAPANESE_ROWS.find((row) => row.chars.includes(char));
};
