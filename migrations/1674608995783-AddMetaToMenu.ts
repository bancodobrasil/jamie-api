import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMetaToMenu1674608995783 implements MigrationInterface {
  name = 'AddMetaToMenu1674608995783';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`menus\` ADD \`meta\` text NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`menus\` DROP COLUMN \`meta\``);
  }
}
