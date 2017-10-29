'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

var priority = {
    filter: 0,
    sort: 1,
    select: 2,
    limit: 3,
    format: 4
};

function clone(collection) {
    return JSON.parse(JSON.stringify(collection));
}

function friendInParty(friend, party) {
    function friendCompare(firstFriend, secondFriend) {
        var property;
        for (property in firstFriend) {
            if (secondFriend[property] !== firstFriend[property]) {
                return false;
            }
        }
        for (property in secondFriend) {
            if (firstFriend[property] !== secondFriend[property]) {
                return false;
            }
        }

        return true;
    }
    for (var partyMember of party) {
        if (friendCompare(friend, partyMember)) {
            return true;
        }
    }

    return false;
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...actions) {
    var result = clone(collection);
    actions.sort((firstAction, secondAction) =>
        priority[firstAction.name] - priority[secondAction.name]);
    actions.forEach(function (action) {
        result = action(result);
    });

    return result;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Array}
 */
exports.select = function (...desiredProperties) {
    var selectFunction = function select(friends) {
        return friends.map(function (friend) {
            var result = {};
            for (var property of desiredProperties) {
                if (friend.hasOwnProperty(property)) {
                    result[property] = friend[property];
                }
            }

            return result;
        });
    };

    return selectFunction;
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Array}
 */
exports.filterIn = function (property, values) {
    var filterFunction = function filter(friends) {
        return friends.filter(friend => values.includes(friend[property]) >= 0);
    };

    return filterFunction;
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Array}
 */
exports.sortBy = function (property, order) {
    var compareBy = function (a, b) {
        if (a[property] > b[property]) {
            return 1;
        } else if (a[property] === b[property]) {
            return 0;
        }

        return -1;
    };
    var sortFunction;
    if (order === 'asc') {
        sortFunction = function sort(friends) {
            friends.sort(compareBy);

            return friends;
        };
    } else {
        sortFunction = function sort(friends) {
            friends.sort((a, b) => -compareBy(a, b));

            return friends;
        };
    }

    return sortFunction;
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Array}
 */
exports.format = function (property, formatter) {
    var formatFunction = function format(friends) {
        return friends.map(function (friend) {
            friend[property] = formatter(friend[property]);

            return friend;
        });
    };

    return formatFunction;
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Array}
 */
exports.limit = function limit(count) {
    var limitFunction = function (friends) {
        return friends.slice(0, count);
    };

    return limitFunction;
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Array}
     */
    exports.or = function () {
        function unitePartys(firstParty, secondParty) {
            var result = firstParty.slice(0);
            secondParty.forEach(function (member) {
                if (!friendInParty(member, result)) {
                    result.push(member);
                }
            });

            return result;
        }

        var actions = Array.from(arguments);
        var orFunction = function filter(friends) {
            var partysToUnite = actions.map(action => action(friends));

            return partysToUnite.reduce(unitePartys);
        };

        return orFunction;
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Array}
     */
    exports.and = function () {
        var actions = Array.from(arguments);
        var andFunction = function filter(friends) {
            return actions.reduce((acc, action) => action(acc), friends);
        };

        return andFunction;
    };
}
