var Transformer = require('./lib/transformer');
var plugins     = require('./lib/plugins');

/**
 * @param {Object} object
 * @param {Object} config
 */
function transformerFactory(object, config) {
    return new Transformer(object, config, plugins);
}

/**
 * @param {String}   pluginName
 * @param {Function} plugin
 */
transformerFactory.setPlugin = function(pluginName, plugin) {
    plugins[pluginName] = plugin;
};

/**
 * @param {String} pluginName
 *
 * @returns {Function}
 */
transformerFactory.getPlugin = function(pluginName) {
    return plugins[pluginName];
};

module.exports = transformerFactory;