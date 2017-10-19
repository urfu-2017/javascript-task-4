'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

var PRIORITY_OF_FUNCTIONS = {
    filterIn: 1,
    sortBy: 2,
    or: 4,
    and: 4,
    select: 5,
    limit: 6,
    format: 7
};

function sortFunctions(firstFunction, secondFunction) {
    return PRIORITY_OF_FUNCTIONS[firstFunction.name] - PRIORITY_OF_FUNCTIONS[secondFunction.name];
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Function}
 */
exports.query = function (collection, ...functions) {
    var sorted = functions.sort(sortFunctions);
    var newCollection = collection.slice();
    for (let func of sorted) {
        newCollection = func(newCollection);
    }

    return newCollection;
};

/**
 * Выбор полей
 * @params {...String},
 * @returns {Object}
 */
exports.select = function (...margins) {
    return function select(collection) {
        var friendList = collection.slice();
        let newFriendList = [];
        for (let entry of friendList) {
            let keys = Object.keys(entry);
            keys = keys.filter(x => (margins.includes(x)));
            if (Array.isArray(keys)) {
                newFriendList.push(createObjectWithMargins(entry, keys));
            } else {
                newFriendList.push(createObjectWithMargin(entry, keys));
            }
        }

        return newFriendList;
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
        return collection.filter(x => {
            let keys = Object.keys(x);
            if (!keys.includes(property)) {
                return false;
            }

            return values.includes(x[property]);
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
        var newCollection = collection.slice();

        return newCollection.sort((x, y) => {
            if (order === 'asc') {
                return x[property] > y[property];
            }

            return y[property] < x[property];
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
        var newCollection = collection.slice();

        return newCollection.map(x => {
            let keys = Object.keys(x);
            if (!keys.includes(property)) {
                return x;
            }
            x[property] = formatter(x[property]);

            return x;
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
        var newCollection = [];
        for (var i = 0; i < count; i++) {
            var element = collection[i];
            if (typeof element !== 'undefined') {
                newCollection.push(element);
            }
        }

        return newCollection;
    };
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.or = function (...functions) {

        return function or(collection) {
            var newCollection = collection.slice();
            var finalCollection = [];
            for (let func of functions) {
                finalCollection = finalCollection.concat(func(newCollection));
            }

            return finalCollection;
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = function (...functions) {

        return function and(collection) {
            var newCollection = collection.slice();
            for (let func of functions) {
                newCollection = func(newCollection);
            }

            return newCollection;
        };
    };
}

function createObjectWithMargins(entry, keys) {
    let newObject = {};
    for (let key of keys) {
        newObject[key] = entry[key];
    }

    return newObject;
}

function createObjectWithMargin(entry, key) {
    let newObject = {};
    newObject[key] = entry[key];

    return newObject;
}

