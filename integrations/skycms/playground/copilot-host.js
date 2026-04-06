/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

function getEditorId( editor ) {
	return editor?.sourceElement?.id || editor?.sourceElement?.getAttribute( 'data-playground-editor' ) || 'editor';
}

function escapeHtml( value ) {
	return String( value || '' )
		.replaceAll( '&', '&amp;' )
		.replaceAll( '<', '&lt;' )
		.replaceAll( '>', '&gt;' )
		.replaceAll( '"', '&quot;' )
		.replaceAll( '\'', '&#39;' );
}

function collapseWhitespace( value ) {
	return String( value || '' ).replace( /\s+/g, ' ' ).trim();
}

function textFromHtml( runtimeDocument, html ) {
	const container = runtimeDocument.createElement( 'div' );
	container.innerHTML = html || '';
	return collapseWhitespace( container.textContent || '' );
}

function firstSentence( text ) {
	const normalized = collapseWhitespace( text );
	if ( !normalized ) {
		return '';
	}

	const parts = normalized.split( /(?<=[.!?])\s+/ );
	return parts[ 0 ] || normalized;
}

function serializePosition( position ) {
	return {
		root: position.root.rootName,
		path: Array.from( position.path ),
		stickiness: position.stickiness || 'toNone'
	};
}

function serializeSelection( selection ) {
	return {
		isBackward: !!selection.isBackward,
		ranges: Array.from( selection.getRanges() ).map( range => ( {
			start: serializePosition( range.start ),
			end: serializePosition( range.end )
		} ) )
	};
}

function collapseSnapshot( snapshot, edge = 'end' ) {
	if ( !snapshot?.ranges?.length ) {
		return null;
	}

	return {
		isBackward: false,
		ranges: snapshot.ranges.map( range => {
			const point = edge === 'start' ? range.start : range.end;
			return {
				start: { ...point, path: Array.from( point.path ) },
				end: { ...point, path: Array.from( point.path ) }
			};
		} )
	};
}

function selectionFromSnapshot( writer, editor, snapshot ) {
	if ( !snapshot?.ranges?.length ) {
		return null;
	}

	try {
		const ranges = snapshot.ranges.map( range => {
			const startRoot = editor.model.document.getRoot( range.start.root );
			const endRoot = editor.model.document.getRoot( range.end.root );
			const start = writer.createPositionFromPath( startRoot, range.start.path, range.start.stickiness || 'toNone' );
			const end = writer.createPositionFromPath( endRoot, range.end.path, range.end.stickiness || 'toNone' );

			return writer.createRange( start, end );
		} );

		return {
			ranges,
			isBackward: !!snapshot.isBackward
		};
	} catch {
		return null;
	}
}

function buildSuggestedHtml( action, runtimeDocument, sourceHtml ) {
	const text = textFromHtml( runtimeDocument, sourceHtml );

	if ( !text ) {
		return '<p>This is a playground suggestion. Add more text or select a region to see scoped rewriting.</p>';
	}

	const improved = `${ firstSentence( text ) }${ text.endsWith( '.' ) ? '' : '.' }`;
	const improvedText = escapeHtml( improved );

	switch ( action ) {
		case 'shorten-selection':
			return `<p>${ escapeHtml( firstSentence( text ) ) }</p>`;
		case 'expand-selection':
			return [
				`<p>${ improvedText } `,
				'This extra sentence is generated locally in the playground so you can verify ',
				'apply behavior before using the real backend.</p>'
			].join( '' );
		case 'replace-block':
			return [
				`<p>${ improvedText }</p>`,
				'<p>This block replacement demonstrates full-region apply from the playground assistant.</p>'
			].join( '' );
		case 'rewrite-selection':
			return `<p>${ improvedText } The wording is more direct and ready to publish.</p>`;
		case 'improve-selection':
		default:
			return `<p>${ improvedText } This version is clearer and more polished.</p>`;
	}
}

function buildReply( action, runtimeDocument, sourceHtml ) {
	const suggestedHtml = buildSuggestedHtml( action, runtimeDocument, sourceHtml );
	return [
		'This is a local playground response that mirrors the real assistant flow.',
		'',
		'```html',
		suggestedHtml,
		'```'
	].join( '\n' );
}

function createSession() {
	return { messages: [] };
}

export function initializePlaygroundCopilotHost( {
	runtimeWindow = globalThis.window,
	runtimeDocument = globalThis.document
} = {} ) {
	const panel = runtimeDocument.getElementById( 'copilotPanel' );
	if ( !panel ) {
		return null;
	}

	const subtitle = runtimeDocument.getElementById( 'copilotPanelSubtitle' );
	const messagesContainer = runtimeDocument.getElementById( 'copilotPanelMessages' );
	const statusContainer = runtimeDocument.getElementById( 'copilotPanelStatus' );
	const form = runtimeDocument.getElementById( 'copilotPanelForm' );
	const input = runtimeDocument.getElementById( 'copilotPanelInput' );
	const clearButton = runtimeDocument.getElementById( 'copilotPanelClear' );
	const closeButton = runtimeDocument.getElementById( 'copilotPanelClose' );
	const minimizeButton = runtimeDocument.getElementById( 'copilotPanelMinimize' );
	const actionButtons = Array.from( runtimeDocument.querySelectorAll( '[data-playground-copilot-action]' ) );

	const state = {
		activeEditor: null,
		activeEditorId: null,
		nextMessageId: 1,
		sessions: new Map(),
		isMinimized: false,
		actionPrompts: {
			'improve-selection': 'Improve the selected content for grammar, clarity, and flow.',
			'rewrite-selection': 'Rewrite the selection to sound more polished.',
			'shorten-selection': 'Shorten the selection while keeping the main point.',
			'expand-selection': 'Expand the selection with a bit more detail.',
			'replace-block': 'Rewrite the entire current region.'
		}
	};

	function getSession() {
		if ( !state.activeEditorId ) {
			return null;
		}

		if ( !state.sessions.has( state.activeEditorId ) ) {
			state.sessions.set( state.activeEditorId, createSession() );
		}

		return state.sessions.get( state.activeEditorId );
	}

	function createMessage( role, content, context = {} ) {
		return {
			id: state.nextMessageId++,
			role,
			content,
			context
		};
	}

	function setStatus( text ) {
		statusContainer.textContent = text;
		statusContainer.hidden = !text;
	}

	function extractSuggestedHtml( content ) {
		const match = String( content || '' ).match( /```html\s*([\s\S]*?)```/i );
		return match?.[ 1 ]?.trim() || '';
	}

	function renderMessages() {
		const session = getSession();
		messagesContainer.innerHTML = '';

		if ( !session || session.messages.length === 0 ) {
			const empty = runtimeDocument.createElement( 'div' );
			empty.className = 'copilot-panel-empty';
			empty.textContent = state.activeEditorId ?
				'Ask for a rewrite or use one of the quick actions. Suggestions stay scoped to the active editor.' :
				'Open the assistant from a standard or advanced editor toolbar.';
			messagesContainer.appendChild( empty );
			return;
		}

		session.messages.forEach( message => {
			const wrapper = runtimeDocument.createElement( 'div' );
			wrapper.className = `copilot-panel-message ${ message.role }`;

			const content = runtimeDocument.createElement( 'div' );
			content.className = 'copilot-panel-message-content';
			content.textContent = message.content;
			wrapper.appendChild( content );

			if ( message.role === 'assistant' ) {
				const actions = runtimeDocument.createElement( 'div' );
				actions.className = 'copilot-panel-message-actions';

				[
					[ 'replaceSelection', 'Replace selection', !message.context.hasSelection ],
					[ 'insertAtCursor', 'Insert at cursor', false ],
					[ 'replaceBlock', 'Replace block', false ]
				].forEach( ( [ mode, label, disabled ] ) => {
					const button = runtimeDocument.createElement( 'button' );
					button.type = 'button';
					button.className = 'copilot-panel-inline-button';
					button.dataset.messageId = String( message.id );
					button.dataset.applyMode = mode;
					button.disabled = disabled;
					button.textContent = label;
					actions.appendChild( button );
				} );

				wrapper.appendChild( actions );
			}

			messagesContainer.appendChild( wrapper );
		} );

		messagesContainer.scrollTop = messagesContainer.scrollHeight;
	}

	function setActiveEditor( editor ) {
		state.activeEditor = editor;
		state.activeEditorId = getEditorId( editor );

		const session = getSession();
		if ( session && session.messages.length === 0 ) {
			session.messages.push( createMessage(
				'system',
				'This local panel mirrors the real SkyCMS host window. It keeps chat history scoped to one editor at a time.'
			) );
		}

		subtitle.textContent = `Scoped to ${ state.activeEditorId }.`;
		renderMessages();
		setStatus( '' );
	}

	function openPanel( editor ) {
		setActiveEditor( editor );
		panel.hidden = false;
		panel.classList.remove( 'is-minimized' );
		state.isMinimized = false;
		input.focus();
	}

	function captureContext() {
		const selection = state.activeEditor.model.document.selection;
		const selectionSnapshot = serializeSelection( selection );
		const caretSnapshot = collapseSnapshot( selectionSnapshot, 'end' );
		const hasSelection = !selection.isCollapsed;
		const selectedHtml = hasSelection ?
			state.activeEditor.data.stringify( state.activeEditor.model.getSelectedContent( selection ) ) :
			'';

		return {
			hasSelection,
			selectedHtml,
			currentHtml: state.activeEditor.getData(),
			selectionSnapshot,
			caretSnapshot
		};
	}

	function sendMessage( action, message ) {
		const session = getSession();
		if ( !session || !state.activeEditor ) {
			setStatus( 'Open the assistant from a standard or advanced editor first.' );
			return;
		}

		const trimmed = String( message || '' ).trim();
		if ( !trimmed ) {
			return;
		}

		const context = captureContext();
		session.messages.push( createMessage( 'user', trimmed ) );

		const sourceHtml = context.selectedHtml || context.currentHtml;
		session.messages.push( createMessage( 'assistant', buildReply( action, runtimeDocument, sourceHtml ), {
			hasSelection: context.hasSelection,
			selectionSnapshot: context.selectionSnapshot,
			caretSnapshot: context.caretSnapshot
		} ) );

		renderMessages();
		setStatus( 'Local playground response generated. Apply it to verify selection and block updates.' );
		input.value = '';
	}

	function applySuggestion( messageId, mode ) {
		const session = getSession();
		const message = session?.messages.find( entry => entry.id === messageId );
		if ( !message || !state.activeEditor ) {
			return;
		}

		const suggestedHtml = extractSuggestedHtml( message.content );
		if ( !suggestedHtml ) {
			setStatus( 'No HTML suggestion was found in the selected response.' );
			return;
		}

		if ( mode === 'replaceBlock' ) {
			state.activeEditor.setData( suggestedHtml );
			state.activeEditor.editing.view.focus();
			setStatus( 'Applied suggestion to the full editor region.' );
			return;
		}

		const snapshot = mode === 'replaceSelection' ? message.context.selectionSnapshot : message.context.caretSnapshot;
		if ( !snapshot ) {
			setStatus( 'No saved selection is available for this response.' );
			return;
		}

		state.activeEditor.model.change( writer => {
			const selectionState = selectionFromSnapshot( writer, state.activeEditor, snapshot );
			if ( !selectionState ) {
				throw new Error( 'selection-restore-failed' );
			}

			writer.setSelection( selectionState.ranges, { backward: selectionState.isBackward } );
			const viewFragment = state.activeEditor.data.processor.toView( suggestedHtml );
			const modelFragment = state.activeEditor.data.toModel( viewFragment );
			state.activeEditor.model.insertContent(
				modelFragment,
				state.activeEditor.model.document.selection
			);
		} );

		state.activeEditor.editing.view.focus();
		setStatus(
			mode === 'insertAtCursor' ?
				'Inserted suggestion at the saved cursor position.' :
				'Replaced the saved selection with the suggestion.'
		);
	}

	runtimeWindow.openCkEditorCopilot = editor => openPanel( editor );

	if ( runtimeWindow.parent === runtimeWindow ) {
		runtimeWindow.parent.openCkEditorCopilot = runtimeWindow.openCkEditorCopilot;
	}

	form.addEventListener( 'submit', event => {
		event.preventDefault();
		sendMessage( 'chat', input.value );
	} );

	input.addEventListener( 'keydown', event => {
		if ( event.key === 'Enter' && !event.shiftKey ) {
			event.preventDefault();
			sendMessage( 'chat', input.value );
		}
	} );

	clearButton.addEventListener( 'click', () => {
		const session = getSession();
		if ( session ) {
			session.messages = [];
		}
		renderMessages();
		setStatus( '' );
	} );

	closeButton.addEventListener( 'click', () => {
		panel.hidden = true;
	} );

	minimizeButton.addEventListener( 'click', () => {
		state.isMinimized = !state.isMinimized;
		panel.classList.toggle( 'is-minimized', state.isMinimized );
	} );

	actionButtons.forEach( button => {
		button.addEventListener( 'click', () => {
			const action = button.dataset.playgroundCopilotAction || 'chat';
			const message = input.value.trim() || state.actionPrompts[ action ] || 'Help improve this editor region.';
			sendMessage( action, message );
		} );
	} );

	messagesContainer.addEventListener( 'click', event => {
		const button = event.target.closest( '[data-apply-mode]' );
		if ( !button ) {
			return;
		}

		applySuggestion( Number( button.dataset.messageId ), button.dataset.applyMode );
	} );

	renderMessages();
	return {
		open: openPanel,
		applySuggestion,
		sendMessage
	};
}
