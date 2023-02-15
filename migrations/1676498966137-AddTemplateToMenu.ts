import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTemplateToMenu1676498966137 implements MigrationInterface {
  name = 'AddTemplateToMenu1676498966137';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`menus\` ADD \`template\` text NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`menus\` DROP COLUMN \`template\``);
  }
}
