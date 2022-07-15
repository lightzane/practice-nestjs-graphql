import { ArgsType, Field } from "@nestjs/graphql";
import { IsMongoId, IsOptional } from "class-validator";

@ArgsType()
export class MongoIDArgs {
    @IsMongoId()
    @IsOptional()
    @Field({ nullable: true })
    _id: string;
}