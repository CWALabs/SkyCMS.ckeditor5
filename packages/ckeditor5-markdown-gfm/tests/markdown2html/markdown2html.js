/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
		} );
	} );
} );

describe( 'MarkdownGfmMdToHtmlDefaultPlugins', () => {
	it( 'should load the default plugins', () => {
		expect( Object.keys( MarkdownGfmMdToHtmlDefaultPlugins ) ).toEqual( [
			'remarkParse',
			'remarkGfm',
			'remarkBreaks',
			'remarkRehype',
			'rehypeDomRaw',
			'deleteClassesFromToDoLists',
			'rehypeStringify'
		] );
	} );
} );
