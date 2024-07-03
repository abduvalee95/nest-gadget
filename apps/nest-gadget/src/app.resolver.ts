import { Query, Resolver } from "@nestjs/graphql";

@Resolver()
export class AppResolver{
    @Query(() => String)
    public sayHello(): string{
        return " This GRAPHQL API SERVER"
    }
}