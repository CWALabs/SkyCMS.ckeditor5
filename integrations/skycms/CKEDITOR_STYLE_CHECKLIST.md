# CKEditor Style Checklist (SkyCMS Integration)

Use this before opening a PR with new or migrated plugins in this package.

- Use the CKEditor license header block at the top of every JS file.
- Use LF line endings only (no CRLF).
- Use tabs for indentation (no space-based indent).
- Keep spacing in calls and literals in CKEditor style, for example: `method( value )`, `[ value ]`, and `{ key: value }`.
- Add a trailing newline at the end of every file.
- Keep lines at or under 140 characters.
- Split long inline SVG strings into joined string segments so each source line stays within max length.
- Avoid direct browser globals in shared modules:
  - Prefer `globalThis.window` and `globalThis.document` access.
  - Resolve host bridge methods first (for example via optional chaining) before calling.
- Avoid direct `alert()` and `prompt()` calls:
  - Read callable references from `globalThis` or `runtimeWindow` and call conditionally.
- Keep generated playground output out of lint scope (`playground-dist/**`).

## Recommended Commands

- Check lint for authored files only:
  - `pnpm --filter @skycms/ckeditor-integration lint`
- Apply lint fixes where possible:
  - `pnpm --filter @skycms/ckeditor-integration lint:fix`
- Validate behavior after lint cleanup:
  - `pnpm --filter @skycms/ckeditor-integration test`
