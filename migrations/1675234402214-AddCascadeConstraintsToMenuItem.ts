import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCascadeConstraintsToMenuItem1675234402214
  implements MigrationInterface
{
  name = 'AddCascadeConstraintsToMenuItem1675234402214';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` DROP FOREIGN KEY \`FK_ba71edc684a901b4bc9d9228f42\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` ADD CONSTRAINT \`FK_ba71edc684a901b4bc9d9228f42\` FOREIGN KEY (\`menu_id\`) REFERENCES \`menus\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` DROP FOREIGN KEY \`FK_ba71edc684a901b4bc9d9228f42\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` ADD CONSTRAINT \`FK_ba71edc684a901b4bc9d9228f42\` FOREIGN KEY (\`menu_id\`) REFERENCES \`menus\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
