import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRulesToMenuItem1684338081679 implements MigrationInterface {
  name = 'AddRulesToMenuItem1684338081679';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` ADD \`rules\` text NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`menu_items\` DROP COLUMN \`rules\``);
  }
}
