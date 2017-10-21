'use strict';

exports.isStar = true;

const OPERATION_PRIORITY = ['filterIn', 'and', 'or', 'sortBy', 'select', 'limit', 'format'];
const priority = name => OPERATION_PRIORITY.indexOf(name);

const copyCollection = collection => [...collection];

exports.query = (collection, ...params) =>
    params
        .sort((a, b) => priority(a.name) - priority(b.name))
        .reduce((collectionCopy, param) => param(collectionCopy), copyCollection(collection));

exports.select = (...params) =>
    function select(collection) {
        return collection.reduce((result, entry) => {
            let newEntry = params.reduce((element, param) => {
                element[param] = entry[param];

                return element;
            }, {});
            result.push(newEntry);

            return result;
        }, []);
    };

exports.filterIn = (property, values) =>
    function filterIn(collection) {
        return collection.filter(entry => values.includes(entry[property]));
    };

exports.sortBy = (property, order) =>
    function sortBy(collection) {
        let copy = copyCollection(collection);
        if (order === 'asc') {
            return copy.sort((a, b) => a[property] > b[property]);
        }

        return copy.sort((a, b) => a[property] < b[property]);
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
                params.some(param => param([entry]).length)
            );
        };

    exports.and = (...params) =>
        function and(collection) {
            return collection.filter(entry =>
                params.every(param => param([entry]).length)
            );
        };
}
