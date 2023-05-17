import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHasConditionsToMenu1684313628148 implements MigrationInterface {
  name = 'AddHasConditionsToMenu1684313628148';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menus\` ADD \`has_conditions\` tinyint NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menus\` DROP COLUMN \`has_conditions\``,
    );
  }
}
