'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

function clone(obj) {
    return Object.keys(obj).reduce(
        (newObj, property) => {
            if (typeof obj[property] == 'object') {
                newObj[property] = clone(obj[property]);
            } else {
                newObj[property] = obj[property];
            }

            return newObj;
        }, {});
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    var priority = {
        'and': 1,
        'or': 2,
        'filterIn': 3,
        'sortBy': 4,
        'select': 5,
        'limit': 6,
        'format': 7,
    };
    var copiedCollection = collection.map(x => clone(x));
    [].slice.call(arguments, 1)
        .sort((a, b) => priority[a.name] > priority[b.name])
        .forEach(f => copiedCollection = f(copiedCollection));

    return copiedCollection;
};

/**
 * Выбор полей
 * @params {...String}
 */
exports.select = function () {
    var selectors = [].slice.call(arguments);
    return function select(collection) {
        return collection.map(
            elem => selectors.reduce(
                (result, selector) => {
                    if (elem.hasOwnProperty(selector)) {
                        result[selector] = elem[selector]
                    }
                    return result;
                }, {}));
    }};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 */
exports.filterIn = function (property, values) {
    return function filterIn(collection) {
        return collection.filter(
            elem => values.indexOf(elem[property]) !== -1);
    }};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 */
exports.sortBy = function (property, order) {
    return function sortBy(collection) {
        return collection.sort((a, b) =>
        (a[property] > b[property]) && (order === "asc") ||
        (a[property] < b[property]) && (order === "desc"));
    }};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 */
exports.format = function (property, formatter) {
    return function format(collection) {
        return collection.map(
            elem => {
                elem[property] = formatter(elem[property]);
                return elem;
            });};
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 */
exports.limit = function (count) {
    return function limit(collection){
        return collection.slice(0, count);}
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     */
    exports.or = function () {
        var functions = [].slice.call(arguments);
        return function or(collection) {
            return collection.filter(
                    elem => functions.some(
                        f => f(collection).indexOf(elem) !== -1));
        }};

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     */
    exports.and = function () {
        var functions = [].slice.call(arguments);
        return function and(collection) {
            return collection.filter(
                elem => functions.every(
                    f => f(collection).indexOf(elem) !== -1));
        }};
}
