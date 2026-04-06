/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, expect, it } from 'vitest';

import { initializePlaygroundCopilotHost } from '../playground/copilot-host.js';

function createElement( id = '' ) {
	return {
		id,
		hidden: false,
		textContent: '',
		value: '',
		children: [],
		className: '',
		classList: {
			values: new Set(),
			add( value ) {
				this.values.add( value );
			},
			remove( value ) {
				this.values.delete( value );
			},
			toggle( value, force ) {
				if ( force === true ) {
					this.values.add( value );
					return true;
				}

				if ( force === false ) {
					this.values.delete( value );
					return false;
				}

				if ( this.values.has( value ) ) {
					this.values.delete( value );
					return false;
				}

				this.values.add( value );
				return true;
			}
		},
		dataset: {},
		listeners: {},
		appendChild( child ) {
			this.children.push( child );
			return child;
		},
		addEventListener( eventName, handler ) {
			this.listeners[ eventName ] = handler;
		},
		focus() {},
		closest() {
			return null;
		},
		querySelectorAll() {
			return [];
		}
	};
}

function createRuntimeDocument() {
	const elements = {
		copilotPanel: createElement( 'copilotPanel' ),
		copilotPanelSubtitle: createElement( 'copilotPanelSubtitle' ),
		copilotPanelMessages: createElement( 'copilotPanelMessages' ),
		copilotPanelStatus: createElement( 'copilotPanelStatus' ),
		copilotPanelForm: createElement( 'copilotPanelForm' ),
		copilotPanelInput: createElement( 'copilotPanelInput' ),
		copilotPanelClear: createElement( 'copilotPanelClear' ),
		copilotPanelClose: createElement( 'copilotPanelClose' ),
		copilotPanelMinimize: createElement( 'copilotPanelMinimize' )
	};

	elements.copilotPanel.hidden = true;

	return {
		elements,
		getElementById( id ) {
			return elements[ id ] || null;
		},
		querySelectorAll() {
			return [];
		},
		createElement() {
			return createElement();
		}
	};
}

function createEditor() {
	return {
		sourceElement: {
			id: 'editor-standard-auto',
			getAttribute( name ) {
				return name === 'data-playground-editor' ? 'standard-auto' : null;
			}
		},
		getData() {
			return '<p>Example content.</p>';
		},
		editing: {
			view: {
				focus() {}
			}
		},
		model: {
			document: {
				selection: {
					isBackward: false,
					isCollapsed: true,
					getRanges() {
						return [ {
							start: {
								root: { rootName: 'main' },
								path: [ 0 ],
								stickiness: 'toNone'
							},
							end: {
								root: { rootName: 'main' },
								path: [ 0 ],
								stickiness: 'toNone'
							}
						} ];
					}
				},
				getRoot() {
					return { rootName: 'main' };
				}
			},
			change() {}
		},
		data: {
			stringify() {
				return '<p>Example content.</p>';
			}
		}
	};
}

describe( 'Playground copilot host smoke tests', () => {
	it( 'closes the panel when the close button is clicked', () => {
		const runtimeDocument = createRuntimeDocument();
		const runtimeWindow = { parent: null };
		runtimeWindow.parent = runtimeWindow;

		const host = initializePlaygroundCopilotHost( { runtimeWindow, runtimeDocument } );
		const editor = createEditor();

		host.open( editor );
		expect( runtimeDocument.elements.copilotPanel.hidden ).toBe( false );

		runtimeDocument.elements.copilotPanelClose.listeners.click();
		expect( runtimeDocument.elements.copilotPanel.hidden ).toBe( true );
	} );
} );

