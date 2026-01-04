import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260104103727 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "product_query" ("id" text not null, "type" text check ("type" in ('question', 'custom_delivery', 'customize_product')) not null, "product_id" text not null, "customer_name" text not null, "customer_email" text not null, "customer_mobile" text not null, "subject" text not null, "message" text not null, "address" jsonb not null, "status" text check ("status" in ('new', 'read', 'responded')) not null default 'new', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_query_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_PRODUCT_QUERY_PRODUCT_ID" ON "product_query" ("product_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_PRODUCT_QUERY_CUSTOMER_EMAIL" ON "product_query" ("customer_email") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_query_deleted_at" ON "product_query" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "product_query" cascade;`);
  }

}
