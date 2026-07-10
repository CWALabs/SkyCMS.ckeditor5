# SkyCMS CKEditor Integration Manual QA Checklist

This checklist validates toolbar profile behavior and host bridge integration after syncing integration assets into SkyCMS.

## Preconditions

- Integration build is current:
  - `pnpm --filter @skycms/ckeditor-integration build`
- Smoke tests are passing:
  - `pnpm --filter @skycms/ckeditor-integration test`
- SkyCMS page under test contains editable regions with `data-ccms-ceid`.
- Browser console is open for diagnostics.

## Profile Mapping Validation

### 1. Default fallback profile

- Open playground with no profile override and no `data-editor-config` on `#editor`.
- Expected result:
  - Editor starts.
  - Simple toolbar appears (no `vsCodeEditor` and no `codeBlock` button by default).

### 2. Explicit runtime override

- Before editor bootstrap, set `window.skycmsEditorProfile = 'advanced'`.
- Expected result:
  - Advanced toolbar appears.
  - `vsCodeEditor` and `codeBlock` items are visible.

### 3. SkyCMS runtime element mapping

- In SkyCMS runtime, verify inferred profile from `data-editor-config`:
  - `data-editor-config="ckeditor"` => advanced profile.
  - `data-editor-config="title"` => simple profile.
  - `data-editor-config="heading"` => simple profile.
- Expected result:
  - Toolbar profile matches mapped behavior above.

## Host Bridge Validation

### 4. Page link bridge

- Click `pageLink`.
- Expected result:
  - Host callback `window.parent.openPickPageModal(editor)` is invoked.
  - If host callback is absent in local mode, fallback prompt inserts a link.

### 5. File link bridge

- Click `fileLink`.
- Expected result:
  - Host callback `window.parent.openInsertFileLinkModel(editor)` is invoked.
  - If host callback is absent in local mode, fallback prompt inserts a link.

### 6. Insert image bridge

- Click `insertImage`.
- Expected result:
  - Host callback `window.parent.openInsertImageModel(editor)` is invoked.
  - If host callback is absent in local mode, fallback prompt inserts image URL.

### 7. VS Code bridge

- Click `vsCodeEditor` in advanced profile.
- Expected result:
  - Host callback `window.parent.openVsCodeBlockEditor(editor)` is invoked.
  - If host callback is absent, fallback alert appears.

### 8. AI assistant bridge

- Open a standard or advanced editor and click `copilotAssist`.
- Expected result:
  - Host callback `window.parent.openCkEditorCopilot(editor)` is invoked.
  - In local playground mode, the floating AI window opens and remains scoped to the active editor.
  - Title mode does not expose the AI button.

### 9. SignalR event bridge

- Focus, blur, type, and click inside the editor.
- Expected result:
  - Host callback `window.parent.cosmosSignalOthers(editor, eventName)` receives:
    - `focus`
    - `blur`
    - `keydown`
    - `mousedown`
  - In local mode without host bridge, console fallback logs are emitted.

## Regression Checks

- Toolbar buttons render without console errors.
- Custom commands execute without runtime exceptions.
- Autosave/editing behavior outside toolbar customization remains unchanged.
