# SkyCMS CKEditor Integration TODO

This document tracks the migration and validation work needed to safely align SkyCMS custom CKEditor modules with the current CKEditor version in this repository.

## Goals

- Move SkyCMS custom CKEditor modules into this repository in a maintainable location.
- Create a local test environment in this repository to build and validate SkyCMS CKEditor behavior before syncing back to SkyCMS Editor.
- Define a CMS-oriented default toolbar and menu baseline, including SkyCMS custom actions.

## Confirmed Decisions (2026-03-20)

- No strict user preference on location; use repository best-practice structure.
- Source/code editing should be enabled for all users.
- CMS references should include WordPress and Drupal.
- Research should include what users want versus what defaults currently provide.
- Long-term interest in collaborative editing; SignalR approach to be evaluated.

## Phase 0: Alignment and Guardrails

- [ ] Confirm source of truth for SkyCMS custom modules currently in SkyCMS Editor:
  - `Editor/wwwroot/lib/cosmos/ckeditor/filelink/*`
  - `Editor/wwwroot/lib/cosmos/ckeditor/insertimage/*`
  - `Editor/wwwroot/lib/cosmos/ckeditor/pagelink/*`
  - `Editor/wwwroot/lib/cosmos/ckeditor/signalr/*`
  - `Editor/wwwroot/lib/cosmos/ckeditor/vscodeeditor/*`
  - `Editor/wwwroot/lib/cosmos/ckeditor/main.js`
- [ ] Create a dedicated integration branch in both repositories.
- [ ] Freeze version target for first pass (no mixed-version experiment during migration).

## Phase 1: Bring SkyCMS Modules Into ckeditor5 Repo

- [ ] Create integration workspace under this repository, proposed path:
  - `integrations/skycms/`
- [ ] Mirror custom modules into repository-owned source structure (not copied as final static assets):
  - `integrations/skycms/plugins/filelink/`
  - `integrations/skycms/plugins/insertimage/`
  - `integrations/skycms/plugins/pagelink/`
  - `integrations/skycms/plugins/signalr/`
  - `integrations/skycms/plugins/vscodeeditor/`
- [ ] Normalize imports to current CKEditor package entry points where needed.
- [ ] Add TypeScript/JSDoc typing pass where practical to catch API drift early.

Deliverable:
- SkyCMS plugins exist in this repo in an editable, source-first structure.

Status:
- [x] Integration workspace scaffolded at `integrations/skycms/`.
- [x] Vertical slice plugin migrated: `pagelink`.
- [x] Vertical slice plugin migrated: `filelink`.
- [x] Vertical slice plugin migrated: `insertimage`.
- [x] Custom component migrated: `signalr`.
- [x] Custom component migrated: `vscodeeditor`.

## Phase 2: Create Local Test Environment

- [ ] Create a local SkyCMS integration test app inside this repository:
  - Proposed path: `integrations/skycms/playground/`
- [ ] Add build/dev scripts (for example):
  - `pnpm --filter @skycms/ckeditor-playground dev`
  - `pnpm --filter @skycms/ckeditor-playground build`
- [ ] Add sample fixtures that reflect real SkyCMS authoring scenarios:
  - article body editing
  - file link insertion
  - page link insertion
  - image insertion/editing
  - collaboration/signalr hooks (mocked if needed)
- [ ] Add smoke tests:
  - editor starts
  - custom toolbar buttons render
  - each custom command executes without runtime exception
- [ ] Add compatibility checklist for manual QA before sync back to SkyCMS.

Deliverable:
- Repeatable local build + test harness for SkyCMS CKEditor behavior.

Status:
- [x] Local Vite playground scaffolded at `integrations/skycms/playground/`.
- [x] Playground wired with `pageLink` custom button and fallback behavior.
- [x] Playground wired with `fileLink` custom button and fallback behavior.
- [x] Playground wired with `insertImage` custom button and fallback behavior.
- [x] Playground wired with `vsCodeEditor` custom button behavior.
- [x] Playground wired with `signalr` event bridge behavior.
- [x] Plugin UI smoke tests added at `integrations/skycms/tests/plugin-ui.smoke.test.js`.
- [x] Playground boot smoke tests added at `integrations/skycms/tests/playground-boot.smoke.test.js`.
- [x] Runtime profile mapping wired from SkyCMS `data-editor-config` source in `integrations/skycms/playground/bootstrap.js`.
- [x] Manual QA checklist added at `integrations/skycms/MANUAL_QA_CHECKLIST.md`.
- [x] Playground build validation passes (`pnpm --filter @skycms/ckeditor-integration build`).

## Phase 3: Toolbar and Menu Baseline (CMS-oriented)

- [ ] Define a default toolbar profile aligned with common CMS editors (author-focused):
  - block styles: paragraph + headings
  - inline styles: bold, italic, underline, optional strikethrough
  - links: standard link + SkyCMS page link + file link
  - content blocks: image, table, media/embed, quote, code block
  - lists and indentation
  - utility: undo/redo, remove format, source/code where allowed
- [ ] Add SkyCMS custom buttons to primary toolbar where high-frequency.
- [ ] Move lower-frequency actions to overflow/menu to reduce toolbar noise.
- [ ] Validate button naming/icons against CMS conventions for editorial clarity.
- [ ] Produce two profiles:
  - `simple` (content authors)
  - `advanced` (power editors / developers)

Deliverable:
- Agreed default toolbar configuration and plugin list with SkyCMS features included.

Status:
- [x] Initial WordPress + Drupal convention pass completed.
- [x] Draft `simple` and `advanced` profile recommendations documented at `integrations/skycms/TOOLBAR_PROFILES.md`.
- [x] Component integration guide documented at `integrations/skycms/COMPONENT_INTEGRATION_GUIDE.md`.

## Phase 4: Sync Back to SkyCMS Editor

- [ ] Build artifacts from this integration setup.
- [ ] Sync artifacts to SkyCMS Editor static assets using:
  - `sync-ckeditor5-to-editor.ps1` at the ckeditor5 repo root
- [ ] Run local SkyCMS Editor validation pass.
- [ ] Record release notes and rollback steps.

Deliverable:
- Verified, repeatable path from ckeditor5 integration workspace to SkyCMS Editor deployment assets.

## Open Questions (Need Answers Before Implementation)

- [x] What should be the exact home path for SkyCMS integration code in this repo (`integrations/skycms` or another path)?
- [ ] Do you want JavaScript-only plugins first, or convert to TypeScript during migration?
- [ ] Which editor profile should be the SkyCMS default (`simple` or `advanced`)?
- [x] Which editor profile should be the SkyCMS default (`simple` or `advanced`)?
- [x] Should source editing be enabled by default for all editors, or role-gated?
- [x] Which CMS products should we treat as reference UX for toolbar/menu conventions?
- [ ] Should collaboration features be mocked in the playground, or connected to a live SignalR endpoint?
- [x] Should collaboration features be mocked in the playground, or connected to a live SignalR endpoint?

Decisions:
- Default profile for integration phase: `simple` (runtime override supported).
- Collaboration testing mode for integration phase: mocked host-bridge behavior.

## Immediate Next Steps

1. Add one lightweight editor boot smoke test (playground-level) to complement plugin-unit smoke checks.
2. Validate mapped profile behavior in SkyCMS runtime pages after artifact sync.
3. Add role-based profile controls if SkyCMS requirements move beyond element-type mapping.
