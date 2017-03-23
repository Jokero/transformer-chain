'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var plugins = require('./plugins');

/**
 * @param {Object} object
 * @param {Object} schema
 */

var Transformer = function Transformer(object, schema) {
    var _this = this;

    _classCallCheck(this, Transformer);

    this.result = object;

    Object.keys(plugins).forEach(function (pluginName) {
        var plugin = plugins[pluginName];

        _this[pluginName] = function (options) {
            if (_this.result.then instanceof Function) {
                _this.result = _this.result.then(function (result) {
                    return plugin(result, schema, options);
                });
            } else {
                _this.result = plugin(_this.result, schema, options);
            }

            return _this;
        };
    });
};

module.exports = Transformer;