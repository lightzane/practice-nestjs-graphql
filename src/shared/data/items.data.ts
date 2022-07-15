import { Item } from "../../inventory/models/item.model";
import { DATA_RECIPES } from "./recipes.data";
const SUGAR = DATA_RECIPES.find(i => i.name === 'sugar');

/** Item */
export const DATA_ITEMS: Item[] = [
    {
        name: 'wheat',
        quantity: 5
    },
    {
        name: SUGAR.name,
        quantity: 1,
        price: SUGAR.price
    }
];

