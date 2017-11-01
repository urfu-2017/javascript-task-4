'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

const priority = ['filterIn', 'sortBy', 'and', 'or', 'format', 'select', 'limit'];

let deepCopy = col => JSON.parse(JSON.stringify(col));

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...functions) {
    let copiedCollection = deepCopy(collection);

    let sortedFuncs = functions.sort(function (func1, func2) {
        return priority.indexOf(func1.name) - priority.indexOf(func2.name);
    });

    for (let func in sortedFuncs) {
        if (functions.hasOwnProperty(func)) {
            copiedCollection = functions[func](copiedCollection);
        }
    }

    return copiedCollection;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function (...attrs) {
    return function select(collection) {
        return collection.map(function (friend) {
            return attrs.reduce(function (newObj, attr) {
                if (friend.hasOwnProperty(attr)) {
                    newObj[attr] = friend[attr];
                }

                return newObj;
            }, {});
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
        return collection.filter (function (friend) {
            return values.some(function (value) {
                return value === friend[property];
            });
        });
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
        return collection.sort(function (a, b) {
            return order === 'asc' ? a[property] - b[property] : b[property] - a[property];
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
        return collection.map(function (friend) {
            friend[property] = formatter(friend[property]);

            return friend;
        });
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
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
    exports.or = function (...funcs) {
        return function or(collection) {
            let initialCollection = deepCopy(collection);

            return funcs.reduce(function (col, func) {
                return col.concat(func(initialCollection));
            }, []);
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
            return funcs.reduce(function (col, func) {
                return func(col);
            }, collection);
        };
    };
}
