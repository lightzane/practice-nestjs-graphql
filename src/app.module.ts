import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [
    InventoryModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: true,
      driver: ApolloDriver,
      playground: true, // to display GraphQL Playground in production/deployment (i.e. herokuapp)
      introspection: true // enable GraphQL server in production/deployment (e.g. deploying in herokuapp)
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
