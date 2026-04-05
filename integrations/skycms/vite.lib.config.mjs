/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );

/**
 * SVG transform plugin — identical to playground config.
 * Converts SVG imports within ckeditor5 source to raw text strings
 * so CKEditor's IconView receives SVG content, not asset URLs.
 */
const svgRawPlugin = {
	name: 'svg-raw-text',
	enforce: 'pre',
	async transform( code, id ) {
		if ( !code.includes( '.svg' ) || !id.includes( 'ckeditor5' ) ) {
			return null;
		}
		const transformed = code.replace(
			/from\s+['"]([^'"]+\.svg)['"]/g,
			"from '$1?raw'"
		);
		if ( transformed !== code ) {
			return { code: transformed, map: null };
		}
	}
};

export default defineConfig( {
	plugins: [ svgRawPlugin ],
	build: {
		lib: {
			entry: path.resolve( __dirname, 'src/index.js' ),
			name: 'SkyCmsPlugins',
			fileName: 'skycms-plugins',
			formats: [ 'es' ]
		},
		outDir: 'dist',
		emptyOutDir: true,
		rollupOptions: {
			external: [ 'ckeditor5' ],
			output: {
				// Prevent code-splitting — SkyCMS expects a single file.
				inlineDynamicImports: true
			}
		}
	}
} );
