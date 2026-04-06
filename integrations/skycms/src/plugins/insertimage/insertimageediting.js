/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Plugin } from 'ckeditor5';

// Reserved for future model/schema extensions.
//
// SkyCMS currently inserts standard CKEditor image model content and does not
// introduce a custom schema element for this button.
export default class InsertImageEditing extends Plugin {
	init() {
		// Intentionally minimal to preserve current behavior.
	}
}
