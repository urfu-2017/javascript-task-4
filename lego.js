'use strict';
// Пошевелим хрюнделя в первый раз
const { containsIn, mutateCollection, getSortedCopy } = require('./utils');

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

function getActionPriority(func) {
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
    return getSortedCopy(actions, (x, y) => getActionPriority(x) - getActionPriority(y))
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
    const comparator = (x, y) => {
        if (x[property] > y[property]) {
            return order === 'asc' ? 1 : -1;
        }
        if (x[property] < y[property]) {
            return order === 'asc' ? -1 : 1;
        }

        return 0;
    };

    return function sortBy(collection) {
        return getSortedCopy(collection, comparator);
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
     * @param {...Function} filters – Фильтрующие функции
     * @returns {Function}
     */
    exports.or = function (...filters) {
        return function or(collection) {
            return collection.filter(item =>
                filters.some(filter => filter([item]).length > 0)
            );
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @param {...Function} filters – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = function (...filters) {
        return function or(collection) {
            return collection.filter(item =>
                filters.every(filter => filter([item]).length > 0)
            );
        };
    };
}
