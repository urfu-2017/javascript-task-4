'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

let FUNC_PRIORS = {
    'format': 0,
    'limit': 0,
    'select': 2,
    'sortBy': 5,
    'filterIn': 10,
    'or': 10,
    'and': 10
};

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...funcs) {
    funcs = funcs.sort(compareFunctionsByPriority);
    let newCollection = createObjectCopy(collection);

    return funcs.reduce((prev, func) => func(prev), newCollection);
};

function compareFunctionsByPriority(function1, function2) {
    return FUNC_PRIORS[function2.name] - FUNC_PRIORS[function1.name];
}

function createObjectCopy(object) {
    return JSON.parse(JSON.stringify(object));
}

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function (...fields) {
    return function select(collection) {
        return collection.map(element => {
            let newElement = {};
            for (let field of fields) {
                if (element.hasOwnProperty(field)) {
                    newElement[field] = element[field];
                }
            }

            return newElement;
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
        return collection.filter(elem => values.includes(elem[property]));
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
        return collection.sort(createComparatorByProperty(property, order));
    };
};

function createComparatorByProperty(property, order) {
    return function (a, b) {
        let invertor = order === 'asc' ? 1 : -1;
        let compare = a[property] <= b[property] ? -1 : 1;

        return invertor * compare;
    };
}

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Function}
 */
exports.format = function (property, formatter) {
    return function format(collection) {
        return collection.map(elem => {
            let newElem = createObjectCopy(elem);
            newElem[property] = formatter(newElem[property]);

            return newElem;
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
    exports.or = function (...filters) {
        return function or(collection) {
            return collection.filter(
                elem => filters.some(
                    filter => filter([elem]).length === 1
                )
            );
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = function (...filters) {
        return function and(collection) {
            return filters.reduce((prev, filter) => filter(prev), collection);
        };
    };
}
