import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCascadeConstraintsToMenuItemParent1676580016840
  implements MigrationInterface
{
  name = 'AddCascadeConstraintsToMenuItemParent1676580016840';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` DROP FOREIGN KEY \`FK_8e20ca40202c116fdafe92cdc4e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` ADD CONSTRAINT \`FK_8e20ca40202c116fdafe92cdc4e\` FOREIGN KEY (\`parent_id\`) REFERENCES \`menu_items\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` DROP FOREIGN KEY \`FK_8e20ca40202c116fdafe92cdc4e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` ADD CONSTRAINT \`FK_8e20ca40202c116fdafe92cdc4e\` FOREIGN KEY (\`parent_id\`) REFERENCES \`menu_items\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
