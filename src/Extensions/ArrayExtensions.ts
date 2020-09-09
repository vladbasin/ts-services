import { Result } from "@vladbasin/ts-result";
import { Maybe } from "@vladbasin/ts-types";
import { isNil } from 'lodash';
import { SearchPredicateType } from "./Types/SearchPredicateType";

declare global {
    interface Array<T> {
        search(predicates: SearchPredicateType<T>[]): Result<T>;
        distinct(keyProvider: (item: T) => string): Array<T>;
        nth(index: number): T | undefined;
        first<K>(predicate: (arg: T) => boolean, selector: (arg: T) => K): K | undefined;
        compactMap<K>(predicate: (arg: T) => K | undefined, checkForNilOnly?: boolean): K[];
        take(count: number): T[];
        ensureSize(size: number, generator: (arg: number) => T): T[];
        mapMany<K>(mapper: (arg: T) => K[]): K[];
        swap(first: number, second: number): T[];
        toDictionary(keySelector: (arg: T) => string): Map<string, T>;
        last(predicate?: (arg: T) => boolean): Maybe<T>;
        firstReversed(predicate?: (arg: T) => boolean): Maybe<T>;
    }

    interface ArrayConstructor {
        create<T>(length: number, value: (index: number) => T): Array<T>;
    }
}

Array.prototype.firstReversed = function <T>(predicate: (arg: T) => boolean): Maybe<T> {
    let result: Maybe<T>;
    let iterator = this.length - 1;

    while (iterator >= 0) {
        if (predicate(this[iterator])) {
            result = this[iterator];
        } else {
            if (!isNil(result)) {
                return result;
            }
        }

        iterator--;
    }

    return result;
}

Array.prototype.last = function <T>(predicate?: (arg: T) => boolean): Maybe<T> {
    let iterator = this.length - 1;

    while (iterator >= 0) {
        if (isNil(predicate) || predicate(this[iterator])) {
            return this[iterator];
        }

        iterator--;
    }
}

Array.prototype.toDictionary = function <T>(keySelector: (arg: T) => string): Map<string, T> {
    const result = new Map<string, T>();

    this.forEach(item => result.set(keySelector(item), item));

    return result;
}

Array.prototype.swap = function <T>(first: number, second: number): T[] {
    const mem = this[second];
    this[second] = this[first];
    this[first] = mem;

    return this;
}

Array.prototype.search = function <T>(predicates: SearchPredicateType<T>[]): Result<T> {
    for (const predicate of predicates) {
        const index = this.findIndex(predicate);

        if (index > -1) {
            return Result.Ok(this[index]);
        }
    }

    return Result.Fail<T>("Could not find any item");
}

Array.prototype.distinct = function <T>(keyProvider: (item: T) => string): Array<T> {
    const result = new Array<T>();

    let map = new Map<string, any>();

    for (const item of this) {
        if (map.has(keyProvider(item))) {
            continue;
        }

        map.set(keyProvider(item), item);

        result.push(item);
    }

    return result;
}

Array.prototype.nth = function <T>(index: number): T | undefined {
    if (!this || this.length < index + 1) {
        return undefined;
    }

    return this[index];
}

Array.prototype.first = function <T, K>(predicate: (arg: T) => boolean, selector: (arg: T) => K): K | undefined {
    const result = this.filter(t => predicate(t)).map(t => selector(t));

    return result.length === 0
        ? undefined
        : result[0];
}

Array.prototype.compactMap = function <T, K>(predicate: (arg: T) => K | undefined, checkForNilOnly?: boolean): K[] {
    const result = new Array<K>();

    this.forEach(item => {
        const newItem = predicate(item);

        if (checkForNilOnly === true) {
            if (!isNil(newItem)) {
                result.push(newItem);
            }
        } else {
            if (newItem) {
                result.push(newItem);
            }
        }
    });

    return result;
}

Array.prototype.mapMany = function <T, K>(mapper: (arg: T) => K[]): K[] {
    const result = new Array<K>();

    this.forEach(item => {
        mapper(item).forEach(mappedItem => result.push(mappedItem));
    });

    return result;
}

Array.prototype.take = function <T>(count: number): T[] {
    return this.slice(0, count);
}

Array.prototype.ensureSize = function <T>(size: number, generator: (arg: number) => T): T[] {
    const result = this.take(3);

    return result.length === size
        ? result
        : Array.from(result.concat(Array.create(size - result.length, generator)));
}

Array.create = function <T>(length: number, value: (index: number) => T): Array<T> {
    return Array.from(Array(length)).map((_, index) => value(index));
}