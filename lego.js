'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

const APPLICATION_SEQUENCE = {
    select: 5,
    filterIn: 0,
    sortBy: 3,
    format: 6,
    limit: 4,
    or: 2,
    and: 1
};

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...functions) {
    return functions
        .sort((a, b) => APPLICATION_SEQUENCE[a.name] - APPLICATION_SEQUENCE[b.name])
        .reduce((acc, func) => func(acc), collection);
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function (...properties) {
    return function select(collection) {
        return collection.map(obj =>
            properties.reduce((newObj, property) =>
                (Object.assign(newObj, { [property]: obj[property] })), {}
            ));
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
        return collection.filter(obj => values.includes(obj[property]));
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
        return collection.slice().sort((a, b) => {
            if (a[property] > b[property]) {
                return order === 'asc' ? 1 : -1;
            }
            if (a[property] < b[property]) {
                return order === 'asc' ? -1 : 1;
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
        return collection.map(obj =>
            Object.assign({}, obj, { [property]: formatter(obj[property]) })
        );
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
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
     * @returns {Function}
     */
    exports.or = function (...functions) {
        return function or(collection) {
            return collection.filter(obj =>
                functions.some(func => func(collection).includes(obj)));
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
            return collection.filter(obj =>
                functions.every(func => func(collection).includes(obj)));
        };
    };
}
