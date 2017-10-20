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
    let result = collection.slice();
    let args = Array.prototype.slice.call(arguments);
    args = args.slice(1);
    collection = result.slice();
    for (let func of args) {
        result = func(result);
    }
    let maxLength = result.length;
    if (result !== [] && result[0].maxCount !== undefined) {
        maxLength = result[0].maxCount;
    }
    result = result.splice(0, maxLength);
    result = result.map(function (item) {
        let res = {};
        let keys = Object.keys(item);
        keys = keys.filter((key) => {
            if (item.selectParam === undefined) {
                return true;
            }

            return item.selectParam.indexOf(key) !== -1;
        });

        for (let key of keys) {
            res[key] = item[key];
        }
        if (item.changeFunc !== undefined) {
            res.changeFunc = item.changeFunc;
            res.changeFunc();
        }
        delete res.changeFunc;
        delete res.maxCount;

        return res;
    });

    return result;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function () {
    let args = Array.prototype.slice.call(arguments);
    let resultFunc = function (collection, argumentsFunc = args) {
        let result = collection.map(function (item) {
            let res = Object.assign({}, item);
            if (res.selectParam === undefined) {
                res.selectParam = [];
            }
            res.selectParam = res.selectParam.concat(argumentsFunc);

            return res;
        });

        return result;
    };

    return resultFunc;
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function}
 */
exports.filterIn = function (property, values) {
    let resultFunc = function (collection, argumentsFunc = property, valuesFunc = values) {
        let result = collection.filter(
            (men) => valuesFunc.indexOf(men[argumentsFunc]) !== -1);

        return result;
    };

    return resultFunc;
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = function (property, order) {
    let resultFunc = function (collection, propertyFunc = property, orderFunc = order) {
        let filterFunc = (propertyFunc !== 'age')
            ? function (a, b) {
                return a.localeCompare(b);
            }
            : (a, b) => {
                if (a > b) {
                    return 1;
                }
                if (b > a) {
                    return -1;
                }

                return 0;
            };

        let result = collection
            .slice()
            .sort((one, two) =>
                filterFunc(one[propertyFunc], two[propertyFunc])
            );
        if (orderFunc === 'desc') {
            result.reverse();
        }

        return result;
    };

    return resultFunc;
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Function}
 */
exports.format = function (property, formatter) {
    let resultFunc = function (collection, propertyFunc = property, formatterFunc = formatter) {
        let result = collection.map(function (item) {
            let res = Object.assign({}, item);
            res.changeFunc = function (proper = propertyFunc, func = formatterFunc) {
                this[proper] = func(this[proper]);
            };

            return res;
        });

        return result;
    };

    return resultFunc;
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
 */
exports.limit = function (count) {
    let resultFunc = function (collection, countFunc = count) {
        let result = collection.map((item) => {
            let res = Object.assign({}, item);
            res.maxCount = countFunc;

            return res;
        });

        return result;
    };

    return resultFunc;
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.or = function () {
        let args = Array.prototype.slice.call(arguments);
        let resultFunc = function (collection, argument = args) {
            let result = [];
            for (let func of argument) {
                let res = func(collection);
                result = result.concat(res);
            }

            return result;
        };

        return resultFunc;
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = function () {
        let args = Array.prototype.slice.call(arguments);
        let resultFunc = function (collection, argument = args) {
            let result = collection.slice();
            for (let func of argument) {
                result = func(result);
            }

            return result;
        };

        return resultFunc;
    };
}

