/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { defineConfig } from 'vite';

const svgRawPlugin = {
    name: 'svg-raw-text',
    enforce: 'pre',
    async transform( code, id ) {
        if ( !code.includes( '.svg' ) || !id.includes( 'ckeditor5' ) ) {
            return null;
        }

        const transformed = code.replace(
            /from\s+['"]([^'"]+\.svg)['"]/g,
            'from \'$1?raw\''
        );

        if ( transformed !== code ) {
            return {
                code: transformed,
                map: null
            };
        }
    }
};

export default defineConfig( {
    root: 'playground',
    server: {
        port: 5174,
        open: true
    },
    build: {
        outDir: '../playground-dist',
        emptyOutDir: true
    },
    plugins: [ svgRawPlugin ]
} );