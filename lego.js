'use strict';

exports.isStar = true;


// Constants
//
var FUNC_PRIORITY = [
    'and',
    'or',
    'filterIn',
    'sortBy',
    'select',
    'limit',
    'format'
];


// Functions-helpers
//
var _functionSorter = function (one, another) {
    var nameOne = one.name.split(' ')[1];
    var nameAnother = another.name.split(' ')[1];

    return FUNC_PRIORITY.indexOf(nameOne) > FUNC_PRIORITY.indexOf(nameAnother);
};

var _functionApplyer = function (obj, f) {
    return f(obj);
};

var _objectBuilder = function (obj, keyValuePair) {
    var key = keyValuePair[0];
    var value = keyValuePair[1];

    var newObject = Object.assign({}, obj);
    newObject[key] = value;

    return newObject;
};

var _in = function (collection, obj) {
    return collection.indexOf(obj) !== -1;
};

var _objIn = function (obj, collection) {
    return _in(collection, obj);
};

var _takeKeyValuePair = function (item, key) {
    return [key, item[key]];
};


// Query functions
//
var select = function (keys, collection) {
    return collection
        .map(function (item) {
            return Object.keys(item)
                .filter(_in.bind(null, keys))
                .map(_takeKeyValuePair.bind(null, item))
                .reduce(_objectBuilder, {});
        });
};

var filterIn = function (key, values, collection) {
    return collection
        .filter(function (item) {
            return _in(values, item[key]);
        });
};

var sortBy = function (key, order, collection) {
    return collection
        .sort(function (one, another) {
            return order === 'asc'
                ? one[key] > another[key]
                : one[key] < another[key];
        });
};

var format = function (key, formatter, collection) {
    return collection
        .map(function (item) {
            var itemCopy = Object.assign({}, item);
            itemCopy[key] = formatter(itemCopy[key]);

            return itemCopy;
        });
};

var limit = function (count, collection) {
    return collection.slice(0, count);
};

var or = function (filters, collection) {
    return collection
        .filter(function (item) {
            return filters
                .map(_functionApplyer.bind(null, collection))
                .some(_objIn.bind(null, item));
        });
};

var and = function (filters, collection) {
    return collection
        .filter(function (item) {
            return filters
                .map(_functionApplyer.bind(null, collection))
                .every(_objIn.bind(null, item));
        });
};


// Export
//
exports.query = function (collection) {
    return [].slice.call(arguments, 1)
        .sort(_functionSorter)
        .reduce(_functionApplyer, collection.slice());
};

exports.select = function () {
    return select.bind(null, [].slice.call(arguments));
};

exports.filterIn = function (key, values) {
    return filterIn.bind(null, key, values);
};

exports.sortBy = function (key, order) {
    return sortBy.bind(null, key, order);
};

exports.format = function (key, formatter) {
    return format.bind(null, key, formatter);
};

exports.limit = function (count) {
    return limit.bind(null, count);
};


if (exports.isStar) {
    exports.or = function () {
        return or.bind(null, [].slice.call(arguments));
    };

    exports.and = function () {
        return and.bind(null, [].slice.call(arguments));
    };
}
