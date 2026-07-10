/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Plugin } from 'ckeditor5';
import SignalRUI from './signalrui.js';
import SignalREditing from './signalrediting.js';

// Aggregator plugin for SkyCMS collaboration signaling hooks.
//
// This plugin does not implement real-time OT/CRDT synchronization. It reports
// interaction events to the host, which can then broadcast presence or activity
// over SignalR (or another transport).
export default class SignalR extends Plugin {
	static get requires() {
		return [ SignalRUI, SignalREditing ];
	}
}
