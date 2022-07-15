# practice-nestjs-graphql

Practice Nestjs GraphQL and build craft/cook foods to make it more interesting.

## Getting Started

Do `npm install` and go [Start Your Journey](#start-your-journey)

> **Note** You might encounter some errors, this is normal as you will start your journey with some pre-logic already created for you. But you have to develop the core resources for GraphQL to work

Or go to this page https://github.com/lightzane/practice-nestjs-graphql/tree/completed to see an overview of what we are going to build.

## How this Project was Created

Using `@nestjs/cli` ![](https://img.shields.io/badge/nest-8.2.5-red)

1. `nest new practice-nestjs-graphql`
2. `npm i graphql @nestjs/graphql apollo-server-express @nestjs/apollo`
3. `npm i class-validator class-transformer`

## Start Your Journey

Continue the project and develop a logic to craft recipes.

Instead of having a database, we will be using a data in memory: `DATA_ITEMS` and `DATA_RECIPES`

1. Create `Inventory` resources for GraphQL

```
npx nest g module inventory
npx nest g service inventory
npx nest g resolver inventory
```

2. Import `GraphQLModule` in **app.module.ts**

```ts
GraphQLModule.forRoot({
  autoSchemaFile: true,
  driver: ApolloDriver,
})
```

3. Create `models` or entities for the **GraphQL schema**

- [Item](#item)
- [Inventory](#item)
- **Ingredient** (already created for you)
- **Recipe** (already created for you)

#### Item

**src/inventory/models/item.model.ts**

```ts
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Item {
  @Field()
  name: string;

  @Field(() => Int)
  quantity: number;

  @Field({ defaultValue: 0 })
  price?: number;
}
```

#### Inventory

**src/inventory/models/inventory.model.ts**

```ts
import { Field, ObjectType } from '@nestjs/graphql';
import { Item } from './item.model';

@ObjectType()
export class Inventory {
  @Field({ defaultValue: 0 })
  value?: number;

  @Field(() => [Item])
  items: Item[];
}
```

4. Add logic in to get data for **Item** and **Inventory**

**src/inventory/inventory.service.ts**

```ts
getItems(): Item[] {
    return DATA_ITEMS;
}

getItem(names: string[]): Item[] {
    const items: Item[] = [];
    names.forEach(name => {
        const item = DATA_ITEMS.filter(item => item.name === name);
        items.push(...item);
    });
    return items;
}

getInventory(): Inventory {
    const items = this.getItems();
    const value = items.reduce((a, b) => a + ((b.price || 0) * b.quantity), 0);
    return { items, value };
}
```

5. Add `Query` resolver for `InventoryService.getInventory()`

**src/inventory/inventory.resolver.ts**

```ts
constructor(private inventoryService: InventoryService) { }

@Query(() => Inventory, { name: 'inventory' }) getInventory(): Inventory {
  return this.inventoryService.getInventory();
}
```

Test it

```graphql
{
  inventory {
    value
    items {
      name
      quantity
      price
    }
  }
}
```

6. Create resolver with `ResolverField` for the child field (child is **Item**) and parent is **Inventory** so we also need to specify `@Resolver(() => Inventory)` on top of the `export class InventoryResolver`

> **Note** We have `@Args` here without creating a separate file for `@ArgsType`. Later at **Step 8** will show a different approach to define arguments which we can verify with **class-validator** package as this is a user input

```diff
+@Resolver(() => Inventory)
export class InventoryResolver {

+  @ResolveField(() => [Item], { name: 'items' })
+  filterItems(@Args('names', { type: () => [String], nullable: true }) names: string[]): Item[] {
+      if (names) { return this.inventoryService.getItem(names); }
+      return this.inventoryService.getItems();
+  }

}
```

Test it

```graphql
{
  inventory {
    value
    items(names: "sugar") {
      name
      quantity
      price
    }
  }
}
```

7. Add logic to get `Recipe` data

**inventory.service.ts**

```ts
getRecipes(): Recipe[] {
    return DATA_RECIPES;
}

getRecipe(_id: string): Recipe[] {
    return DATA_RECIPES.filter(recipe => recipe._id === _id);
}
```

8. Let's create `@ArgsType()` so we can also validate that user input using **class-validator** package

Create file `src/inventory/dto/_id.args.ts`

```ts
import { ArgsType, Field } from '@nestjs/graphql';
import { IsMongoId, IsOptional } from 'class-validator';

@ArgsType()
export class MongoIDArgs {
  @IsMongoId()
  @IsOptional()
  @Field({ nullable: true })
  _id: string;
}
```

9. Create `Query` resolvers for **Step 7 and 8**

**inventory.resolver.ts**

```ts
@Query(() => [Recipe], { name: 'recipes' })
getRecipes(@Args() mongoIDArgs: MongoIDArgs): Recipe[] {
    if (mongoIDArgs._id) { return this.inventoryService.getRecipe(mongoIDArgs._id); }
    return this.inventoryService.getRecipes();
}
```

Test it

```graphql
{
  recipes {
    _id
    name
    ingredients {
      name
      quantity
    }
  }
}
```

10. Create `CollectEnum` for **Typescript** and **GraphQL** to be used for our next logic

**src/inventory/enums/collect.enum.ts**

```ts
import { registerEnumType } from '@nestjs/graphql';

export enum CollectEnum {
  HARVEST,
  FISH,
}

registerEnumType(CollectEnum, { name: 'CollectEnum' });
```

11. Create logic to gather materials for crafting

**inventory.service.ts**

```ts
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
```

12. Create `Mutation` resolver for the previous logic

**inventory.resolver.ts**

```ts
@Mutation(() => [Item])
gather(@Args('item', { type: () => CollectEnum }) collect: CollectEnum): Item[] {
    return this.inventoryService.gather(collect);
}
```

Test it

```graphql
mutation {
  gather(item: HARVEST) {
    name
    quantity
    price
  }
}
```

13. Create **args** for our next `craft` logic. This time, the input args can accept multiple arguments.

**src/inventory/dto/craft.args.ts**

```ts
import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class CraftArgs {
  @Field({ nullable: true })
  _id?: string;

  @Field({ nullable: true })
  name?: string;
}
```

14. Create logic for `craft` and `checkMissingIngredients`

**inventory.service.ts**

```ts
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
```

15. Add `Resolver` for the previous logic

**inventory.resolver.ts**

```ts
@Mutation(() => Item)
craft(@Args() craftArgs: CraftArgs): Item {
    return this.inventoryService.craft(craftArgs);
}
```

Test it

```graphql
mutation {
  craft(name: "pancakes") {
    name
    quantity
    price
  }
}
```

16. To add new recipe identify the `Input` for GraphQL

**src/inventory/models/recipe.model.ts**

```diff
+@InputType('RecipeInput')
 @ObjectType()
 export class Recipe {
     @Field({ nullable: true })
     _id?: string;

     ...
 }
```

17. Create logic to add a new `Recipe`

**inventory.service.ts**

```ts
addRecipe(recipe: Recipe): Recipe {
    const existingRecipe = DATA_RECIPES.find(r => r.name.toLowerCase() === recipe.name.toLowerCase());
    if (existingRecipe) { throw new ConflictException('You already know this recipe, use updateRecipe() instead'); }

    recipe._id = IDUtil.oid();
    DATA_RECIPES.push(recipe);

    return recipe;
}
```

18. Create the `Resolver` for the previous logic

**inventory.resolver.ts**

```ts
@Mutation(() => Recipe)
addRecipe(@Args('recipeInput') recipe: Recipe): Recipe {
    return this.inventoryService.addRecipe(recipe);
}
```

Test it

**Mutation**

```graphql
mutation ($input: RecipeInput!) {
  addRecipe(recipeInput: $input) {
    _id
    name
    price
    category
    produceQuantity
    ingredients {
      name
      quantity
    }
  }
}
```

**Query Variables**

```graphql
{
  "input": {
    "name": "bread",
    "produceQuantity": 5,
    "ingredients": [
      {
        "name": "wheat",
        "quantity": 5
      }
    ]
  }
}
```

19. To update recipe... we need to create separate `UpdateRecipeInput` since we don't require all properties as an input.

**src/inventory/dto/update-recipe.input.ts**

```ts
import { InputType, PartialType } from '@nestjs/graphql';
import { Recipe } from '../models/recipe.model';

@InputType()
export class UpdateRecipeInput extends PartialType(Recipe) {}
```

20. Create logic for `updateRecipe`

**inventory.service.ts**

```ts
updateRecipe(recipe: UpdateRecipeInput): Recipe {
    const [existingRecipe] = this.getRecipe(recipe._id);
    if (!existingRecipe) { throw new NotFoundException('Recipe not found'); }

    Object.assign(existingRecipe, recipe);

    return existingRecipe;
}
```

**Final**. Create `Resolver` for that logic

**inventory.resolver.ts**

Here, instead of **Recipe**, we used the type `UpdateRecipeInput` since we require only partial fields as input.

```ts
@Mutation(() => Recipe)
updateRecipe(@Args('updateRecipeInput') recipe: UpdateRecipeInput): Recipe {
    return this.inventoryService.updateRecipe(recipe);
}
```

Test it

**Mutation Query**

```graphql
mutation ($input: UpdateRecipeInput!) {
  updateRecipe(updateRecipeInput: $input) {
    _id
    name
    price
    category
    produceQuantity
  }
}
```

**Query Variables**

```graphql
{
  "input": {
    "_id": "62cce74002e41d92b1bb92fc",
    "price": 10
  }
}
```

## Try Your Server in the UI

- https://github.com/lightzane/practice-nestjs-graphql-ui
