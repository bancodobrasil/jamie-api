import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMetaToMenu1674616785150 implements MigrationInterface {
  name = 'AddMetaToMenu1674616785150';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`menus\` ADD \`meta\` text NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`menus\` DROP COLUMN \`meta\``);
  }
}
