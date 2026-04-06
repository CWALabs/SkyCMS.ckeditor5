/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Plugin } from 'ckeditor5';
import InsertImageUI from './insertimageui.js';
import InsertImageEditing from './insertimageediting.js';

// Thin composition plugin used by SkyCMS.
//
// The editing part is intentionally minimal because image insertion behavior is
// delegated to CKEditor image plugins and the host CMS modal workflow.
export default class InsertImage extends Plugin {
	static get requires() {
		return [ InsertImageUI, InsertImageEditing ];
	}
}
