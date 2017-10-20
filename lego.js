'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

const FUNCTIONS_PRIORITIES = {
    select: 2,
    filterIn: 0,
    sortBy: 1,
    format: 3,
    limit: 3,
    or: 0,
    and: 0
};

function copyCollection(collection) {
    return collection.map(friend => Object.assign({}, friend));
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    let functions = [].slice.call(arguments, 1);
    let collectionCopy = copyCollection(collection);
    functions.sort((a, b) => FUNCTIONS_PRIORITIES[a.name] - FUNCTIONS_PRIORITIES[b.name]);
    functions.forEach(func => {
        collectionCopy = func(collectionCopy);
    });

    return collectionCopy;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function () {
    let fields = [].slice.call(arguments);

    return function select(collection) {
        return collection.map(friend => {
            let updatedFriend = {};
            for (let i = 0; i < fields.length; i++) {
                if (fields[i] in friend) {
                    updatedFriend[fields[i]] = friend[fields[i]];
                }
            }

            return updatedFriend;
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
    return function filterIn(collection) {
        return collection.filter(friend => values.indexOf(friend[property]) !== -1);
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = function (property, order) {
    return function sortBy(collection) {
        return copyCollection(collection).sort((a, b) => {
            if (a[property] > b[property]) {
                return (order === 'asc') ? 1 : -1;
            }
            if (a[property] < b[property]) {
                return (order === 'asc') ? -1 : 1;
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
    return function format(collection) {
        if (!(collection.every(friend => property in friend))) {
            return collection;
        }

        return collection.map(friend => {
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
    return function limit(collection) {
        return (count > 0) ? collection.slice(0, count) : [];
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
        let filters = [].slice.call(arguments);

        return function or(collection) {
            return collection.filter(
                friend => filters.some(filter => filter(collection).indexOf(friend) !== -1));
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = function () {
        let filters = [].slice.call(arguments);

        return function and(collection) {
            return collection.filter(
                friend => filters.every(filter => filter(collection).indexOf(friend) !== -1));
        };
    };
}
