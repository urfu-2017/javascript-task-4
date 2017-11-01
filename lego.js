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


exports.query = function (collection, ...selectors) {
    const PRIORITY = {
        filterIn: 0,
        and: 1,
        or: 2,
        sortBy: 3,
        select: 4,
        limit: 5,
        format: 6
    };
    let collectionCopy = collection.map(person => Object.assign({}, person));
    selectors.sort((a, b) => PRIORITY[a.name] - PRIORITY[b.name]);
    for (let i = 0; i < selectors.length; i++) {
        collectionCopy = selectors[i](collectionCopy);
    }

    return collectionCopy;
};

/**
 * Выбор полей
 * @params {...String}
 */

exports.select = function (...params) {
    return function select(collection) {
        return collection.map(person => params.reduce((oldPerson, param) => {
            if (person[param] !== undefined) {
                oldPerson[param] = person[param];
            }

            return oldPerson;
        }, {})
        );
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 */

exports.filterIn = function (property, values) {
    return function filterIn(collection) {
        return collection.filter((a) => values.includes(a[property]));
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 */

exports.sortBy = function (property, order) {
    return function sortBy(collection) {
        return collection.sort((a, b) => ((order === 'asc') && (a[property] > b[property])) ||
        ((order !== 'asc') && (a[property] < b[property]))
        );
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
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
     */

    exports.or = function (...selectors) {
        return function or(collection) {
            return collection.filter(person =>
                selectors.some(func => func(collection).includes(person)));
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     */

    exports.and = function (...selectors) {
        return function and(collection) {
            return collection.filter(person =>
                selectors.every(func => func(collection).includes(person)));
        };
    };
}
