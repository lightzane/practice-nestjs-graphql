import { ArgsType, Field } from "@nestjs/graphql";

@ArgsType()
export class CraftArgs {
    @Field({ nullable: true })
    _id?: string;

    @Field({ nullable: true })
    name?: string;
}