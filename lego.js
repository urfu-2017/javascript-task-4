'use strict';

const QUERIES_PRIORITY = {
    'and': 1,
    'or': 2,
    'filterIn': 3,
    'sortBy': 4,
    'select': 5,
    'format': 6,
    'limit': 7
};

function copy(collection) {
    return collection.map(elem => Object.assign({}, elem));
}

function compareObjectsBy(key) {
    return (obj1, obj2) => {
        [obj1, obj2] = [obj1[key], obj2[key]];

        if (obj1 > obj2) {
            return 1;
        }

        if (obj1 < obj2) {
            return -1;
        }

        return 0;
    };
}

function uniteSelectQueries(selectQueries) {
    let fields = [...new Set(selectQueries.reduce((prev, cur) => prev.concat(cur.params), []))];

    return exports.select(...fields);
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
exports.query = (collection, ...queries) => {
    collection = copy(collection);
    const selectQueries = queries.filter(query => query.name === 'select');

    if (selectQueries.length > 1) {
        const selectQuery = uniteSelectQueries(selectQueries);
        queries = queries.filter(query => query.name !== 'select');

        queries.push(selectQuery);
    }

    queries.sort((q1, q2) => QUERIES_PRIORITY[q1.name] - QUERIES_PRIORITY[q2.name]);

    return queries.reduce((coll, query) => query(coll), collection);
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = (...fields) => {
    const func = function select(collection) {
        return collection.map(obj => {
            let newObj = {};

            for (const key of Object.keys(obj)) {
                if (fields.includes(key)) {
                    newObj[key] = obj[key];
                }
            }

            return newObj;
        });
    };

    func.params = fields;

    return func;
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function}
 */
exports.filterIn = (property, values) => {
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
exports.sortBy = (property, order) => {
    return function sortBy(collection) {
        return order === 'asc'
            ? collection.sort(compareObjectsBy(property))
            : collection.sort(compareObjectsBy(property)).reverse();
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Function}
 */
exports.format = (property, formatter) => {
    return function format(collection) {
        return collection.map(obj => {
            if (Object.keys(obj).includes(property)) {
                obj[property] = formatter(obj[property]);
            }

            return obj;
        });
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} max – Максимальное количество элементов
 * @returns {Function}
 */
exports.limit = (max) => {
    return function limit(collection) {
        return collection.slice(0, max);
    };
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.or = (...filters) => {
        return function or(collection) {
            return collection.filter(elem => filters.some(ft => ft(collection).includes(elem)));
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = (...filters) => {
        return function and(collection) {
            return collection.filter(elem => filters.every(ft => ft(collection).includes(elem)));
        };
    };
}
