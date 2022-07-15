import { Field, ObjectType } from "@nestjs/graphql";
import { Item } from "./item.model";

@ObjectType()
export class Inventory {
    @Field({ defaultValue: 0 })
    value?: number;

    @Field(() => [Item])
    items: Item[];
}