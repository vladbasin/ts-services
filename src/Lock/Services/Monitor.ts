import { Result } from '@vladbasin/ts-result';
import { EventAggregatorContract } from '../../EventAggregation/Contracts/EventAggregatorContract';
import { MonitorContract } from '../Contracts/MonitorContract';

export class Monitor implements MonitorContract {
    private readonly _locks = new Map<string, boolean>();
    private readonly _eventAggregator: EventAggregatorContract;

    constructor(dep: {
        eventAggregator: EventAggregatorContract
    }) {
        this._eventAggregator = dep.eventAggregator;
    }

    public lock(key: string) {
        this._locks.set(key, true);
    }

    public unlock(key: string) {
        this._locks.set(key, false);
        this._eventAggregator.emit(this.getEvent(key));
    }

    public continueWhenUnlockedAsync(key: string): Result<void> {
        return this.continueWhenUnlockedInnerAsync(key, false);
    }

    public continueWhenUnlockedAndLockAsync(key: string): Result<void> {
        return this.continueWhenUnlockedInnerAsync(key, true);
    }

    public continueWhenUnlockedInnerAsync(key: string, lock: boolean): Result<void> {
        const lockState = this._locks.get(key);

        if (lockState !== true) {
            lock && this.lock(key);

            return Result.Void();
        }

        return Result.FromPromise(new Promise<void>((resolve, _) => {
            const subscriberId = this._eventAggregator.subscribe(this.getEvent(key), () => {
                lock && this.lock(key);
                
                resolve();

                this._eventAggregator.unsubscribe(subscriberId);

                return Result.Void();
            });
        }));
    }

    private getEvent(key: string) {
        return `monitor_event_${key}`;
    }
}