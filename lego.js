'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = false;

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
const priority = ['filterIn', 'sortBy', 'select', 'format', 'limit'];
exports.query = function (collection) {
    var clone = [];
    collection.forEach(function (col) {
        var obj = {};
        Object.keys(col).forEach(function (keys) {
            obj[keys] = col[keys];
        });
        clone.push(obj);
    });


    var functions = [].slice.call(arguments, 1);

    functions.sort(function (a, b) {
        return priority.indexOf(a.name) - priority.indexOf(b.name);
    });
    functions.forEach(function (current) {
        clone = current(clone);
    });

    return clone;
};


exports.select = function () {
    var args = [].slice.call(arguments);

    return function select(collection) {
        return collection.map(function (current) {

            current = selector(args, current);

            return current;
        });

    };
};

function selector(args, current) {
    var ob = {};
    var keys = Object.keys(current);

    args.map(function (argument) {
        return keys.forEach(function (elem) {
            if (elem === argument) {
                ob[argument] = current[elem];
            }
        });

    });


    return ob;
}

exports.filterIn = function (property, values) {
    return function (collection) {
        return collection.filter(function (current) {
            return values.some(function (val) {
                return val === current[property];

            });

        });
    };
};

exports.sortBy = function (property, order) {

    return function sortBy(collection) {
        return collection.sort(function (a, b) {
            if (order === 'asc') {
                return a[property] - b[property];
            }

            return b[property] - a[property];
        });
    };
};


exports.format = function (property, formatter) {

    return function format(collection) {
        return collection.map(function (current) {
            current[property] = formatter(current[property]);

            return current;
        });
    };
};


exports.limit = function (count) {


    return function limit(collection) {
        return collection.slice(0, count);
    };
};

if (exports.isStar) {


    exports.or = function () {
        return;
    };


    exports.and = function () {
        return;
    };
}
