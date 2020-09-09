export const validateRegExp = (regexp: RegExp, value: string): boolean => {
    return regexp.test(value);
};