'use strict';
const _ = require('lodash');
var FUNCTIONS = {
    sortBy: 1,
    filterIn: 2,
    select: 3,
    format: 4,
    limit: 5
};

exports.isStar = false;

exports.query = function (collection, ...functions) {
    var collectionCopy = _.cloneDeep(collection);
    functions = functions.sort((a, b) => {
        return FUNCTIONS[a.name] < FUNCTIONS[b.name] ? -1 : 1;
    });
    functions.forEach(fun => {
        collectionCopy = fun(collectionCopy);
    });

    return collectionCopy;
};


exports.select = function (...selected) {

    return function select(collection) {
        collection.forEach(partner => {
            for (var key in partner) {
                if (!selected.includes(key)) {
                    delete partner[key];
                }
            }
        });

        return collection;
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {{Function, Number}}
 */

exports.filterIn = function (property, values) {

    return function filterIn(collection) {
        return collection.filter(collectionCopy => {
            if (collectionCopy.hasOwnProperty(property)) {
                return values.includes(collectionCopy[property]);
            }

            return false;
        });
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 */

exports.sortBy = function (property, order) {

    return function sortBy(collection) {

        return collection.sort((a, b) =>
            (order === 'asc' ? a[property] > b[property] : a[property] < b[property]));
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 */

exports.format = function (property, formatter) {

    return function format(collection) {
        var collectionCopy = collection;

        return collectionCopy.map(partner => {
            if (partner[property]) {
                partner[property] = formatter(partner[property]);
            }

            return partner;
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
