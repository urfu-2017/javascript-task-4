'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

const PRIORITY_OF_METHODS = {
    and: 0,
    or: 1,
    filterIn: 2,
    sortBy: 3,
    select: 4,
    limit: 5,
    format: 6
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
 * @params {...methods} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...methods) {
    let collectionCopy = copy(collection);
    for (let foo of methods.sort(sortMethods)) {
        collectionCopy = foo(collectionCopy);
    }

    return collectionCopy;
};

/**
 * Содержит ли массив часть
 * @param {Array} arr - массив
 * @param {Array} part - часть (элемент)
 * @returns {Boolean} - содержится ли часть в массиве
 */
function isContain(arr, part) {

    return arr.indexOf(part) !== -1;
}

/**
 * Выбор полей
 * @params {...String} - Поля
 * @returns {Function}
 */
exports.select = function (...properties) {

    return function select(collection) {
        let collectionCopy = copy(collection);

        return collectionCopy.map(object => {
            let newObject = {};
            for (let key in object) {
                if (isContain(properties, key)) {
                    newObject[key] = object[key];
                }
            }

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

        return collection.filter(part => {
            let propertyName = part[property];

            return isContain(values, propertyName);
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
        let collectionCopy = copy(collection);

        return collectionCopy.sort((a, b) => {

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
        let collectionCopy = copy(collection);

        return collectionCopy.map(part => {
            part[property] = formatter(part[property]);

            return part;
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
 * @param {Object} part - элемент
 * @param {Function} filter - фильтр
 * @returns {Boolean}
 */
function isPartRemainAfterFilter(part, filter) {

    return filter([part]).length !== 0;
}

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function} оставляет элементы, пошедшие хотя бы через один фильтр
     */
    exports.or = function (...filtersIn) {

        return function or(collection) {

            return collection.filter(part => {
                for (let filter of filtersIn) {
                    if (isPartRemainAfterFilter(part, filter)) { // элемент остался после фильтра
                        return true;
                    }
                }

                return false;
            });
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function} оставляет элементы, которые остались после всех фильтров
     */
    exports.and = function (...filtersIn) {

        return function and(collection) {

            return collection.filter(part => {
                for (let filter of filtersIn) {
                    if (!isPartRemainAfterFilter(part, filter)) { // элемент изчез после фильтра
                        return false;
                    }
                }

                return true;
            });
        };
    };
}
