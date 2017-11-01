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
    var newCollection = [];
    collection.forEach(function(friend) {
    	newCollection.push(Object.assign({}, friend));
    })

    ([].slice.call(arguments, 1))
        .sort(function (func1, func2) {
            return FUNCTION_ORDER.indexOf(func1.name) - FUNCTION_ORDER.indexOf(func2.name);
        })
        .forEach(function (func) {
            newCollection = func(newCollection);
        });

    return newCollection;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Array}
 */
exports.select = function () {
    var givenProperties = [].slice.call(arguments);

    return function select(collection) {
        var friendProperties = Object.keys(collection[0]);
        var intersectedProperties = getPropertiesIntersection(friendProperties, givenProperties);
        var newCollection = [];
        for (var i = 0; i < collection.length; i++) {
            var currentFriend = collection[i];
            var selectedFriend = {};
            for (var j = 0; j < intersectedProperties.length; j++) {
                selectedFriend[intersectedProperties[j]] = currentFriend[intersectedProperties[j]];
            }
            newCollection.push(selectedFriend);
        }

        return newCollection;
    };
};

/**
 * Выделение общих свойств у друзей и полученных от селекта
 * @param {Array} friendsProperties – Свойства друзей на конкретном шаге(если несколько селектов)
 * @param {Array} givenProperties – Данные нам свойства от селекта
 * @returns {Array}
 */
function getPropertiesIntersection(friendsProperties, givenProperties) {
    return givenProperties.filter(function (givenProperty) {
        return friendsProperties.some(function (friendProperty) {
            return friendProperty === givenProperty;
        });
    });
}

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Array}
 */
exports.filterIn = function (property, values) {
    return function filterIn(collection) {
        return collection.reduce(function (result, currentFriend) {
            var hasProperty = values.some(function (prop) {
                return prop === currentFriend[property];
            });
            if (hasProperty) {
                result.push(currentFriend);

                return result;
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
        return collection.map(function (friend) {
            friend[property] = formatter(friend[property]);

            return friend;
        });
    };
};

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
