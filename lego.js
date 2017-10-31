'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

var PRIORITY_OF_FUNCTIONS = {
    or: 1,
    and: 2,
    filterIn: 3,
    sortBy: 4,
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
    let sortedFunctions = functions.sort(sortFunctions);
    let collectionCopy = JSON.parse(JSON.stringify(collection));
    for (let func of sortedFunctions) {
        collectionCopy = func(collectionCopy);
    }

    return collectionCopy;
};

/**
 * Выбор полей
 * @params {...String},
 * @returns {Object}
 */
exports.select = function (...fields) {
    return function select(collection) {
        let friendList = JSON.parse(JSON.stringify(collection));
        let newFriendList = [];
        for (let friend of friendList) {
            let friendFields = Object.keys(friend).filter(x => (fields.includes(x)));
            newFriendList.push(createObjectWithFields(friend, friendFields));
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
        return collection.filter(friend => {
            let fields = Object.keys(friend);
            if (!fields.includes(property)) {
                return false;
            }

            return values.includes(friend[property]);
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
        let collectionCopy = JSON.parse(JSON.stringify(collection));

        return collectionCopy.sort((x, y) => {
            if (order === 'asc') {
                return x[property] > y[property];
            }

            return y[property] > x[property];
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

        return collection.map(friend => {
            let fields = Object.keys(friend);
            if (!fields.includes(property)) {
                return friend;
            }
            friend[property] = formatter(friend[property]);

            return friend;
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
        let collectionCopy = JSON.parse(JSON.stringify(collection));
        if (count < 0) {
            return [];
        }
        collectionCopy.length = count;

        return collectionCopy;
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

            return collection.filter(friend => functions
                .some(func => (func([friend]).length !== 0)));
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
            let collectionCopy = JSON.parse(JSON.stringify(collection));
            for (let func of functions) {
                collectionCopy = func(collectionCopy);
            }

            return collectionCopy;
        };
    };
}

function createObjectWithFields(entry, keys) {
    let newObject = {};
    for (let key of keys) {
        newObject[key] = entry[key];
    }

    return newObject;
}


