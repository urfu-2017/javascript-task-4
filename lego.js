'use strict';
const _ = require('lodash');

exports.isStar = false;
var FUNCTIONS = ['sortBy', 'filterIn', 'select', 'format', 'limit'];

function putFunctionsInOrder(a, b) {
    if (FUNCTIONS.indexOf(a.name) > FUNCTIONS.indexOf(b.name)) {

        return 1;
    }
    if (FUNCTIONS.indexOf(a.name) < FUNCTIONS.indexOf(b.name)) {

        return -1;
    }

    return 0;
}

exports.query = function (collection, ...functions) {
    var collectionCopy = _.cloneDeep(collection);
    functions = functions.sort(putFunctionsInOrder);
    functions.forEach(fun => {
        collectionCopy = fun(collectionCopy);
    });

    return collectionCopy;
};

/**
 * Выбор полей
 * @params {...String}
 */

exports.select = function (...selected) {
    return function select(collection) {
        return collection.map(collectionCopy => {
            var result = {};
            for (var key of selected) {
                if (collectionCopy.hasOwnProperty(key)) {
                    result[key] = collectionCopy[key];
                }
            }

            return result;
        });
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
