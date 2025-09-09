-- Create 'menu-images' bucket using INSERT (version-safe) and add RLS policies

-- 1) Create the bucket (id = name = 'menu-images'), public
insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do nothing;

-- 2) (Optional) Set size/mime constraints when columns exist (older storage may not have these)
do $$
begin
  begin
    update storage.buckets
    set file_size_limit = 6291456,                               -- 6 MB
        allowed_mime_types = array['image/jpeg','image/png','image/webp']
    where id = 'menu-images';
  exception when undefined_column then
    null; -- column not available; skip
  end;
end $$;

-- 3) (Re)create RLS policies (drop first to avoid duplicates)
drop policy if exists "auth can read menu images" on storage.objects;
drop policy if exists "auth can upload menu images" on storage.objects;
drop policy if exists "auth can update menu images" on storage.objects;
drop policy if exists "auth can delete menu images" on storage.objects;
drop policy if exists "public read menu images" on storage.objects;

-- Public read (useful for direct CDN/object access); safe with a public bucket
create policy "public read menu images"
on storage.objects for select
to public
using (bucket_id = 'menu-images');

-- Broad insert for authenticated users (verify upload path works, then tighten if desired)
create policy "auth can upload menu images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'menu-images');

-- Optional: allow update/delete by authenticated users
create policy "auth can update menu images"
on storage.objects for update
to authenticated
using (bucket_id = 'menu-images')
with check (bucket_id = 'menu-images');

create policy "auth can delete menu images"
on storage.objects for delete
to authenticated
using (bucket_id = 'menu-images');

-- NOTE: After confirming uploads succeed, you can tighten the above policies to
--   bucket_id = 'menu-images' AND name LIKE 'items/%'
-- for finer path control.
