import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251205053702 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "brand" ("id" text not null, "name" text not null, "description" text null, "meta_title" text null, "meta_desc" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "brand_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_brand_deleted_at" ON "brand" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "brand" cascade;`);
  }

}
