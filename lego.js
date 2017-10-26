'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

const rightSort = {
    limit: 100,
    format: 100,
    select: 10,
    filterIn: 0,
    sortBy: 0,
    and: 0,
    or: 0
};

exports.query = function (collection) {
    var colCopy = collection.slice();
    var functions = Array.from(arguments).slice(1);

    return functions
        .sort(function (x, y) {
            return rightSort[x.name] - rightSort[y.name];
        })
        .reduce(function (billysList, operator) {
            // console.info(operator);
            return operator(billysList);
        }, colCopy);
};

exports.select = function () {
    // console.info("select");
    var keys = Array.from(arguments);
    // console.info(keys);
    // console.info(collection);

    return function select(collection) {
        return collection.map(function (constructElem) {
            var selectGraph = {};
            for (var key of keys) {
                if (key in constructElem) {
                    selectGraph[key] = constructElem[key];
                }
            }
            // console.info(selectGraph);

            return selectGraph;
        });
    };
};

exports.filterIn = function (property, values) {
    // console.info("filter");
    // console.info(property, values);

    return function filterIn(collection) {
        return collection.filter(friend => values.includes(friend[property]));
    };
};

exports.sortBy = function (property, order) {
    // console.info("sortby");
    // console.info(property, order);

    return function sortBy(collection) {
        return collection.sort(function (x, y) {
            if (order === 'asc') {
                return x[property] > y[property];
            }
            if (order === 'desc') {
                return x[property] < y[property];
            }

            return 0;
        });
    };
};

exports.format = function (property, formatter) {
    // console.info("format");
    // console.info(property, formatter);

    return function format(collection) {
        return collection.map(function (constructElem) {
            var selectGraph = Object.assign({}, constructElem);
            selectGraph[property] = formatter(constructElem[property]);

            return selectGraph;
        });
    };
};

exports.limit = function (count) {
    // console.info("limit");
    // console.info(count);

    return function limit(collection) {
        return collection.slice(0, count);
    };
};

if (exports.isStar) {

    exports.or = function () {
        var operators = Array.from(arguments);

        return function or(collection) {
            return collection.filter(function (property) {
                return operators.some(operator => operator(collection).includes(property));
            });
        };
    };

    exports.and = function () {
        var operators = Array.from(arguments);

        return function and(collection) {
            return collection.filter(function (property) {
                return operators.every(operator => operator(collection).includes(property));
            });
        };
    };
}
