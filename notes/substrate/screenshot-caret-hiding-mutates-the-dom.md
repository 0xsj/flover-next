A screenshot can alter the DOM while hydration is still comparing it, so a warning observed during capture may originate in the measuring harness.

**True of Playwright 1.56.0 with React 19.2.8 and Next 16.3.4 · observed and source-checked 2026-09-10.**

## Origin

During a full-page capture of a gallery with lazy shell iframes, React reported
a style mismatch on hidden radio inputs. The unexpected style included
`caret-color: transparent`. Repeating the browser checks with
`caret: "initial"` removed the warning without changing the radio component.
This was an observed run and comparison, not a controlled measurement of the
race's frequency.

## Mechanism

Playwright hides the caret by default. In the
[1.56.0 screenshotter source](https://github.com/microsoft/playwright/blob/v1.56.0/packages/playwright-core/src/server/screenshotter.ts),
preparation writes an inline caret color to inputs, textareas, and editable
elements, including hidden inputs, and restores it afterward. Preparation runs
across frames. If an iframe hydrates during that interval, the DOM being compared
already contains a style the application did not render. The source and the
observed mismatch support that explanation for this run.

The [screenshot API](https://playwright.dev/docs/api/class-page#page-screenshot-option-caret)
provides `caret: "initial"` to leave the caret unchanged:

```ts
await page.screenshot({ path: "shell.png", caret: "initial" });
```

For hydration checks, capture console errors as well as page exceptions, and
exercise controls inside each lazy frame. A visible server-rendered heading
alone does not establish that its event handlers are attached. If a mismatch
appears during capture, compare with capture disabled or caret hiding disabled
before changing the application. Keep the original assertion intact.

## Used in

The manual Flover browser verification of chart pages and embedded shell
previews. The diagnostic harness ran during development; it is not a committed
browser test suite.

## Related

[`negative-controls-catch-the-harness`](../techniques/negative-controls-catch-the-harness.md),
[`a-shell-preview-needs-its-own-document`](../techniques/a-shell-preview-needs-its-own-document.md).
