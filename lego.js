'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;


const copy = function copyColl(coll) {
    return JSON.parse(JSON.stringify(coll));
};

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Array} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...funcs) {
    let localCollection = copy(collection);

    let commonParams = funcs.filter((func) => func.name === 'select')
        .reduce(function (acc, item) {
            return acc.concat(item.params || []);
        }, []);

    funcs.filter(function (func) {
        return 'priority' in func;
    })
        .sort(function (func1, func2) {
            return func1.priority > func2.priority;
        })
        .forEach(function (func) {
            if (func.name === 'select' && commonParams.length !== 0) {
                localCollection = func.func(localCollection, commonParams);
            } else {
                localCollection = func.func(localCollection);
            }
        });

    return localCollection;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Object}
 */
exports.select = function select(...fields) {
    let slct = (coll, commonFields) => {
        let copyColl = copy(coll);

        return copyColl.map(function (item) {
            let newItem = {};
            commonFields.forEach((field) => {
                if (field in item) {
                    newItem[field] = item[field];
                }
            });

            return newItem;
        });
    };

    return { name: 'select', priority: 5, func: slct, params: fields };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Object}
 */
exports.filterIn = function (property, values) {
    let fltr = (coll) => {
        let copyColl = copy(coll);

        return copyColl.filter((friend) => {
            return values.some((prop) => {
                if (property in friend) {
                    return prop === friend[property];
                }

                return false;
            });
        });
    };

    return { name: 'filterIn', priority: 3, func: fltr };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Object}
 */
exports.sortBy = function (property, order) {
    let srt = (coll) => {
        let copyColl = copy(coll);
        if (order === 'asc') {
            return copyColl.sort((fr1, fr2) => fr1[property] > fr2[property]);
        }

        return copyColl.sort((fr1, fr2) => fr1[property] < fr2[property]);
    };

    return { name: 'sortBy', priority: 4, func: srt };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Object}
 */
exports.format = function (property, formatter) {
    let frm = (coll) => {
        let copyColl = copy(coll);

        return copyColl.map((friend) => {
            if (property in friend) {
                friend[property] = formatter(friend[property]);
            }

            return friend;
        });
    };

    return { name: 'format', priority: 6, func: frm };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Object}
 */
exports.limit = function (count) {
    let cnt = (coll) => {
        let copyColl = copy(coll);

        return copyColl.splice(0, count);
    };

    return { name: 'limit', priority: 7, func: cnt };
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Object}
     */
    exports.or = function (...funcs) {
        let orFunc = (coll) => {
            let copyColl = copy(coll);
            funcs = funcs.reduce(function (acc, item) {
                return acc.concat(item.func(copyColl) || []);
            }, []);

            return funcs.length === 0 ? copyColl : funcs;
        };

        return { name: 'or', priority: 1, func: orFunc };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Object}
     */
    exports.and = function (...funcs) {
        let andFunc = (coll) => {
            let copyColl = copy(coll);
            funcs.forEach(function (func) {
                copyColl = func.func(copyColl);
            });

            return copyColl;
        };

        return { name: 'and', priority: 2, func: andFunc };
    };
}

