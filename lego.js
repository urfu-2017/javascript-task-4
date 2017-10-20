'use strict';

exports.isStar = true;

const OPERATION_PRIORITY = {
    filterIn: 6,
    and: 5,
    or: 4,
    sortBy: 3,
    select: 2,
    limit: 1,
    format: 0
};

exports.query = function (collection, ...params) {
    let collectionCopy = [...collection];
    params
        .sort((a, b) => OPERATION_PRIORITY[b.name] - OPERATION_PRIORITY[a.name])
        .forEach(param => {
            collectionCopy = param(collectionCopy);
        });

    return collectionCopy;
};

exports.select = (...params) =>
    function select(collection) {
        return collection.map(entry => {
            let newEntry = {};
            params.forEach(function (param) { // can't make arrow func here
                newEntry[param] = entry[param];
            });

            return newEntry;
        });
    };


exports.filterIn = (property, values) => {
    let filtered = [];

    return function filterIn(collectionCopy) {
        collectionCopy.filter(entry =>
            values.forEach(value => {
                if (entry[property] === value) {
                    filtered.push(entry);
                }
            })
        );

        return filtered;
    };
};

exports.sortBy = (property, order) =>
    function sortBy(collection) {
        let copy = [...collection];
        if (order === 'asc') {
            return copy.sort((a, b) => a[property] - b[property]);
        }

        return copy.sort((a, b) => b[property] - a[property]);
    };

exports.format = (property, formatter) =>
    function format(collection) {
        return collection.map(entry => {
            entry[property] = formatter(entry[property]);

            return entry;
        });
    };

exports.limit = (count) =>
    function limit(collection) {
        return collection.slice(0, count);
    };

if (exports.isStar) {
    exports.or = (...params) =>
        function or(collection) {
            return collection.filter(entry =>
                params.some(param =>
                    param(collection).indexOf(entry) !== -1
                )
            );
        };

    exports.and = (...params) =>
        function and(collection) {
            return collection.filter(entry =>
                params.every(param =>
                    param(collection).indexOf(entry) !== -1
                )
            );
        };
}
