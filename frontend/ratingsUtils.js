
export function getStarCount(value) {
    if (value >= 8) return 5;
    if (value >= 6) return 4;
    if (value >= 4) return 3;
    if (value >= 2) return 2;
    if (value >= 1) return 1;
    return 0;
}