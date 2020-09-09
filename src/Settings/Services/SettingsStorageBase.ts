import { Result } from "@vladbasin/ts-result";
import moment from "moment";

export abstract class SettingsStorageBase {
    private readonly _booleanTrueValue: string = "1";
    private readonly _persistClearKeys: string = "PersistClear";

    protected abstract getInternalAsync(key: string): Result<string>;
    protected abstract getAllKeysInternalAsync(): Result<string[]>;
    protected abstract setInternalAsync(key: string, value: string): Result<void>;
    protected abstract removeInternalAsync(key: string): Result<void>;

    public getAsync(key: string): Result<string> {
        return this.getInternalAsync(key)
            .onSuccess(value => value === null ? Result.Fail<string>("Key not found") : Result.Ok(value));
    }

    public getNumberAsync(key: string): Result<number> {
        return this.getAsync(key)
            .onSuccess(value => parseInt(value));
    }

    public getBooleanAsync(key: string): Result<boolean> {
        return this.getAsync(key)
            .onSuccess(value => value === this._booleanTrueValue);
    }

    public getDateAsync(key: string): Result<Date> {
        return this.getNumberAsync(key)
            .onSuccess(number => moment.unix(number).toDate());
    }

    public setAsync(key: string, value: string | boolean | number | Date, persistLogout: boolean): Result<void> {
        const valueType = typeof value;

        let targetValue = `${value}`;

        switch (valueType) {
            case "boolean":
                targetValue = value ? this._booleanTrueValue : "";
                break;
        }

        if (value instanceof Date) {
            targetValue = `${moment(value).unix()}`;
        }

        return this.setInternalAsync(key, targetValue)
            .onSuccess(_ => this.ensureSurviveLogoutAsync(key, persistLogout))
            .void;
    }

    public removeAsync(key: string): Result<void> {
        return this.removeInternalAsync(key);
    }

    public clearAsync(): Result<void> {
        return this.getAllKeysInternalAsync()
            .onSuccess(allKeys => this.getPersistLogoutKeysAsync()
                .onSuccess(persistKeys => new Set(persistKeys))
                .onSuccess(persistKeysSet => allKeys.filter(key => !!!persistKeysSet.has(key)))
            )
            .onSuccess(keysToRemove => Result.Combine(keysToRemove.map(key => this.removeAsync(key))))
            .void;
    }

    private getPersistLogoutKeysAsync() {
        return this.getAsync(this._persistClearKeys)
            .onSuccess(value => JSON.parse(value) as string[])
            .onFailureCompensate(_ => [])
            .onSuccess(keys => keys.concat([this._persistClearKeys]));
    }

    private ensureSurviveLogoutAsync(key: string, persistClear: boolean) {
        return this.getPersistLogoutKeysAsync()
            .onSuccess(persistedKeys => new Set(persistedKeys))
            .onSuccess(persistedKeysSet => {
                persistClear
                    ? persistedKeysSet.add(key)
                    : persistedKeysSet.delete(key);

                return persistedKeysSet;
            })
            .onSuccess(persistedKeysSet => this.setInternalAsync(this._persistClearKeys, JSON.stringify(Array.from(persistedKeysSet))))
    }
}