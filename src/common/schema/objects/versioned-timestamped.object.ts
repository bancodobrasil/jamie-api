import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

@ObjectType({ isAbstract: true })
export abstract class Timestamped {
  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}

@ObjectType({ isAbstract: true })
export abstract class VersionedTimestamped extends Timestamped {
  @Field(() => Int)
  @VersionColumn()
  version: number;
}
