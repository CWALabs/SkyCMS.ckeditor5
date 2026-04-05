/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	InlineEditor,
	Autoformat,
	AutoImage,
	Autosave,
	BalloonToolbar,
	BlockQuote,
	Bold,
	Bookmark,
	CodeBlock,
	Essentials,
	Heading,
	ImageBlock,
	ImageCaption,
	ImageInline,
	ImageInsert,
	ImageInsertViaUrl,
	ImageResize,
	ImageStyle,
	ImageTextAlternative,
	ImageToolbar,
	ImageUpload,
	ImageUploadEditing,
	Indent,
	IndentBlock,
	Italic,
	Link,
	LinkImage,
	List,
	ListProperties,
	MediaEmbed,
	Paragraph,
	PasteFromOffice,
	Table,
	TableCaption,
	TableCellProperties,
	TableColumnResize,
	TableProperties,
	TableToolbar,
	TextTransformation,
	TodoList,
	Underline
} from 'ckeditor5';

import {
	FileLink,
	InsertImage,
	PageLink,
	SignalR,
	TitleModeIndicator,
	VSCodeEditor
} from '../src/index.js';

import { getEditorProfile } from '../src/toolbarProfiles.js';

const TITLE_EDITOR_TYPES = new Set( [ 'title', 'heading' ] );
const SIMPLE_EDITOR_TYPES = new Set( [ 'simple' ] );
const ADVANCED_EDITOR_TYPES = new Set( [ 'ckeditor', 'default', 'richtext' ] );
const AUTO_ADVANCED_MIN_WIDTH = 780;
const AUTO_ADVANCED_MIN_AREA = 240000;

function getDefaultRuntimeWindow() {
	return globalThis.window;
}

function getDefaultRuntimeDocument() {
	return globalThis.document;
}

function getEditorElementMetrics( editorElement ) {
	if ( !editorElement ) {
		return { width: 0, height: 0 };
	}

	const width = Number( editorElement.clientWidth ) ||
		Number( editorElement.offsetWidth ) ||
		Number( editorElement.getBoundingClientRect?.().width ) ||
		0;
	const height = Number( editorElement.clientHeight ) ||
		Number( editorElement.offsetHeight ) ||
		Number( editorElement.getBoundingClientRect?.().height ) ||
		0;

	return { width, height };
}

function getAutomaticProfileName( editorElement ) {
	const { width, height } = getEditorElementMetrics( editorElement );
	const area = width * height;

	if ( width >= AUTO_ADVANCED_MIN_WIDTH || area >= AUTO_ADVANCED_MIN_AREA ) {
		return 'advanced';
	}

	return 'standard';
}

export function getRuntimeProfileName( runtimeWindow = getDefaultRuntimeWindow(), editorElement = null ) {
	// Explicit runtime override takes precedence over inferred mapping.
	const explicitProfile = runtimeWindow?.skycmsEditorProfile ||
		runtimeWindow?.ccmsCkeditorProfile ||
		runtimeWindow?.CCMS_CKEDITOR_PROFILE ||
		runtimeWindow?.ccmsEditorConfig?.profile;

	if ( explicitProfile ) {
		return explicitProfile;
	}

	const editorType = editorElement?.getAttribute?.( 'data-editor-config' )?.toLowerCase();

	if ( editorType && TITLE_EDITOR_TYPES.has( editorType ) ) {
		return 'title';
	}

	if ( editorType && SIMPLE_EDITOR_TYPES.has( editorType ) ) {
		return 'simple';
	}

	if ( editorType === 'skycms' ) {
		return 'skycms';
	}

	if ( editorType && ADVANCED_EDITOR_TYPES.has( editorType ) ) {
		return 'advanced';
	}

	return getAutomaticProfileName( editorElement );
}

function getPlaygroundEditorElements( runtimeDocument ) {
	const modeEditors = Array.from( runtimeDocument.querySelectorAll( '[data-playground-editor]' ) );

	if ( modeEditors.length > 0 ) {
		return modeEditors;
	}

	const legacyEditor = runtimeDocument.querySelector( '#editor' );
	return legacyEditor ? [ legacyEditor ] : [];
}

export function createPlaygroundConfig( profileName = 'simple' ) {
	const profile = getEditorProfile( profileName );
	return {
		licenseKey: 'GPL',
		plugins: [
			Essentials,
			Paragraph,
			Heading,
			Autoformat,
			AutoImage,
			Autosave,
			BalloonToolbar,
			BlockQuote,
			Bold,
			Bookmark,
			CodeBlock,
			ImageBlock,
			ImageCaption,
			ImageInline,
			ImageInsert,
			ImageInsertViaUrl,
			ImageResize,
			ImageStyle,
			ImageTextAlternative,
			ImageToolbar,
			ImageUpload,
			ImageUploadEditing,
			Indent,
			IndentBlock,
			Italic,
			Link,
			LinkImage,
			List,
			ListProperties,
			MediaEmbed,
			PasteFromOffice,
			Table,
			TableCaption,
			TableCellProperties,
			TableColumnResize,
			TableProperties,
			TableToolbar,
			TextTransformation,
			TodoList,
			Underline,
			FileLink,
			InsertImage,
			PageLink,
			SignalR,
			TitleModeIndicator,
			VSCodeEditor
		],
		balloonToolbar: profile.balloonToolbar,
		toolbar: {
			items: profile.toolbar
		},
		image: {
			toolbar: [
				'toggleImageCaption',
				'imageTextAlternative',
				'|',
				'imageStyle:inline',
				'imageStyle:wrapText',
				'imageStyle:breakText',
				'|',
				'resizeImage'
			]
		},
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties' ]
		}
	};
}

export function startPlaygroundEditor( {
	runtimeWindow = getDefaultRuntimeWindow(),
	runtimeDocument = getDefaultRuntimeDocument(),
	editorClass = InlineEditor
} = {} ) {
	const editorElements = getPlaygroundEditorElements( runtimeDocument );

	if ( editorElements.length === 0 ) {
		console.warn( 'SkyCMS playground: no editable surface found.' );
		return Promise.resolve( [] );
	}

	const createRequests = editorElements.map( editorElement => {
		const profileName = getRuntimeProfileName( runtimeWindow, editorElement );
		const config = createPlaygroundConfig( profileName );
		const editorName = editorElement.id || editorElement.getAttribute( 'data-playground-editor' ) || 'editor';

		return editorClass.create( editorElement, config )
			.then( editor => {
				console.log( `SkyCMS playground editor ready (${ editorName }, profile: ${ profileName }).` );
				return editor;
			} );
	} );

	return Promise.all( createRequests )
		.catch( error => {
			console.error( '❌ Failed to start SkyCMS playground editor:', error );
			throw error;
		} );
}
