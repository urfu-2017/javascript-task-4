'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;


const DELEGATES_PRIORITIES = {
    and: 0,
    or: 0,
    filterIn: 0,
    sortBy: 1,
    select: 2,
    limit: 3,
    format: 3
};

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...delegates) {
    return delegates
        .sort((a, b) => DELEGATES_PRIORITIES[a.name] - DELEGATES_PRIORITIES[b.name])
        .reduce((acc, delegate) => delegate(acc), collection);
};


/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = (...properties) => function select(collection) {
    return collection.map(
        item => {
            const obj = {};
            properties
                .filter(prop => item.hasOwnProperty(prop))
                .forEach(prop => {
                    obj[prop] = item[prop];
                });

            return obj;
        }
    );
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
  * @returns {Function}
 */
exports.filterIn = (property, values) => function filterIn(collection) {
    return collection.filter(
        item => values.includes(item[property])
    );
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = (property, order) => function sortBy(collection) {
    const orderSignum = { asc: 1, desc: -1 }[order];

    return [...collection].sort(
        (item1, item2) => {
            let [prop1, prop2] = [item1[property], item2[property]];
            if (prop1 === prop2) {
                return 0;
            }

            return (prop1 > prop2 || -1) * orderSignum;
        }
    );
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Function}
 */
exports.format = (property, formatter) => function format(collection) {
    return collection.map(
        item => {
            let obj = {};
            Object.assign(obj, item);
            obj[property] = formatter(obj[property]);

            return obj;
        }
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
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.or = (...filters) => function or(collection) {
        const filtered = new Set();
        filters.forEach(
            f => f(collection)
                .forEach(item => filtered.add(item))
        );

        return [...filtered];
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = (...filters) => function and(collection) {
        const filtered = filters
            .map(f => new Set(f(collection)))
            .reduce((acc, current) => {
                return acc &&
                    new Set([...current].filter(i => acc.has(i))) ||
                    new Set(current);
            }, undefined);

        return [...filtered];
    };
}
