'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = false;

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @param {...Function} functions – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...functions) {
    if (functions.length === 0) {
        return collection;
    }

    functions.sort((first, second) => first.priority - second.priority);

    for (let func of functions) {
        collection = func(collection);
    }

    return collection;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function (...fields) {
    let selector = collection => collection.reduce((acc, object) => {
        let strippedObject = {};

        for (let field of fields) {
            if (field in object) {
                strippedObject[field] = object[field];
            }
        }
        acc.push(strippedObject);

        return acc;
    }, []);
    selector.priority = 2;

    return selector;
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function} – Фильтрующая функция
 */
exports.filterIn = function (property, values) {
    let filter = collection => collection.filter(object => values.includes(object[property]));
    filter.priority = 0;

    return filter;
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function} – Сортирующая функция
 */
exports.sortBy = function (property, order) {
    let sorter = collection => collection.slice(0).sort((first, second) => {
        if (first[property] > second[property]) {
            return order === 'asc' ? 1 : -1;
        }
        if (first[property] < second[property]) {
            return order === 'asc' ? -1 : 1;
        }

        return 0;
    });
    sorter.priority = 1;

    return sorter;
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} propertyFormatter – Функция для форматирования
 * @returns {Function} – Функция применяющая форматирование к полям объектов коллекции
 */
exports.format = function (property, propertyFormatter) {
    let formatter = collection => collection.map(object => {
        object[property] = propertyFormatter(object[property]);

        return object;
    });
    formatter.priority = 4;

    return formatter;
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function} – Функция лимитирующая выдачу объектов
 */
exports.limit = function (count) {
    let limiter = collection => collection.slice(0, count > 0 ? count : 0);
    limiter.priority = 3;

    return limiter;
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @param {...Function} filters – Фильтрующие функции
     * @returns {Function} – Функция выдающая объединение результатов переданных функций-фильтров
     */
    exports.or = function (...filters) {
        let combiner = collection => collection.filter(object => filters.some(
            filter => filter(collection).includes(object))
        );
        combiner.priority = 0;

        return combiner;
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @param {...Function} filters – Фильтрующие функции
     * @returns {Function} – Функция выдающая пересечение результатов переданных функций-фильтров
     */
    exports.and = function (...filters) {
        let intersector = collection => collection.filter(object => filters.every(
            filter => filter(collection).includes(object)
        ));
        intersector.priority = 0;

        return intersector;
    };
}
