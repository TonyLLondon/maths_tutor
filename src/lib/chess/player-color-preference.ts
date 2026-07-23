export type PlayerColor = "w" | "b";

export function resolveColorChoice(
  choice: PlayerColor | "random",
): PlayerColor {
  if (choice === "random") {
    return Math.random() < 0.5 ? "w" : "b";
  }
  return choice;
}
