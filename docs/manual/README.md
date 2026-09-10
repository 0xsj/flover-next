# Flover user manual

The [cookbook manual](http://localhost:3000/cookbook/manual) is public and needs
no sign-in. It includes a Markdown download generated from the same content.
Use the origin of your running Flover instance when it differs from localhost.

Read the chapters in sequence, or start with the question you are working on:

| Chapter | What it answers |
| --- | --- |
| [Start with the shape](http://localhost:3000/cookbook/manual/orientation) | What belongs to the template, and where does product work start? |
| [Layers and ownership](http://localhost:3000/cookbook/manual/layers) | Who owns each decision, and why are those imports separated? |
| [Results and failures](http://localhost:3000/cookbook/manual/results-and-failures) | How do results, kinds, narrowing, absence, causes and framework edges fit together? |
| [Add a feature](http://localhost:3000/cookbook/manual/add-a-feature) | How do I go from a behavior specification to a service and screen? |
| [Connect a backend](http://localhost:3000/cookbook/manual/backends) | Which envelopes and semantic guarantees must my adapter supply? |
| [State and recovery](http://localhost:3000/cookbook/manual/state-and-recovery) | Which store owns the state, and what survives an interruption? |
| [Verification and specifications](http://localhost:3000/cookbook/manual/verification) | What do the checks establish, and what needs an independent oracle? |

## Read the underlying contracts

- Result and failures: [Result](../../lib/kernel/result.ts),
  [Failure](../../lib/kernel/failure.ts), [explicit absence](../../lib/kernel/optional.ts),
  [exception edge](../../lib/kernel/app-error.ts),
  [plain form state](../../app/_lib/form-state.ts).
- Boundaries: [HTTP port](../../lib/http/port.ts),
  [response readers](../../lib/http/response.doc.ts),
  [root construction](../../lib/root/index.ts),
  [framework session binding](../../app/_lib/root.ts).
- Recovery: [draft contract](../../lib/runtime/save-draft.doc.ts),
  [session recovery](../../lib/runtime/session-recovery.doc.ts),
  [capabilities](../../lib/services/access/doc.ts),
  [jobs](../../lib/services/jobs/doc.ts),
  [storage](../../lib/storage/doc.ts), [locale](../../lib/locale/doc.ts).
- Verification: [architecture command](../../tools/architecture/README.md),
  [contextual review](../../tools/architecture/REVIEW.md),
  [mutation harness](../../tools/resilience/README.md).
- Optional protocols: [index](../../protocols/README.md),
  [spec tests](../../protocols/spec-tests.md),
  [writer's information barrier](../../protocols/spec-tests.role.md),
  [notes](../../protocols/notes.md).

## Maintaining the manual

The authored chapters live in
[chapters.ts](<../../app/(workspace)/cookbook/manual/_lib/chapters.ts>).
Their typed blocks drive both the HTML reader and Markdown download; edit that
content once. Keep snippets tied to their named source or clearly identify them
as illustrative. Describe current behavior and limitations, including where
isolated cookbook adapters differ from the main application root.

Repository paths in the browser are references for your editor. They are not
HTTP links, and the app does not read optional protocol files at runtime.
