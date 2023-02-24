import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTemplateToMenuItem1676499215895 implements MigrationInterface {
  name = 'AddTemplateToMenuItem1676499215895';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` ADD \`template\` text NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` DROP COLUMN \`template\``,
    );
  }
}
