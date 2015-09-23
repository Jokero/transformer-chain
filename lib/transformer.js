var _ = require('lodash');

/**
 * @param {Object} object
 * @param {Object} config
 * @param {Object} plugins
 */
module.exports = function(object, config, plugins) {
    object = _.cloneDeep(object);
    config = _.cloneDeep(config);

    this.result = object;

    _.forOwn(plugins, function(plugin, pluginName) {
        this[pluginName] = (function(options) {
            if (this.result.then instanceof Function) {
                this.result = this.result.then(function(result) {
                    return plugin(result, config, options);
                });
            } else {
                this.result = plugin(this.result, config, options);
            }

            return this;
        }).bind(this);
    }, this);
};