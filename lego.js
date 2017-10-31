'use strict';
const functionWeight = {
    and: 0,
    or: 0,
    filterIn: 1,
    sortBy: 2,
    select: 3,
    limit: 4,
    format: 5
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
    var clone = [].concat(collection);
    var methods = values
        .sort((a, b) => functionWeight[a.name] - functionWeight[b.name]);

    return methods.reduce((result, func) =>
        func(result), clone);

};


/**
 * Выбор полей
 * @params {...String}
 */

exports.select = function (...keys) {
    return function select(collection) {
        return collection.map(person => {
            var result = {};
            for (var i = 0; i < keys.length; i++) {
                if (keys[i] in person) {
                    result[keys[i]] = person[keys[i]];
                }
            }

            return result;
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
        return collection.sort(function (a, b) {
            if (a[property] === b[property]) {
                return 0;
            } else if (a[property] > b[property]) {
                return order === 'asc' ? 1 : -1;
            }

            return order === 'desc' ? 1 : -1;
        });
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
            return collection.filter(clone => values
                .some(filter => (filter([clone]).length)));
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
