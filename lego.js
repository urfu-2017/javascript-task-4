'use strict';
const functionWeight = {
    and: 0,
    or: 0,
    filterIn: 1,
    sortBy: 1,
    select: 2,
    limit: 3,
    format: 3
};

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

exports.query = function (collection, ...values) {
    var clone = JSON.parse(JSON.stringify(collection));
    var methods = values
        .sort((a, b) => functionWeight[a.name] - functionWeight[b.name]);
    console.info(methods);

    return methods.reduce((result, func) =>
        func(result), clone);

};


/**
 * Выбор полей
 * @params {...String}
 */

exports.select = function (...values) {
    return function select(collection) {
        var clone = Object.assign([], collection);

        return clone.map(function (data) {
            Object.keys(data).forEach(function (key) {
                if (!values.includes(key)) {
                    delete data[key];
                }
            });

            return data;
        });
    };

};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 */

exports.filterIn = function (property, values) {
    return function filterIn(collection) {
        return collection.filter(function (data) {
            return values.includes(data[property]);
        });
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 */

exports.sortBy = function (property, order) {
    return function sortBy(collection) {
        return collection.sort(function (firstValue, secondValue) {
            var typeAsc = firstValue[property] > secondValue[property];
            var typeDesc = firstValue[property] <= secondValue[property];

            return (order === 'asc') ? typeAsc : typeDesc;
        }
        );
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 */

exports.format = function (property, formatter) {
    return function format(collection) {
        return collection.map(function (data) {
            var clonePerson = Object.assign({}, data);
            if (data[property] !== undefined) {
                clonePerson[property] = formatter(clonePerson[property]);
            }

            return clonePerson;
        }
        );
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

    exports.or = function (...values) {
        return function or(collection) {
            var answersArray = values.reduce((result, func) =>
                result.concat(func(collection)), []);

            return collection.filter(person => answersArray.includes(person));
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     */


    exports.and = function (...values) {

        return function and(collection) {

            return values.reduce((result, func) => func(result),
                collection);
        };
    };
}

