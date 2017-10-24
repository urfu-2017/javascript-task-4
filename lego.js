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
exports.query = function (collection, ...selectors) {
    selectors.sort((a, b) => a.priority > b.priority ? 1 : -1);

    if (selectors.length === 0) {
        return shallowClone(collection);
    }

    return selectors.reduce(
        (nextCollection, nextSelector) => nextSelector.callback(nextCollection),
        collection
    );
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Object}
 * @returns {{priority: Number, callback: Function}}
 */
exports.select = function (...args) {
    return {
        priority: 2,
        callback: function (fields, collection) {
            return collection
                .map(element => {
                    let newElement = {};
                    fields.forEach(filed => {
                        if (element[filed] !== undefined) {
                            newElement[filed] = element[filed];
                        }
                    });

                    return newElement;
                });
        }.bind(null, args)
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {{priority: Number, callback: Function}}
 */
exports.filterIn = function (property, values) {
    return {
        priority: 0,
        callback: function (bindProperty, bindValues, collection) {
            return collection.filter(element => bindValues.indexOf(element[bindProperty]) !== -1);
        }.bind(null, property, values)
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {{priority: Number, callback: Function}}
 */
exports.sortBy = function (property, order) {
    return {
        priority: 1,
        callback: function (bindProperty, bindOrder, collection) {
            let numberOrder = bindOrder === 'asc' ? 1 : -1;

            return shallowClone(collection)
                .sort((a, b) => a[bindProperty] > b[bindProperty] ? numberOrder : numberOrder * -1);
        }.bind(null, property, order)
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {{priority: Number, callback: Function}}
 */
exports.format = function (property, formatter) {
    return {
        priority: 4,
        callback: function (bindProperty, bindFormatter, collection) {
            return shallowClone(collection)
                .map(element => {
                    element[bindProperty] = bindFormatter(element[bindProperty]);

                    return element;
                });
        }.bind(null, property, formatter)
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {{priority: Number, callback: Function}}
 */
exports.limit = function (count) {
    return {
        priority: 3,
        callback: function (bindCount, collection) {
            return collection.slice(0, bindCount);
        }.bind(null, count)
    };
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {{priority: Number, callback: Function}}
     */
    exports.or = function (...filters) {
        return {
            priority: 0,
            callback: function (bindFilters, collection) {
                let collections = bindFilters.map(
                    filter => (filter.callback || filter)(collection)
                );

                return collection.filter(
                    element => collections
                        .filter(c => collectionContainObject(c, element) !== -1)
                        .length !== 0
                );
            }.bind(null, filters)
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {{priority: Number, callback: Function}}
     */
    exports.and = function (...filters) {
        return {
            priority: 0,
            callback: function (bindFilters, collection) {
                let collections = bindFilters.map(
                    filter => (filter.callback || filter)(collection)
                );

                return collection.filter(
                    element => collections
                        .filter(c => collectionContainObject(c, element) !== -1)
                        .length === collections.length
                );
            }.bind(null, filters)
        };
    };
}

function collectionContainObject(collection, object) {
    for (let index = 0; index < collection.length; index++) {
        let element = collection[index];

        let eqCount = Object
            .keys(element)
            .filter(field => element[field] === object[field])
            .length;

        if (eqCount === Object.keys(element).length) {
            return index;
        }
    }

    return -1;
}

function shallowClone(collection) {
    return collection.map(element => Object.assign({}, element));
}
