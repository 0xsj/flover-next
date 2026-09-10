import { asFailure, canceled, err, internal, type Failure, type Result } from "@/lib/kernel";
import { createStore } from "@/lib/runtime";
import type { NoteAttempt, NoteDraft, NoteReceipt } from "@/lib/services/example/note.types";

type NotePort = {
  save: (attempt: NoteAttempt, signal: AbortSignal) => Promise<Result<NoteReceipt>>;
  find: (operationId: string, signal: AbortSignal) => Promise<Result<NoteReceipt | null>>;
};
export type NotePhase =
  | { state: "ready" }
  | { state: "refused"; failure: Failure }
  | { state: "saving" | "checking"; attempt: NoteAttempt }
  | { state: "unknown"; attempt: NoteAttempt; failure: Failure }
  | { state: "not-recorded" };
export type NoteState = { draft: NoteDraft; confirmed: NoteReceipt | null; phase: NotePhase };
export const sameDraft = (a: NoteDraft, b: NoteDraft) => a.title === b.title && a.body === b.body;

/** This recipe's policy over an injected port, independent of its React view. */
export function createNoteModel(port: NotePort, initial: NoteDraft, newId = () => crypto.randomUUID()) {
  const store = createStore<NoteState>({ draft: { ...initial }, confirmed: null, phase: { state: "ready" } });
  let generation = 0;
  let controller: AbortController | undefined;
  const updatePhase = (phase: NotePhase) => store.set({ ...store.get(), phase });
  const uncertain = (attempt: NoteAttempt, failure: Failure) => updatePhase({ state: "unknown", attempt, failure });

  function confirm(attempt: NoteAttempt, receipt: NoteReceipt) {
    if (receipt.operationId !== attempt.operationId || !sameDraft(receipt.draft, attempt.draft)) {
      uncertain(attempt, internal("The receipt did not match this save.", { type: "invalid_response" }));
      return;
    }
    // A receipt confirms the captured draft; newer input is never overwritten.
    store.set({ ...store.get(), confirmed: receipt, phase: { state: "ready" } });
  }

  return {
    ...store,
    edit(draft: NoteDraft) { store.set({ ...store.get(), draft: { ...draft } }); },
    async save() {
      const current = store.get();
      if (["saving", "checking", "unknown"].includes(current.phase.state)) return;
      const attempt: NoteAttempt = { operationId: newId(), draft: { ...current.draft } };
      const own = ++generation;
      controller = new AbortController();
      updatePhase({ state: "saving", attempt });
      let result: Result<NoteReceipt>;
      try { result = await port.save(attempt, controller.signal); }
      catch (cause) { result = err(asFailure(cause)); }
      if (own !== generation) return;
      if (result.ok) confirm(attempt, result.value);
      else if (result.error.kind === "invalid") updatePhase({ state: "refused", failure: result.error });
      else uncertain(attempt, result.error);
    },
    async check() {
      const phase = store.get().phase;
      if (phase.state !== "unknown") return;
      const { attempt } = phase;
      const own = ++generation;
      controller = new AbortController();
      updatePhase({ state: "checking", attempt });
      let result: Result<NoteReceipt | null>;
      try { result = await port.find(attempt.operationId, controller.signal); }
      catch (cause) { result = err(asFailure(cause)); }
      if (own !== generation) return;
      if (!result.ok) uncertain(attempt, result.error);
      else if (result.value === null) updatePhase({ state: "not-recorded" });
      else confirm(attempt, result.value);
    },
    cancel() {
      generation++;
      controller?.abort();
      const phase = store.get().phase;
      if (phase.state === "saving" || phase.state === "checking") uncertain(phase.attempt, canceled("The operation was interrupted. Check its outcome before saving again."));
    },
  };
}
