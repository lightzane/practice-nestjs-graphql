import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DATA_ITEMS } from '../shared/data/items.data';
import { DATA_RECIPES } from '../shared/data/recipes.data';
import { collectUtil } from '../shared/utils/collect.util';
import { IDUtil } from '../shared/utils/id.util';
import { CraftArgs } from './dto/craft.args';
import { UpdateRecipeInput } from './dto/update-recipe.input';
import { CollectEnum } from './enums/collect.enum';
import { Ingredient } from './models/ingredient.model';
import { Inventory } from './models/inventory.model';
import { Item } from './models/item.model';
import { Recipe } from './models/recipe.model';

@Injectable()
export class InventoryService {

    /**
     * Display all the item in the inventory
     */
    getItems(): Item[] {
        return DATA_ITEMS;
    }

    /**
     * Display multiple item/s in the inventory
     * @param names names of the item to display
     * @returns selected `Item[]`
     */
    getItem(names: string[]): Item[] {
        const items: Item[] = [];
        names.forEach(name => {
            const item = DATA_ITEMS.filter(item => item.name === name);
            items.push(...item);
        });
        return items;
    }

    /**
     * The inventory will display all items and its value
     * @returns `Inventory` which contains all the `Item[]` and its value
     */
    getInventory(): Inventory {
        const items = this.getItems();
        const value = items.reduce((a, b) => a + ((b.price || 0) * b.quantity), 0);
        return { items, value };
    }

    /**
     * Display all the recipe
     * @returns `Recipe[]`
     */
    getRecipes(): Recipe[] {
        return DATA_RECIPES;
    }

    /**
     * Display a single `Recipe`
     * @param _id _id of the specific Recipe to display
     * @returns a single `Recipe`
     */
    getRecipe(_id: string): Recipe[] {
        return DATA_RECIPES.filter(recipe => recipe._id === _id);
    }

    /**
     * Gather raw materials for crafting
     * @param item `harvest` or `fish`
     * @returns `Item[]` that has been harvested
     */
    gather(item: CollectEnum): Item[] {

        const collectedItems = collectUtil(item);

        collectedItems.forEach(v => {

            const existingItem = DATA_ITEMS.find(e => e.name === v.name);

            if (existingItem) {
                existingItem.quantity += v.quantity;
            } else {
                DATA_ITEMS.push(v);
            }
        });

        return collectedItems;
    }

    /**
     * Craft a recipe if available, and consumes items in the inventory.
     * @param craftArgs `_id` or `name` of the recipe to be made
     * @returns `Item` crafted
     */
    craft(craftArgs: CraftArgs): Item {
        const { _id, name } = craftArgs;
        const chosenRecipe = DATA_RECIPES.find(r => r._id === _id || r.name === name);

        if (!chosenRecipe) throw new NotFoundException('Recipe not found');

        this.checkMissingIngredientsFor(chosenRecipe);

        // consume items in inventory
        chosenRecipe.ingredients.forEach(target => {
            const i = DATA_ITEMS.findIndex(i => i.name === target.name);
            const source = DATA_ITEMS[i];
            source.quantity -= target.quantity;

            if (source.quantity === 0) {
                DATA_ITEMS.splice(i, 1);
            }
        });

        const existingItem = DATA_ITEMS.find(e => e.name === chosenRecipe.name);

        /** the object to return in graphql */
        let producedItem: Item = {
            name: chosenRecipe.name,
            quantity: chosenRecipe.produceQuantity,
            price: chosenRecipe.price
        };

        if (existingItem) {
            producedItem.quantity += existingItem.quantity;
            existingItem.quantity += chosenRecipe.produceQuantity;
            producedItem = existingItem;
        } else {
            DATA_ITEMS.push(producedItem);
        }

        return producedItem;
    }

    /**
     * Throws an error if there are missing ingredients
     * @param recipe recipe to check ingredients for
     */
    private checkMissingIngredientsFor(recipe: Recipe): void {
        // list of missing ingredients
        const missingIngredients: Ingredient[] = [];

        // check all the required ingredients
        recipe.ingredients.forEach(target => {
            const source = DATA_ITEMS.find(i => i.name === target.name);
            const name = target.name;

            // identify missing ingredient
            if (!source) {
                missingIngredients.push({
                    name,
                    quantity: target.quantity
                });
            }

            // lacks ingredient quantity
            else if (source.quantity < target.quantity) {
                missingIngredients.push({
                    name,
                    quantity: target.quantity - source.quantity
                });
            }
        });

        // there are missing ingredients
        if (missingIngredients.length) {
            throw new BadRequestException({
                message: 'Missing ingredients',
                missingIngredients
            });
        }
    }

    /**
     * Simple add a new recipe
     * @param recipe the recipe to add in the book
     * @returns recipe
     */
    addRecipe(recipe: Recipe): Recipe {
        const existingRecipe = DATA_RECIPES.find(r => r.name.toLowerCase() === recipe.name.toLowerCase());
        if (existingRecipe) { throw new ConflictException('You already know this recipe, use updateRecipe() instead'); }

        recipe._id = IDUtil.oid();
        DATA_RECIPES.push(recipe);

        return recipe;
    }

    /**
     * Simple updates an existing recipe
     * @param recipe the recipe to update in the book
     * @returns the updated recipe
     */
    updateRecipe(recipe: UpdateRecipeInput): Recipe {
        const [existingRecipe] = this.getRecipe(recipe._id);
        if (!existingRecipe) { throw new NotFoundException('Recipe not found'); }

        Object.assign(existingRecipe, recipe);

        return existingRecipe;
    }
}
