'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

const PRIORITY_OF_METHODS = {
    and: 0,
    or: 0,
    filterIn: 1,
    sortBy: 2,
    select: 3,
    limit: 4,
    format: 5
};

/**
 * Задает порядок для сортировки методов 
 * @param {Array} meth1 - методы1
 * @param {Array} meth2 - метод2
 * @returns {Array}
 */
function sortMethods(meth1, meth2) {

    return PRIORITY_OF_METHODS[meth1.name] - PRIORITY_OF_METHODS[meth2.name];
}

/**
 * Копирование объекта (коллекции)
 * @param {Object} object - коллекция
 * @returns {Object} - копия
 */
function copy(object) {

    return JSON.parse(JSON.stringify(object));
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @param {Array} methods – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...methods) {
    let collectionCopy = copy(collection);
    for (let meth of methods.sort(sortMethods)) {
        collectionCopy = meth(collectionCopy);
    }

    return collectionCopy;
};

/**
 * Содержит ли массив элемент
 * @param {Array} arr - массив
 * @param {Array} item - элемент
 * @returns {Boolean} - содержится ли элемент в массиве
 */
function contains(arr, item) {

    return arr.indexOf(item) !== -1;
}

/**
 * Выбор полей
 * @param {Array} properties - Поля
 * @returns {Function}
 */
exports.select = function (...properties) {

    return function select(collection) {

        return copy(collection).map(object => {
            let newObject = {};
            properties.forEach(prop => {
                if (object.hasOwnProperty(prop)) {
                    newObject[prop] = object[prop];
                }
            });

            return newObject;
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

        return copy(collection).filter(item => {

            return contains(values, item[property]);
        });
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

        return copy(collection).sort((a, b) => {

            return (order === 'asc') ? a[property] > b[property] : b[property] > a[property];
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

    return function format(collection) {

        return copy(collection).map(item => {
            item[property] = formatter(item[property]);

            return item;
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

/**
 * Остался ли элемент в коллекции после применения фильтра
 * @param {Object} item - элемент
 * @param {Function} filter - фильтр
 * @returns {Boolean}
 */
function isitemRemainAfterFilter(item, filter) {

    return filter([item]).length !== 0;
}

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @param {Array} filtersIn – Фильтрующие функции
     * @returns {Function} оставляет элементы, прошедшие хотя бы через один фильтр
     */
    exports.or = function (...filtersIn) {

        return function or(collection) {

            return collection.filter(item => {

                return filtersIn.some(filter => {

                    return isitemRemainAfterFilter(item, filter);
                });
            });
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @param {Array} filtersIn – Фильтрующие функции
     * @returns {Function} оставляет элементы, которые остались после всех фильтров
     */
    exports.and = function (...filtersIn) {

        return function and(collection) {

            return collection.filter(item => {

                return filtersIn.every(filter => {

                    return isitemRemainAfterFilter(item, filter);
                });
            });
        };
    };
}
