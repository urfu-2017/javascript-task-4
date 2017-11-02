'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = false;
var FUNCTION_ORDER = ['filterIn', 'sortBy', 'select', 'limit', 'format'];

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    var collectionCopy = [];
    collection.forEach(function (friend) {
        collectionCopy.push(Object.assign({}, friend));
    });

    var functions = ([].slice.call(arguments, 1));
    var sortedFunctions = functions.sort(function (func1, func2) {
        return FUNCTION_ORDER.indexOf(func1.name) - FUNCTION_ORDER.indexOf(func2.name);
    });
    sortedFunctions.forEach(function (func) {
        collectionCopy = func(collectionCopy);
    });

    return collectionCopy;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Array}
 */
exports.select = function () {
    var givenProperties = [].slice.call(arguments);

    return function select(collection) {
        var newCollection = [];
        for (var i = 0; i < collection.length; i++) {
            var currentFriend = collection[i];
            var selectedFriend = {};
            for (var j = 0; j < givenProperties.length; j++) {
                selectedFriend[givenProperties[j]] = currentFriend[givenProperties[j]];
            }
            newCollection.push(selectedFriend);
        }

        return newCollection;
    };
};


/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Array}
 */
exports.filterIn = function (property, values) {
    return function filterIn(collection) {
        return collection.reduce(function (result = [], currentFriend) {
            var hasProperty = values.some(function (prop) {
                return prop === currentFriend[property];
            });
            if (hasProperty) {
                result.push(currentFriend);
            }

            return result;
        }, []);
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Array}
 */
exports.sortBy = function (property, order) {
    return function sortBy(collection) {
        order = (order === 'asc') ? 1 : -1;

        return collection.sort(function (a, b) {
            return (a[property] > b[property] ? 1 : -1) * order;
        });
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Array}
 */
exports.format = function (property, formatter) {
    return function format(collection) {
        var collectionCopy = [];
        collection.forEach(function (friend) {
            collectionCopy.push(Object.assign({}, friend));
        });

        return collectionCopy.map(function (friend) {
            friend[property] = formatter(friend[property]);

            return friend;
        });
    };
};

exports.limit = function (count) {
    return function limit(collection) {
        return collection.slice(0, Math.abs(count));
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
