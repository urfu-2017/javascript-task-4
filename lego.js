'use strict';
const { containsIn, mutateCollection, sorted } = require('./utils');

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @param {...Function} args – Функции для запроса
 * @returns {Array}
 */
// eslint-disable-next-line no-unused-vars
exports.query = function (collection, ...args) {
    return collection;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function (...args) {
    return collection => mutateCollection(collection,
        entries => entries.filter(containsIn(args)));
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function}
 */
exports.filterIn = function (property, values) {

    return collection => Array.from(collection
        .filter(x => containsIn(values)([x[property]])));
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

    return collection => sorted(collection, comparator);
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Function}
 */

exports.format = function (property, formatter) {
    return collection => mutateCollection(collection,
        entries => entries.map(
            ([key, value]) => key === property
                ? [key, formatter(value)]
                : [key, value]));
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
 */
exports.limit = function (count) {
    return collection => collection.slice(0, count);
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     */
    exports.or = function () {
        return;
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     */
    exports.and = function () {
        return;
    };
}
