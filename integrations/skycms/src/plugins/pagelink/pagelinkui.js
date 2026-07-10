/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Plugin, ButtonView, IconLink, createDropdown, addToolbarToDropdown } from 'ckeditor5';

export default class PageLinkUI extends Plugin {
	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( 'skyCmsLink', locale => {
			const dropdownView = createDropdown( locale );

			dropdownView.buttonView.set( {
				label: t( 'Insert link' ),
				icon: IconLink,
				tooltip: true
			} );

			addToolbarToDropdown(
				dropdownView,
				() => [
					this._createPageLinkButton( locale, {
						label: t( 'From website page' ),
						withText: true,
						dropdownView
					} ),
					this._createForwardingButton( 'link', {
						label: t( 'From another website' ),
						withText: true,
						dropdownView
					} )
				],
				{
					isVertical: true,
					ariaLabel: t( 'Link source options' )
				}
			);

			return dropdownView;
		} );

		this.editor.ui.componentFactory.add( 'pageLink', locale => {
			return this._createPageLinkButton( locale, {
				label: t( 'Insert a link to a page on this website.' ),
				tooltip: true
			} );
		} );
	}

	_createForwardingButton( componentName, {
		label,
		withText = false,
		dropdownView = null
	} = {} ) {
		const button = this.editor.ui.componentFactory.create( componentName );

		if ( label ) {
			button.label = label;
		}

		button.withText = withText;

		this.listenTo( button, 'execute', () => {
			if ( dropdownView ) {
				dropdownView.isOpen = false;
			}
		} );

		return button;
	}

	_createPageLinkButton( locale, {
		label,
		withText = false,
		tooltip = false,
		dropdownView = null
	} = {} ) {
		const button = new ButtonView( locale );

		button.set( {
			label,
			icon: IconLink,
			withText,
			tooltip
		} );

		this.listenTo( button, 'execute', () => {
			if ( dropdownView ) {
				dropdownView.isOpen = false;
			}

			this._openPickPageModal();
		} );

		return button;
	}

	_openPickPageModal() {
		const runtimeWindow = globalThis.window;
		const openPickPageModal = runtimeWindow?.parent?.openPickPageModal;

		if ( openPickPageModal ) {
			openPickPageModal( this.editor );
			return;
		}

		// Playground fallback: use native prompt and CKEditor link command.
		const promptForPageUrl = runtimeWindow?.prompt;
		const pageUrl = promptForPageUrl ?
			promptForPageUrl( 'Enter relative page URL (example: /about):', '/about' ) :
			null;

		if ( pageUrl && pageUrl.trim().length > 0 ) {
			this.editor.execute( 'link', pageUrl.trim() );
		}
	}
}
