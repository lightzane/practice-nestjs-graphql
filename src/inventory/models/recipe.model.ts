import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { Ingredient } from "./ingredient.model";

@ObjectType()
export class Recipe {
    @Field({ nullable: true })
    _id?: string;

    @Field()
    name: string;

    @Field(() => [Ingredient])
    ingredients: Ingredient[];

    @Field({ defaultValue: 0 })
    price?: number;

    @Field({ nullable: true })
    category?: string;

    @Field(() => Int, { description: 'The amount produced after a single craft' })
    produceQuantity: number;
}