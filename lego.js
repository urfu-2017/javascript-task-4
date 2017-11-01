'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

const PRIORITY_LIST = {
    select: 1,
    filterIn: 0,
    sortBy: 0,
    format: 2,
    limit: 2,
    or: 0,
    and: 0
};

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...functions) {
    let copyCollection = getCopy(collection);
    functions = functions.sort((a, b) => PRIORITY_LIST[a.name] - PRIORITY_LIST[b.name]);
    functions.forEach(func => {
        copyCollection = func(copyCollection);
    });

    return copyCollection;
};


function getCopy(collection) {
    return collection.slice();
}

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function (...fields) {
    return function select(collection) {
        return collection.map(element =>
            fields.reduce((newElement, field) => (
                Object.assign(newElement, element[field] &&
                    { [field]: element[field] })), {}));

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
        return collection.filter(element => values.includes(element[property]));
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
        return collection.sort((a, b) =>
            (order === 'asc') ? a[property] > b[property] : b[property] > a[property]);
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
        return collection.map(element =>
            Object.assign({}, element, { [property]: formatter(element[property]) })
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
            return collection.filter(el =>
                functions.some(func =>
                    func([el]).length > 0));
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
            return collection.filter(el =>
                functions.every(func =>
                    func([el]).length > 0));
        };
    };
}
