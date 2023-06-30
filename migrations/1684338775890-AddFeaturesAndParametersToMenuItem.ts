import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeaturesAndParametersToMenuItem1684338775890
  implements MigrationInterface
{
  name = 'AddFeaturesAndParametersToMenuItem1684338775890';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` ADD \`features\` text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` ADD \`parameters\` text NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` DROP COLUMN \`parameters\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` DROP COLUMN \`features\``,
    );
  }
}
