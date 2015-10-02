var Transformer = require('./lib/transformer');
var plugins     = require('./lib/plugins');

/**
 * @param {Object} object
 * @param {Object} config
 */
function transformer(object, config) {
    return new Transformer(object, config, plugins);
}

/**
 * @param {String}   pluginName
 * @param {Function} plugin
 */
transformer.setPlugin = function(pluginName, plugin) {
    plugins[pluginName] = plugin;
};

/**
 * @param {String} pluginName
 *
 * @returns {Function}
 */
transformer.getPlugin = function(pluginName) {
    return plugins[pluginName];
};

module.exports = transformer;