'use strict';

function Query(name, priority, params, handler) {
    this.name = name;
    this.priority = priority;
    this.params = params;
    this.handler = handler;
    this.execute = (collection) => this.handler(collection, this.params);
}

/**
 * Количество одинаковых объектов в коллекции
 * @param {Object} element
 * @param {Array} collection
 * @returns {Number}
 */
function count(element, collection) {
    return collection.reduce((prev, curr) => prev + Number(equals(element, curr)), 0);
}

function equals(obj1, obj2) {
    const [keys1, keys2] = [Object.keys(obj1), Object.keys(obj2)];

    return keys1.length === keys2.length &&
        keys1.every(key => keys2.includes(key) && obj1[key] === obj2[key]);
}

function compareObjectsBy(key) {
    return (obj1, obj2) => {
        [obj1, obj2] = [obj1[key], obj2[key]];

        if (typeof obj1 === 'number' && typeof obj2 === 'number') {
            return obj1 - obj2;
        }

        return obj1.localeCompare(obj2);
    };
}

function selectQueriesUnion(selectQueries) {
    let fields = [...new Set(selectQueries.reduce((prev, cur) => prev.concat(cur.params), []))];

    return exports.select(...fields);
}

function select(collection, fields) {
    return collection.map(obj => {
        let newObj = {};

        for (const key of Object.keys(obj)) {
            if (fields.includes(key)) {
                newObj[key] = obj[key];
            }
        }

        return newObj;
    });
}

function filterIn(collection, [property, values]) {
    return collection.filter(obj => values.includes(obj[property]));
}

function sortBy(collection, [property, order]) {
    return order === 'asc'
        ? collection.sort(compareObjectsBy(property))
        : collection.sort(compareObjectsBy(property)).reverse();
}

function format(collection, [property, formatter]) {
    return collection.map(obj => {
        if (Object.keys(obj).includes(property)) {
            obj = Object.assign(obj);
            obj[property] = formatter(obj[property]);
        }

        return obj;
    });
}

function limit(collection, max) {
    return collection.slice(0, max);
}

function or(collection, filters) {
    let result = filters.reduce(
        (elements, filter) => elements.concat(filter.execute(collection)),
        []
    );

    return result.filter(elem => count(elem, result) === 1);
}

function and(collection, filters) {
    return filters.reduce((coll, filter) => filter.execute(coll), collection);
}

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Query} – Запросы
 * @returns {Array}
 */
exports.query = function (collection, ...queries) {
    const selectQueries = queries.filter(query => query.name === 'select');
    const selectQuery = selectQueriesUnion(selectQueries);
    queries = queries.filter(query => query.name !== 'select');

    queries.push(selectQuery);
    queries.sort((query1, query2) => query1.priority - query2.priority);

    return queries.reduce((coll, query) => query.execute(coll), collection);
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Object} - запрос
 */
exports.select = function (...fields) {
    return new Query('select', 3, fields, select);
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Object} - запрос
 */
exports.filterIn = function (property, values) {
    return new Query('filterIn', 1, [property, values], filterIn);
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Object} - запрос
 */
exports.sortBy = function (property, order) {
    return new Query('sortBy', 2, [property, order], sortBy);
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Object} - запрос
 */
exports.format = function (property, formatter) {
    return new Query('format', 4, [property, formatter], format);
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} max – Максимальное количество элементов
 * @returns {Object} - запрос
 */
exports.limit = function (max) {
    return new Query('limit', 5, max, limit);
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Object} - запрос
     */
    exports.or = function (...filters) {
        return new Query('or', 0, filters, or);
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Object} - запрос
     */
    exports.and = function (...filters) {
        return new Query('and', 0, filters, and);
    };
}
