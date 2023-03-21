import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMenuPendencies1679435721405 implements MigrationInterface {
  name = 'CreateMenuPendencies1679435721405';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`menu_pendencies\` (\`id\` int NOT NULL AUTO_INCREMENT, \`menu_id\` int NOT NULL, \`submitted_by\` text NOT NULL, \`input\` text NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`, \`menu_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_pendencies\` ADD CONSTRAINT \`FK_4cda2325a9f4e05315a9a12fc36\` FOREIGN KEY (\`menu_id\`) REFERENCES \`menus\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_pendencies\` DROP FOREIGN KEY \`FK_4cda2325a9f4e05315a9a12fc36\``,
    );
    await queryRunner.query(`DROP TABLE \`menu_pendencies\``);
  }
}
