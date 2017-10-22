'use strict';

/**
 * Получить приоритет операции
 * @param {Function} func
 * @returns {Number}
 */
function getOperationPriority(func) {
    const priotities = { 'format': 0, 'limit': 1, 'select': 2 };
    let priority = priotities[func.name];

    return priority === undefined ? Infinity : priority;
}

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
    let collectionCopy = JSON.parse(JSON.stringify(collection));

    return selectors
        .sort((x, y) => getOperationPriority(y) - getOperationPriority(x))
        .reduce((summary, delegate) => delegate(summary), collectionCopy);
};

/**
 * Выбор полей
 * @params {...fields}
 * @returns {Function}
 */
exports.select = function (...fields) {
    let select = collection => collection
        .map(record => fields
            .filter(field => field in record)
            .reduce((filtered, field) => {
                filtered[field] = record[field];

                return filtered;
            }, {})
        );

    return select;
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function}
 */
exports.filterIn = function (property, values) {
    console.info(property, values);
    let filterIn = collection => collection
        .filter(record => values.includes(record[property]));

    return filterIn;
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = function (property, order) {
    console.info(property, order);
    let orderType = { 'asc': 1, 'desc': -1 };
    let sortBy = collection => collection
        .sort((x, y) => (x[property] > y[property] ? 1 : -1) * orderType[order]);

    return sortBy;
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Function}
 */
exports.format = function (property, formatter) {
    console.info(property, formatter);
    let format = collection =>
        collection.map(x=> Object.assign(x, { [property]: formatter(x[property]) }));

    return format;
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
 */
exports.limit = function (count) {
    console.info(count);
    let limit = collection => collection.slice(0, count);

    return limit;
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.or = function (...filters) {
        let or = collection => collection
            .filter(item => filters.some(selector => selector([item]).length > 0)
            );

        return or;
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = function (...filters) {
        let and = collection => collection
            .filter(item => filters.every(selector => selector([item]).length > 0)
            );

        return and;
    };
}
