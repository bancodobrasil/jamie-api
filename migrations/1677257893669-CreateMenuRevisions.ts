import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMenuRevisions1677257893669 implements MigrationInterface {
  name = 'CreateMenuRevisions1677257893669';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`menu_revisions\` (\`id\` int NOT NULL, \`menu_id\` int NOT NULL, \`description\` text NOT NULL, \`snapshot\` text NOT NULL, \`date_created\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`, \`menu_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_revisions\` ADD CONSTRAINT \`FK_ae57a5041c46e5dba5810a73030\` FOREIGN KEY (\`menu_id\`) REFERENCES \`menus\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_revisions\` DROP FOREIGN KEY \`FK_ae57a5041c46e5dba5810a73030\``,
    );
    await queryRunner.query(`DROP TABLE \`menu_revisions\``);
  }
}
