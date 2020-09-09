import { validateRegExp } from "./validateRegExp";
import { isNil } from 'lodash';

export const validateLengthTrimmed = (value: string | null, min: number, max?: number): boolean => {
    const valueStrong = value || "";
    const maxRegexpString = isNil(max) ? "" : `${max}`;
    const regExp = new RegExp(`^.{${min},${maxRegexpString}}$`);

    return validateRegExp(regExp, valueStrong) && valueStrong.isTrimmed();
};