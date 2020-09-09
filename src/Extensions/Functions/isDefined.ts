export function isDefined(value: string | number | null | undefined): boolean {
    if (!value) {
        return false;
    }

    if (typeof value === "number") {
        return value > 0;
    }

    return true;
}