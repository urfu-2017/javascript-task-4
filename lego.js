'use strict';

const SELECTORS_ORDER = {
    filterIn: 1,
    and: 2,
    or: 3,
    sortBy: 4,
    select: 5,
    limit: 6,
    format: 7
};

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
exports.query = (collection, ...selectors) =>
    selectors
        .sort((s1, s2) => SELECTORS_ORDER[s1.name] - SELECTORS_ORDER[s2.name])
        .reduce((result, selector) => selector(result), collection);

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = (...properties) =>
    function select(collection) {
        return collection.map(item =>
            properties.reduce((result, property) => {
                if (item[property] !== undefined) {
                    result[property] = item[property];
                }

                return result;
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
    function filterIn(collection) {
        return collection.filter(item => values.some(value => item[property] === value));
    };

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = (property, order) =>
    function sortBy(collection) {
        order = order === 'asc' ? 1 : -1;

        return collection.slice().sort((item1, item2) => {
            if (item1[property] === item2[property]) {
                return 0;
            }

            return item1[property] > item2[property] ? order : -order;
        });
    };

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Function}
 */
exports.format = (property, formatter) =>
    function format(collection) {
        return collection.map(item =>
            Object.assign({}, item, { [property]: formatter(item[property]) })
        );
    };

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
 */
exports.limit = count =>
    function limit(collection) {
        return collection.slice(0, count);
    };

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.or = (...selectors) =>
        function or(collection) {
            return collection.filter(item =>
                selectors.some(selector => selector([item]).length > 0)
            );
        };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = (...selectors) =>
        function or(collection) {
            return collection.filter(item =>
                selectors.every(selector => selector([item]).length > 0)
            );
        };
}
