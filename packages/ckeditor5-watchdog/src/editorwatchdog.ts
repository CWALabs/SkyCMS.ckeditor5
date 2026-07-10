/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module watchdog/editorwatchdog
 */

import { areConnectedThroughProperties } from './utils/areconnectedthroughproperties.js';
import { normalizeRootsConfig } from './utils/normalizerootsconfig.js';
import { Watchdog, type WatchdogConfig } from './watchdog.js';

import type {
	CKEditorError
} from '@ckeditor/ckeditor5-utils';

import type {
	ModelNode,
	ModelText,
	ModelElement,
	ModelWriter
} from '@ckeditor/ckeditor5-engine';

import type {
	Editor,
	EditorConfig,
	Context,
	EditorReadyEvent,
	RootConfig
} from '@ckeditor/ckeditor5-core';

import {
	throttle,
	cloneDeepWith,
	isElement as _isElement
} from 'es-toolkit/compat';

/**
 * A watchdog for CKEditor 5 editors.
 *
 * See the {@glink features/watchdog Watchdog feature guide} to learn the rationale behind it and
 * how to use it.
 */
export class EditorWatchdog<TEditor extends Editor = Editor> extends Watchdog {
	/**
	 * The current editor instance.
	 */
	private _editor: TEditor | null = null;

	/**
	 * A promise associated with the life cycle of the editor (creation or destruction processes).
	 *
	 * It is used to prevent the initialization of the editor if the previous instance has not been destroyed yet,
	 * and conversely, to prevent the destruction of the editor if it has not been initialized.
	 */
	private _lifecyclePromise: Promise<unknown> | null = null;

	/**
	 * Throttled save method. The `save()` method is called the specified `saveInterval` after `throttledSave()` is called,
	 * unless a new action happens in the meantime.
	 */
	private _throttledSave: ReturnType<typeof throttle<() => void>>;

	/**
	 * The latest saved editor data represented as a root name -> root data object.
	 */
	private _data?: EditorData;

	/**
	 * The last document version.
	 */
	private _lastDocumentVersion?: number;

	/**
	 * The editor source element or data.
	 */
	private _elementOrData?: HTMLElement | string | Record<string, string> | Record<string, HTMLElement>;

	/**
	 * Stores the original DOM element for single-root editors.
	 */
	private _editorAttachTo: HTMLElement | null = null;

	/**
	 * Specifies whether the editor is a single-root editor (e.g. ClassicEditor) or a multi-root editor (e.g. MultiRootEditor).
	 */
	private _isSingleRootEditor: boolean = true;

	/**
	 * Specifies whether the editor was created using config-based creator mode (without a source element or data as the first argument).
	 *
	 * @internal
	 */
	public _isUsingConfigBasedCreator: boolean = false;

	/**
	 * The latest record of the editor editable elements. Used to restart the editor.
	 */
	private _editables: Record<string, HTMLElement> = {};

	/**
	 * The editor configuration.
	 */
	private _config?: EditorConfig;

	/**
	 * The creation method.
	 *
	 * @see #setCreator
	 */
	declare protected _creator: EditorWatchdogCreatorFunction<TEditor>;

	/**
	 * The destruction method.
	 *
	 * @see #setDestructor
	 */
	declare protected _destructor: ( editor: Editor ) => Promise<unknown>;

	private _excludedProps?: Set<unknown>;

	/**
	 * @param Editor The editor class.
	 * @param watchdogConfig The watchdog plugin configuration.
	 */
	constructor( Editor: { create( ...args: any ): Promise<TEditor> } | null, watchdogConfig: WatchdogConfig = {} ) {
		super( watchdogConfig );

		// this._editorClass = Editor;

		this._throttledSave = throttle(
			this._save.bind( this ),
			typeof watchdogConfig.saveInterval === 'number' ? watchdogConfig.saveInterval : 5000
		);

		// Set default creator and destructor functions:
		if ( Editor ) {
			this._creator = ( ( elementOrDataOrConfig: any, config?: EditorConfig ) => {
				if ( config === undefined ) {
					// Config-based mode: first argument is the config.
					return Editor.create( elementOrDataOrConfig );
				}

				// Legacy mode: first argument is element/data, second is config.
				return Editor.create( elementOrDataOrConfig, config );
			} ) as EditorWatchdogCreatorFunction<TEditor>;
		}

		this._destructor = editor => editor.destroy();
	}

	/**
	 * The current editor instance.
	 */
	public get editor(): TEditor | null {
		return this._editor;
	}

	/**
	 * @internal
	 */
	public get _item(): TEditor | null {
		return this._editor;
	}

	/**
	 * Sets the function that is responsible for the editor creation.
	 * It expects a function that should return a promise.
	 *
	 * For config-based editor creation:
	 *
	 * ```ts
	 * watchdog.setCreator( config => ClassicEditor.create( config ) );
	 * ```
	 *
	 * For legacy editor creation (with element or data as the first argument):
	 *
	 * ```ts
	 * watchdog.setCreator( ( element, config ) => ClassicEditor.create( element, config ) );
	 * ```
	 */
	public setCreator( creator: EditorWatchdogCreatorFunction<TEditor> ): void {
		this._creator = creator;
	}

	/**
	 * Sets the function that is responsible for the editor destruction.
	 * Overrides the default destruction function, which destroys only the editor instance.
	 * It expects a function that should return a promise or `undefined`.
	 *
	 * ```ts
	 * watchdog.setDestructor( editor => {
	 * 	// Do something before the editor is destroyed.
	 *
	 * 	return editor
	 * 		.destroy()
	 * 		.then( () => {
	 * 			// Do something after the editor is destroyed.
	 * 		} );
	 * } );
	 * ```
	 */
	public setDestructor( destructor: ( editor: Editor ) => Promise<unknown> ): void {
		this._destructor = destructor;
	}

	/**
	 * Restarts the editor instance. This method is called whenever an editor error occurs. It fires the `restart` event and changes
	 * the state to `initializing`.
	 *
	 * @fires restart
	 */
	protected override _restart(): Promise<unknown> {
		return Promise.resolve()
			.then( () => {
				this.state = 'initializing';
				this._fire( 'stateChange' );

				return this._destroy();
			} )
			.catch( err => {
				console.error( 'An error happened during the editor destroying.', err );
			} )
			.then( () => {
				// Pre-process some data from the original editor config.
				// Our goal here is to make sure that the restarted editor will be reinitialized with correct set of roots.
				// We are not interested in any data set in config. It will be replaced anyway.
				// But we need to set them correctly to make sure that proper roots are created.
				//
				// Since a different set of roots will be created, lazy-roots and roots-attributes must be managed too.

				if ( this._isUsingConfigBasedCreator ) {
					// In config-based creator mode, normalize using an empty source to ensure `config.root` is moved
					// to `config.roots.main` and other legacy config properties are handled.
					normalizeRootsConfig(
						this._isSingleRootEditor ? '' : {},
						this._config!,
						this._isSingleRootEditor ? 'main' : false
					);
				} else {
					// Normalize the roots configuration based on the editor source element or data and the editor configuration.
					normalizeRootsConfig(
						this._isSingleRootEditor ? this._editorAttachTo || '' : this._editables,
						this._config!,
						this._isSingleRootEditor ? 'main' : false
					);
				}

				const updatedConfig: EditorConfig = {
					...this._config,
					extraPlugins: this._config!.extraPlugins || [],
					_watchdogInitialData: this._data
				};

				// Add content loading plugin to the editor configuration.
				// This plugin will be responsible for loading the editor data into the editor after it is restarted.
				updatedConfig.extraPlugins!.push( EditorWatchdogInitPlugin );

				// Collect existing roots configuration and update it. This will ensure that the same set of roots
				// will be created after the restart, and they will have correct lazy loading and attributes configuration.
				const updatedRootsConfig: Record<string, RootConfig> = {};

				for ( const [ rootName, rootData ] of Object.entries( this._data!.roots ) ) {
					const rootConfig = updatedConfig.roots![ rootName ] || Object.create( null );

					// Delete `initialData` as it is not needed. Data will be set by the watchdog based on `_watchdogInitialData`.
					rootConfig.initialData = '';

					// Copy root element name as it is created in the editor constructor.
					rootConfig.modelElement = rootData.modelElement;

					// Reuse previous DOM editable.
					if ( this._isUsingConfigBasedCreator ) {
						if ( this._editables[ rootName ]?.isConnected ) {
							rootConfig.element = this._editables[ rootName ];
						} else if ( rootData.isLoaded && !rootConfig.element ) {
							Object.assign( rootConfig, getSavedRootEditableOptions( rootData.attributes ) );
						}
					}

