import { Result } from "@vladbasin/ts-result";
import { UniqueIdProviderContract } from "../../Unique/Contracts/UniqueIdProviderContract";
import { EventAggregatorContract } from "../Contracts/EventAggregatorContract";
import { SubscriberActionType } from "../Types/SubscriberActionType";
import { SubscriberType } from "../Types/SubscriberType";

const OnceSubscribedAwaitCheckInterval = 1000;

export class EventAggregator implements EventAggregatorContract {
    private readonly _eventSubscribersMap = new Map<string, SubscriberType[]>();

    private readonly _uniqueIdProvider: UniqueIdProviderContract;

    constructor(dep: {
        uniqueIdProvider: UniqueIdProviderContract
    }) {
        this._uniqueIdProvider = dep.uniqueIdProvider;
    }

    public emitAwaitingSubscribersAsync<T extends any>(event: string, arg?: T) {
        const subscribers = this._eventSubscribersMap.get(event) || [];

        if (!subscribers) {
            return Result.Void();
        }

        const tasks = subscribers.map(subscriber => subscriber.action(arg));

        return Result.Combine(tasks).void;
    }

    public emit<T extends any>(event: string, arg?: T) {
        this.emitAwaitingSubscribersAsync(event, arg)
            .run();
    }

    public emitAsync<T extends any>(event: string, awaitSubscribers: boolean, arg?: T): Result<void> {
        const result = this.emitAwaitingSubscribersAsync(event, arg)
            .runAsResult();

        return awaitSubscribers
            ? result
            : Result.Void();
    }

    public subscribeOnceAwaitingAsync(event: string, timeout: number): Result<any> {
        const promise = new Promise<any>((resolve, reject) => {
            let isRejectedByTimeout = false;
            let isTriggered = false;
            let totalPollingTime = 0;

            const pollingInterval = setInterval(() => {
                if (isTriggered) {
                    clearInterval(pollingInterval);
                    return;
                }

                totalPollingTime += OnceSubscribedAwaitCheckInterval;

                if (totalPollingTime > timeout) {
                    isRejectedByTimeout = true;
                    clearInterval(pollingInterval);
                    reject("Timeout exceeded");
                }

            }, OnceSubscribedAwaitCheckInterval);

            const id = this.subscribe(event, (arg: any) => {
                this.unsubscribe(id);
               
                if (isRejectedByTimeout) {
                    return Result.Void();
                }

                resolve(arg);
                isTriggered = true;

                return Result.Void();
            });

        });

        return Result.FromPromise<any>(promise);
    }

    public subscribe(event: string, action: SubscriberActionType): string {
        const id = this._uniqueIdProvider.provide();

        let subscribers = this._eventSubscribersMap.get(event) || [];

        subscribers.push({ id, action });

        this._eventSubscribersMap.set(event, subscribers);

        return id;
    }

    public unsubscribe(subscriberId: string) {
        const events = Array.from(this._eventSubscribersMap.keys());

        for (const event of events) {
            let subscribers = this._eventSubscribersMap.get(event);

            if (!subscribers) {
                continue;
            }

            subscribers = subscribers.filter(t => t.id !== subscriberId);

            this._eventSubscribersMap.set(event, subscribers);
        }
    }
}