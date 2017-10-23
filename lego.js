'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

const FUNCTIONS_ORDER = {
    or: 1,
    and: 1,
    filterIn: 1,
    sortBy: 1,
    select: 2,
    limit: 3,
    format: 3
};

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    let functions = Array.from(arguments).slice(1)
        .sort((a, b) => FUNCTIONS_ORDER[a.name] - FUNCTIONS_ORDER[b.name]);
    let result = collection.slice();
    for (let func of functions) {
        result = func(result);
    }

    return result;

};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function (...fields) {
    function getNewPerson(person) {
        let newPerson = {};
        for (let field of fields) {
            if (Object.keys(person).includes(field)) {
                newPerson[field] = person[field];
            }
        }

        return newPerson;
    }

    return function select(collection) {
        let result = [];
        for (let person of collection) {
            result.push(getNewPerson(person));
        }

        return result;
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function}
 */
exports.filterIn = function (property, values) {
    console.info(property, values);

    return function filterIn(collection) {
        return collection.slice()
            .filter(person => values.includes(person[property]));
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = function (property, order) {
    console.info(property, order);
    const signToNum = {
        asc: 1,
        desc: -1
    };
    let sign = signToNum[order];
    if (!sign) {
        throw new RangeError('Order is invalid');
    }

    return function sortBy(collection) {
        return collection.slice()
            .sort((a, b) => {
                let first = a[property];
                let second = b[property];
                if (first < second) {
                    return -sign;
                }
                if (first > second) {
                    return sign;
                }

                return 0;
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
    console.info(property, formatter);

    return function format(collection) {
        let result = collection.slice();
        for (let person of result) {
            person[property] = formatter(person[property]);
        }

        return result;
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
 */
exports.limit = function (count) {
    console.info(count);

    return function limit(collection) {
        return collection.slice(0, count);
    };
};

function peopleAreEqual(person1, person2) {
    return person1.name === person2.name &&
        person1.phone === person2.phone &&
        person1.email === person2.email;
}

function arrayIncludesObject(array, obj) {
    for (let item of array) {
        if (peopleAreEqual(item, obj)) {
            return true;
        }
    }

    return false;
}

function allArraysIncludeObject(arrays, obj) {
    for (let array of arrays) {
        if (!arrayIncludesObject(array, obj)) {
            return false;
        }
    }

    return true;
}

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.or = function (...funcs) {

        /**
         * Функция, добавляющая obj в array, если он там ещё не содержится
         * @param {Array} array
         * @param {Object} obj
         */
        function addUniqueElement(array, obj) {
            if (!arrayIncludesObject(array, obj)) {
                array.push(obj);
            }
        }

        return function or(collection) {
            let copy = collection.slice();
            let collections = funcs.map(func => func(copy));
            let result = [];
            for (let arg of collections) {
                for (let person of arg) {
                    addUniqueElement(result, person);
                }
            }

            return result;
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = function (...funcs) {

        /**
         * Функция, добавляющая в result объект obj,
         * если он содержится во всех подмассивах массива sources
         * @param {Array} result
         * @param {Object} obj
         * @param {Array} sources
         */
        function addElementFromAllArrays(result, obj, sources) {
            if (!arrayIncludesObject(result, obj) &&
                allArraysIncludeObject(sources, obj)) {
                result.push(obj);
            }
        }

        return function and(collection) {
            let copy = collection.slice();
            let tempResults = funcs.map(func => func(copy));
            let result = [];
            for (let tempResult of tempResults) {
                for (let person of tempResult) {
                    addElementFromAllArrays(result, person, tempResults);
                }
            }

            return result;
        };
    };
}
