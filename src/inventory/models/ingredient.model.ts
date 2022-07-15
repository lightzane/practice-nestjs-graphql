import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";

@InputType('IngredientInput')
@ObjectType()
export class Ingredient {
    @Field()
    name: string;

    @Field(() => Int)
    quantity: number;
}