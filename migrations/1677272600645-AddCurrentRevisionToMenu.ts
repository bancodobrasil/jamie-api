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
      `ALTER TABLE \`menus\` ADD CONSTRAINT \`FK_2101385c80b747f39d62ed6eb82\` FOREIGN KEY (\`current_revision_id\`) REFERENCES \`menu_revisions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menus\` DROP FOREIGN KEY \`FK_2101385c80b747f39d62ed6eb82\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menus\` DROP COLUMN \`current_revision_id\``,
    );
  }
}
