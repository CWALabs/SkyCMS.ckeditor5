/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

export const SKYCMS_EDITOR_PROFILES = {
	title: {
		toolbar: [ 'titleModeIndicator' ],
		balloonToolbar: [ 'bold', 'italic' ]
	},
	simple: {
		toolbar: [
			'undo', 'redo', '|',
			'heading', '|',
			'bold', 'italic', 'underline', '|',
			'link', '|',
			'bulletedList', 'numberedList', '|',
			'blockQuote'
		],
		balloonToolbar: [ 'bold', 'italic', 'link' ]
	},
	standard: {
		toolbar: [
			'undo', 'redo', '|',
			'heading', '|',
			'bold', 'italic', 'underline', '|',
			'skyCmsLink', 'fileLink', '|',
			'imageInsert', '|',
			'bulletedList', 'numberedList', 'todoList', '|',
			'blockQuote', '|',
			'mediaEmbed'
		],
		balloonToolbar: [
			'bold', 'italic', 'underline', '|',
			'skyCmsLink'
		]
	},
	advanced: {
		toolbar: [
			'heading', '|',
			'skyCmsLink', 'imageInsert', 'resizeImage', 'imageStyle:inline',
			'toggleImageCaption', 'mediaEmbed',
			'insertTable', 'blockQuote', 'codeBlock', '|',
			'bulletedList', 'numberedList', 'todoList', 'outdent', 'indent'
		],
		balloonToolbar: [
			'bold', 'italic', 'underline', '|',
			'bookmark', 'skyCmsLink', '|',
			'bulletedList', 'numberedList'
		]
	}
};

export const SKYCMS_EDITOR_PROFILE_ALIASES = {
	title: 'title',
	heading: 'title',
	simple: 'simple',
	standard: 'standard',
	default: 'advanced',
	richtext: 'advanced',
	ckeditor: 'advanced',
	advanced: 'advanced',
	skycms: 'advanced'
};

export function resolveEditorProfileName( profileName = 'standard', {
	tagName = null,
	fallbackProfile = 'standard'
} = {} ) {
	const normalizedTag = tagName ? tagName.toLowerCase() : null;
	if ( normalizedTag && /^(h[1-6])$/.test( normalizedTag ) ) {
		return 'title';
	}

	const normalizedProfile = typeof profileName === 'string' ? profileName.toLowerCase() : '';
	const resolved = SKYCMS_EDITOR_PROFILE_ALIASES[ normalizedProfile ] || normalizedProfile;

	if ( SKYCMS_EDITOR_PROFILES[ resolved ] ) {
		return resolved;
	}

	return SKYCMS_EDITOR_PROFILES[ fallbackProfile ] ? fallbackProfile : 'standard';
}

export function getEditorProfile( profileName = 'standard', options = {} ) {
	const resolved = resolveEditorProfileName( profileName, options );
	return SKYCMS_EDITOR_PROFILES[ resolved ];
}

export function getToolbarProfile( profileName = 'standard', options = {} ) {
	return getEditorProfile( profileName, options ).toolbar;
}

export function getBalloonToolbarProfile( profileName = 'standard', options = {} ) {
	return getEditorProfile( profileName, options ).balloonToolbar;
}

// Backward compatibility export for existing imports.
export const TOOLBAR_PROFILES = SKYCMS_EDITOR_PROFILES;
