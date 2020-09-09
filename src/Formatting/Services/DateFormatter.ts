import { Maybe } from '@vladbasin/ts-types';
import moment, { Moment } from 'moment';
import { DateFormatterContract } from '../Contracts/DateFormatterContract';

export class DateFormatter implements DateFormatterContract {
    public fromNow(date: Moment): Maybe<string> {
        return moment(date).local().fromNow();
    }

    public calendar(date: Date): Maybe<string> {
        return moment(date).local().calendar();
    }

    public formatLocalized(date: Date, formatString: string): Maybe<string> {
        return this.format(date, formatString);
    }

    public format(date: Date, formatString: string): Maybe<string> {
        if (!date) {
            return undefined;
        }

        return moment(date).local().format(formatString);
    }
}