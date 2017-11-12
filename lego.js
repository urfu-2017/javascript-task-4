'use strict';


exports.isStar = true;

const PRIORITY = {
    'or': 0,
    'and': 0,
    'filterIn': 0,
    'sortBy': 0,
    'select': 1,
    'format': 2,
    'limit': 2
};

function copyCollection(collection) {
    return Object.assign({}, collection);
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...funcs) {
    funcs.sort((func, otherFunc) => PRIORITY[func.name] - PRIORITY[otherFunc.name]);

    return funcs.reduce((newCollection, func) => func(newCollection),
        collection.map(copyCollection));
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */

exports.select = function (...property) {

    return function select(collection) {
        return collection.reduce((newCollection, friend) => {
            let updateFriend = Object.keys(friend).reduce((update, key) => {
                if (property.includes(key)) {
                    update[key] = friend[key];
                }

                return update;
            }, {});
            newCollection.push(updateFriend);

            return newCollection;
        }, []);
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
        return collection.filter(friend => values.includes(friend[property]));
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
        return collection.map(copyCollection).sort((person, otherPerson) => {
            return (order === 'asc') ? person[property] > otherPerson[property]
                : otherPerson[property] > person[property];
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
        return collection.slice(0, count);
    };
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.or = function (...funcs) {
        return function or(collection) {
            return collection.filter(element =>
                funcs.some(func => Boolean(func([element]).length)));
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = function (...funcs) {
        return function and(collection) {
            return collection.filter(element =>
                funcs.every(func => Boolean(func([element]).length)));
        };
    };
}
