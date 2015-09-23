module.exports = {
    clean:                             require('./plugins/clean'),
    dropFirstLevelUndefinedProperties: require('./plugins/dropFirstLevelUndefinedProperties'),
    filter:                            require('./plugins/filter'),
    setDefaults:                       require('./plugins/setDefaults'),
    validate:                          require('./plugins/validate')
};