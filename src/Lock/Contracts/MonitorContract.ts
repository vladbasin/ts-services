import { Result } from "@vladbasin/ts-result";

export interface MonitorContract {
    lock(key: string): void;
    unlock(key: string): void;
    continueWhenUnlockedAsync(key: string): Result<void>;
    continueWhenUnlockedAndLockAsync(key: string): Result<void>;
}