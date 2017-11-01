'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;


/**
 * Выбор нужных свойств
 * @param {...String} properties
 * @param {Object} friend
 * @returns {Object}
 */
function pickProperties(properties, friend) {
    return properties.reduce(function (pickedProperties, property) {
        if (Reflect.has(friend, property)) {
            pickedProperties[property] = friend[property];
        }

        return pickedProperties;
    }, {});
}

/**
 * Сравнение функций
 * @param {Function} f1
 * @param {Function} f2
 * @returns {Number}
 */
function compareSelectors(f1, f2) {
    const FUNCTION_WEIGHT =
    { 'limit': 5, 'format': 4, 'select': 3, 'sortBy': 2, 'or': 1, 'and': 1, 'filterIn': 1 };

    return FUNCTION_WEIGHT[f1.name] - FUNCTION_WEIGHT[f2.name];
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...functions) {
    functions.sort(compareSelectors);
    let newCollection = collection.map(collectionItem => Object.assign({}, collectionItem));

    return functions.reduce(function (resultCollection, selector) {
        return selector(resultCollection);
    }, newCollection);
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function (...properties) {
    return function select(collection) {
        return collection.reduce(function (result, friend) {
            let friendProperties = pickProperties(properties, friend);
            if (Object.keys(friendProperties).length !== 0) {
                result.push(friendProperties);
            }

            return result;
        }, []);
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
        return collection.filter(obj => values.includes(obj[property]));
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
        return collection.sort(
            (f1, f2) => (order === 'asc' ? 1 : -1) * (f1[property] > f2[property] ? 1 : -1));
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
        return collection.map(function (friend) {
            friend[property] = formatter(friend[property]);

            return friend;
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

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.or = function (...functions) {
        return function or(collection) {
            return collection.filter(function (friend) {
                return functions.some(function (filterFunction) {
                    return filterFunction([friend]).length !== 0;
                });
            });
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = function (...functions) {
        return function or(collection) {
            return collection.filter(function (friend) {
                return functions.every(function (filterFunction) {
                    return filterFunction([friend]).length !== 0;
                });
            });
        };
    };
}
