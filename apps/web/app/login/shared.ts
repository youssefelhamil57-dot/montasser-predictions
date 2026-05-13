/**
 * Shared types + initial state for the login flow.
 * Lives outside `actions.ts` because "use server" files may only export
 * async functions — no types, no constants.
 */

export type LoginResult =
  | { status: "idle" }
  | { status: "error"; message: string };

export const loginInitial: LoginResult = { status: "idle" };
