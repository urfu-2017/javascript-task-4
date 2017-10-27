'use strict';

exports.fromEntriesToObject = entries => {
    let result = {};
    for (let [key, value] of entries) {
        result[key] = value;
    }

    return result;
};

exports.containsIn = args =>
    function ([key]) {
        return Array.from(args).indexOf(key) >= 0;
    };

exports.mutateCollection = (collection, mutator) =>
    Array.from(collection
        .map(Object.entries)
        .map(mutator)
        .map(exports.fromEntriesToObject));


exports.getSortedCopy = (collection, comparator) =>
    collection
        .slice()
        .sort(comparator);

