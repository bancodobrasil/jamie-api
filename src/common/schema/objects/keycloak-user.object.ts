import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class KeycloakUser {
  @Field(() => ID)
  id: string;

  @Field()
  username: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;
}
