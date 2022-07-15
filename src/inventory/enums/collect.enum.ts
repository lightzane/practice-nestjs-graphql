import { registerEnumType } from "@nestjs/graphql";

export enum CollectEnum {
    HARVEST,
    FISH
}

registerEnumType(CollectEnum, { name: 'CollectEnum' });