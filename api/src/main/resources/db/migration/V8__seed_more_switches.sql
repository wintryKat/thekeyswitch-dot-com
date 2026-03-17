-- V8: Expand switch catalog with 30 additional popular and enthusiast-grade switches
-- Data sourced from manufacturer specs; force curves are representative approximations

-- 21. Akko CS Lavender Purple (Tactile)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Akko CS Lavender Purple', 'Akko', 'tactile', 36.0, 50.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.3,"force_gf":12},{"distance_mm":0.7,"force_gf":28},{"distance_mm":1.1,"force_gf":36},{"distance_mm":1.4,"force_gf":42},{"distance_mm":1.7,"force_gf":30},{"distance_mm":2.2,"force_gf":28},{"distance_mm":2.8,"force_gf":38},{"distance_mm":3.4,"force_gf":44},{"distance_mm":4.0,"force_gf":50}]'::jsonb,
'medium-thocky', 'standard', 'POM', 'Polycarbonate', 0.15, ARRAY['akko', 'tactile', 'budget', 'light', 'beginner-friendly']);

-- 22. Akko CS Jelly Black (Linear)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Akko CS Jelly Black', 'Akko', 'linear', 50.0, 65.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.5,"force_gf":13},{"distance_mm":1.0,"force_gf":26},{"distance_mm":1.5,"force_gf":38},{"distance_mm":2.0,"force_gf":50},{"distance_mm":2.5,"force_gf":55},{"distance_mm":3.0,"force_gf":59},{"distance_mm":3.5,"force_gf":62},{"distance_mm":4.0,"force_gf":65}]'::jsonb,
'smooth-deep', 'standard', 'POM', 'Polycarbonate', 0.15, ARRAY['akko', 'linear', 'budget', 'smooth', 'medium']);

-- 23. Akko CS Rose Red (Linear)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Akko CS Rose Red', 'Akko', 'linear', 43.0, 55.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.5,"force_gf":11},{"distance_mm":1.0,"force_gf":22},{"distance_mm":1.5,"force_gf":33},{"distance_mm":2.0,"force_gf":43},{"distance_mm":2.5,"force_gf":47},{"distance_mm":3.0,"force_gf":50},{"distance_mm":3.5,"force_gf":53},{"distance_mm":4.0,"force_gf":55}]'::jsonb,
'smooth-light', 'standard', 'POM', 'Polycarbonate', 0.15, ARRAY['akko', 'linear', 'budget', 'light', 'gaming']);

-- 24. NovelKeys Cream (Linear)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('NovelKeys Cream', 'NovelKeys', 'linear', 55.0, 70.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.5,"force_gf":14},{"distance_mm":1.0,"force_gf":28},{"distance_mm":1.5,"force_gf":42},{"distance_mm":2.0,"force_gf":55},{"distance_mm":2.5,"force_gf":60},{"distance_mm":3.0,"force_gf":63},{"distance_mm":3.5,"force_gf":67},{"distance_mm":4.0,"force_gf":70}]'::jsonb,
'creamy-deep', 'standard', 'POM', 'POM', 0.55, ARRAY['novelkeys', 'linear', 'premium', 'pom', 'creamy', 'break-in']);

-- 25. C3 Equalz Tangerine V2 67g (Linear)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Tangerine V2 67g', 'C3 Equalz', 'linear', 53.0, 67.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.5,"force_gf":14},{"distance_mm":1.0,"force_gf":27},{"distance_mm":1.5,"force_gf":40},{"distance_mm":2.0,"force_gf":53},{"distance_mm":2.5,"force_gf":57},{"distance_mm":3.0,"force_gf":61},{"distance_mm":3.5,"force_gf":64},{"distance_mm":4.0,"force_gf":67}]'::jsonb,
'poppy-smooth', 'gold-plated', 'POM', 'UHMWPE', 0.65, ARRAY['c3', 'linear', 'premium', 'smooth', 'enthusiast', 'jwk']);

-- 26. TTC Gold Pink V2 (Linear)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('TTC Gold Pink V2', 'TTC', 'linear', 37.0, 45.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.5,"force_gf":9},{"distance_mm":1.0,"force_gf":19},{"distance_mm":1.5,"force_gf":28},{"distance_mm":2.0,"force_gf":37},{"distance_mm":2.5,"force_gf":39},{"distance_mm":3.0,"force_gf":41},{"distance_mm":3.5,"force_gf":43},{"distance_mm":4.0,"force_gf":45}]'::jsonb,
'soft-clacky', 'standard', 'POM', 'Polycarbonate', 0.22, ARRAY['ttc', 'linear', 'ultra-light', 'smooth', 'gaming']);

-- 27. TTC Bluish White (Tactile)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('TTC Bluish White', 'TTC', 'tactile', 42.0, 55.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.3,"force_gf":14},{"distance_mm":0.7,"force_gf":30},{"distance_mm":1.1,"force_gf":42},{"distance_mm":1.4,"force_gf":48},{"distance_mm":1.7,"force_gf":34},{"distance_mm":2.2,"force_gf":30},{"distance_mm":2.8,"force_gf":40},{"distance_mm":3.4,"force_gf":48},{"distance_mm":4.0,"force_gf":55}]'::jsonb,
'medium-clacky', 'standard', 'POM', 'Polycarbonate', 0.22, ARRAY['ttc', 'tactile', 'budget', 'office', 'gentle-bump']);

-- 28. Outemu Brown (Tactile)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Outemu Brown', 'Outemu', 'tactile', 45.0, 55.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.3,"force_gf":14},{"distance_mm":0.8,"force_gf":34},{"distance_mm":1.2,"force_gf":45},{"distance_mm":1.5,"force_gf":50},{"distance_mm":1.8,"force_gf":37},{"distance_mm":2.2,"force_gf":33},{"distance_mm":2.8,"force_gf":40},{"distance_mm":3.4,"force_gf":48},{"distance_mm":4.0,"force_gf":55}]'::jsonb,
'scratchy-medium', 'standard', 'POM', 'Nylon', 0.12, ARRAY['outemu', 'tactile', 'budget', 'prebuilt', 'entry-level']);

-- 29. Outemu Red (Linear)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Outemu Red', 'Outemu', 'linear', 45.0, 55.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.5,"force_gf":11},{"distance_mm":1.0,"force_gf":22},{"distance_mm":1.5,"force_gf":34},{"distance_mm":2.0,"force_gf":45},{"distance_mm":2.5,"force_gf":48},{"distance_mm":3.0,"force_gf":50},{"distance_mm":3.5,"force_gf":53},{"distance_mm":4.0,"force_gf":55}]'::jsonb,
'scratchy-light', 'standard', 'POM', 'Nylon', 0.12, ARRAY['outemu', 'linear', 'budget', 'prebuilt', 'entry-level']);

-- 30. SP-Star Meteor White (Linear)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('SP-Star Meteor White', 'SP-Star', 'linear', 57.0, 67.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.5,"force_gf":14},{"distance_mm":1.0,"force_gf":29},{"distance_mm":1.5,"force_gf":43},{"distance_mm":2.0,"force_gf":57},{"distance_mm":2.5,"force_gf":60},{"distance_mm":3.0,"force_gf":62},{"distance_mm":3.5,"force_gf":65},{"distance_mm":4.0,"force_gf":67}]'::jsonb,
'creamy-smooth', 'standard', 'POM', 'Nylon', 0.40, ARRAY['sp-star', 'linear', 'mid-range', 'smooth', 'creamy']);

-- 31. Tecsee Purple Panda (Tactile)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Tecsee Purple Panda', 'Tecsee', 'tactile', 52.0, 67.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.3,"force_gf":18},{"distance_mm":0.6,"force_gf":38},{"distance_mm":1.0,"force_gf":52},{"distance_mm":1.3,"force_gf":58},{"distance_mm":1.6,"force_gf":42},{"distance_mm":2.0,"force_gf":36},{"distance_mm":2.5,"force_gf":44},{"distance_mm":3.0,"force_gf":52},{"distance_mm":3.5,"force_gf":60},{"distance_mm":4.0,"force_gf":67}]'::jsonb,
'poppy-thocky', 'standard', 'POM', 'Polycarbonate/Nylon', 0.45, ARRAY['tecsee', 'tactile', 'mid-range', 'sharp-bump', 'panda-clone']);

-- 32. Durock T1 (Tactile)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Durock T1', 'Durock', 'tactile', 53.0, 67.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.3,"force_gf":18},{"distance_mm":0.6,"force_gf":38},{"distance_mm":1.0,"force_gf":53},{"distance_mm":1.3,"force_gf":60},{"distance_mm":1.5,"force_gf":44},{"distance_mm":2.0,"force_gf":36},{"distance_mm":2.5,"force_gf":44},{"distance_mm":3.0,"force_gf":52},{"distance_mm":3.5,"force_gf":60},{"distance_mm":4.0,"force_gf":67}]'::jsonb,
'medium-thocky', 'standard', 'POM', 'Polycarbonate', 0.55, ARRAY['durock', 'tactile', 'premium', 'sharp-bump', 'smooth']);

-- 33. Durock L7 62g (Linear)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Durock L7 62g', 'Durock', 'linear', 50.0, 62.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.5,"force_gf":13},{"distance_mm":1.0,"force_gf":25},{"distance_mm":1.5,"force_gf":38},{"distance_mm":2.0,"force_gf":50},{"distance_mm":2.5,"force_gf":53},{"distance_mm":3.0,"force_gf":56},{"distance_mm":3.5,"force_gf":59},{"distance_mm":4.0,"force_gf":62}]'::jsonb,
'smooth-deep', 'standard', 'POM', 'Polycarbonate', 0.55, ARRAY['durock', 'linear', 'premium', 'smooth', 'jwk']);

-- 34. Everglide Aqua King V3 55g (Linear)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Everglide Aqua King V3 55g', 'Everglide', 'linear', 44.0, 55.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.5,"force_gf":11},{"distance_mm":1.0,"force_gf":22},{"distance_mm":1.5,"force_gf":33},{"distance_mm":2.0,"force_gf":44},{"distance_mm":2.5,"force_gf":47},{"distance_mm":3.0,"force_gf":50},{"distance_mm":3.5,"force_gf":53},{"distance_mm":4.0,"force_gf":55}]'::jsonb,
'muted-smooth', 'standard', 'Polycarbonate', 'Polycarbonate', 0.50, ARRAY['everglide', 'linear', 'premium', 'transparent', 'rgb', 'smooth']);

-- 35. Cherry MX Clear (Tactile)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Cherry MX Clear', 'Cherry', 'tactile', 55.0, 95.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.3,"force_gf":22},{"distance_mm":0.8,"force_gf":45},{"distance_mm":1.2,"force_gf":55},{"distance_mm":1.5,"force_gf":65},{"distance_mm":1.8,"force_gf":48},{"distance_mm":2.2,"force_gf":55},{"distance_mm":2.8,"force_gf":70},{"distance_mm":3.4,"force_gf":82},{"distance_mm":4.0,"force_gf":95}]'::jsonb,
'medium-thocky', 'standard', 'POM', 'Nylon', 0.30, ARRAY['cherry', 'tactile', 'heavy', 'typing', 'office']);

-- 36. Cherry MX Green (Clicky)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Cherry MX Green', 'Cherry', 'clicky', 70.0, 95.0, 2.20, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.3,"force_gf":22},{"distance_mm":0.7,"force_gf":45},{"distance_mm":1.2,"force_gf":70},{"distance_mm":1.5,"force_gf":78},{"distance_mm":1.8,"force_gf":52},{"distance_mm":2.2,"force_gf":55},{"distance_mm":2.8,"force_gf":70},{"distance_mm":3.4,"force_gf":82},{"distance_mm":4.0,"force_gf":95}]'::jsonb,
'loud-heavy-clicky', 'standard', 'POM', 'Nylon', 0.30, ARRAY['cherry', 'clicky', 'heavy', 'loud']);

-- 37. Gateron Oil King (Linear)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Gateron Oil King', 'Gateron', 'linear', 55.0, 65.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.5,"force_gf":14},{"distance_mm":1.0,"force_gf":28},{"distance_mm":1.5,"force_gf":42},{"distance_mm":2.0,"force_gf":55},{"distance_mm":2.5,"force_gf":58},{"distance_mm":3.0,"force_gf":60},{"distance_mm":3.5,"force_gf":63},{"distance_mm":4.0,"force_gf":65}]'::jsonb,
'deep-thocky-smooth', 'standard', 'POM', 'Nylon (ink-style)', 0.35, ARRAY['gateron', 'linear', 'mid-range', 'factory-lubed', 'thocky', 'popular']);

-- 38. Gateron Ink V2 Black (Linear)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Gateron Ink V2 Black', 'Gateron', 'linear', 60.0, 70.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.5,"force_gf":15},{"distance_mm":1.0,"force_gf":30},{"distance_mm":1.5,"force_gf":45},{"distance_mm":2.0,"force_gf":60},{"distance_mm":2.5,"force_gf":63},{"distance_mm":3.0,"force_gf":65},{"distance_mm":3.5,"force_gf":68},{"distance_mm":4.0,"force_gf":70}]'::jsonb,
'deep-thocky', 'standard', 'POM', 'Nylon (ink)', 0.75, ARRAY['gateron', 'linear', 'premium', 'ink', 'heavy', 'thocky']);

-- 39. Glorious Panda (Tactile)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Glorious Panda', 'Glorious', 'tactile', 52.0, 67.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.3,"force_gf":18},{"distance_mm":0.6,"force_gf":38},{"distance_mm":1.0,"force_gf":52},{"distance_mm":1.3,"force_gf":60},{"distance_mm":1.5,"force_gf":44},{"distance_mm":2.0,"force_gf":36},{"distance_mm":2.5,"force_gf":44},{"distance_mm":3.0,"force_gf":52},{"distance_mm":3.5,"force_gf":60},{"distance_mm":4.0,"force_gf":67}]'::jsonb,
'poppy-thocky', 'standard', 'POM', 'Polycarbonate/Nylon', 0.50, ARRAY['glorious', 'tactile', 'mid-range', 'panda', 'sharp-bump']);

-- 40. KTT Strawberry (Linear)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('KTT Strawberry', 'KTT', 'linear', 43.0, 55.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.5,"force_gf":11},{"distance_mm":1.0,"force_gf":22},{"distance_mm":1.5,"force_gf":33},{"distance_mm":2.0,"force_gf":43},{"distance_mm":2.5,"force_gf":47},{"distance_mm":3.0,"force_gf":50},{"distance_mm":3.5,"force_gf":53},{"distance_mm":4.0,"force_gf":55}]'::jsonb,
'creamy-smooth', 'standard', 'POM', 'Polycarbonate', 0.18, ARRAY['ktt', 'linear', 'budget', 'light', 'smooth', 'popular']);

-- 41. Boba U4 (Silent Tactile)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Boba U4 62g', 'Gazzew', 'tactile', 50.0, 62.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.3,"force_gf":18},{"distance_mm":0.6,"force_gf":38},{"distance_mm":1.0,"force_gf":50},{"distance_mm":1.3,"force_gf":56},{"distance_mm":1.5,"force_gf":40},{"distance_mm":2.0,"force_gf":34},{"distance_mm":2.5,"force_gf":42},{"distance_mm":3.0,"force_gf":50},{"distance_mm":3.5,"force_gf":56},{"distance_mm":4.0,"force_gf":62}]'::jsonb,
'silent-thocky', 'standard', 'POM', 'Nylon/UHMWPE blend', 0.65, ARRAY['gazzew', 'tactile', 'premium', 'silent', 'office', 'quiet', 'sharp-bump']);

-- 42. Gateron G Pro 3.0 Yellow (Linear)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Gateron G Pro 3.0 Yellow', 'Gateron', 'linear', 50.0, 67.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.5,"force_gf":14},{"distance_mm":1.0,"force_gf":27},{"distance_mm":1.5,"force_gf":39},{"distance_mm":2.0,"force_gf":50},{"distance_mm":2.5,"force_gf":55},{"distance_mm":3.0,"force_gf":59},{"distance_mm":3.5,"force_gf":63},{"distance_mm":4.0,"force_gf":67}]'::jsonb,
'smooth-medium', 'standard', 'POM', 'Nylon', 0.22, ARRAY['gateron', 'linear', 'budget', 'factory-lubed', 'popular', 'improved']);

-- 43. Kailh Midnight Silent V2 (Linear)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Kailh Midnight Silent V2', 'Kailh', 'linear', 45.0, 55.0, 2.00, 3.60,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.5,"force_gf":12},{"distance_mm":1.0,"force_gf":24},{"distance_mm":1.5,"force_gf":36},{"distance_mm":2.0,"force_gf":45},{"distance_mm":2.5,"force_gf":48},{"distance_mm":3.0,"force_gf":51},{"distance_mm":3.6,"force_gf":55}]'::jsonb,
'silent-dampened', 'standard', 'POM', 'Nylon', 0.35, ARRAY['kailh', 'linear', 'silent', 'quiet', 'office']);

-- 44. Ajazz Diced Fruit Banana (Linear)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Ajazz Banana', 'Ajazz', 'linear', 45.0, 55.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.5,"force_gf":12},{"distance_mm":1.0,"force_gf":23},{"distance_mm":1.5,"force_gf":34},{"distance_mm":2.0,"force_gf":45},{"distance_mm":2.5,"force_gf":48},{"distance_mm":3.0,"force_gf":50},{"distance_mm":3.5,"force_gf":53},{"distance_mm":4.0,"force_gf":55}]'::jsonb,
'creamy-light', 'standard', 'POM', 'Polycarbonate', 0.15, ARRAY['ajazz', 'linear', 'budget', 'light', 'fruit-series']);

-- 45. Wuque Studio WS Morandi (Tactile)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('WS Morandi', 'Wuque Studio', 'tactile', 50.0, 63.5, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.3,"force_gf":16},{"distance_mm":0.7,"force_gf":35},{"distance_mm":1.1,"force_gf":50},{"distance_mm":1.4,"force_gf":55},{"distance_mm":1.7,"force_gf":40},{"distance_mm":2.2,"force_gf":35},{"distance_mm":2.8,"force_gf":46},{"distance_mm":3.4,"force_gf":55},{"distance_mm":4.0,"force_gf":63.5}]'::jsonb,
'poppy-medium', 'standard', 'POM', 'Nylon', 0.55, ARRAY['wuque', 'tactile', 'premium', 'mid-weight', 'gentle-bump']);

-- 46. Cherry MX2A Red (Linear) - Updated 2024 revision
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Cherry MX2A Red', 'Cherry', 'linear', 45.0, 63.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.5,"force_gf":12},{"distance_mm":1.0,"force_gf":23},{"distance_mm":1.5,"force_gf":34},{"distance_mm":2.0,"force_gf":45},{"distance_mm":2.5,"force_gf":52},{"distance_mm":3.0,"force_gf":56},{"distance_mm":3.5,"force_gf":60},{"distance_mm":4.0,"force_gf":63}]'::jsonb,
'smooth-medium', 'standard', 'POM', 'Nylon (updated)', 0.35, ARRAY['cherry', 'linear', 'gaming', 'updated', 'smoother']);

-- 47. Kailh Box Red (Linear)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Kailh Box Red', 'Kailh', 'linear', 45.0, 60.0, 1.80, 3.60,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.5,"force_gf":13},{"distance_mm":1.0,"force_gf":25},{"distance_mm":1.5,"force_gf":37},{"distance_mm":1.8,"force_gf":45},{"distance_mm":2.2,"force_gf":50},{"distance_mm":2.7,"force_gf":54},{"distance_mm":3.2,"force_gf":57},{"distance_mm":3.6,"force_gf":60}]'::jsonb,
'medium-clacky', 'standard', 'POM', 'Nylon', 0.25, ARRAY['kailh', 'linear', 'box', 'ip56', 'dust-resistant', 'gaming']);

-- 48. Gateron Cap V2 Milky Yellow (Linear)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Gateron Cap V2 Milky Yellow', 'Gateron', 'linear', 50.0, 63.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.5,"force_gf":13},{"distance_mm":1.0,"force_gf":26},{"distance_mm":1.5,"force_gf":38},{"distance_mm":2.0,"force_gf":50},{"distance_mm":2.5,"force_gf":54},{"distance_mm":3.0,"force_gf":57},{"distance_mm":3.5,"force_gf":60},{"distance_mm":4.0,"force_gf":63}]'::jsonb,
'smooth-thocky', 'standard', 'POM', 'Nylon (milky)', 0.28, ARRAY['gateron', 'linear', 'budget', 'milky', 'improved', 'factory-lubed']);

-- 49. Haimu Heartbeat Silent (Linear)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Haimu Heartbeat', 'Haimu', 'linear', 45.0, 55.0, 2.00, 3.80,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.5,"force_gf":12},{"distance_mm":1.0,"force_gf":24},{"distance_mm":1.5,"force_gf":35},{"distance_mm":2.0,"force_gf":45},{"distance_mm":2.5,"force_gf":48},{"distance_mm":3.0,"force_gf":51},{"distance_mm":3.5,"force_gf":54},{"distance_mm":3.8,"force_gf":55}]'::jsonb,
'silent-smooth', 'standard', 'POM', 'Nylon', 0.30, ARRAY['haimu', 'linear', 'silent', 'quiet', 'office', 'budget']);

-- 50. JWK T1 Shrimp (Tactile)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('JWK T1 Shrimp', 'JWK', 'tactile', 53.0, 67.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.3,"force_gf":18},{"distance_mm":0.6,"force_gf":38},{"distance_mm":1.0,"force_gf":53},{"distance_mm":1.3,"force_gf":60},{"distance_mm":1.5,"force_gf":44},{"distance_mm":2.0,"force_gf":36},{"distance_mm":2.5,"force_gf":44},{"distance_mm":3.0,"force_gf":52},{"distance_mm":3.5,"force_gf":60},{"distance_mm":4.0,"force_gf":67}]'::jsonb,
'poppy-medium', 'gold-plated', 'POM', 'Polycarbonate', 0.55, ARRAY['jwk', 'tactile', 'premium', 'sharp-bump', 'smooth']);
