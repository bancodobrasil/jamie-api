import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNullableMetaToMenuItem1676609999446
  implements MigrationInterface
{
  name = 'AddNullableMetaToMenuItem1676609999446';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` CHANGE \`meta\` \`meta\` text NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` CHANGE \`meta\` \`meta\` text NOT NULL`,
    );
  }
}
