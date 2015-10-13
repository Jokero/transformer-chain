var _ = require('lodash');

/**
 * @param {Object} object
 * @param {Object} config
 * @param {Object} plugins
 */
module.exports = function(object, config, plugins) {
    this.result = _.cloneDeep(object);

    _.forOwn(plugins, function(plugin, pluginName) {
        this[pluginName] = (function(options) {
            if (this.result.then instanceof Function) {
                this.result = this.result.then(function(result) {
                    return plugin(result, config, object, options);
                });
            } else {
                this.result = plugin(this.result, config, object, options);
            }

            return this;
        }).bind(this);
    }, this);
};