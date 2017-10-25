'use strict';

exports.fromEntriesToObject = function (entries) {
    let result = {};
    for (let [key, value] of entries) {
        result[key] = value;
    }

    return result;
};

exports.containsIn = function (args) {
    return ([key]) => Array.from(args).indexOf(key) >= 0;
};

exports.mutateCollection = function (collection, mutator) {
    return Array.from(collection
        .map(Object.entries)
        .map(mutator)
        .map(exports.fromEntriesToObject));
};

exports.sorted = function (collection, comparator) {
    let result = collection.slice(0);
    result.sort(comparator);

    return result;
};

