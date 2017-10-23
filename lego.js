'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

const ORDER_NORMAL = 0;
const ORDER_FINAL = 99;

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...functions) {
    let result = collection.slice();
    functions.sort((a, b) => {
        return a.order - b.order;
    });

    for (const { operation } of functions) {
        result = operation(result);
    }

    return result;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Object} - Операция выбора
 */
exports.select = function (...selectFields) {
    return {
        order: ORDER_FINAL + 1,
        operation: function (collection) {
            const fieldsToDelete = getAllFields(collection)
                .filter(field => !selectFields.includes(field));

            return collection.map(item => {
                const itemCopy = Object.assign({}, item);
                fieldsToDelete.forEach(field => {
                    delete itemCopy[field];
                });

                return itemCopy;
            });
        }
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Object} - Операция фильтрации
 */
exports.filterIn = function (property, values) {
    console.info(property, values);

    return {
        order: ORDER_NORMAL,
        operation: function (collection) {
            return collection.filter(item => values.includes(item[property]));
        }
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Object} - Операция сортировки
 */
exports.sortBy = function (property, order) {
    console.info(property, order);

    return {
        order: ORDER_NORMAL,
        operation: function (collection) {
            const collectionCopy = collection.slice();
            collectionCopy.sort((a, b) => {
                let result = 0;
                if (a[property] < b[property]) {
                    result = -1;
                }
                if (a[property] > b[property]) {
                    result = 1;
                }
                if (order === 'desc') {
                    result *= -1;
                }

                return result;
            });

            return collectionCopy;
        }
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Object} - Операция форматирования
 */
exports.format = function (property, formatter) {
    console.info(property, formatter);

    return {
        order: ORDER_FINAL,
        operation: function (collection) {
            return collection.map(item => {
                const itemCopy = Object.assign({}, item);
                itemCopy[property] = formatter(item[property]);

                return itemCopy;
            });
        }
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Object} - Операция ограничения количества элементов
 */
exports.limit = function (count) {
    console.info(count);

    return {
        order: ORDER_FINAL,
        operation: function (collection) {
            return collection.slice(0, count);
        }
    };
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Object} - Операция OR для фильтрующих функций
     */
    exports.or = function (...functions) {
        return {
            order: ORDER_NORMAL,
            operation: function (collection) {
                return unique(functions
                    .map(({ operation }) => operation(collection))
                    .reduce((c1, c2) => c1.concat(c2), []));
            }
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Object} - Операция AND для фильтрующих функций
     */
    exports.and = function (...functions) {
        return {
            order: ORDER_NORMAL,
            operation: function (collection) {
                const itemCounts = new Map();
                functions
                    .map(({ operation }) => operation(collection))
                    .forEach(result => result.forEach(
                        item => itemCounts.set(item, (itemCounts.get(item) || 0) + 1)));

                return [...itemCounts.keys()]
                    .filter(item => itemCounts.get(item) === functions.length);
            }
        };
    };
}

function getAllFields(collection) {
    return unique(collection.map(item => Object.keys(item)).reduce((a, b) => a.concat(b), []));
}

function unique(array) {
    return [...new Set(array)];
}
