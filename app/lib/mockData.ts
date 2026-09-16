export const MOCK_RESULT = {
  refined_note:
    "Photosynthesis is the process by which plants convert light energy into chemical energy. This process primarily occurs in chloroplasts and uses light energy to produce chemical energy that can be stored and used by the plant.",

  key_points: [
    "Photosynthesis converts light energy into chemical energy.",
    "The process primarily occurs in chloroplasts.",
    "The resulting chemical energy can be stored and used by plants.",
  ],

  citations_used: [],

  uncertainties: [],

  source_note:
    "Source and citation information will appear here when the real academic evidence layer is connected.",
} as const;

export type MockRefineResult = typeof MOCK_RESULT;

export function mockRefineNote(
  note: string,
  style: string,
): MockRefineResult {
  void note;
  void style;

  return MOCK_RESULT;
}
