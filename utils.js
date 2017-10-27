'use strict';

exports.fromEntriesToObject = function (entries) {
    let result = {};
    for (let [key, value] of entries) {
        result[key] = value;
    }

    return result;
};

exports.containsIn = function (args) {
    return function ([key]) {
        return Array.from(args).indexOf(key) >= 0;
    };
};

exports.mutateCollection = function (collection, mutator) {
    return Array.from(collection
        .map(Object.entries)
        .map(mutator)
        .map(exports.fromEntriesToObject));
};


exports.getSortedCopy = function (collection, comparator) {
    return collection
        .slice()
        .sort(comparator);
};

