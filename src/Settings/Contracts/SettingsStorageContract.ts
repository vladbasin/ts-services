import { Result } from "@vladbasin/ts-result";

export interface SettingsStorageContract {
    clearAsync(): Result<void>;
    getAsync(key: string): Result<string>;
    getNumberAsync(key: string): Result<number>;
    getBooleanAsync(key: string): Result<boolean>;
    getDateAsync(key: string): Result<Date>;
    setAsync(key: string, value: string | boolean | number | Date, persistClear: boolean): Result<void>;
    removeAsync(key: string): Result<void>;
}