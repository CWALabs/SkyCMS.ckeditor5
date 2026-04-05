SkyCMS CKEditor 5 Integration<!-- omit in toc -->
===================================

This repository is the SkyCMS-maintained CKEditor 5 integration. It exists to keep the SkyCMS editor implementation current with upstream CKEditor fixes and features while preserving SkyCMS-specific plugins, runtime behavior, and deployment assets.

This is a downstream integration repository, not a contribution fork. Upstream CKEditor development still happens in the official `ckeditor/ckeditor5` repository, while this repository packages and validates the version of CKEditor used by SkyCMS.

Branch intent:

* `skycms/main` is the SkyCMS product branch and the default branch that should be shown to repository visitors.
* `vendor/ckeditor5` is the upstream mirror branch synced from CKEditor.
* Upstream updates are reviewed into `skycms/main` by pull request after SkyCMS validation.

For the official CKEditor 5 project, documentation, and contribution guidelines, see [https://github.com/ckeditor/ckeditor5](https://github.com/ckeditor/ckeditor5).

![A composition of screenshots presenting various features of CKEditor&nbsp;5 rich text editor](https://raw.githubusercontent.com/ckeditor/ckeditor5/master/docs/assets/img/CKEditor-5.png)

## Table of contents<!-- omit in toc -->

- [Quick start](#quick-start)
	- [Repository purpose](#repository-purpose)
	- [Branch model](#branch-model)
	- [CKEditor 5 Builder](#ckeditor-5-builder)
	- [TypeScript support](#typescript-support)
	- [CKEditor 5 advanced installation](#ckeditor-5-advanced-installation)
		- [CKEditor 5 Framework](#ckeditor-5-framework)
- [Documentation and FAQ](#documentation-and-faq)
- [Releases](#releases)
- [Editing and collaboration features](#editing-and-collaboration-features)
- [Create a free account and test full potential](#create-a-free-account-and-test-full-potential)
- [Contributing and project organization](#contributing-and-project-organization)
	- [Ideas and discussions](#ideas-and-discussions)
	- [Development](#development)
	- [Fork maintenance (SkyCMS)](#fork-maintenance-skycms)
	- [Reporting issues and feature requests](#reporting-issues-and-feature-requests)
- [License](#license)

## Quick start

### Repository purpose

Use this repository when you need to:

* maintain the CKEditor build deployed by SkyCMS,
* develop or validate SkyCMS-specific CKEditor plugins under `integrations/skycms/`,
* mirror upstream CKEditor updates into a controlled vendor branch,
* review upstream changes before promoting them into the SkyCMS product branch.

If you want the upstream CKEditor source repository for contribution or general framework development, use [https://github.com/ckeditor/ckeditor5](https://github.com/ckeditor/ckeditor5).

### Branch model

This repository follows a vendor-mirror workflow:

* `skycms/main` is the SkyCMS customization and deployment branch.
* `vendor/ckeditor5` mirrors the selected upstream CKEditor branch.
* `master` is considered legacy if it still exists and should not be used for new work.

The sync sequence is:

1. Mirror upstream into `vendor/ckeditor5`.
2. Open a pull request from `vendor/ckeditor5` into `skycms/main`.
3. Review, test, and merge only after SkyCMS validation.

See `FORK_MAINTENANCE_CHECKLIST.md` for the GitHub setup and first-run steps.

Refer to the [Quick Start](https://ckeditor.com/docs/ckeditor5/latest/getting-started/installation/quick-start.html) guide to learn more about CKEditor&nbsp;5 installation.

### CKEditor 5 Builder

The easiest way to start using CKEditor&nbsp;5 with all the features you need is to prepare a customized setup with the [CKEditor&nbsp;5 Builder](https://ckeditor.com/ckeditor-5/builder). All you need to do is choose the preferred editor type as a base, add all the required plugins, and download the ready-to-use package.

### TypeScript support

CKEditor&nbsp;5 is a TypeScript project. Starting from v37.0.0, it offers native type definitions. Check out our dedicated guide to read more about [TypeScript support](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/typescript-support.html).

### CKEditor 5 advanced installation

For more advanced users or those who need to integrate CKEditor&nbsp;5 with their applications, we prepared integrations with popular JavaScript frameworks:
* [Angular](https://ckeditor.com/docs/ckeditor5/latest/getting-started/installation/angular.html)
* [React](https://ckeditor.com/docs/ckeditor5/latest/getting-started/installation/react/react.html)
* [Vue](https://ckeditor.com/docs/ckeditor5/latest/getting-started/installation/vuejs-v3.html)

#### CKEditor 5 Framework

CKEditor&nbsp;5 is also a framework for creating custom-made rich text editing solutions.

To find out how to start building your editor from scratch go to the [CKEditor&nbsp;5 Framework overview](https://ckeditor.com/docs/ckeditor5/latest/framework/index.html) section of the CKEditor&nbsp;5 documentation.

## Documentation and FAQ

Extensive documentation dedicated to all things CKEditor&nbsp;5-related is available. You will find basic guides that will help you kick off your project, advanced deep-dive tutorials to tailor the editor to your specific needs, and help sections with solutions and answers to any of your possible questions. To find out more refer to the following [CKEditor&nbsp;5 documentation](https://ckeditor.com/docs/ckeditor5/latest/index.html) sections:

* [Installing CKEditor&nbsp;5](https://ckeditor.com/docs/ckeditor5/latest/getting-started/installation/quick-start.html)
* [CKEditor&nbsp;5 features](https://ckeditor.com/docs/ckeditor5/latest/features/index.html)
* [CKEditor&nbsp;5 examples](https://ckeditor.com/docs/ckeditor5/latest/examples/index.html)
* [Updating CKEditor&nbsp;5](https://ckeditor.com/docs/ckeditor5/latest/updating/index.html)
* [Getting CKEditor&nbsp;5 support](https://ckeditor.com/docs/ckeditor5/latest/support/index.html)
* [CKEditor&nbsp;5 Framework](https://ckeditor.com/docs/ckeditor5/latest/framework/index.html)
* [API documentation](https://ckeditor.com/docs/ckeditor5/latest/api/index.html)

For FAQ please go to the [CKEditor Ecosystem help center](https://support.ckeditor.com/hc/en-us).
For a high-level overview of the project see the [CKEditor Ecosystem website](https://ckeditor.com).

## Releases

Follow the [CKEditor&nbsp;5 changelog](https://github.com/ckeditor/ckeditor5/blob/stable/CHANGELOG.md) for release details and check out the CKEditor&nbsp;5 release blog posts on the [CKSource blog](https://ckeditor.com/blog/?category=releases&tags=CKEditor-5) for important release highlights and additional information.

## Editing and collaboration features

The CKEditor&nbsp;5 Framework offers access to a plethora of various plugins, supporting [all kinds of editing features](https://ckeditor.com/docs/ckeditor5/latest/features/index.html).

From collaborative editing support providing comments and tracking changes, through editing tools that let users control the content looks and structure such as tables, lists, and font styles, to accessibility helpers and multi-language support - CKEditor&nbsp;5 is easily extensible and customizable. Special duty features like Markdown input and output and source editing, or export to PDF and Word provide solutions for users with diverse and specialized needs. Images and videos are easily supported and CKEditor&nbsp;5 offers various upload and storage systems to manage these.

The number of options and the ease of customization and adding new ones make the editing experience even better for any environment and professional background.

Refer to the [CKEditor&nbsp;5 Features](https://ckeditor.com/docs/ckeditor5/latest/features/index.html) documentation for details.

## Create a free account and test full potential

If you want to check full CKEditor&nbsp;5 capabilities, including premium features, sign up for a [free non-commitment 14-day trial](https://portal.ckeditor.com/checkout?plan=free).

## Contributing and project organization

### Ideas and discussions

The development repository of CKEditor&nbsp;5 is located at [https://github.com/ckeditor/ckeditor5](https://github.com/ckeditor/ckeditor5). This is the best place for bringing opinions and contributions. Letting the core team know if they are going in the right or wrong direction is great feedback and will be much appreciated!

### Development

CKEditor&nbsp;5 is a modular, multi-package, [monorepo](https://en.wikipedia.org/wiki/Monorepo) project. It consists of several packages that create the editing framework, based on which the feature packages are implemented.

The [`ckeditor5`](https://github.com/ckeditor/ckeditor5) repository is the place that centralizes the development of CKEditor&nbsp;5. It bundles different packages into a single place, adding the necessary helper tools for the development workflow, like the builder and the test runner. [Basic information on how to set up the development environment](https://ckeditor.com/docs/ckeditor5/latest/framework/contributing/development-environment.html) can be found in the documentation.

Use this repository for SkyCMS integration work. If you intend to contribute to CKEditor itself, use the [official contributors' guide](https://ckeditor.com/docs/ckeditor5/latest/framework/contributing/contributing.html) and work against the upstream project.

### Fork maintenance (SkyCMS)

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

#### SkyCMS editor asset sync

To sync built CKEditor assets from this repository into the SkyCMS Editor application, use:

```powershell
pwsh -NoProfile -File .\sync-ckeditor5-to-editor.ps1
```

This script copies CKEditor distribution files (JS/CSS/browser/translations/license) into the SkyCMS Editor `wwwroot/lib/ckeditor` folder.

For the full SkyCMS integration workflow (including building and deploying `skycms-plugins.js`), see:

- `integrations/skycms/README.md`

### Reporting issues and feature requests

Report issues in [the `ckeditor5` repository](https://github.com/ckeditor/ckeditor5/issues). Read more in the [Getting support](https://ckeditor.com/docs/ckeditor5/latest/support/index.html#reporting-issues) section of the CKEditor 5 documentation.

## License

Licensed under a dual-license model, this software is available under:

* the [GNU General Public License Version 2 or later](https://www.gnu.org/licenses/gpl.html),
* or commercial license terms from CKSource Holding sp. z o.o.

For more information, see: [https://ckeditor.com/legal/ckeditor-licensing-options](https://ckeditor.com/legal/ckeditor-licensing-options).
