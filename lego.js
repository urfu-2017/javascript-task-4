'use strict';

const PRIORITY = {
    filterIn: 0,
    and: 1,
    or: 2,
    sortBy: 3,
    select: 4,
    limit: 5,
    format: 6
};


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


exports.query = function (collection, ...selectors) {
    let collectionCopy = collection.slice(0);
    selectors.sort((a, b) => PRIORITY[a.name] - PRIORITY[b.name]);
    for (let i = 0; i < selectors.length; i++) {
        collectionCopy = selectors[i](collectionCopy);
    }

    return collectionCopy;
};

function getCopy(collection) {
    return JSON.parse(JSON.stringify(collection));
}


/**
 * Выбор полей
 * @params {...String}
 */

exports.select = function (...params) {

    return function select(collection) {
        return collection.map((person) => {
            let newPerson = {};
            for (var i = 0; i < params.length; i++) {
                let param = params[i];
                if (person[param] !== undefined) {
                    newPerson[param] = person[param];
                }
            }

            return newPerson;
        });
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 */

exports.filterIn = function (property, values) {
    // console.info(property, values);

    return function filterIn(collection) {
        return collection.filter((a) => values.indexOf(a[property]) > -1);
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 */

exports.sortBy = function (property, order) {
    // console.info(property, order);

    return function sortBy(collection) {
        let collectionCopy = getCopy(collection);
        if (order === 'asc') {
            collectionCopy = collectionCopy.sort((a, b) => a[property] > b[property]);

            return collectionCopy;
        }
        collectionCopy = collectionCopy.sort((a, b) => a[property] < b[property]);

        return collectionCopy;
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 */

exports.format = function (property, formatter) {
    // console.info(property, formatter);

    return function format(collection) {
        return collection.map((person) => {
            let newPerson = person;
            newPerson[property] = formatter(person[property]);
            // console.info(newPerson);

            return newPerson;
        });
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 */

exports.limit = function (count) {
    // console.info(count);

    return function limit(collection) {
        let collectionCopy = getCopy(collection).slice(0, count);

        return collectionCopy;
    };
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     */

    exports.or = function (...selectors) {
        selectors.sort((a, b) => PRIORITY[a.name] - PRIORITY[b.name]);

        return function or(collection) {
            return collection.filter(person =>
                selectors.some(func => func(collection).includes(person)));
            // console.info(collectionCopy);
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     */

    exports.and = function (...selectors) {
        selectors.sort((a, b) => PRIORITY[a.name] - PRIORITY[b.name]);

        return function and(collection) {
            return collection.filter(person =>
                selectors.every(func => func(collection).includes(person)));
        };
    };
}
