# SkyCMS CKEditor Integration Workspace

This package is the staging area for SkyCMS-specific CKEditor customization before syncing assets back into the SkyCMS Editor repository.

## Included now

- Migrated vertical slice plugin:
  - `src/plugins/copilot/*`
  - `src/plugins/filelink/*`
  - `src/plugins/insertimage/*`
  - `src/plugins/pagelink/*`
  - `src/plugins/signalr/*`
  - `src/plugins/vscodeeditor/*`
- Local playground:
  - `playground/`
- Toolbar/profile guidance:
  - `TOOLBAR_PROFILES.md`
- Manual QA checklist:
  - `MANUAL_QA_CHECKLIST.md`
- Integration docs:
  - `COMPONENT_INTEGRATION_GUIDE.md`
  - `AI_ASSISTANT_INTEGRATION.md`

## Run the playground

From repository root:

```bash
pnpm --filter @skycms/ckeditor-integration dev
```

Build static playground assets:

```bash
pnpm --filter @skycms/ckeditor-integration build
```

Run smoke tests:

```bash
pnpm --filter @skycms/ckeditor-integration test
```

Run lint checks for authored integration files:

```bash
pnpm --filter @skycms/ckeditor-integration lint
```

Auto-fix lint issues where possible:

```bash
pnpm --filter @skycms/ckeditor-integration lint:fix
```

## Sync to SkyCMS Editor

Use this sequence to push both CKEditor core assets and SkyCMS integration assets to the SkyCMS repository.

From the ckeditor5 repository root:

```powershell
# 1) Sync CKEditor core artifacts (ckeditor5.js/css/translations/license) to SkyCMS
pwsh -NoProfile -File .\sync-ckeditor5-to-editor.ps1

# 2) Build the SkyCMS integration bundle
pnpm --filter @skycms/ckeditor-integration build:lib

# 3) Deploy skycms-plugins.js into SkyCMS Editor wwwroot
pnpm --filter @skycms/ckeditor-integration deploy:skycms
```

What the sync script does:

- runs `pnpm build` (unless `-SkipBuild` is used),
- copies files from `packages/ckeditor5/dist` to `SkyCMS/Editor/wwwroot/lib/ckeditor`,
- copies `packages/ckeditor5/dist/browser/*` artifacts,
- refreshes `translations`,
- refreshes `LICENSE-ckeditor5.md` unless `-SkipLicenseUpdate` is used.

Useful options:

```powershell
# Preview only
pwsh -NoProfile -File .\sync-ckeditor5-to-editor.ps1 -SkipBuild -WhatIf

# Copy already-built artifacts only
pwsh -NoProfile -File .\sync-ckeditor5-to-editor.ps1 -SkipBuild

# Explicit paths
pwsh -NoProfile -File .\sync-ckeditor5-to-editor.ps1 -CkeditorRepoPath D:\source\ckeditor5\ckeditor5 -EditorCkeditorPath D:\source\SkyCMS\Editor\wwwroot\lib\ckeditor
```

## Style and lint guidance

- Use `CKEDITOR_STYLE_CHECKLIST.md` as the migration checklist before opening PRs.
- Lint scripts intentionally scope to `src`, `tests`, and `playground` while excluding generated `playground-dist` output.

## Toolbar profile runtime setting

The `resolveEditorProfileName` function in `src/toolbarProfiles.js` is the single source of truth for all name → profile resolution. The SkyCMS widget (`ckeditor-widget.301.js`) passes `fallbackProfile: 'standard'`.

| `data-editor-config` value | Resolved profile |
| --- | --- |
| omitted / null / unknown | `standard` (fallback) |
| `title` | `title` |
| `heading` | `title` (alias) |
| `simple` | `simple` |
| `standard` | `standard` |
| `advanced`, `default`, `richtext`, `ckeditor` | `advanced` |
| `h1`–`h6` tag (any profile) | `title` (tag-name override) |

When no explicit profile is set, runtime auto-detection uses editor element size:

- smaller areas resolve to `standard`
- larger areas resolve to `advanced`

## Unified authoring dropdowns

The current integration uses unified dropdown entry points to reduce toolbar noise while keeping all link/image insertion paths available.

### Link dropdown (`skyCmsLink`)

- Main button label: `Insert link`
- Dropdown options:
  - `From website page` (SkyCMS picker / page-link flow)
  - `From another website` (native external link flow)

### Image dropdown (`imageInsert`)

- Main button label follows CKEditor defaults (`Insert image` / `Replace image`)
- Dropdown options (ordered):
  - `From computer`
  - `From website storage`
  - `From another website`

## AI assistant integration

The integration workspace now includes a Copilot-style writing assistant entry point for SkyCMS editors.

What it does:

1. Adds a `copilotAssist` toolbar button to the `standard` and `advanced` profiles.
2. Opens a floating assistant window that stays scoped to the active editor instance.
3. Supports `Replace selection`, `Insert at cursor`, and `Replace block` apply flows.

Why it exists:

1. To validate the SkyCMS rich-text AI authoring experience before syncing built assets into the main application.
2. To test multi-editor scoping, floating host UI behavior, and apply semantics without waiting for a full product deployment.

Where to start:

1. `src/plugins/copilot/`
2. `playground/copilot-host.js`
3. `AI_ASSISTANT_INTEGRATION.md`

Typical uses include grammar cleanup, paragraph rewrites, shortening or expanding a section, and replacing an entire editor region with a more polished draft.

## Playground mode matrix

The playground includes side-by-side editable surfaces to validate all core Visual Editor modes:

- `title` (explicit)
- `simple` (explicit)
- `standard` (auto-inferred from smaller area)
- `advanced` (explicit via `ckeditor` alias)

To test a specific profile in the playground, set this before editor bootstrap:

```js
window.skycmsEditorProfile = 'advanced';
```

## Why this exists

- Validate custom plugin compatibility against the current ckeditor5 version.
- Evolve toolbar/menu defaults in a controlled test environment.
- Validate the SkyCMS AI writing assistant experience before syncing to the main CMS host.
- Reduce risk before syncing final artifacts to SkyCMS Editor.