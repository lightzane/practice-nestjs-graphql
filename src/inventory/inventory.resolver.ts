import { Args, Mutation, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CraftArgs } from './dto/craft.args';
import { UpdateRecipeInput } from './dto/update-recipe.input';
import { MongoIDArgs } from './dto/_id.args';
import { CollectEnum } from './enums/collect.enum';
import { InventoryService } from './inventory.service';
import { Inventory } from './models/inventory.model';
import { Item } from './models/item.model';
import { Recipe } from './models/recipe.model';


@Resolver(() => Inventory)
export class InventoryResolver {

    constructor(private inventoryService: InventoryService) { }

    @Query(() => Inventory, { name: 'inventory', description: 'Display all the items and its value' })
    getInventory(): Inventory {
        return this.inventoryService.getInventory();
    }

    @ResolveField(() => [Item], { name: 'items', description: 'Display multiple items available in the inventory' })
    filterItems(@Args('names', { type: () => [String], nullable: true }) names: string[]): Item[] {
        if (names) { return this.inventoryService.getItem(names); }
        return this.inventoryService.getItems();
    }

    @Query(() => [Recipe], { name: 'recipes', description: 'Display all available recipes' })
    getRecipes(@Args() mongoIDArgs: MongoIDArgs): Recipe[] {
        if (mongoIDArgs._id) { return this.inventoryService.getRecipe(mongoIDArgs._id); }
        return this.inventoryService.getRecipes();
    }

    @Mutation(() => [Item], { description: 'Gather raw items available as an ingredient to craft' })
    gather(@Args('item', { type: () => CollectEnum }) collect: CollectEnum): Item[] {
        return this.inventoryService.gather(collect);
    }

    @Mutation(() => Item, { description: 'Craft a selected recipe and consumes ingredients in the inventory' })
    craft(@Args() craftArgs: CraftArgs): Item {
        return this.inventoryService.craft(craftArgs);
    }

    @Mutation(() => Recipe)
    addRecipe(@Args('recipeInput') recipe: Recipe): Recipe {
        return this.inventoryService.addRecipe(recipe);
    }

    @Mutation(() => Recipe)
    updateRecipe(@Args('updateRecipeInput') recipe: UpdateRecipeInput): Recipe {
        return this.inventoryService.updateRecipe(recipe);
    }
}
