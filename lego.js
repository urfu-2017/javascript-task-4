'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

let priority = {
    'and': 0,
    'or': 1,
    'filterIn': 2,
    'sortBy': 3,
    'select': 4,
    'limit': 5,
    'format': 6
};

function sortMethods(methods) {
    return methods.sort(function (methodOne, methodTwo) {
        return priority[methodOne.name] - priority[methodTwo.name];
    });
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    let copiedCollection = JSON.parse(JSON.stringify(collection));

    let methods = [].slice.call(arguments, 1);
    let sortedMethods = sortMethods(methods);

    sortedMethods.forEach(function (method) {
        copiedCollection = method(copiedCollection);
    });

    return copiedCollection;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function} - Функция, выбирающая поля
 */
exports.select = function () {
    let args = [].slice.call(arguments);

    return function select(collection) {
        collection.forEach(function (person) {
            let personArgs = Object.keys(person);

            personArgs.forEach(function (arg) {
                if (args.indexOf(arg) === -1) {
                    delete person[arg];
                }
            });
        });

        return collection;
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function} - Функция, фильтрующая поля по массиву значений
 */
exports.filterIn = function (property, values) {
    return function filterIn(collection) {
        return collection.filter(function (person) {
            return values.indexOf(person[property]) !== -1;
        });
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function} - Функция, сортирующая коллекцию по полю
 */
exports.sortBy = function (property, order) {
    return function sortBy(collection) {
        return collection.sort(function (personOne, personTwo) {
            let propertyOne = personOne[property];
            let propertyTwo = personTwo[property];

            if (propertyOne === propertyTwo) {
                return 0;
            }

            let propertyOrder = propertyOne > propertyTwo ? 1 : -1;

            return order === 'asc' ? propertyOrder : -propertyOrder;
        });
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Function} - Функция, форматирующая поля
 */
exports.format = function (property, formatter) {
    return function format(collection) {
        collection.forEach(function (person) {
            person[property] = formatter(person[property]);
        });

        return collection;
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function} - Функция, ограничивающая количество элементов
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
     * @returns {Function} - Функция, объединяющая фильтрующие функции
     */
    exports.or = function () {
        let methods = [].slice.call(arguments);

        return function or(collection) {
            return collection.filter(function (person) {
                return methods.some(function (method) {
                    return method(collection).indexOf(person) !== -1;
                });
            });
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function} - Функция, объединяющая фильтрующие функции
     */
    exports.and = function () {
        let methods = [].slice.call(arguments);

        return function and(collection) {
            return collection.filter(function (person) {
                return methods.every(function (method) {
                    return method(collection).indexOf(person) !== -1;
                });
            });
        };
    };
}
