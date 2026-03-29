# CKEditor 5 SVG Icon Bundling Process - Complete Analysis

## Summary
**SVG icons in CKEditor 5 are compiled to embedded SVG strings (NOT URLs or module exports)**, making them ready for direct consumption by `IconView` which expects raw SVG strings.

---

## 1. How SVG Icon Files Are Imported and Bundled

### Source Files
- **Location**: `packages/ckeditor5-icons/theme/icons/*.svg`
- **Example files**: 
  - `undo.svg` → `<svg xmlns="..." viewBox="0 0 20 20"><path d="..."/></svg>`
  - `redo.svg` → `<svg xmlns="..." viewBox="0 0 20 20"><path d="..."/></svg>`

### Export Configuration
- **File**: `packages/ckeditor5-icons/src/index.ts`
- **Pattern**: Each SVG is exported as a named constant
  ```typescript
  export { default as IconUndo } from '../theme/icons/undo.svg';
  export { default as IconRedo } from '../theme/icons/redo.svg';
  ```

---

## 2. How @ckeditor/ckeditor5-undo Plugin Exports Icons

### Import in UndoUI Plugin
- **File**: `packages/ckeditor5-undo/src/undoui.ts`
- **Code**:
  ```typescript
  import { IconUndo, IconRedo } from '@ckeditor/ckeditor5-icons';
  
  export class UndoUI extends Plugin {
      public init(): void {
          const editor = this.editor;
          const locale = editor.locale;
          const t = editor.t;

          const localizedUndoIcon = locale.uiLanguageDirection == 'ltr' ? IconUndo : IconRedo;
          const localizedRedoIcon = locale.uiLanguageDirection == 'ltr' ? IconRedo : IconUndo;

          this._addButtonsToFactory( 'undo', t( 'Undo' ), 'CTRL+Z', localizedUndoIcon );
          this._addButtonsToFactory( 'redo', t( 'Redo' ), 'CTRL+Y', localizedRedoIcon );
      }
  }
  ```

### Key Point
The icons are directly assigned to button properties (`icon: IconUndo`), which expects **SVG string content**, not URLs or module references.

---

## 3. SVG Compilation Format: **EMBEDDED SVG STRINGS**

### TypeScript Type Declarations
- **File**: `typings/types.d.ts`
- **Declaration**:
  ```typescript
  declare module '*.svg' {
      const content: string;
      export default content;
  }
  ```

This declares that SVG imports resolve to **strings**, not URLs or objects.

### Post-Build Type Transformation
- **File**: `scripts/update-icons-typings.mjs`
- **Process**: After build completion, TypeScript declaration types are updated:
  - **Before**: 
    ```typescript
    export { default as IconRedo } from '../theme/icons/redo.svg';
    ```
  - **After**:
    ```typescript
    export const IconRedo: string;
    ```

This confirms icons are **string values**, not module imports.

---

## 4. Build Configuration for SVG Processing

### Build Entry Point
- **Package Build Script**: `packages/ckeditor5-icons/package.json`
  ```json
  "scripts": {
    "build": "node ../../scripts/nim/build-package.mjs && node ../../scripts/update-icons-typings.mjs"
  }
  ```

### Build System
- **Tool**: `@ckeditor/ckeditor5-dev-build-tools` (via `scripts/nim/build-package.mjs`)
- **Build Config**: `scripts/nim/utils.mjs`
  ```javascript
  export async function generateCKEditor5PackageBuild( packagePath, overrides = {} ) {
      const pkg = await fs.readJson( upath.join( packagePath, 'package.json' ) );

      return build( {
          input: 'src/index.ts',
          output: upath.resolve( packagePath, 'dist/index.js' ),
          tsconfig: 'tsconfig.build.json',
          declarations: true,
          banner,
          external: [ 'ckeditor5', ...Object.keys( { ...pkg.dependencies, ...pkg.peerDependencies } ) ],
          clean: true,
          sourceMap: true,
          translations: '**/*.po',
          ...overrides
      } );
  }
  ```

---

## 5. Webpack/Rollup SVG Rules

### Documentary Evidence (Legacy Method - Pre-v42)
CKEditor 5 used to require this webpack configuration for SVG files:

```javascript
// webpack.config.js (Legacy setup, NO LONGER REQUIRED)
module.exports = {
    module: {
        rules: [
            {
                test: /\.svg$/,
                use: [ 'raw-loader' ]
            },
            // ... other rules for CSS, etc.
        ]
    }
};
```

### Current Method (v42+)
SVG files are processed at **build time** by esbuild with the `text` loader.

**File**: `scripts/docs/snippetadapter.mjs`
```javascript
await esbuild( {
    // ...
    loader: {
        '.js': 'jsx',
        '.svg': 'text'  // ← SVG files loaded as text content
    },
    plugins: [
        // SVG files are inlined as strings, not URLs
    ]
} );
```

---

## 6. Complete SVG-to-String Build Pipeline

### Step 1: Source SVG Files
```
packages/ckeditor5-icons/theme/icons/undo.svg
→ Content: <svg xmlns="..." viewBox="0 0 20 20"><path d="..."/></svg>
```

### Step 2: TypeScript Source
```typescript
// packages/ckeditor5-icons/src/index.ts
export { default as IconUndo } from '../theme/icons/undo.svg';
```

### Step 3: Build Time Processing
```
esbuild runs with loader: { '.svg': 'text' }
↓
SVG file content is read as raw text string
↓
Icon constant is assigned the SVG string value
```

### Step 4: Compiled Output
```javascript
// dist/index.js (after build)
export const IconUndo = '<svg xmlns="..." viewBox="0 0 20 20"><path d="..."/></svg>';
export const IconRedo = '<svg xmlns="..." viewBox="0 0 20 20"><path d="..."/></svg>';
```

### Step 5: Type Definitions Updated
```typescript
// dist/index.d.ts (after update-icons-typings.mjs)
export const IconUndo: string;
export const IconRedo: string;
```

---

## 7. IconView Consumption

### IconView Class
- **File**: `packages/ckeditor5-ui/src/icon/iconview.ts`
- **Usage**:
  ```typescript
  export class IconView extends View {
      /**
       * Updates the {@link #element} with the value of {@link #content}.
       */
      private _updateXMLContent() {
          if ( this.content ) {
              // Parse SVG string using DOMParser
              const parsed = new DOMParser().parseFromString( this.content.trim(), 'image/svg+xml' );
              const svg = parsed.querySelector( 'svg' );

              if ( !svg ) {
                  throw new CKEditorError( 'ui-iconview-invalid-svg', this );
              }

              const viewBox = svg.getAttribute( 'viewBox' );
              // ... process SVG
          }
      }
  }
  ```

### Expected Input Type
- **Type**: `string` (raw SVG markup)
- **Example**: `icon.content = '<svg xmlns="..."><path .../></svg>'`
- **NOT**: URL strings, module references, or object exports

### Usage in Buttons
```typescript
import { IconUndo } from 'ckeditor5';

const button = new ButtonView();
button.set( {
    label: 'Undo',
    icon: IconUndo,  // Passes SVG string directly
    withText: false
} );
```

---

## Key Findings Summary

| Aspect | Details |
|--------|---------|
| **Source Format** | SVG files in `theme/icons/` |
| **Build Processing** | esbuild with `loader: { '.svg': 'text' }` |
| **Compiled Output** | **SVG strings** (e.g., `'<svg>...</svg>'`) |
| **Type Declaration** | `export const IconName: string;` |
| **IconView Expectation** | Raw **SVG strings** to parse via DOMParser |
| **Distribution Method** | Named exports from `@ckeditor/ckeditor5-icons` |
| **Setup Required** | None - icons are pre-bundled as strings |
| **Old Method** | Required `raw-loader` webpack plugin (deprecated in v42+) |
| **Critical Detail** | ✅ Confirms: Icons are **embedded SVG strings**, not URLs or module exports |

---

## How to Verify

1. **Check built package**: 
   ```bash
   cd packages/ckeditor5-icons
   cat dist/index.js | grep -A 2 "IconUndo"
   ```
   
2. **Expected output**:
   ```javascript
   export const IconUndo = '<svg xmlns="..." viewBox="..."><path .../></svg>';
   ```

3. **Type check**:
   ```bash
   cat dist/index.d.ts | grep "IconUndo"
   ```
   
4. **Expected output**:
   ```typescript
   export const IconUndo: string;
   ```

---

## References
- **Build Tool**: `@ckeditor/ckeditor5-dev-build-tools`
- **Update Script**: `scripts/update-icons-typings.mjs`
- **Doc Builder**: `scripts/docs/snippetadapter.mjs` (shows `loader: { '.svg': 'text' }`)
- **Type Declarations**: `typings/types.d.ts`
- **Migration Guide**: `docs/updating/nim-migration/migration-to-new-installation-methods.md`
- **IconView Implementation**: `packages/ckeditor5-ui/src/icon/iconview.ts`
