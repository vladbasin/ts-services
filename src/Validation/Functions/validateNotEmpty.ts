import { isNil } from 'lodash';

export const validateNotEmpty = (value: string | null): boolean => {
    return !isNil(value) && value.trim().length > 0;
};