import { Maybe } from "@vladbasin/ts-types";
import { Moment } from 'moment';

export interface DateFormatterContract {
    formatLocalized(date: Date, formatString: string): Maybe<string>;
    format(date: Date, formatString: string): Maybe<string>;
    fromNow(date: Moment): Maybe<string>;
    calendar(date: Date): Maybe<string>;
}