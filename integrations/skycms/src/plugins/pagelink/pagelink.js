/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Plugin } from 'ckeditor5';
import PageLinkEditing from './pagelinkediting.js';
import PageLinkUI from './pagelinkui.js';

export default class PageLink extends Plugin {
	static get requires() {
		return [ PageLinkEditing, PageLinkUI ];
	}
}
