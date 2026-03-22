/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, expect, it, vi } from 'vitest';

vi.mock( 'ckeditor5', () => {
	return {
		InlineEditor: {
			create: vi.fn( () => Promise.resolve( { id: 'editor-instance' } ) )
		},
		Autoformat: Symbol( 'Autoformat' ),
		AutoImage: Symbol( 'AutoImage' ),
		Autosave: Symbol( 'Autosave' ),
		BalloonToolbar: Symbol( 'BalloonToolbar' ),
		Essentials: Symbol( 'Essentials' ),
		Paragraph: Symbol( 'Paragraph' ),
		Heading: Symbol( 'Heading' ),
		Bold: Symbol( 'Bold' ),
		Bookmark: Symbol( 'Bookmark' ),
		BlockQuote: Symbol( 'BlockQuote' ),
		CodeBlock: Symbol( 'CodeBlock' ),
		Italic: Symbol( 'Italic' ),
		Underline: Symbol( 'Underline' ),
		Indent: Symbol( 'Indent' ),
		IndentBlock: Symbol( 'IndentBlock' ),
		Link: Symbol( 'Link' ),
		LinkImage: Symbol( 'LinkImage' ),
		List: Symbol( 'List' ),
		ListProperties: Symbol( 'ListProperties' ),
		MediaEmbed: Symbol( 'MediaEmbed' ),
		PasteFromOffice: Symbol( 'PasteFromOffice' ),
		ImageBlock: Symbol( 'ImageBlock' ),
		ImageCaption: Symbol( 'ImageCaption' ),
		ImageInline: Symbol( 'ImageInline' ),
		ImageInsert: Symbol( 'ImageInsert' ),
		ImageInsertViaUrl: Symbol( 'ImageInsertViaUrl' ),
		ImageResize: Symbol( 'ImageResize' ),
		ImageStyle: Symbol( 'ImageStyle' ),
		ImageTextAlternative: Symbol( 'ImageTextAlternative' ),
		ImageToolbar: Symbol( 'ImageToolbar' ),
		ImageUpload: Symbol( 'ImageUpload' ),
		ImageUploadEditing: Symbol( 'ImageUploadEditing' ),
		Table: Symbol( 'Table' ),
		TableCaption: Symbol( 'TableCaption' ),
		TableCellProperties: Symbol( 'TableCellProperties' ),
		TableColumnResize: Symbol( 'TableColumnResize' ),
		TableProperties: Symbol( 'TableProperties' ),
		TableToolbar: Symbol( 'TableToolbar' ),
		TextTransformation: Symbol( 'TextTransformation' ),
		TodoList: Symbol( 'TodoList' )
	};
} );

vi.mock( '../src/plugins/filelink/filelink.js', () => ( { default: class FileLink {} } ) );
vi.mock( '../src/plugins/insertimage/insertimage.js', () => ( { default: class InsertImage {} } ) );
vi.mock( '../src/plugins/pagelink/pagelink.js', () => ( { default: class PageLink {} } ) );
vi.mock( '../src/plugins/signalr/signalr.js', () => ( { default: class SignalR {} } ) );
vi.mock( '../src/plugins/titlemodeindicator/titlemodeindicator.js', () => ( { default: class TitleModeIndicator {} } ) );
vi.mock( '../src/plugins/vscodeeditor/vscodeeditor.js', () => ( { default: class VSCodeEditor {} } ) );

import { createPlaygroundConfig, getRuntimeProfileName, startPlaygroundEditor } from '../playground/bootstrap.js';
import { TOOLBAR_PROFILES } from '../src/toolbarProfiles.js';

describe( 'Playground boot smoke tests', () => {
	it( 'uses standard profile by default at runtime when no element is available', () => {
		const profileName = getRuntimeProfileName( {}, null );

		expect( profileName ).toBe( 'standard' );
	} );

	it( 'uses advanced profile for larger editor elements when no explicit profile is set', () => {
		const editorElement = {
			clientWidth: 980,
			clientHeight: 420,
			getAttribute: vi.fn( () => null )
		};

		const profileName = getRuntimeProfileName( {}, editorElement );

		expect( profileName ).toBe( 'advanced' );
	} );

	it( 'uses standard profile for smaller editor elements when no explicit profile is set', () => {
		const editorElement = {
			clientWidth: 420,
			clientHeight: 180,
			getAttribute: vi.fn( () => null )
		};

		const profileName = getRuntimeProfileName( {}, editorElement );

		expect( profileName ).toBe( 'standard' );
	} );

	it( 'respects explicit runtime override over inferred element type', () => {
		const editorElement = {
			getAttribute: vi.fn( () => 'ckeditor' )
		};

		const profileName = getRuntimeProfileName( { skycmsEditorProfile: 'simple' }, editorElement );

		expect( profileName ).toBe( 'simple' );
	} );

	it( 'maps SkyCMS ckeditor element type to advanced profile', () => {
		const editorElement = {
			getAttribute: vi.fn( () => 'ckeditor' )
		};

		const profileName = getRuntimeProfileName( {}, editorElement );

		expect( profileName ).toBe( 'advanced' );
	} );

	it( 'maps SkyCMS heading/title element type to title profile', () => {
		const headingElement = {
			getAttribute: vi.fn( () => 'heading' )
		};
		const titleElement = {
			getAttribute: vi.fn( () => 'title' )
		};

		expect( getRuntimeProfileName( {}, headingElement ) ).toBe( 'title' );
		expect( getRuntimeProfileName( {}, titleElement ) ).toBe( 'title' );
	} );

	it( 'maps explicit simple element type to simple profile', () => {
		const simpleElement = {
			getAttribute: vi.fn( () => 'simple' )
		};

		expect( getRuntimeProfileName( {}, simpleElement ) ).toBe( 'simple' );
	} );

	it( 'respects runtime toolbar profile override', () => {
		const profileName = getRuntimeProfileName( { skycmsEditorProfile: 'advanced' }, null );
		const config = createPlaygroundConfig( profileName );

		expect( profileName ).toBe( 'advanced' );
		expect( config.toolbar.items ).toEqual( TOOLBAR_PROFILES.advanced.toolbar );
	} );

	it( 'boots all configured playground editors when mode surfaces exist', async () => {
		const create = vi
			.fn()
			.mockResolvedValueOnce( { id: 'editor-title' } )
			.mockResolvedValueOnce( { id: 'editor-simple' } );
		const editorClass = { create };
		const titleElement = { id: 'editor-title', getAttribute: vi.fn( () => 'title' ) };
		const simpleElement = { id: 'editor-simple', getAttribute: vi.fn( () => 'simple' ) };
		const runtimeDocument = {
			querySelectorAll: vi.fn( () => [ titleElement, simpleElement ] ),
			querySelector: vi.fn( () => null )
		};

		const instances = await startPlaygroundEditor( {
			runtimeWindow: {},
			runtimeDocument,
			editorClass
		} );

		expect( runtimeDocument.querySelectorAll ).toHaveBeenCalledWith( '[data-playground-editor]' );
		expect( create ).toHaveBeenCalledTimes( 2 );
		expect( instances ).toEqual( [ { id: 'editor-title' }, { id: 'editor-simple' } ] );
	} );

	it( 'falls back to legacy #editor when mode surfaces are missing', async () => {
		const create = vi.fn( () => Promise.resolve( { id: 'legacy-editor-instance' } ) );
		const editorClass = { create };
		const runtimeDocument = {
			querySelectorAll: vi.fn( () => [] ),
			querySelector: vi.fn( () => ( { id: 'editor', getAttribute: vi.fn( () => null ) } ) )
		};

		const instances = await startPlaygroundEditor( {
			runtimeWindow: {},
			runtimeDocument,
			editorClass
		} );

		expect( runtimeDocument.querySelectorAll ).toHaveBeenCalledWith( '[data-playground-editor]' );
		expect( runtimeDocument.querySelector ).toHaveBeenCalledWith( '#editor' );
		expect( create ).toHaveBeenCalledTimes( 1 );
		expect( instances ).toEqual( [ { id: 'legacy-editor-instance' } ] );
	} );

	it( 'does not boot editor when no editable surface exists', async () => {
		const warnSpy = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
		const create = vi.fn( () => Promise.resolve( { id: 'editor-instance' } ) );
		const editorClass = { create };
		const runtimeDocument = {
			querySelectorAll: vi.fn( () => [] ),
			querySelector: vi.fn( () => null )
		};

		const instances = await startPlaygroundEditor( {
			runtimeWindow: {},
			runtimeDocument,
			editorClass
		} );

		expect( create ).not.toHaveBeenCalled();
		expect( instances ).toEqual( [] );
		expect( warnSpy ).toHaveBeenCalledWith( 'SkyCMS playground: no editable surface found.' );
	} );
} );
