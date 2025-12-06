import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251206093710 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "carousel" ("id" text not null, "image_url1" text null, "image_url2" text null, "link" text null, "order" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "carousel_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_carousel_deleted_at" ON "carousel" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "carousel" cascade;`);
  }

}
