import { DATA_FISH } from "../data/fish.data";
import { DATA_HARVEST } from "../data/harvest.data";
import { Odds } from "../interface/odds.interface";
import { Produce } from "../interface/produce.interface";

/**
 * Gathers and collects raw materials which can be used as an ingredients for crafting
 * @param whatToCollect `0` harvest, `1` fish
 * @returns `Item[]` sorted in most number of quantity
 */
export const collectUtil = (whatToCollect: 0 | 1) => {
    const harvested: Produce[] = [];

    let itemToCollect: Odds[] = [];

    switch (whatToCollect) {
        case 0: {
            itemToCollect = DATA_HARVEST;
            break;
        }
        case 1: {
            itemToCollect = DATA_FISH;
            break;
        }
    }

    for (let i of itemToCollect) {

        // if (harvested.length === 5) { break; }

        const min = i.min;
        const max = i.max || i.min;
        const odds = 1 - (i.chance / 100);
        const success = Math.random() > odds;

        if (success) {
            const item: Produce = { name: i.name, quantity: 0 };
            /** define range for 1 to low quantity */
            const lowQuantity = Math.floor(max - (max * 0.7)) || 1;
            /** define range for high quantity to max */
            const highQuantity = Math.floor(max - lowQuantity);
            /** 20% chance to get high quantity stock */
            const oddsHighQuantity = 1 - (20 / 100);
            const successHigh = Math.random() > oddsHighQuantity;

            let randMin = min;
            let randMax = 0;

            if (successHigh) {
                randMin = highQuantity === lowQuantity ? highQuantity + 1 : highQuantity;
                randMin = randMin >= max ? max : randMin;
                randMin = randMin || min;
                randMax = max;
                // console.log(`high`, i.name, `range from ${randMin}-${randMax}`);
            } else {
                randMin = min;
                randMax = lowQuantity + min;
                // console.log(`lowQuantity`, i.name, `range from ${randMin}-${randMax}`);
            }

            item.quantity += Math.floor(Math.random() * (randMax - randMin) + randMin);
            harvested.push(item);
        }
    }


    return harvested.sort((a, b) => b.quantity - a.quantity);
};





