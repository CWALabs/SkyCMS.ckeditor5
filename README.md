SkyCMS CKEditor 5 Integration<!-- omit in toc -->
===================================

This repository is the SkyCMS-maintained CKEditor 5 integration. It exists to keep the SkyCMS editor implementation current with upstream CKEditor fixes and features while preserving SkyCMS-specific plugins, runtime behavior, and deployment assets.

SkyCMS-specific additions in this repository include:

* an AI writing assistant integration for standard and advanced SkyCMS editor profiles,
* page-link integration for linking to SkyCMS-managed website pages,
* file-link integration for linking to files stored in SkyCMS,
* host-aware image insertion that supports upload, website storage, and external image URLs,
* SignalR integration hooks used by the SkyCMS editor host,
* VS Code editor integration support,
* title/mode indication and SkyCMS toolbar profile behavior.

This is a downstream integration repository, not a contribution fork. Upstream CKEditor development still happens in the official `ckeditor/ckeditor5` repository, while this repository packages and validates the version of CKEditor used by SkyCMS.

Branch intent:

* `skycms/main` is the SkyCMS product branch and the default branch that should be shown to repository visitors.
* `vendor/ckeditor5` is the upstream mirror branch synced from CKEditor.
* Upstream updates are reviewed into `skycms/main` by pull request after SkyCMS validation.

For the official CKEditor 5 project, documentation, and contribution guidelines, see [https://github.com/ckeditor/ckeditor5](https://github.com/ckeditor/ckeditor5).

![A composition of screenshots presenting various features of CKEditor&nbsp;5 rich text editor](https://raw.githubusercontent.com/ckeditor/ckeditor5/master/docs/assets/img/CKEditor-5.png)

Quick start
-----------

Repository purpose:

Use this repository when you need to:

* maintain the CKEditor build deployed by SkyCMS,
* develop or validate SkyCMS-specific CKEditor plugins under `integrations/skycms/`,
* mirror upstream CKEditor updates into a controlled vendor branch,
* review upstream changes before promoting them into the SkyCMS product branch.

If you want the upstream CKEditor source repository for contribution or general framework development, use [https://github.com/ckeditor/ckeditor5](https://github.com/ckeditor/ckeditor5).

Branch model:

This repository follows a vendor-mirror workflow:

* `skycms/main` is the SkyCMS customization and deployment branch.
* `vendor/ckeditor5` mirrors the selected upstream CKEditor branch.
* `master` is considered legacy if it still exists and should not be used for new work.

The sync sequence is:

1. Mirror upstream into `vendor/ckeditor5`.
2. Open a pull request from `vendor/ckeditor5` into `skycms/main`.
3. Review, test, and merge only after SkyCMS validation.

See `FORK_MAINTENANCE_CHECKLIST.md` for the GitHub setup and first-run steps.

Maintainer quick start:

From the repository root:

```powershell
pnpm install
pnpm --filter @skycms/ckeditor-integration dev
```

Useful commands:

* `pnpm --filter @skycms/ckeditor-integration build`
* `pnpm --filter @skycms/ckeditor-integration build:lib`
* `pnpm --filter @skycms/ckeditor-integration test`
* `pwsh ./scripts/sync-fork.ps1 -WhatIf`

SkyCMS integration workspace:

The SkyCMS-specific code lives under `integrations/skycms/` and includes:

* custom authoring plugins for page linking, file linking, image insertion, SignalR integration, VS Code editor integration, and title/mode indication,
* a Copilot-style assistant flow used to validate region-scoped rich-text AI authoring before syncing assets into the main SkyCMS application,
* a host-aware image flow that supports CKEditor upload, SkyCMS website-storage selection, and external image URLs from one unified entry point,
* SkyCMS-specific link and image dropdown behavior that keeps the toolbar compact while still exposing website-page, website-file, upload, and external URL flows,
* runtime toolbar profiles and aliases used by SkyCMS to switch between title, simple, standard, and advanced editing modes,
* a local playground used to validate SkyCMS runtime behavior, fallback prompts, and profile selection against the current CKEditor version,
* deployment helpers that build and copy the SkyCMS integration bundle back into the main SkyCMS repository.

Start there when you need to validate or extend the SkyCMS editor behavior.

Upstream CKEditor resources:

When you need official CKEditor guidance, use the upstream resources:

* [Quick Start](https://ckeditor.com/docs/ckeditor5/latest/getting-started/installation/quick-start.html)
* [TypeScript support](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/typescript-support.html)
* [Framework overview](https://ckeditor.com/docs/ckeditor5/latest/framework/index.html)
* [API documentation](https://ckeditor.com/docs/ckeditor5/latest/api/index.html)

Documentation and support
-------------------------

For SkyCMS integration workflow details, start with `integrations/skycms/README.md` and `FORK_MAINTENANCE_CHECKLIST.md`.

For the SkyCMS AI authoring integration specifically, start with `integrations/skycms/AI_ASSISTANT_INTEGRATION.md`.

For CKEditor framework documentation, updates, and examples, use the upstream documentation portal:

* [Installing CKEditor&nbsp;5](https://ckeditor.com/docs/ckeditor5/latest/getting-started/installation/quick-start.html)
* [CKEditor&nbsp;5 features](https://ckeditor.com/docs/ckeditor5/latest/features/index.html)
* [CKEditor&nbsp;5 examples](https://ckeditor.com/docs/ckeditor5/latest/examples/index.html)
* [Updating CKEditor&nbsp;5](https://ckeditor.com/docs/ckeditor5/latest/updating/index.html)
* [Getting CKEditor&nbsp;5 support](https://ckeditor.com/docs/ckeditor5/latest/support/index.html)

For FAQ please go to the [CKEditor Ecosystem help center](https://support.ckeditor.com/hc/en-us).
For a high-level overview of the project see the [CKEditor Ecosystem website](https://ckeditor.com).

Release and sync model
----------------------

This repository follows a vendor-mirror release model:

1. Upstream CKEditor changes are mirrored into `vendor/ckeditor5`.
2. A review PR is opened from `vendor/ckeditor5` into `skycms/main`.
3. SkyCMS-specific validation happens on `skycms/main` before merge.
4. Built assets are synced into the main SkyCMS Editor repository after validation.

Track upstream release notes in the [CKEditor changelog](https://github.com/ckeditor/ckeditor5/blob/stable/CHANGELOG.md) and use that information during SkyCMS review.

Editing and collaboration features
----------------------------------

SkyCMS builds on CKEditor&nbsp;5 features and adds its own integration-specific behaviors. For the broader CKEditor feature set, see the upstream features catalog:

Refer to the [CKEditor&nbsp;5 Features](https://ckeditor.com/docs/ckeditor5/latest/features/index.html) documentation for details.

Contributing and project organization
-------------------------------------

Ideas and discussions:

Use this repository for SkyCMS-specific editor integration work, custom plugin maintenance, and release preparation for the version deployed by SkyCMS.

If you want to contribute to CKEditor core itself, use the upstream repository at [https://github.com/ckeditor/ckeditor5](https://github.com/ckeditor/ckeditor5).

Development:

CKEditor&nbsp;5 is a modular, multi-package, [monorepo](https://en.wikipedia.org/wiki/Monorepo) project. This repository keeps a SkyCMS-oriented downstream integration of that upstream codebase.

The [`ckeditor5`](https://github.com/ckeditor/ckeditor5) repository is the place that centralizes the development of CKEditor&nbsp;5. It bundles different packages into a single place, adding the necessary helper tools for the development workflow, like the builder and the test runner. [Basic information on how to set up the development environment](https://ckeditor.com/docs/ckeditor5/latest/framework/contributing/development-environment.html) can be found in the documentation.

For SkyCMS integration work in this repository, start with `integrations/skycms/README.md`, then use the branch and sync process documented below. If you intend to contribute to CKEditor itself, use the [official contributors' guide](https://ckeditor.com/docs/ckeditor5/latest/framework/contributing/contributing.html) and work against the upstream project.

Fork maintenance (SkyCMS):

This repository uses a SkyCMS-first branch model:

* `skycms/main` is the SkyCMS customization and deployment branch.
* `vendor/ckeditor5` is the upstream-tracking mirror branch synced from CKEditor.

Use the sync script in this repository to refresh the vendor mirror branch:

```powershell
pwsh ./scripts/sync-fork.ps1
```

What the script does:

1. Verifies the working tree is clean.
2. Fetches the configured upstream branch, defaulting to `upstream/stable`.
3. Resets `vendor/ckeditor5` to exactly match that upstream ref.
4. Optionally pushes `vendor/ckeditor5` to `origin` when `-Push` is used.

Promotion into `skycms/main` is intentionally not done by this script. That step happens through review.

Supported examples:

```powershell
# Preview only
pwsh ./scripts/sync-fork.ps1 -WhatIf

# Mirror upstream/stable into vendor/ckeditor5 and push to origin
pwsh ./scripts/sync-fork.ps1 -Push
```

GitHub Actions automation:

1. `.github/workflows/sync-upstream-vendor-branch.yml`
	Runs weekly and also supports manual runs. It mirrors the configured upstream branch into `vendor/ckeditor5`.
2. `.github/workflows/open-vendor-pr-into-skycms-main.yml`
	Manual-only workflow. Run this when you are ready to review upstream changes in `skycms/main`. It creates or reuses a PR from `vendor/ckeditor5` into `skycms/main`.

For GitHub settings, branch protection, and first-run validation, see `FORK_MAINTENANCE_CHECKLIST.md`.

SkyCMS editor asset sync:

To sync built CKEditor assets from this repository into the SkyCMS Editor application, use:

```powershell
pwsh -NoProfile -File .\sync-ckeditor5-to-editor.ps1
```

This script copies CKEditor distribution files (JS/CSS/browser/translations/license) into the SkyCMS Editor `wwwroot/lib/ckeditor` folder.

For the full SkyCMS integration workflow (including building and deploying `skycms-plugins.js`), see:

* `integrations/skycms/README.md`

Reporting issues and feature requests:

Report SkyCMS-specific integration issues, build problems, or plugin regressions in this repository.

Report CKEditor core bugs and framework feature requests in [the upstream `ckeditor5` repository](https://github.com/ckeditor/ckeditor5/issues). Read more in the [Getting support](https://ckeditor.com/docs/ckeditor5/latest/support/index.html#reporting-issues) section of the CKEditor 5 documentation.

License
-------

Licensed under a dual-license model, this software is available under:

* the [GNU General Public License Version 2 or later](https://www.gnu.org/licenses/gpl.html),
* or commercial license terms from CKSource Holding sp. z o.o.

For more information, see: [https://ckeditor.com/legal/ckeditor-licensing-options](https://ckeditor.com/legal/ckeditor-licensing-options).
