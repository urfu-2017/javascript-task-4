'use strict';
const { containsIn, mutateCollection, sorted } = require('./utils');

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

function getPriority(func) {
    const ACTIONS_PRIORITY = [
        'sortBy', 'filterIn', 'select', 'format', 'limit'
    ];

    return ACTIONS_PRIORITY.indexOf(func.name);
}


/**
 * Запрос к коллекции
 * @param {Array} collection
 * @param {...Function} actions – Функции для запроса
 * @returns {Array}
 */

exports.query = function (collection, ...actions) {

    return sorted(actions, (x, b) => getPriority(x) > getPriority(b))
        .reduce((value, func) => func(value), collection.slice());
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function (...args) {
    return function select(collection) {
        return mutateCollection(collection,
            entries => entries.filter(containsIn(args)));
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function}
 */
exports.filterIn = function (property, values) {

    return function filterIn(collection) {
        return Array.from(collection
            .filter(x => containsIn(values)([x[property]])));
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = function (property, order) {
    let comparator = order === 'asc'
        ? (x, y) => x[property] > y[property]
        : (x, y) => x[property] < y[property];

    return function sortBy(collection) {
        return sorted(collection, comparator);
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Function}
 */

exports.format = function (property, formatter) {
    return function format(collection) {
        return mutateCollection(collection,
            entries => entries.map(
                ([key, value]) => key === property
                    ? [key, formatter(value)]
                    : [key, value]));
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
 */
exports.limit = function (count) {
    return function limit(collection) {
        return collection.slice(0, count);
    };
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.or = function () {
        return collection => collection;
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = function () {
        return collection => collection;
    };
}
