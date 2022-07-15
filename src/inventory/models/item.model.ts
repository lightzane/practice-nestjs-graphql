import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Item {
    @Field()
    name: string;

    @Field(() => Int)
    quantity: number;

    @Field({ defaultValue: 0 })
    price?: number;
}