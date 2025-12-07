import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251206095943 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "liked_product" ("id" text not null, "customer_id" text not null, "product_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "liked_product_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_LIKED_PRODUCT_CUSTOMER_ID" ON "liked_product" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_LIKED_PRODUCT_PRODUCT_ID" ON "liked_product" ("product_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_liked_product_deleted_at" ON "liked_product" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "liked_product" cascade;`);
  }

}
