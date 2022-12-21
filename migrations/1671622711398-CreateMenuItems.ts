import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMenuItems1671622711398 implements MigrationInterface {
  name = 'CreateMenuItems1671622711398';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`menu_items\` (\`id\` int NOT NULL AUTO_INCREMENT, \`label\` varchar(255) NOT NULL, \`order\` int NOT NULL, \`parent_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` ADD CONSTRAINT \`FK_8e20ca40202c116fdafe92cdc4e\` FOREIGN KEY (\`parent_id\`) REFERENCES \`menu_items\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` DROP FOREIGN KEY \`FK_8e20ca40202c116fdafe92cdc4e\``,
    );
    await queryRunner.query(`DROP TABLE \`menu_items\``);
  }
}
