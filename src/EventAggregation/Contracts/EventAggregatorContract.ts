import { Result } from '@vladbasin/ts-result';
import { SubscriberActionType } from '../Types/SubscriberActionType';

export interface EventAggregatorContract {
    emit<T extends any>(event: string, arg?: T): void;
    emitAwaitingSubscribersAsync<T extends any>(event: string, arg?: T): Result<void>,
    emitAsync<T extends any>(event: string, awaitSubscribers: boolean, arg?: T): Result<void>,
    subscribe(event: string, action: SubscriberActionType): string;
    subscribeOnceAwaitingAsync(event: string, timeout: number): Result<any>;
    unsubscribe(subscriberId: string): void;
}