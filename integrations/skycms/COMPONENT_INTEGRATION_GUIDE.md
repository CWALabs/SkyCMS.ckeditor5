# SkyCMS CKEditor Component Integration Guide

This guide explains how custom SkyCMS CKEditor components are organized in this repository, how they connect to the host CMS, and how to safely extend or debug them.

## Purpose

The integration package is a source-first workspace for SkyCMS-specific editor behavior.

Goals:

1. Keep custom plugin logic versioned with CKEditor source work.
2. Validate custom components locally before syncing to SkyCMS runtime assets.
3. Document host integration contracts clearly so behavior remains stable over upgrades.

## Package Layout

Key paths:

- `integrations/skycms/src/plugins/`:
  - Source for SkyCMS custom plugins.
- `integrations/skycms/src/index.js`:
  - Central export surface for all custom plugins.
- `integrations/skycms/playground/`:
  - Local test harness.

Current custom plugins in this package:

1. `copilot`
1. `filelink`
1. `insertimage`
1. `pagelink`
1. `signalr`
1. `vscodeeditor`

## Plugin Pattern Used

Each custom component follows a two-part pattern:

1. `<plugin>.js`:
   - Composition plugin that declares `requires`.
2. `<plugin>editing.js` and `<plugin>ui.js`:
   - Editing layer is currently minimal for most components.
   - UI layer defines the toolbar button and host callback behavior.

This pattern keeps UX integration decoupled from schema complexity.

## Host Callback Contracts

The custom buttons are intentionally host-driven. They call APIs expected on `window.parent`.

### `pageLink`

- Toolbar item: `pageLink`
- Host callback:
  - `window.parent.openPickPageModal(editor)`
- Playground fallback:
  - Prompts for URL and runs `editor.execute('link', url)`.

### `fileLink`

- Toolbar item: `fileLink`
- Host callback:
  - `window.parent.openInsertFileLinkModel(editor)`
- Playground fallback:
  - Prompts for URL and runs `editor.execute('link', url)`.

### `insertImage`

- Toolbar item: `insertImage`
- Host callback:
  - `window.parent.openInsertImageModel(editor)`
- Playground fallback:
  - Prompts for URL and runs `editor.execute('insertImage', { source: url })`.
- CKEditor dependency requirement:
  - Image plugins must be loaded for `insertImage` command to exist.

### `vsCodeEditor`

- Toolbar item: `vsCodeEditor`
- Host callback:
  - `window.parent.openVsCodeBlockEditor(editor)`
- Playground fallback:
  - Displays a clear host-bridge-missing message.

### `copilotAssist`

- Toolbar item:
  - `copilotAssist`
- Host callback:
  - `window.parent.openCkEditorCopilot(editor)`
- Playground fallback:
  - Opens the local floating AI window implemented in `playground/copilot-host.js`.
- Important scope note:
  - Chat sessions and apply actions are scoped to the originating editor instance.

### `signalr`

- No toolbar item; event bridge plugin.
- Host callback:
  - `window.parent.cosmosSignalOthers(editor, eventName)`
- Events emitted:
  - `focus`
  - `blur`
  - `keydown`
  - `mousedown`
- Important scope note:
  - This is an activity signaling bridge, not full collaborative synchronization.

## Playground Integration

The playground loads both CKEditor core plugins and SkyCMS custom plugins.

Main integration file:

- `integrations/skycms/playground/main.js`

What it validates:

1. Editor boot with custom plugin registration.
2. Toolbar item rendering for custom buttons.
3. Host callback invocation path.
4. Local fallback behavior when host APIs are absent.
5. Floating AI window behavior for the Copilot integration.

## Why Editing Files Are Minimal

Most SkyCMS custom components are integration buttons and event bridges, not model-transform plugins.

That means:

1. Behavior primarily lives in UI hooks and host callbacks.
2. Editing layer remains intentionally light until schema or conversion customization is required.

## How To Add A New SkyCMS Component

Recommended process:

1. Create folder under `src/plugins/<name>/`.
2. Add composition plugin with `requires`.
3. Add `editing` and `ui` files.
4. Document host callback contract in code comments and this guide.
5. Export from `src/index.js`.
6. Wire into `playground/main.js` plugins and toolbar if applicable.
7. Run build and local dev validation.

## Debugging Checklist

If a custom button appears but does nothing:

1. Confirm plugin included in `plugins` array.
2. Confirm toolbar item name matches `componentFactory.add(...)` key.
3. Confirm host callback exists on `window.parent`.
4. Check browser console for fallback logs or alerts.

If `insertImage` fails in fallback:

1. Confirm image plugins are loaded.
2. Confirm `insertImage` command exists.
3. Confirm provided URL is accessible.

If the AI button appears but the assistant window does not open:

1. Confirm `copilotAssist` is present in the resolved toolbar profile.
2. Confirm `window.parent.openCkEditorCopilot` exists in the real host.
3. In the local playground, confirm `playground/copilot-host.js` is initialized from `playground/main.js`.
4. Check the browser console for import or runtime errors in the local host layer.

If SignalR events do not broadcast:

1. Confirm `window.parent.cosmosSignalOthers` exists.
2. Verify iframe/host boundary allows parent access.
3. Validate host-side event handling and transport code.

## Collaboration Direction

Current `signalr` plugin supports lightweight activity signaling.

Recommended phased strategy:

1. Presence and focus telemetry first.
2. Save conflict detection and reconciliation UX second.
3. Full real-time collaborative editing only with a dedicated OT/CRDT-capable architecture.
