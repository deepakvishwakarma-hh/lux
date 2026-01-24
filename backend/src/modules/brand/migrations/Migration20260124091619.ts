import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260124091619 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "brand" add column if not exists "title" text null, add column if not exists "slug" text null, add column if not exists "image_url" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "brand" drop column if exists "title", drop column if exists "slug", drop column if exists "image_url";`);
  }

}
