/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Plugin } from 'ckeditor5';
import CopilotUI from './copilotui.js';
import CopilotEditing from './copilotediting.js';

export default class Copilot extends Plugin {
	static get requires() {
		return [ CopilotUI, CopilotEditing ];
	}
}

