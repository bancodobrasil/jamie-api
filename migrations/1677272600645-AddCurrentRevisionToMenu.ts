import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCurrentRevisionToMenu1677272600645
  implements MigrationInterface
{
  name = 'AddCurrentRevisionToMenu1677272600645';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menus\` ADD \`current_revision_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menus\` ADD \`current_revision_menu_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menus\` ADD CONSTRAINT \`FK_27681781e1b6b13225c733fb648\` FOREIGN KEY (\`current_revision_id\`, \`current_revision_menu_id\`) REFERENCES \`menu_revisions\`(\`id\`,\`menu_id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menus\` DROP FOREIGN KEY \`FK_27681781e1b6b13225c733fb648\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menus\` DROP COLUMN \`current_revision_menu_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menus\` DROP COLUMN \`current_revision_id\``,
    );
  }
}
