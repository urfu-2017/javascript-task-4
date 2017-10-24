'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

const FUNCTIONS_ORDER = {
    or: 1,
    and: 1,
    filterIn: 1,
    sortBy: 1,
    select: 2,
    limit: 3,
    format: 3
};

function getCollectionCopy(collection) {
    return JSON.parse(JSON.stringify(collection));
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} ...functions – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...functions) {
    functions = functions.sort((a, b) => FUNCTIONS_ORDER[a.name] - FUNCTIONS_ORDER[b.name]);
    let copy = getCollectionCopy(collection);

    return functions.reduce((result, func) => func(result), copy);
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function (...fields) {
    function getNewPerson(person) {
        let newPerson = {};
        for (let property of Object.keys(person)) {
            if (fields.includes(property)) {
                newPerson[property] = person[property];
            }
        }

        return newPerson;
    }

    return function select(collection) {
        return getCollectionCopy(collection).map(getNewPerson);
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function}
 */
exports.filterIn = function (property, values) {
    console.info(property, values);

    return function filterIn(collection) {
        return getCollectionCopy(collection)
            .filter(person => values.includes(person[property]));
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = function (property, order) {
    console.info(property, order);
    const signToNum = {
        asc: 1,
        desc: -1
    };
    let sign = signToNum[order];

    return function sortBy(collection) {
        return getCollectionCopy(collection)
            .sort((a, b) => {
                let first = a[property];
                let second = b[property];
                if (first < second) {
                    return -sign;
                }
                if (first > second) {
                    return sign;
                }

                return 0;
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
    console.info(property, formatter);

    return function format(collection) {
        let result = getCollectionCopy(collection);
        result.forEach(person => {
            person[property] = formatter(person[property]);
        });

        return result;
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
 */
exports.limit = function (count) {
    console.info(count);

    return function limit(collection) {
        return getCollectionCopy(collection).slice(0, count);
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
            let copy = getCollectionCopy(collection);

            return copy.filter(item => funcs.some(func => Boolean(func([item]).length)));
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
            let copy = getCollectionCopy(collection);

            return copy.filter(item => funcs.every(func => Boolean(func([item]).length)));
        };
    };
}
