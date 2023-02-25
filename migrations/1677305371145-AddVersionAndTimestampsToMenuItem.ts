import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVersionAndTimestampsToMenuItem1677305371145
  implements MigrationInterface
{
  name = 'AddVersionAndTimestampsToMenuItem1677305371145';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` ADD \`deleted_at\` datetime(6) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` ADD \`version\` int NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` DROP COLUMN \`version\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` DROP COLUMN \`deleted_at\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` DROP COLUMN \`updated_at\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` DROP COLUMN \`created_at\``,
    );
  }
}
