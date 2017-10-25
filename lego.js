'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = false;

function formArgs(args) {
    var out = [];
    for (var q = 0; q < args.length; q++) {
        out.push(args[q]);
    }

    return out;
}
function checkArgs(args) {
    var out = [];
    var acceptable = ['name', 'age', 'gender', 'email', 'phone',
        'favouriteFruit'];
    for (var p = 0; p < args.length; p++) {
        if (acceptable.includes(args[p])) {
            out.push(args[p]);
        }
    }

    return out;
}
function parseArguments(args) { // eslint-disable-line complexity
    var operands = {};
    operands.select = [];
    operands.filter = [];
    var a1;
    for (var y = 1; y < args.length; y++) {
        switch (args[y][0]) {
            case 'SELECT':
                a1 = args[y][1];
                a1 = formArgs(a1);
                a1 = checkArgs(a1);
                operands.select += a1;
                break;
            case 'FILTER':
                a1 = args[y][1];
                a1 = formArgs(a1);
                operands.filter.push(a1);
                break;
            case 'SORT':
                a1 = args[y][1];
                a1 = formArgs(a1);
                operands.sort = a1;
                break;
            case 'FORMAT':
                a1 = args[y][1];
                a1 = formArgs(a1);
                operands.format = a1;
                break;
            case 'LIMIT':
                a1 = args[y][1];
                a1 = formArgs(a1);
                operands.limit = a1;
                break;
            default:
                break;
        }
    }

    return operands;
}
function applyOperands(data, operands) { // eslint-disable-line complexity
    if (operands.sort !== undefined) {
        data = sort1(data, operands.sort);
    }
    if (operands.filter.length > 0) {
        for (var o = 0; o < operands.filter.length; o++) {
            data = filter1(data, operands.filter[o]);
        }
    }
    if (operands.select.length > 0) {
        data = select1(data, operands.select);
    }
    if (operands.limit !== undefined) {
        data = limit1(data, operands.limit);
    }
    if (operands.format !== undefined) {
        data = format1(data, operands.format);
    }

    return data;
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    var operands = parseArguments(arguments);
    var data = [];
    data = Object.assign(data, collection);
    data = applyOperands(data, operands);

    return data;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Array}
 */
exports.select = function () {

    return ['SELECT', arguments];
};

function helper(data, q, key) {
    for (var el in data[q]) {
        if (!key.includes(el) && (data[q].hasOwnProperty(el))) {
            delete data[q][el];
        }
    }

    return data;
}
function select1(data, key) {
    for (var q = 0; q < data.length; q++) {
        data = helper(data, q, key);
    }

    return data;
}

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Array}
 */
exports.filterIn = function (property, values) {
    return ['FILTER', [property, values]];
};

function filter1(data, args) {
    var out = [];
    var property = args[0];
    var values = args[1];
    for (var q = 0; q < data.length; q++) {
        if (values.includes(data[q][property])) {
            out.push(data[q]);
        }
    }

    return out;
}

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Array}
 */
exports.sortBy = function (property, order) {
    return ['SORT', [property, order]];
};

function sort1(data, args) {
    var property = args[0];
    var order = args[1];
    if (order === 'asc') {
        data.sort(function compare(a, b) {
            if (a[property] < b[property]) {
                return -1;
            }
            if (a[property] > b[property]) {
                return 1;
            }

            return 0;
        });
    } else {
        data.sort(function compare(b, a) {
            if (a[property] < b[property]) {
                return -1;
            }
            if (a[property] > b[property]) {
                return 1;
            }

            return 0;
        });
    }

    return data;

}

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Array}
 */
exports.format = function (property, formatter) {
    return ['FORMAT', [property, formatter]];
};

function format1(data, args) {
    var property = args[0];
    var func = args[1];
    for (var u = 0; u < data.length; u++) {
        data[u][property] = func(data[u][property]);
    }

    return data;
}

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Array}
 */
exports.limit = function (count) {
    return ['LIMIT', [count]];
};

function limit1(data, count) {
    var out = [];
    if (count <= data.length) {
        for (var y = 0; y < count; y++) {
            out.push(data[y]);
        }
    } else {
        return data;
    }

    return out;
}

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Array}
     */
    exports.or = function () {
        return ['FILTER1', arguments];
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Array}
     */
    exports.and = function () {
        return ['FILTER1', arguments];
    };
}
