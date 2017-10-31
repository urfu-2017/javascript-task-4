'use strict';

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

const FUNC_PRIORITIES = {
    select: 5,
    format: 6,
    filterIn: 4,
    sortBy: 3,
    or: 2,
    and: 1,
    limit: 7
};

function copyCollection(collection) {
    return collection.map((obj) => Object.assign({}, obj));
}

exports.query = function (collection) {
    const functions = [].slice.call(arguments, 1);
    const collectionCopy = copyCollection(collection);

    return functions.sort((first, second) =>
        FUNC_PRIORITIES[first.name] - FUNC_PRIORITIES[second.name])
        .reduce((acc, func) => func(acc), collectionCopy);
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {function}
 */
exports.select = function () {
    const properties = [].slice.call(arguments);

    return function select(collection) {
        return collection.map(person => {
            const resultPerson = {};

            return properties.reduce(function (acc, key) {
                if (key in person) {
                    acc[key] = person[key];
                }

                return acc;
            }, resultPerson);
        });
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
        return collection.filter(person => values.indexOf(person[property]) !== -1);
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {function}
 */
exports.sortBy = function (property, order) {
    return function sortBy(collection) {
        const reverse = (order === 'asc') ? 1 : -1;
        let colCopy = copyCollection(collection);

        return colCopy.sort((firstPerson, secondPerson) =>
            reverse * ((firstPerson[property] > secondPerson[property]) ? 1 : -1));
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
        return collection.map(person => {
            person[property] = formatter(person[property]);

            return person;
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
        const functions = [].slice.call(arguments);

        return function or(collection) {
            return collection.filter(person => functions.some(func => func([person]).length > 0));
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {function}
     */
    exports.and = function () {
        const functions = [].slice.call(arguments);

        return function and(collection) {
            return collection.filter(person => functions.every(func => func([person]).length > 0));
        };
    };
}
