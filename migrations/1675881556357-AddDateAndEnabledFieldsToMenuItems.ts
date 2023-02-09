import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDateAndEnabledFieldsToMenuItems1675881556357 implements MigrationInterface {
    name = 'AddDateAndEnabledFieldsToMenuItems1675881556357'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`menu_items\` ADD \`enabled\` tinyint NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`menu_items\` ADD \`start_publication\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`menu_items\` ADD \`end_publication\` datetime NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`menu_items\` DROP COLUMN \`end_publication\``);
        await queryRunner.query(`ALTER TABLE \`menu_items\` DROP COLUMN \`start_publication\``);
        await queryRunner.query(`ALTER TABLE \`menu_items\` DROP COLUMN \`enabled\``);
    }

}
