'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;


/**
 * Выбор нужных свойств
 * @param {...String} properties
 * @param {Object} friend
 * @returns {Object}
 */
function createProperties(properties, friend) {
    let result = {};
    for (let property of properties) {
        if (Object.keys(friend).indexOf(property) !== -1) {
            result[property] = friend[property];
        }
    }

    return result;
}

/**
 * Сравнение функций
 * @param {Function} f1
 * @param {Function} f2
 * @returns {Number}
 */
function compareFunctions(f1, f2) {
    const FUNCTION_WEIGHT =
    { 'limit': 5, 'format': 4, 'select': 3, 'sortBy': 2, 'or': 1, 'and': 1, 'filterIn': 1 };

    return FUNCTION_WEIGHT[f1.name] - FUNCTION_WEIGHT[f2.name];
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...functions) {
    functions.sort(compareFunctions);

    return functions.reduce(function (previousValue, currentValue) {
        return currentValue(previousValue);
    }, JSON.parse(JSON.stringify(collection)));
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function (...properties) {
    return function select(collection) {
        let result = [];
        for (let friend of collection) {
            let friendProperties = createProperties(properties, friend);
            if (friendProperties.length !== 0) {
                result.push(friendProperties);
            }
        }

        return result;
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function}
 */
exports.filterIn = function (property, values) {
    return function filterIn(col) {
        return col.filter(obj => values.includes(obj[property]));
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
        if (order === 'asc') {
            return collection.sort((f1, f2) => (f1[property] > f2[property] ? 1 : -1));
        }
        if (order === 'desc') {
            return collection.sort((f1, f2) => (f1[property] > f2[property] ? -1 : 1));
        }
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
        for (let friend of collection) {
            friend[property] = formatter(friend[property]);
        }

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
            return collection.filter(function (friend) {
                return functions.some(function (filterFunction) {
                    return filterFunction([friend]).length !== 0;
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
            return collection.filter(function (friend) {
                return functions.every(function (filterFunction) {
                    return filterFunction([friend]).length !== 0;
                });
            });
        };
    };
}
