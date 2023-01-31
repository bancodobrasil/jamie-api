import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMetaToMenuItem1674618405066 implements MigrationInterface {
  name = 'AddMetaToMenuItem1674618405066';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` ADD \`meta\` text NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`menu_items\` DROP COLUMN \`meta\``);
  }
}
