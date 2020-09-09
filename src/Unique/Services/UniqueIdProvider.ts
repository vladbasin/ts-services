import { v4 } from 'uuid';
import { UniqueIdProviderContract } from '../Contracts/UniqueIdProviderContract';

export class UniqueIdProvider implements UniqueIdProviderContract {
    public provide(): string {
        return v4();
    }
}