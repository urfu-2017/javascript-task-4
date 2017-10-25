'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = false;

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    let functions = [].slice.call(arguments).slice(1);
    functions = handlingOfFunctions(functions);
    let resultCollection = collection.map(friend => Object.assign({}, friend));
    let properties = [];
    for (let _function of functions) {
        if (_function.name !== '_select') {
            resultCollection = _function(resultCollection);
        } else {
            let result = _function(resultCollection);
            resultCollection = result[0];
            properties = properties.concat(result[1]);
        }
    }
    for (let friend of resultCollection) {
        deleteUselessProperties(friend, properties);
    }

    return resultCollection;
};

function deleteUselessProperties(friend, properties) {
    properties = Array.from(new Set(properties));
    for (let property in friend) {
        if (properties.indexOf(property) === -1) {
            delete friend[property];
        }
    }
}

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function () {
    let argv = [].slice.call(arguments);

    return function _select(collection) {
        for (let friend of collection) {
            let count = 0;
            for (let property of Object.keys(friend)) {
                count += argv.includes(property);
            }
            if (count < argv.length) {
                collection.splice(collection.indexOf(friend), 1);
            }
        }

        return [collection, argv];
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function}
 */
exports.filterIn = function (property, values) {
    return function _filterIn(collection) {
        for (let friend of collection) {
            if ((values.indexOf(friend[property]) === -1)) {
                collection.splice(collection.indexOf(friend), 1);
            }
        }

        return collection;
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = function (property, order) {
    return function _sortBy(collection) {
        collection.sort(function (a, b) {
            let first = a[property];
            let second = b[property];

            if (first < second) {
                return -1;
            } else if (first > second) {
                return 1;
            }

            return 0;
        });
        if (order === 'desc') {
            collection.reverse();
        }

        return collection;
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Function}
 */
exports.format = function (property, formatter) {
    return function _format(collection) {
        for (let friend of collection) {
            if (Object.keys(friend).includes(property)) {
                friend[property] = formatter(friend[property]);
            }
        }

        return collection;
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
 */
exports.limit = function (count) {
    return function _limit(collection) {
        collection = collection.slice(0, count);

        return collection;
    };
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     */
    exports.or = function () {
        return;
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     */
    exports.and = function () {
        return;
    };
}

function handlingOfFunctions(functions) {
    let prioritiesOfFunctions = {
        '_filterIn': 1,
        '_sortBy': 2,
        '_select': 3,
        '_format': 4,
        '_limit': 5
    };
    functions.sort(function (a, b) {
        return prioritiesOfFunctions[a.name] - prioritiesOfFunctions[b.name];
    });

    return functions;
}
