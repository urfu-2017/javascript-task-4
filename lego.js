'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

const FUNCS_ORDER =
    {
        select: 2,
        filterIn: 0,
        sortBy: 1,
        limit: 3,
        format: 4,
        or: 0,
        and: 0
    };

function copyObject(object) {
    return Object.assign({}, object);
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...functions) {
    functions.sort((a, b) => FUNCS_ORDER[a.name] > FUNCS_ORDER[b.name] ? 1 : -1);
    let copyCollection = collection.map(copyObject);

    return functions.reduce((result, func) => {
        return func(result);
    }, copyCollection);
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function (...fields) {
    return function select(collection) {
        return collection.map(entry => {
            let newEntry = {};
            for (let field of Object.keys(entry)) {
                if (fields.includes(field)) {
                    newEntry[field] = entry[field];
                }
            }

            return newEntry;
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
    console.info(property, values);

    return function filterIn(collection) {
        return collection.filter(entry => values.includes(entry[property]));
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = function (property, order) {
    const orderSign = order === 'asc' ? 1 : -1;

    return function sortBy(collection) {
        return collection.sort((a, b) => orderSign * (a[property] > b[property] ? 1 : -1));
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
        collection.forEach(person => {
            person[property] = formatter(person[property]);
        });

        return collection;
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
            return collection.filter(function (entry) {
                return functions.some(function (func) {
                    return func([entry]).length !== 0;
                });
            });
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = function (...functions) {
        return function or(collection) {
            return collection.filter(function (entry) {
                return functions.every(function (func) {
                    return func([entry]).length !== 0;
                });
            });
        };
    };
}
