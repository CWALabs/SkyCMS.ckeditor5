# SkyCMS CKEditor Fork Maintenance Checklist

Use this checklist when setting up or validating the SkyCMS CKEditor fork after the branch/workflow plumbing changes.

## GitHub Repository Settings

1. Set the default branch to `skycms/main`.
2. Confirm the Actions tab is enabled for the repository.
3. Confirm workflows are allowed to create and update pull requests.
4. Confirm GitHub Actions is allowed to push to `vendor/ckeditor5` under your branch protection or ruleset configuration.

## Branch Model

- `skycms/main`
  - Product branch for SkyCMS.
  - Default branch shown to users.
  - Source for deployment artifacts synced into SkyCMS.
- `vendor/ckeditor5`
  - Mirror branch for the selected upstream CKEditor branch.
  - Updated directly by automation.
  - Never used for SkyCMS feature work.
- `master`
  - Legacy branch retained temporarily if it still exists remotely.
  - Do not use for new work.
  - Lock or retire it after the new flow is established.

## Branch Protection Recommendations

### `skycms/main`

1. Require a pull request before merging.
2. Require at least one approval.
3. Require status checks if you later add CI gates for this repo.
4. Restrict direct pushes.

### `vendor/ckeditor5`

1. Restrict direct human pushes.
2. Allow GitHub Actions to bypass the restriction for the sync workflow.
3. Do not require PRs for the automation push.

## Remote Setup For Maintainers

Run these once in a local clone if the `upstream` remote is missing:

```powershell
git remote add upstream https://github.com/ckeditor/ckeditor5.git
git fetch upstream
```

Verify:

```powershell
git remote -v
```

## First Workflow Run

### A. Create or refresh the mirror branch

1. Open GitHub Actions.
2. Run `Sync Upstream Stable Into Vendor Branch`.
3. Leave defaults unless you intentionally need a different upstream branch.
4. Confirm the run completes successfully.
5. Confirm `vendor/ckeditor5` now exists and points at the upstream baseline.

### B. Open the review PR into `skycms/main`

1. Open GitHub Actions.
2. Run `Open Vendor PR Into SkyCMS Main`.
3. Confirm it creates a PR from `vendor/ckeditor5` to `skycms/main`, or reports that one already exists.

## Local Validation Commands

Preview a sync without mutating refs:

```powershell
pwsh -NoProfile -File .\scripts\sync-fork.ps1 -WhatIf
```

Preview while your working tree is dirty:

```powershell
pwsh -NoProfile -File .\scripts\sync-fork.ps1 -SkipCleanCheck -WhatIf
```

Perform the mirror update locally and push:

```powershell
pwsh -NoProfile -File .\scripts\sync-fork.ps1 -Push
```

## Review Checklist For The Vendor PR

1. Confirm the PR only contains upstream baseline changes plus any expected workflow metadata.
2. Review `integrations/skycms/` for conflicts or API drift affecting SkyCMS plugins.
3. Run the integration build and smoke tests before merge.
4. Merge into `skycms/main` only after SkyCMS-specific validation is complete.

## Suggested Ongoing Cadence

- Scheduled mirror sync: weekly.
- Promotion PR into `skycms/main`: manual, after review.
- Revisit cadence only if upstream churn becomes too noisy or review capacity changes.