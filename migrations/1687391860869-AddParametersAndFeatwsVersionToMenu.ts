import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddParametersAndFeatwsVersionToMenu1687391860869
  implements MigrationInterface
{
  name = 'AddParametersAndFeatwsVersionToMenu1687391860869';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` DROP COLUMN \`features\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` DROP COLUMN \`parameters\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menus\` ADD \`featws_version\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menus\` ADD \`parameters\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`menus\` DROP COLUMN \`parameters\``);
    await queryRunner.query(
      `ALTER TABLE \`menus\` DROP COLUMN \`featws_version\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` ADD \`parameters\` text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` ADD \`features\` text NULL`,
    );
  }
}
