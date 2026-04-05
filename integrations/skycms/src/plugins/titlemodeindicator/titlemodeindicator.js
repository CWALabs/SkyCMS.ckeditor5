/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Plugin } from 'ckeditor5';
import TitleModeIndicatorUI from './titlemodeindicatorui.js';

// Informational toolbar component for title/heading-only editing surfaces.
export default class TitleModeIndicator extends Plugin {
	static get requires() {
		return [ TitleModeIndicatorUI ];
	}
}