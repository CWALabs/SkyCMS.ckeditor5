# SkyCMS AI Assistant Integration

This document explains the SkyCMS CKEditor AI assistant integration in the `SkyCMS.ckeditor5` repository: what it does, why it exists, how it works, and what kinds of authoring tasks it is designed to support.

## What This Does

The AI assistant adds a toolbar button named `copilotAssist` to the `standard` and `advanced` SkyCMS editor profiles.

When the button is clicked:

1. In the real SkyCMS host, CKEditor calls `window.parent.openCkEditorCopilot( editor )`.
2. The host page opens a floating chat window that is scoped to the active CKEditor instance.
3. The user can ask for writing help, review a suggestion, and then explicitly apply the result back into the editor.

The local playground in this repository mirrors that behavior with a mocked host window so the interaction can be validated before syncing assets into the main SkyCMS application.

## Why Use It

The AI assistant exists to improve authoring speed without forcing users into raw HTML or external tools.

It is useful when authors need to:

1. Improve wording while staying inside the visual editor.
2. Rewrite a sentence, paragraph, or entire region without leaving the page.
3. Apply changes directly to the current selection, the caret position, or the full editor region.
4. Validate the UI and integration behavior in a safe local environment before deploying changes back into SkyCMS.

The goal is not to replace editorial review. The goal is to make common editing tasks faster and safer while preserving the author’s intent and the host CMS workflow.

## How It Works

The integration has two layers.

### 1. CKEditor plugin layer

Source files:

1. `src/plugins/copilot/copilot.js`
2. `src/plugins/copilot/copilotediting.js`
3. `src/plugins/copilot/copilotui.js`

The plugin follows the same pattern as the other SkyCMS integration plugins:

1. `copilot.js` is the composition plugin.
2. `copilotediting.js` is intentionally minimal.
3. `copilotui.js` registers the `copilotAssist` toolbar item and triggers the host callback.

The plugin itself does not own the chat lifecycle. It only exposes the toolbar entry point and hands control to the host.

### 2. Host window layer

In the local playground, the host behavior is implemented in:

1. `playground/copilot-host.js`
2. `playground/index.html`
3. `playground/styles.css`

This host layer is responsible for:

1. Opening and closing the floating AI window.
2. Keeping chat history scoped to one editor instance at a time.
3. Capturing the active selection or caret position.
4. Rendering assistant responses.
5. Applying a suggestion back into the editor.

The playground host is deliberately mocked-first. It simulates the real SkyCMS host flow closely enough to validate behavior, but it does not call the real backend. That separation keeps local integration testing fast and predictable.

## Scoped Editing Model

The assistant is intentionally region-scoped.

That means:

1. The active editor instance is tracked independently.
2. Selection snapshots are stored per editor session.
3. Suggestions are applied only to the editor that originated the request.

This matters because SkyCMS pages often contain multiple editable CKEditor regions. The assistant should not leak suggestions or state between them.

## Supported Apply Modes

The integration currently supports three apply paths:

1. `Replace selection`
2. `Insert at cursor`
3. `Replace block`

These map to the main authoring cases:

1. Improve just the currently selected phrase or paragraph.
2. Insert new text at the saved caret position.
3. Replace the full region with a more polished version.

The user explicitly chooses when to apply a suggestion. The assistant does not silently rewrite content.

## Examples Of What You Can Do

Typical authoring prompts include:

1. “Improve this paragraph for grammar and clarity.”
2. “Rewrite this selection in a more professional tone.”
3. “Shorten this section without losing the main point.”
4. “Expand this paragraph with a bit more detail.”
5. “Rewrite the whole block so it reads better on a marketing page.”
6. “Make this sentence easier to understand.”
7. “Turn this rough draft into publish-ready copy.”

In the local playground, these actions are simulated with a local suggestion generator so maintainers can verify the UX without depending on a live AI backend.

## Playground Behavior Versus Real SkyCMS

In this repository:

1. The playground shows the button on `standard` and `advanced` profiles.
2. The playground opens a floating local AI window.
3. Responses are generated locally for smoke and UI validation.

In the main SkyCMS application:

1. The same toolbar button opens the real host AI window.
2. The host uses the SkyCMS Copilot backend.
3. The request payload is routed through the main application controller, where rich-text prompts are handled differently from Monaco/code prompts.

## Why The Playground Matters

This repository exists to reduce risk before syncing built assets into SkyCMS.

The playground helps validate:

1. Toolbar visibility by editor profile.
2. Host bridge wiring.
3. Selection and apply behavior.
4. Floating window behavior such as open, close, minimize, and stacking.
5. Regression-safe authoring flows before deployment into the product.

## Tests In This Repository

Current AI-related coverage includes:

1. `tests/plugin-ui.smoke.test.js`
   Verifies the `copilotAssist` button is registered and that it calls the host bridge or fallback alert.
2. `tests/playground-boot.smoke.test.js`
   Verifies the button is included in `standard` and `advanced` profiles but not `title`.
3. `tests/copilot-host.smoke.test.js`
   Verifies host window behavior such as closing the local panel.

These tests are intended to validate the integration contract and UI behavior in this fork. Real backend prompt behavior is tested in the main SkyCMS repository.