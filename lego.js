'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;
const SELECTORS_PRIORITY = {
    filterIn: 1,
    and: 2,
    or: 3,
    sortBy: 4,
    select: 5,
    limit: 6,
    format: 7
};

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = (collection, ...selectors) =>
    selectors
        .sort((item1, item2) => SELECTORS_PRIORITY[item1.name] - SELECTORS_PRIORITY[item2.name])
        .reduce((result, selector) => selector(result), collection);

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = (...properties) =>
    function select(collection) {
        return collection.map((item) => {
            let res = {};
            Object.keys(item)
                .filter((key) => properties.some((property) => key === property))
                .forEach(function (key) {
                    res[key] = item[key];
                });

            return res;
        });
    };

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function}
 */
exports.filterIn = (property, values) =>
    function filterIn(collection) {
        return collection
            .filter(
                (men) => values
                    .some((value) => men[property] === value));
    };

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = (property, order) =>
    function sortBy(collection) {
        let ordered = order === 'asc' ? 1 : -1;

        return collection
            .slice()
            .sort((one, two) => {
                if (one[property] === two[property]) {
                    return 0;
                }

                return one[property] > two[property] ? ordered : -ordered;
            }
            );
    };

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Function}
 */
exports.format = (property, formatter) =>
    function format(collection) {
        return collection
            .map((item) =>
                Object.assign({}, item, { [property]: formatter(item[property]) })
            );
    };

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
 */
exports.limit = (count) =>
    function limit(collection) {
        return collection.slice().splice(0, count);
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
                selectors.some(selector => selector([item]).length > 0));
        };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = (...selectors) =>
        function and(collection) {
            return collection.filter(item =>
                selectors.every(selector => selector([item]).length > 0));
        };
}
