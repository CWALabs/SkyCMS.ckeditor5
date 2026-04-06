/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { copyFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname( fileURLToPath( import.meta.url ) );

const src = resolve( __dirname, '../dist/skycms-plugins.js' );
const dest = resolve( __dirname, '../../../../SkyCMS/Editor/wwwroot/lib/cosmos/ckeditor/skycms-plugins.js' );
const destDir = resolve( __dirname, '../../../../SkyCMS/Editor/wwwroot/lib/cosmos/ckeditor' );

if ( !existsSync( src ) ) {
	console.error( `Source not found: ${ src }` );
	console.error( 'Run "pnpm --filter @skycms/ckeditor-integration build:lib" first.' );
	process.exit( 1 );
}

if ( !existsSync( destDir ) ) {
	console.error( `Destination directory not found: ${ destDir }` );
	console.error( 'Confirm the sibling SkyCMS repository exists at d:/source/SkyCMS.' );
	process.exit( 1 );
}

copyFileSync( src, dest );
console.log( `Deployed: ${ dest }` );
