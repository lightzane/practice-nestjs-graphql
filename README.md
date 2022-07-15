# practice-nestjs-graphql

Practice Nestjs GraphQL and build craft/cook foods to make it more interesting.

## Getting Started

Do the following below before navigating to `http://localhost:3000/graphql`

```
npm install
npm run start:dev
```

## How this Project was Created

Using `@nestjs/cli` ![](https://img.shields.io/badge/nest-8.2.5-red)

1. `nest new practice-nestjs-graphql`
2. `npm i graphql @nestjs/graphql apollo-server-express @nestjs/apollo`
3. `npm i class-validator class-transformer`

## GraphQL Schema

```graphql
type Item {
  name: String!
  quantity: Int!
  price: Float!
}

type Inventory {
  value: Float!

  # Display multiple items available in the inventory
  items(names: [String!]): [Item!]!
}

type Ingredient {
  name: String!
  quantity: Int!
}

type Recipe {
  _id: String
  name: String!
  ingredients: [Ingredient!]!
  price: Float!
  category: String
}

type Query {
  # Display all the items and its value
  inventory: Inventory!

  # Display all available recipes
  recipes(_id: String): [Recipe!]!
}

type Mutation {
  # Gather raw items available as an ingredient to craft
  gather(item: CollectEnum!): [Item!]!

  # Craft a selected recipe and consumes ingredients in the inventory
  craft(_id: String, name: String): Item!
}

enum CollectEnum {
  HARVEST
  FISH
}
```

## GraphQL Query

```graphql
{
  inventory {
    value
    # items(names: [String!])
    items {
      name
      quantity
      price
    }
  }

  # recipes(id: String)
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

## GraphQL Mutation

**gather**

```graphql
mutation {
  gather(item: HARVEST) {
    name
    quantity
    price
  }
}
```

**craft**

```graphql
mutation {
  craft(name: "pancakes") {
    name
    quantity
    price
  }
}
```

**add recipe**

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

# Query Variables
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

**update recipe**

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

#Query Variables
{
  "input": {
    "_id": "62cce74002e41d92b1bb92fc",
    "price": 10
  }
}
```

## Try Your Server in the UI

- https://github.com/lightzane/practice-nestjs-graphql-ui
