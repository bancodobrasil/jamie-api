import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPublishedRevisionToMenu1677320214393
  implements MigrationInterface
{
  name = 'AddPublishedRevisionToMenu1677320214393';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menus\` ADD \`published_revision_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menus\` ADD \`published_revision_menu_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menus\` ADD CONSTRAINT \`FK_e4bf608a85adf722bc3015bbb8a\` FOREIGN KEY (\`published_revision_id\`, \`published_revision_menu_id\`) REFERENCES \`menu_revisions\`(\`id\`,\`menu_id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menus\` DROP FOREIGN KEY \`FK_e4bf608a85adf722bc3015bbb8a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menus\` DROP COLUMN \`published_revision_menu_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menus\` DROP COLUMN \`published_revision_id\``,
    );
  }
}
