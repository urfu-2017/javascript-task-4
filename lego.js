'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

var PRIORITY_FUNC = {
    format: 0,
    limit: 1,
    select: 2,
    sortBy: 3,
    or: 4,
    and: 5,
    filterIn: 6
};

exports.query = function (collection, ... keyFunction) {
    var masElements = collection.map(function (item) {

        return Object.assign({}, item);
    });
    keyFunction.sort(sortFunc)
        .forEach(function (item) {
            masElements = item(masElements);
        });

    return masElements;
};

function sortFunc(elementForCompare1, elementForCompare2) {

    return PRIORITY_FUNC[elementForCompare1.name] < PRIORITY_FUNC[elementForCompare2.name];
}

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function (... fields) {

    return function select(masElements) {

        return masElements.map(function (item) {

            return Object.keys(item).reduce(function (newItem, key) {
                if (fields.includes(key)) {
                    newItem[key] = item[key];
                }

                return newItem;
            }, {});
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
    console.info(property, values);

    return function filterIn(masElements) {

        return masElements.filter(function (item) {

            return values.indexOf(item[property]) !== -1;
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
    console.info(property, order);

    return function sortBy(masElements) {
        masElements.sort(function (elementForCompare1, elementForCompare2) {
            if (elementForCompare1[property] <= elementForCompare2[property]) {
                return order === 'desc' ? 1 : -1;
            }

            return order === 'desc' ? -1 : 1;
        });

        return masElements;
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

    return function format(masElements) {

        return masElements.map(function (item) {
            if (property in item) {
                item[property] = formatter(item[property]);
            }

            return item;
        });
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
 */
exports.limit = function (count) {
    console.info(count);

    return function limit(masElements) {

        return masElements.slice(0, count);
    };
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.or = function (... functions) {

        return function or(masElements) {
            return masElements.filter(function (element) {
                return functions.some(function (itemFunction) {
                    var newMasWithOneElem = [element];

                    return itemFunction(newMasWithOneElem).length !== 0;
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
    exports.and = function (... functions) {

        return function and(masElements) {

            return masElements.filter(function (element) {
                var newMasElement = [element];
                functions.forEach(function (itemFunction) {
                    newMasElement = itemFunction(newMasElement);
                });

                return newMasElement.length !== 0;
            });
        };
    };
}
