export type MowerCommand = "start" | "pause" | "cancel" | "dock";

export type CommandPlan = { visible: ReadonlySet<MowerCommand>; primary?: MowerCommand };

/**
 * The built-in commands that make sense in the mower's current state, and the one
 * obvious next step. Relevance follows the mower state only; a command in flight
 * disables buttons but never hides them, so the row doesn't jump mid-command.
 */
export function commandPlan(relevant: Record<MowerCommand, boolean>): CommandPlan {
  const visible = new Set((Object.keys(relevant) as MowerCommand[]).filter(command => relevant[command]));
  const primary = visible.has("pause") ? "pause" : visible.has("start") ? "start" : undefined;
  return { visible, primary };
}
