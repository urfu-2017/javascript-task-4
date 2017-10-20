'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    collection = collection.slice();
    let methods = Array.from(arguments).slice(1);
    for (let method of methods.sort((a, b) => {
        return a.priority - b.priority;
    })) {
        collection = method.action(collection);
    }

    return collection;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {{Function, Number}}
 */
exports.select = function () {
    let selectedFields = Array.from(arguments);

    return {
        action:
            function (collection) {
                return collection.map(oldElement => {
                    let element = {};
                    for (let field of selectedFields) {
                        if (field in oldElement) {
                            element[field] = oldElement[field];
                        }
                    }

                    return element;
                });
            },
        priority: 1
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {{Function, Number}}
 */
exports.filterIn = function (property, values) {
    return {
        action:
            function (collection) {
                return collection.filter(element => {
                    return values.indexOf(element[property]) !== -1;
                });
            },
        priority: 0
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {{Function, Number}}
 */
exports.sortBy = function (property, order) {
    let sign = (order === 'asc') ? 1 : -1;

    return {
        action:
            function (collection) {
                return collection.sort((a, b) => {
                    if (a[property] < b[property]) {
                        return -sign;
                    }
                    if (a[property] > b[property]) {
                        return sign;
                    }

                    return 0;
                });
            },
        priority: 0
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {{Function, Number}}
 */
exports.format = function (property, formatter) {
    return {
        action:
            function (collection) {
                return collection.map(oldElement => {
                    let element = Object.assign({}, oldElement);
                    element[property] = formatter(element[property]);

                    return element;
                });
            },
        priority: 2
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {{Function, Number}}
 */
exports.limit = function (count) {
    return {
        action:
            function (collection) {
                return collection.slice(0, count);
            },
        priority: 2
    };
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {{Function, Number}}
     */
    exports.or = function () {
        let methods = Array.from(arguments);

        return {
            action:
                function (collection) {

                    return collection.filter(element => {
                        for (let method of methods) {
                            if (method.action(collection).indexOf(element) !== -1) {
                                return true;
                            }
                        }

                        return false;
                    });
                },
            priority: 0
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {{Function, Number}}
     */
    exports.and = function () {
        let methods = Array.from(arguments);

        return {
            action:
                function (collection) {

                    return collection.filter(element => {
                        for (let method of methods) {
                            if (method.action(collection).indexOf(element) === -1) {
                                return false;
                            }
                        }

                        return true;
                    });
                },
            priority: 0
        };
    };
}
