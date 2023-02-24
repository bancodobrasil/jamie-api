import { MigrationInterface, QueryRunner } from 'typeorm';

export class MenuItemCompositePrimaryKey1677279793975
  implements MigrationInterface
{
  name = 'MenuItemCompositePrimaryKey1677279793975';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` DROP FOREIGN KEY \`FK_8e20ca40202c116fdafe92cdc4e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` ADD \`parent_menu_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`menu_items\` DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` ADD PRIMARY KEY (\`id\`, \`menu_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` ADD CONSTRAINT \`FK_410d05637be571e7fc8973ae364\` FOREIGN KEY (\`parent_id\`, \`parent_menu_id\`) REFERENCES \`menu_items\`(\`id\`,\`menu_id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` DROP FOREIGN KEY \`FK_410d05637be571e7fc8973ae364\``,
    );
    await queryRunner.query(`ALTER TABLE \`menu_items\` DROP PRIMARY KEY`);
    await queryRunner.query(`ALTER TABLE \`menu_items\` DROP COLUMN \`id\``);
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` ADD \`id\` int NOT NULL AUTO_INCREMENT, ADD PRIMARY KEY (\`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` DROP COLUMN \`parent_menu_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` ADD CONSTRAINT \`FK_8e20ca40202c116fdafe92cdc4e\` FOREIGN KEY (\`parent_id\`) REFERENCES \`menu_items\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
