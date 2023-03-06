import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUuidToMenu1678132405217 implements MigrationInterface {
  name = 'AddUuidToMenu1678132405217';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menus\` ADD \`uuid\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menus\` ADD UNIQUE INDEX \`IDX_69aca9e46979f8eff3286c739c\` (\`uuid\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menus\` DROP INDEX \`IDX_69aca9e46979f8eff3286c739c\``,
    );
    await queryRunner.query(`ALTER TABLE \`menus\` DROP COLUMN \`uuid\``);
  }
}
