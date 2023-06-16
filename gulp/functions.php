<?php

/**
 * ##themeName## 
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package ##themeName##
 * @since 1.0.0
 */

/**
 * Define Constants
 */
define('CHILD_THEME_VERSION', wp_get_theme()->get('Version'));

/**
 * Enqueue styles
 */
function child_enqueue_styles()
{
	wp_enqueue_style(
		'##themeName##-theme-css',
		get_stylesheet_directory_uri() . '/style.css',
		array('##parentThemeName##'),
		CHILD_THEME_VERSION,
		'all'
	);
}

add_action('wp_enqueue_scripts', 'child_enqueue_styles', 15);
