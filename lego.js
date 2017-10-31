'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

let FUNC_PRIORITETS = {
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
exports.query = function (collection) {
    let funcs = [...arguments].slice(1);
    funcs = funcs.sort((a, b) => FUNC_PRIORITETS[b.name] - FUNC_PRIORITETS[a.name]);
    let newCollection = createObjectCopy(collection);
    for (let func of funcs) {
        newCollection = func(newCollection);
    }

    return newCollection;
};

function createObjectCopy(object) {
    return JSON.parse(JSON.stringify(object));
}

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function () {
    let fields = [...arguments];

    return function select(collection) {
        return collection.map(element => {
            let newElement = {};
            for (let arg of fields) {
                if (arg in element) {
                    newElement[arg] = element[arg];
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
        return collection.map(el => {
            let newElem = createObjectCopy(el);
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
    exports.or = function () {
        let filters = [...arguments];

        return function or(collection) {
            return collection.filter(el => filters.some(filter => filter([el]).includes(el)));
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = function () {
        let filters = [...arguments];

        return function and(collection) {
            let newCollection = collection;
            for (let filter of filters) {
                newCollection = filter(newCollection);
            }

            return newCollection;
        };
    };
}
