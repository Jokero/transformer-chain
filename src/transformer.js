'use strict';

const plugins = require('./plugins');

/**
 * @param {Object} object
 * @param {Object} schema
 */
class Transformer {
    constructor(object, schema) {
        this.result = object;

        Object.keys(plugins).forEach(pluginName => {
            const plugin = plugins[pluginName];

            this[pluginName] = options => {
                if (this.result.then instanceof Function) {
                    this.result = this.result.then(result => plugin(result, schema, options));
                } else {
                    this.result = plugin(this.result, schema, options);
                }

                return this;
            };
        });
    }
}

module.exports = Transformer;