import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVersionAndTimestampsToMenu1677304809626
  implements MigrationInterface
{
  name = 'AddVersionAndTimestampsToMenu1677304809626';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menus\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menus\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menus\` ADD \`deleted_at\` datetime(6) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menus\` ADD \`version\` int NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`menus\` DROP COLUMN \`version\``);
    await queryRunner.query(`ALTER TABLE \`menus\` DROP COLUMN \`deleted_at\``);
    await queryRunner.query(`ALTER TABLE \`menus\` DROP COLUMN \`updated_at\``);
    await queryRunner.query(`ALTER TABLE \`menus\` DROP COLUMN \`created_at\``);
  }
}
