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

var queryFunctions = ['or', 'and', 'filterIn', 'sortBy', 'select', 'limit', 'format'];

exports.query = function (collection) {
    var collectionCopy = collection.map(function (item) {
        return Object.assign({}, item);
    });
    var collectionFunctions = [].slice.call(arguments, 1);

    return collectionFunctions
        .sort(function (f1, f2) {
            return queryFunctions.indexOf(f1.name) - queryFunctions.indexOf(f2.name);
        })
        .reduce(function (currentCollection, func) {
            return func(currentCollection);
        }, collectionCopy);
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function () {
    var _arguments = [].slice.call(arguments);

    return function select(collection) {
        return collection.map(function (item) {
            return _arguments.reduce(function (newItem, key) {
                if (item.hasOwnProperty(key)) {
                    newItem[key] = item[key];
                }

                return newItem;
            }, {});
        });
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function}
 */
exports.filterIn = function (property, values) {
    console.info(property, values);

    return function filterIn(collection) {
        return collection.filter(function (item) {
            return (item.hasOwnProperty(property) && values.indexOf(item[property]) !== -1);
        });
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = function (property, order) {
    console.info(property, order);

    return function sortBy(collection) {
        var orderNumber = order === 'asc' ? 1 : -1;

        return collection.sort(function (item1, item2) {
            if (!item1.hasOwnProperty(property)) {
                return -orderNumber;
            }
            if (!item2.hasOwnProperty(property)) {
                return orderNumber;
            }
            if (item1[property] > item2[property]) {
                return orderNumber;
            }
            if (item1[property] < item2[property]) {
                return -orderNumber;
            }

            return 0;
        });
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Function}
 */
exports.format = function (property, formatter) {
    console.info(property, formatter);

    return function format(collection) {
        return collection.map (function (item) {
            if (item.hasOwnProperty(property)) {
                item[property] = formatter(item[property]);
            }

            return item;
        });
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
 */
exports.limit = function (count) {
    console.info(count);

    return function limit(collection) {
        return collection.slice(0, count);

    };
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
