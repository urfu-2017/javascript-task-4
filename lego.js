'use strict';

const ORDER_TYPE = { 'asc': 1, 'desc': -1 };
const PRIORITIES = { 'format': 0, 'limit': 1, 'select': 2 };

/**
 * Получить приоритет операции
 * @param {Function} operation
 * @returns {Number}
 */
function getOperationPriority(operation) {
    return PRIORITIES.hasOwnProperty(operation.name) ? PRIORITIES[operation.name] : Infinity;
}

/**
 * Получить копию обьекта
 * @param {Array} collection
 * @returns {Array}
 */
function getDeepCopy(collection) {
    return JSON.parse(JSON.stringify(collection));
}

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...filters} – Функции для запроса
 * @returns {Array}
 */
exports.query = (collection, ...filters) => filters
    .sort((firstFunc, secondFunc) =>
        getOperationPriority(secondFunc) - getOperationPriority(firstFunc))
    .reduce((summary, delegate) => delegate(summary), getDeepCopy(collection));

/**
 * Выбор полей
 * @params {...fields}
 * @returns {Function}
 */
exports.select = (...fields) => function select(collection) {
    return collection.map(record => fields
        .reduce((filteredRecord, field) => {
            if (record.hasOwnProperty(field)) {
                filteredRecord[field] = record[field];
            }

            return filteredRecord;
        }, {})
    );
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function}
 */
exports.filterIn = (property, values) =>
    collection => collection.filter(record => values.includes(record[property]));

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = (property, order) =>
    collection => collection.sort(
        (record, other) => (record[property] > other[property] ? 1 : -1) * ORDER_TYPE[order]
    );

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Function}
 */
exports.format = (property, formatter) => function format(collection) {
    return collection.map(
        record => Object.assign(record, { property: formatter(record[property]) })
    );
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
 */
exports.limit = (count) => function limit(collection) {
    return collection.slice(0, count);
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...filters} – Фильтрующие функции
     * @returns {Function}
     */
    exports.or = (...filters) => collection => collection
        .filter(record => filters.some(filter => filter([record]).length > 0));

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...filters} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = (...filters) => collection => collection
        .filter(record => filters.every(filter => filter([record]).length > 0));
}
