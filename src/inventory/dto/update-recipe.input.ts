import { InputType, PartialType } from "@nestjs/graphql";
import { Recipe } from "../models/recipe.model";

@InputType()
export class UpdateRecipeInput extends PartialType(Recipe) { }