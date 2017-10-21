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

const copyCollection = (collection) => JSON.parse(JSON.stringify(collection));

exports.query = (collection, ...params) =>
    params
        .sort((a, b) => OPERATION_PRIORITY[b.name] - OPERATION_PRIORITY[a.name])
        .reduce((collectionCopy, param) => param(collectionCopy), copyCollection(collection));

exports.select = (...params) =>
    function select(collection) {
        return collection.map(entry => {
            let newEntry = {};
            params.forEach(function (param) { // can't make arrow func here
                if (entry[param] !== undefined) {
                    newEntry[param] = entry[param];
                }
            });

            return newEntry;
        });
    };


exports.filterIn = (property, values) =>
    function filterIn(collection) {
        return collection.filter(entry =>
            values.some(value => entry[property] === value)
        );
    };

exports.sortBy = (property, order) =>
    function sortBy(collection) {
        let copy = copyCollection(collection);
        if (order === 'asc') {
            return copy.sort((a, b) => a[property] - b[property]);
        }

        return copy.sort((a, b) => b[property] - a[property]);
    };

exports.format = (property, formatter) =>
    function format(collection) {
        return collection.map(entry => {
            if (entry[property] !== undefined) {
                entry[property] = formatter(entry[property]);
            }

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
