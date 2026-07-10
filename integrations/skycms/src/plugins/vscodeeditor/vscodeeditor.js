/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Plugin } from 'ckeditor5';
import VSCodeEditorEditing from './vscodeeditorediting.js';
import VSCodeEditorUI from './vscodeeditorui.js';

// SkyCMS extension point for opening an external code-centric editor flow.
export default class VSCodeEditor extends Plugin {
	static get requires() {
		return [ VSCodeEditorEditing, VSCodeEditorUI ];
	}
}
