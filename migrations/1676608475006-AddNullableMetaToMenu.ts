import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNullableMetaToMenu1676608475006 implements MigrationInterface {
  name = 'AddNullableMetaToMenu1676608475006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menus\` CHANGE \`meta\` \`meta\` text NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menus\` CHANGE \`meta\` \`meta\` text NOT NULL`,
    );
  }
}
