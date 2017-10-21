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
    return functions.sort((a, b) => APPLICATION_SEQUENCE[a.name] - APPLICATION_SEQUENCE[b.name])
        .reduce((acc, fun) => fun(acc), collection);
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function (...properties) {
    return function select(collection) {
        return collection.map(function (obj) {
            let newObj = {};
            properties.forEach(function (property) {
                if (obj[property] !== undefined) {
                    newObj[property] = obj[property];
                }
            });

            return newObj;
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
        return collection.slice().sort(function (a, b) {
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
        return collection.map(function (obj) {
            let newObj = Object.assign({}, obj);
            if (newObj[property] !== undefined) {
                newObj[property] = formatter(newObj[property]);
            }

            return newObj;
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
            return collection.filter(obj => functions.some(fun => fun(collection).includes(obj)));
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
            return collection.filter(obj => functions.every(fun => fun(collection).includes(obj)));
        };
    };
}
