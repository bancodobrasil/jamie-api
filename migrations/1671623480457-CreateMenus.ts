import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMenus1671623480457 implements MigrationInterface {
  name = 'CreateMenus1671623480457';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`menus\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` ADD \`menu_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` ADD CONSTRAINT \`FK_ba71edc684a901b4bc9d9228f42\` FOREIGN KEY (\`menu_id\`) REFERENCES \`menus\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` DROP FOREIGN KEY \`FK_ba71edc684a901b4bc9d9228f42\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` DROP COLUMN \`menu_id\``,
    );
    await queryRunner.query(`DROP TABLE \`menus\``);
  }
}
