# SkyCMS Toolbar Profiles and Collaboration Notes

This document proposes practical CKEditor toolbar defaults for SkyCMS using patterns common in WordPress and Drupal.

## Reference Signals

### WordPress (Block Editor)

- Keeps high-frequency authoring actions visible (undo/redo, formatting, link, list).
- Pushes lower-frequency controls into menus, sidebars, or contextual controls.
- Supports both visual authoring and source/code editing mode.
- Emphasizes focused writing modes and reducing toolbar clutter.

### Drupal (CKEditor 5 + Text Formats)

- Toolbar is managed by text format profiles.
- Allowed HTML and toolbar buttons are configured together for security and predictability.
- Role/permission model determines who can use more permissive editing capabilities.

### User Feedback Pattern (common across CMS ecosystems)

- Authors prefer cleaner defaults with fewer buttons visible at all times.
- Power users request source access and advanced controls without switching editors.
- Teams value consistency: one predictable baseline profile, plus an advanced profile.

## SkyCMS Profiles (Current)

SkyCMS currently supports four runtime profiles:

- `title`
- `simple`
- `standard`
- `advanced`

Aliases:

- `heading` -> `title`
- `default`, `richtext`, `ckeditor`, `skycms` -> `advanced`

### `title` profile

- Focused heading/title editing surface.
- Minimal balloon toolbar (`bold`, `italic`).

### `simple` profile

Recommended plugin/button set:

- History and essentials: `undo`, `redo`.
- Text structure: `heading` (Paragraph + common heading levels).
- Inline style: `bold`, `italic`, `underline`.
- Links: `link`, `pageLink`, `fileLink`.
- Lists: `bulletedList`, `numberedList`.
- Content blocks: `blockQuote`.
- Utility: `removeFormat`, `sourceEditing`.

Suggested order:

1. `undo`, `redo`
2. `heading`
3. `bold`, `italic`, `underline`, `removeFormat`
4. `link`, `pageLink`, `fileLink`
5. `bulletedList`, `numberedList`
6. `blockQuote`
7. `sourceEditing`

### `standard` profile (runtime fallback/default)

- Balanced authoring profile for most editable regions.
- Includes unified link and image insertion entry points.

### `advanced` profile (power editor/developer)

Includes all `simple` controls, plus:

- `codeBlock`
- `table` (if enabled)
- `imageUpload` / image tools (when migrated)
- `mediaEmbed` (if enabled)
- Additional style tools (`strikethrough`, alignment, etc.) after UX validation

## Runtime Resolution

- Explicit runtime override is supported via `window.skycmsEditorProfile`.
- If no explicit profile is set, mapping uses `data-editor-config` aliases.
- If there is still no explicit mapping, element-size inference is used:
	- smaller surfaces -> `standard`
	- larger surfaces -> `advanced`

Profile definitions live in `src/toolbarProfiles.js`.

## Unified Dropdown UX

The integration intentionally consolidates related actions into single toolbar buttons.

### Link dropdown (`skyCmsLink`)

- Options:
	- `From website page`
	- `From another website`

### Image dropdown (`imageInsert`)

- Options:
	- `From computer`
	- `From website storage`
	- `From another website`

## Collaborative Editing Direction (SignalR)

Short version: use SignalR as an orchestration and presence layer first, not as a custom OT/CRDT engine.

### Recommended phased approach

1. Presence + lock hints: show active editors and optional soft-lock state via SignalR.
2. Save conflict UX: detect stale version on save and prompt merge/reload decisions.
3. True real-time collaboration: evaluate CKEditor collaboration stack or a robust OT/CRDT approach before implementing custom sync logic.

### Current testing decision

- Integration package and playground stay mocked-first for collaboration behavior.
- SignalR interaction is validated through host bridge callbacks and smoke tests.
- Live endpoint testing is deferred to SkyCMS runtime validation phase.

### Why this approach

- Building custom operational transforms over SignalR is high-risk and hard to make correct.
- Presence and conflict handling deliver immediate user value with low implementation risk.
- Defers the hardest distributed-editing guarantees until a purpose-built engine is selected.
