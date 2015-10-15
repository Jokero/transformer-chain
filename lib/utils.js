/**
 * @param {*} value
 *
 * @returns {*}
 */
exports.result = function(value) {
    if (value instanceof Function) {
        var args = Array.from(arguments).slice(1);
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

            errors = errors.concat(err);
        });
    });

    return Promise.all(resolvedPromises).then(function(result) {
        if (errors.length) {
            return Promise.reject(errors);
        }

        return result;
    });
};