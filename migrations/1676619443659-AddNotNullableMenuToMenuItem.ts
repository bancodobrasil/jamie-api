import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotNullableMenuToMenuItem1676619443659
  implements MigrationInterface
{
  name = 'AddNotNullableMenuToMenuItem1676619443659';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` DROP FOREIGN KEY \`FK_ba71edc684a901b4bc9d9228f42\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` CHANGE \`menu_id\` \`menu_id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` ADD CONSTRAINT \`FK_ba71edc684a901b4bc9d9228f42\` FOREIGN KEY (\`menu_id\`) REFERENCES \`menus\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` DROP FOREIGN KEY \`FK_ba71edc684a901b4bc9d9228f42\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` CHANGE \`menu_id\` \`menu_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_items\` ADD CONSTRAINT \`FK_ba71edc684a901b4bc9d9228f42\` FOREIGN KEY (\`menu_id\`) REFERENCES \`menus\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
