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

var queryFunction = ['or', 'and', 'filterIn', 'sortBy', 'select', 'limit', 'format'];

exports.query = function (collection) {
    var newCollection = [];
    collection.forEach (function (item) {
        let newItem = {};
        Object.keys(item).forEach (function (key) {
            newItem[key] = item[key];
        });
        newCollection.push(newItem);
    });
    collection = newCollection;
    var collectionFunction = [].slice.call(arguments, 1);
    collectionFunction.sort(function (f1, f2) {
        return queryFunction.indexOf(f1.name) - queryFunction.indexOf(f2.name);
    });
    console.info(collectionFunction);
    collectionFunction.forEach (function (func) {
        console.info(func);
        collection = func(collection);
        console.info(func, collection);
    });

    return collection;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function () {
    var _arguments = [].slice.call(arguments);

    return function select(collection) {
        var selectedCollection = [];
        var newItem = {};
        collection.forEach (function (item) {
            newItem = {};
            _arguments.forEach (function (key) {
                if (item.hasOwnProperty(key)) {
                    newItem[key] = item[key];
                }
            });
            selectedCollection.push(newItem);
        });

        return selectedCollection;
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
        var filteredCollection = [];
        collection.forEach (function (item) {
            if ((item.hasOwnProperty(property)) && (values.some(function (val) {
                return item[property] === val;
            }))) {
                filteredCollection.push(item);
            }
        });

        return filteredCollection;
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
        var sortingCollection = collection.slice();
        if (order === 'asc') {
            order = 1;
        } else {
            order = -1;
        }
        sortingCollection.sort(function (item1, item2) {
            if (!item1.hasOwnProperty(property)) {

                return -1 * order;
            }
            if (!item2.hasOwnProperty(property)) {

                return order;
            }
            if (((typeof item1[property]) === 'number') &&
                ((typeof item2[property]) === 'number')) {

                return (item1[property] - item2[property]) * order;
            }

            return (item1[property].toString().localeCompare(item2[property].toString())) * order;
        });

        return sortingCollection;
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
        var formatedCollection = [];
        var newItem = {};
        collection.forEach (function (item) {
            console.info(item);
            newItem = {};
            Object.keys(item).forEach(function (key) {
                console.info(key, property);
                let value = item[key];
                if (key === property) {
                    value = formatter(value);
                }
                newItem[key] = value;
            });
            formatedCollection.push(newItem);
        });

        return formatedCollection;
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
