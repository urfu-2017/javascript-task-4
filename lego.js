'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

const QUERY_PRIORITIES = {
    'and': 1,
    'or': 5,
    'filterIn': 10,
    'sortBy': 20,
    'select': 50,
    'format': 100,
    'limit': 100
};

function copyObject(collection) {
    return JSON.parse(JSON.stringify(collection));
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...selectors) {
    let collectionCopy = copyObject(collection);
    selectors
        .sort((a, b) => QUERY_PRIORITIES[a.name] - QUERY_PRIORITIES[b.name])
        .forEach(selector => {
            collectionCopy = selector(collectionCopy);
        });

    return collectionCopy;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function} — Функция, выбирающая поля fieldNames
 */
exports.select = function (...fieldNames) {
    return function select(collection) {
        return collection.map(
            element => {
                let newElement = {};
                fieldNames
                    .filter(fieldName => fieldName in element)
                    .forEach(fieldName => {
                        newElement[fieldName] = element[fieldName];
                    });

                return newElement;
            }
        );
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function} — Функция, фильтрующая коллекцию
 */
exports.filterIn = function (property, values) {
    return function filterIn(collection) {
        return collection.filter(element => values.includes(element[property]));
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function} — Функция, сортирующая коллекцию
 */
exports.sortBy = function (property, order) {
    return function sortBy(collection) {
        return collection.sort((a, b) =>
            (order === 'asc' ? -1 : 1) * (a[property] <= b[property] ? 1 : -1));
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Function} — Функция, форматирующая свойство property
 */
exports.format = function (property, formatter) {
    return function format(collection) {
        return collection.map(element => {
            let newElement = copyObject(element);
            newElement[property] = formatter(element[property]);

            return newElement;
        });
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function} — Функция, отдающая первые count элементов
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
     * @returns {Function} — Функция, объединяющая фильры
     */
    exports.or = function (...filters) {
        return function or(collection) {
            return collection.filter(element => filters
                .some(filter => filter([element]).length !== 0));
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function} — Функция, пересекающая фильтры
     */
    exports.and = function (...filters) {
        return function and(collection) {
            return collection.filter(element => filters
                .every(filter => filter([element]).length !== 0));
        };
    };
}
