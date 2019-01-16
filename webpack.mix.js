/**
 * Importing of Laravel mix and external packages
 */
const mix = require('laravel-mix')
mix.setPublicPath('./')

/**
 * Generating of Javascript and CSS
 */
mix.js('src/js/index.js', 'dist')

mix.disableSuccessNotifications()