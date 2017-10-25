'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

const PRIORITY_LIST = {
    select : 1,
    filterIn : 0,
    sortBy : 1,
    format : 2,
    limit : 2,
    or : 0,
    and : 0
} 

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...functions) {
    let copyCollection = getCopy(collection);
    functions = functions.sort((a, b) => PRIORITY_LIST[a.name]-PRIORITY_LIST[b.name]);
    for (const element of functions) {
        copyCollection = element(copyCollection);
    }

    return copyCollection
};


function getCopy(collection) {
    return JSON.parse(JSON.stringify(object));
}

/**
 * Выбор полей
 * @params {...String}
 */
exports.select = function (...fields) {
    return function select(collection) {
        return collection.map(element => {
            let newElement = {};
            for (const field of Object.keys(element)) {
                if (fiels.includes(field)){
                    newElement[field] = element[field];
                }
            }

            return newElement
        });
    };
    
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 */
exports.filterIn = function (property, values) {
    return function filterIn(collection){
        return collection.filterIn(element => values.includes(element[property]))};
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 */
exports.sortBy = function (property, order) {
    return function sortBy(collection) {
        copyCollection = getCopy(collection);
        return copyCollection.sort((a, b) => {
            if (a[property] > b[property]) {
                return 1;
            }
            if (a[property] < b[property]) {
                return -1;
            }
            
            return 0;
        });
        if (order === 'asc') {
            return copyCollection;
        }

        return copyCollection.reverse();
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 */
exports.format = function (property, formatter) {
    return function format(collection) {
        collection.forEach((element) => {
            element[property] = formatter(element[property]);
        });
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
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
     */
    exports.or = function (...functions) {
        return function or(collection) {
            return colection.filter(el => functions.some(func => func([el]).length > 0));
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     */
    exports.and = function (...functions) {
        return function and(collection) {
            return function or(collection) {
                return colection.filter(el => functions.every(func => func([el]).length > 0));
            };
        };
    };
}
