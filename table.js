'use strict';
let selectMap = select => {
    return item => {
        let newItem = {};
        select.forEach(field => {
            if (item[field]) {
                newItem[field] = item[field];
            }
        });

        return newItem;
    };
};

let formatMap = formats => {
    return item => {
        let newItem = Object.assign(item);
        formats.forEach(format => {
            newItem[format.field] = format.func(newItem[format.field]);
        });

        return newItem;
    };
};

module.exports = class Table {
    constructor(collection) {
        this.collection = collection.map(item => Object.assign(item));
        this.select = Object.keys(collection[0]);
        this.formats = [];
        this.limit = this.collection.length;
    }

    filter(field, values) {
        this.collection = this.collection.filter(item => values.includes(item[field]));
    }

    sort(field, order) {
        this.collection.sort((i, j) => {
            if (i[field] === j[field]) {
                return 0;
            } else if (i[field] > j[field] === order) {
                return 1;
            }

            return -1;
        });
    }

    setSelect(select) {
        let newSelect = [];
        select.forEach(item => {
            if (this.select.includes(item)) {
                newSelect.push(item);
            }
        });
        this.select = newSelect;
    }

    execute() {
        return this.collection
            .map(selectMap(this.select))
            .map(formatMap(this.formats))
            .slice(0, this.limit);
    }
};
