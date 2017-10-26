'use strict';

var lodash = require('./node_modules/lodash');

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    var priority = {
        'and': 1,
        'or': 2,
        'filterIn': 3,
        'sortBy': 4,
        'select': 5,
        'limit': 6,
        'format': 7
    };
    var cloneCollection = collection.map(x => lodash.cloneDeep(x));
    [].slice.call(arguments, 1)
        .sort((a, b) => {
            return priority[a.name] > priority[b.name];
        })
        .forEach(f => {
            cloneCollection = f(cloneCollection);
        });

    return cloneCollection;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {function}
 */
exports.select = function () {
    var selectors = [].slice.call(arguments);

    return function select(collection) {
        return collection.map(
            elem => selectors.reduce(
                (result, selector) => {
                    if (elem.hasOwnProperty(selector)) {
                        result[selector] = elem[selector];
                    }

                    return result;
                }, {}));
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {function}
 */
exports.filterIn = function (property, values) {
    return function filterIn(collection) {
        return collection.filter(
            elem => {
                return values.includes(elem[property]);
            });
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {function}
 */
exports.sortBy = function (property, order) {
    if (order === undefined)
        order = "asc";

    return function sortBy(collection) {
        return collection.sort((a, b) => {
            return (a[property] > b[property]) && (order === 'asc') ||
                (a[property] < b[property]) && (order === 'desc');
        });
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {function}
 */
exports.format = function (property, formatter) {
    return function format(collection) {
        return collection.map(
            elem => {
                elem[property] = formatter(elem[property]);

                return elem;
            });
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {function}
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
     * @returns {function}
     */
    exports.or = function () {
        var functions = [].slice.call(arguments);

        return function or(collection) {
            return collection.filter(
                elem => functions.some(
                    f => {
                        return f(collection).includes(elem);
                    }));
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {function}
     */
    exports.and = function () {
        var functions = [].slice.call(arguments);

        return function and(collection) {
            return collection.filter(
                elem => functions.every(
                    f => {
                        return f(collection).includes(elem);
                    }));
        };
    };
}
