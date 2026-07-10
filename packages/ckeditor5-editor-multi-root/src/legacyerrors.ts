/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module editor-multi-root/legacyerrors
 */

/**
 * Trying to set attributes on a non-existing root.
 *
 * Roots specified in legacy `config.rootsAttributes` do not match initial editor roots.
 * Use `config.roots.<rootName>.modelAttributes` instead.
 *
 * @error multi-root-editor-root-attributes-no-root
 */
export const MULTI_ROOT_EDITOR_ROOT_ATTRIBUTES_NO_ROOT = 'multi-root-editor-root-attributes-no-root';
