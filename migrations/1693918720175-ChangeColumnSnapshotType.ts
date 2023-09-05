import { MigrationInterface, QueryRunner } from "typeorm"

export class ChangeColumnSnapshotType1693918720175 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`menu_revisions\` MODIFY \`snapshot\` LONGTEXT`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`menu_revisions\` MODIFY \`snapshot\` TEXT`,
        );
    }

}
