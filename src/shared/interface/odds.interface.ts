export interface Odds {
    /** the name of the item */
    name: string;
    /** the chance to get it from 1 - 100 */
    chance: number,
    min: number,
    max?: number;
}