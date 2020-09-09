import { isNil } from 'lodash';

declare global {
    interface Map<K, V> {
        contains(predicate: (key: K, value: V) => boolean): boolean;
        find(predicate: (key: K, value: V) => boolean): V | undefined;
    }
}

Map.prototype.contains = function<K, V>(predicate: (key: K, value: V) => boolean): boolean {
    if (isNil(predicate)) {
        return false;
    }

    for (const entry of this.entries()) {
        if (predicate(entry[0], entry[1])) {
            return true;
        }
    }

    return false;
}

Map.prototype.find = function<K, V>(predicate: (key: K, value: V) => boolean): V | undefined {
    for (const entry of this.entries()) {
        if (predicate(entry[0], entry[1])) {
            return entry[1];
        }
    }
}