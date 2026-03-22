/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Plugin } from 'ckeditor5';
import FileLinkUI from './filelinkui.js';
import FileLinkEditing from './filelinkediting.js';

export default class FileLink extends Plugin {
	static get requires() {
		return [ FileLinkUI, FileLinkEditing ];
	}
}
