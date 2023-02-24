import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTemplateFormatToMenu1676500037896
  implements MigrationInterface
{
  name = 'AddTemplateFormatToMenu1676500037896';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menus\` ADD \`template_format\` text NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menus\` DROP COLUMN \`template_format\``,
    );
  }
}
