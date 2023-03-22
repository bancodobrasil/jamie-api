import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMustDeferChangesToMenu1679426133674
  implements MigrationInterface
{
  name = 'AddMustDeferChangesToMenu1679426133674';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menus\` ADD \`must_defer_changes\` tinyint NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menus\` DROP COLUMN \`must_defer_changes\``,
    );
  }
}
