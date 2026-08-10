-- Seed current site content so public pages never render empty

insert into public.employees (email, full_name)
values ('cjfrady5@gmail.com', 'Tommy')
on conflict (email) do nothing;

insert into public.site_stats (label, value, suffix, sort_order) values
  ('Lawns cared for',        500, '+', 1),
  ('Years of experience',     10, '+', 2),
  ('Satisfaction guaranteed',100, '%', 3),
  ('Response time',           24, 'h', 4);

insert into public.site_content (key, value) values
  ('hero_title',        'A lawn you''ll love coming'),
  ('hero_title_accent', 'home to.'),
  ('hero_lede',         'THOY Lawncare delivers quality lawn care with attention to detail and service you can count on.'),
  ('about_title',       'We treat your yard'),
  ('about_title_accent','like our own.'),
  ('about_p1',          'THOY Lawncare started with a simple idea: show up on time, do careful work, and leave every lawn looking sharp. We''re a local team that takes pride in the details — clean lines, healthy grass, and tidy beds.'),
  ('about_p2',          'From weekly mowing to seasonal cleanups, mulching, and edging, we handle the work so you can enjoy a yard you''re proud of.'),
  ('contact_phone',     '(555) 123-4567'),
  ('contact_email',     'hello@thoylawncare.com'),
  ('contact_area',      'Serving your neighborhood')
on conflict (key) do nothing;
