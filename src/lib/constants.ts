// Promptathon winner app IDs (1st, 2nd, 3rd place)
export const WINNER_IDS: [number, number, number] = [121, 147, 98];

export const PODIUM = [
  {
    label: "Winner",
    emoji: "\uD83D\uDC51",
    bg: "bg-yellow-500/20",
    border: "border-yellow-500/50",
    text: "text-yellow-400",
  },
  {
    label: "2nd Place",
    emoji: "\uD83E\uDD48",
    bg: "bg-slate-300/15",
    border: "border-slate-400/40",
    text: "text-slate-300",
  },
  {
    label: "3rd Place",
    emoji: "\uD83E\uDD49",
    bg: "bg-amber-600/15",
    border: "border-amber-600/40",
    text: "text-amber-500",
  },
] as const;

export function getWinnerBadge(appId: number) {
  const index = WINNER_IDS.indexOf(appId);
  return index >= 0 ? PODIUM[index] : null;
}
