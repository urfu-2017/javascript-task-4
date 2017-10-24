'use strict';

exports.isStar = false;

function putFunctionsInOrder(functions) {
    var functionsInOrder = ['sortBy', 'filterIn', 'select', 'format', 'limit'];

    return functions.sort((a, b) =>
        functionsInOrder.indexOf(a.name) > functionsInOrder.indexOf(b.name));
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */

exports.query = function (collection, ...functions) {
    var collectionCopy = collection;
    functions = putFunctionsInOrder(functions);
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
        collection.forEach(partner => {
            Object.keys(partner).forEach(key => {
                if (selected.indexOf(key) === -1) {
                    delete partner[key];
                }
            });
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
        return collection.filter(partner => values.indexOf(partner[property]) !== -1);
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
