import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRulesheetIdToMenu1684339350858 implements MigrationInterface {
  name = 'AddRulesheetIdToMenu1684339350858';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menus\` ADD \`rulesheet_id\` int NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menus\` DROP COLUMN \`rulesheet_id\``,
    );
  }
}
