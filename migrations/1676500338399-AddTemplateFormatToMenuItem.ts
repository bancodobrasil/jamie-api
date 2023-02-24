import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTemplateFormatToMenuItem1676500338399
  implements MigrationInterface
{
  name = 'AddTemplateFormatToMenuItem1676500338399';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` ADD \`template_format\` text NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` DROP COLUMN \`template_format\``,
    );
  }
}
