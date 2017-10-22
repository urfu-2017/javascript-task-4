'use strict';

/**
 * Получить приоритет операции
 * @param {Function} operation
 * @returns {Number}
 */
function getOperationPriority(operation) {
    const priotities = { 'format': 0, 'limit': 1, 'select': 2 };
    let priority = priotities[operation.name];

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
        .sort((firstFunc, secondFunc) =>
            getOperationPriority(secondFunc) - getOperationPriority(firstFunc))
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
            .reduce((filteredRecord, field) => {
                filteredRecord[field] = record[field];

                return filteredRecord;
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
        .sort((firstRecord, secondRecord) =>
            (firstRecord[property] > secondRecord[property] ? 1 : -1) * orderType[order]
        );

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
        collection.map(
            record => Object.assign(record, { [property]: formatter(record[property]) })
        );

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
     * @params {...filters} – Фильтрующие функции
     * @returns {Function}
     */
    exports.or = function (...filters) {
        let or = collection => collection
            .filter(record => filters.some(filter => filter([record]).length > 0)
            );

        return or;
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...filters} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = function (...filters) {
        let and = collection => collection
            .filter(record => filters.every(filter => filter([record]).length > 0)
            );

        return and;
    };
}
