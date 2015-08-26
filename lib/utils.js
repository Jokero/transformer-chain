/**
 * @param {*} value
 *
 * @returns {*}
 */
exports.result = function(value) {
    if (value instanceof Function) {
        var args = Array.prototype.slice.call(arguments, 1);
        value    = value.apply(null, args);
    }

    return value;
};

/**
 * @param {Promise[]} promises
 *
 * @returns {Promise}
 */
exports.waitForAllPromises = function(promises) {
    var errors = [];

    var resolvedPromises = promises.map(function(promise) {
        return promise.catch(function(err) {
            if (err instanceof Error) {
                return Promise.reject(err);
            }

            if (!(err instanceof Array)) {
                err = [err];
            }

            Array.prototype.push.apply(errors, err);

            return Promise.resolve();
        });
    });

    return Promise.all(resolvedPromises).then(function() {
        if (errors.length) {
            return Promise.reject(errors);
        }
    });
};