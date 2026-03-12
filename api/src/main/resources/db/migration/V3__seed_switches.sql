-- Seed data: 20 real mechanical keyboard switches with realistic specs and force curves

-- 1. Cherry MX Red (Linear)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Cherry MX Red', 'Cherry', 'linear', 45.0, 63.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.5,"force_gf":12},{"distance_mm":1.0,"force_gf":23},{"distance_mm":1.5,"force_gf":34},{"distance_mm":2.0,"force_gf":45},{"distance_mm":2.5,"force_gf":52},{"distance_mm":3.0,"force_gf":56},{"distance_mm":3.5,"force_gf":59},{"distance_mm":4.0,"force_gf":63}]'::jsonb,
'medium-pitched', 'standard', 'POM', 'Nylon', 0.25, ARRAY['cherry', 'linear', 'gaming', 'light']);

-- 2. Cherry MX Blue (Clicky)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Cherry MX Blue', 'Cherry', 'clicky', 50.0, 60.0, 2.20, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.3,"force_gf":15},{"distance_mm":0.7,"force_gf":30},{"distance_mm":1.2,"force_gf":50},{"distance_mm":1.5,"force_gf":55},{"distance_mm":1.8,"force_gf":38},{"distance_mm":2.2,"force_gf":30},{"distance_mm":2.8,"force_gf":42},{"distance_mm":3.4,"force_gf":52},{"distance_mm":4.0,"force_gf":60}]'::jsonb,
'loud-clicky', 'standard', 'POM', 'Nylon', 0.25, ARRAY['cherry', 'clicky', 'typing', 'tactile-feedback']);

-- 3. Cherry MX Brown (Tactile)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Cherry MX Brown', 'Cherry', 'tactile', 45.0, 55.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.3,"force_gf":15},{"distance_mm":0.8,"force_gf":35},{"distance_mm":1.2,"force_gf":45},{"distance_mm":1.5,"force_gf":50},{"distance_mm":1.8,"force_gf":38},{"distance_mm":2.2,"force_gf":33},{"distance_mm":2.8,"force_gf":40},{"distance_mm":3.4,"force_gf":48},{"distance_mm":4.0,"force_gf":55}]'::jsonb,
'medium-thocky', 'standard', 'POM', 'Nylon', 0.25, ARRAY['cherry', 'tactile', 'all-purpose', 'office']);

-- 4. Cherry MX Black (Linear)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Cherry MX Black', 'Cherry', 'linear', 60.0, 80.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.5,"force_gf":16},{"distance_mm":1.0,"force_gf":31},{"distance_mm":1.5,"force_gf":46},{"distance_mm":2.0,"force_gf":60},{"distance_mm":2.5,"force_gf":67},{"distance_mm":3.0,"force_gf":72},{"distance_mm":3.5,"force_gf":76},{"distance_mm":4.0,"force_gf":80}]'::jsonb,
'deep-thocky', 'standard', 'POM', 'Nylon', 0.25, ARRAY['cherry', 'linear', 'heavy', 'typing']);

-- 5. Cherry MX Speed Silver (Linear)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Cherry MX Speed Silver', 'Cherry', 'linear', 45.0, 63.0, 1.20, 3.40,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.4,"force_gf":15},{"distance_mm":0.8,"force_gf":30},{"distance_mm":1.2,"force_gf":45},{"distance_mm":1.6,"force_gf":50},{"distance_mm":2.0,"force_gf":54},{"distance_mm":2.5,"force_gf":57},{"distance_mm":3.0,"force_gf":60},{"distance_mm":3.4,"force_gf":63}]'::jsonb,
'medium-pitched', 'standard', 'POM', 'Nylon', 0.30, ARRAY['cherry', 'linear', 'gaming', 'speed', 'short-travel']);

-- 6. Cherry MX Silent Red (Linear)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Cherry MX Silent Red', 'Cherry', 'linear', 45.0, 63.0, 1.90, 3.70,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.5,"force_gf":13},{"distance_mm":1.0,"force_gf":25},{"distance_mm":1.5,"force_gf":36},{"distance_mm":1.9,"force_gf":45},{"distance_mm":2.4,"force_gf":52},{"distance_mm":2.9,"force_gf":57},{"distance_mm":3.3,"force_gf":60},{"distance_mm":3.7,"force_gf":63}]'::jsonb,
'quiet-dampened', 'standard', 'POM', 'Nylon', 0.35, ARRAY['cherry', 'linear', 'silent', 'office', 'quiet']);

-- 7. Gateron Yellow (Linear)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Gateron Yellow', 'Gateron', 'linear', 50.0, 67.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.5,"force_gf":14},{"distance_mm":1.0,"force_gf":27},{"distance_mm":1.5,"force_gf":39},{"distance_mm":2.0,"force_gf":50},{"distance_mm":2.5,"force_gf":56},{"distance_mm":3.0,"force_gf":60},{"distance_mm":3.5,"force_gf":64},{"distance_mm":4.0,"force_gf":67}]'::jsonb,
'smooth-thocky', 'standard', 'POM', 'Nylon', 0.20, ARRAY['gateron', 'linear', 'budget', 'smooth', 'popular']);

-- 8. Gateron Red (Linear)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Gateron Red', 'Gateron', 'linear', 45.0, 55.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.5,"force_gf":11},{"distance_mm":1.0,"force_gf":22},{"distance_mm":1.5,"force_gf":33},{"distance_mm":2.0,"force_gf":45},{"distance_mm":2.5,"force_gf":48},{"distance_mm":3.0,"force_gf":51},{"distance_mm":3.5,"force_gf":53},{"distance_mm":4.0,"force_gf":55}]'::jsonb,
'smooth-medium', 'standard', 'POM', 'Nylon', 0.20, ARRAY['gateron', 'linear', 'budget', 'light', 'gaming']);

-- 9. Gateron Brown (Tactile)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Gateron Brown', 'Gateron', 'tactile', 45.0, 55.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.3,"force_gf":14},{"distance_mm":0.8,"force_gf":33},{"distance_mm":1.2,"force_gf":45},{"distance_mm":1.5,"force_gf":48},{"distance_mm":1.8,"force_gf":36},{"distance_mm":2.2,"force_gf":32},{"distance_mm":2.8,"force_gf":39},{"distance_mm":3.4,"force_gf":47},{"distance_mm":4.0,"force_gf":55}]'::jsonb,
'medium-thocky', 'standard', 'POM', 'Nylon', 0.20, ARRAY['gateron', 'tactile', 'budget', 'all-purpose']);

-- 10. Gateron Black (Linear)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Gateron Black', 'Gateron', 'linear', 60.0, 75.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.5,"force_gf":15},{"distance_mm":1.0,"force_gf":30},{"distance_mm":1.5,"force_gf":45},{"distance_mm":2.0,"force_gf":60},{"distance_mm":2.5,"force_gf":64},{"distance_mm":3.0,"force_gf":68},{"distance_mm":3.5,"force_gf":72},{"distance_mm":4.0,"force_gf":75}]'::jsonb,
'deep-thocky', 'standard', 'POM', 'Nylon', 0.20, ARRAY['gateron', 'linear', 'heavy', 'budget']);

-- 11. Gateron Milky Yellow (Linear)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Gateron Milky Yellow', 'Gateron', 'linear', 50.0, 67.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.5,"force_gf":14},{"distance_mm":1.0,"force_gf":27},{"distance_mm":1.5,"force_gf":39},{"distance_mm":2.0,"force_gf":50},{"distance_mm":2.5,"force_gf":55},{"distance_mm":3.0,"force_gf":59},{"distance_mm":3.5,"force_gf":63},{"distance_mm":4.0,"force_gf":67}]'::jsonb,
'creamy-thocky', 'standard', 'POM', 'Milky Nylon', 0.18, ARRAY['gateron', 'linear', 'budget', 'milky', 'popular', 'creamy']);

-- 12. Kailh Box White (Clicky)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Kailh Box White', 'Kailh', 'clicky', 50.0, 60.0, 1.80, 3.60,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.3,"force_gf":16},{"distance_mm":0.7,"force_gf":32},{"distance_mm":1.1,"force_gf":50},{"distance_mm":1.4,"force_gf":55},{"distance_mm":1.6,"force_gf":35},{"distance_mm":2.0,"force_gf":30},{"distance_mm":2.5,"force_gf":40},{"distance_mm":3.0,"force_gf":50},{"distance_mm":3.6,"force_gf":60}]'::jsonb,
'sharp-clicky', 'standard', 'POM', 'Nylon', 0.30, ARRAY['kailh', 'clicky', 'box', 'ip56', 'dust-resistant']);

-- 13. Kailh Box Jade (Clicky)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Kailh Box Jade', 'Kailh', 'clicky', 50.0, 70.0, 1.80, 3.60,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.3,"force_gf":18},{"distance_mm":0.6,"force_gf":36},{"distance_mm":1.0,"force_gf":50},{"distance_mm":1.3,"force_gf":60},{"distance_mm":1.5,"force_gf":38},{"distance_mm":2.0,"force_gf":35},{"distance_mm":2.5,"force_gf":48},{"distance_mm":3.0,"force_gf":58},{"distance_mm":3.6,"force_gf":70}]'::jsonb,
'thick-clicky', 'standard', 'POM', 'Nylon', 0.35, ARRAY['kailh', 'clicky', 'box', 'thick-click', 'heavy-tactile']);

-- 14. Kailh Box Navy (Clicky)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Kailh Box Navy', 'Kailh', 'clicky', 60.0, 90.0, 1.80, 3.60,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.3,"force_gf":22},{"distance_mm":0.6,"force_gf":42},{"distance_mm":1.0,"force_gf":60},{"distance_mm":1.3,"force_gf":75},{"distance_mm":1.5,"force_gf":48},{"distance_mm":2.0,"force_gf":45},{"distance_mm":2.5,"force_gf":60},{"distance_mm":3.0,"force_gf":75},{"distance_mm":3.6,"force_gf":90}]'::jsonb,
'loud-thick-clicky', 'standard', 'POM', 'Nylon', 0.35, ARRAY['kailh', 'clicky', 'box', 'thick-click', 'heavy']);

-- 15. Kailh Speed Copper (Tactile)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Kailh Speed Copper', 'Kailh', 'tactile', 40.0, 55.0, 1.10, 3.50,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.2,"force_gf":12},{"distance_mm":0.5,"force_gf":30},{"distance_mm":0.8,"force_gf":40},{"distance_mm":1.1,"force_gf":48},{"distance_mm":1.3,"force_gf":35},{"distance_mm":1.8,"force_gf":30},{"distance_mm":2.3,"force_gf":38},{"distance_mm":2.8,"force_gf":46},{"distance_mm":3.5,"force_gf":55}]'::jsonb,
'medium-clacky', 'standard', 'POM', 'Nylon', 0.30, ARRAY['kailh', 'tactile', 'speed', 'short-travel', 'gaming']);

-- 16. Holy Panda (Tactile)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Holy Panda', 'Drop', 'tactile', 52.0, 67.0, 1.90, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.3,"force_gf":20},{"distance_mm":0.6,"force_gf":42},{"distance_mm":1.0,"force_gf":60},{"distance_mm":1.3,"force_gf":67},{"distance_mm":1.5,"force_gf":48},{"distance_mm":1.9,"force_gf":38},{"distance_mm":2.4,"force_gf":42},{"distance_mm":3.0,"force_gf":50},{"distance_mm":3.5,"force_gf":58},{"distance_mm":4.0,"force_gf":67}]'::jsonb,
'poppy-thocky', 'standard', 'POM (Halo)', 'Invyr Panda Nylon', 1.10, ARRAY['holy-panda', 'tactile', 'premium', 'enthusiast', 'sharp-bump']);

-- 17. Zealios V2 67g (Tactile)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Zealios V2 67g', 'ZealPC', 'tactile', 54.0, 67.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.3,"force_gf":18},{"distance_mm":0.6,"force_gf":38},{"distance_mm":1.0,"force_gf":54},{"distance_mm":1.3,"force_gf":62},{"distance_mm":1.5,"force_gf":50},{"distance_mm":2.0,"force_gf":40},{"distance_mm":2.5,"force_gf":45},{"distance_mm":3.0,"force_gf":52},{"distance_mm":3.5,"force_gf":60},{"distance_mm":4.0,"force_gf":67}]'::jsonb,
'smooth-poppy', 'gold-plated', 'UHMWPE', 'Polycarbonate/Nylon', 1.20, ARRAY['zealpc', 'tactile', 'premium', 'enthusiast', 'round-bump', 'smooth']);

-- 18. Alpaca V2 (Linear)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Alpaca V2', 'Prime Keyboards', 'linear', 50.0, 62.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.5,"force_gf":13},{"distance_mm":1.0,"force_gf":25},{"distance_mm":1.5,"force_gf":37},{"distance_mm":2.0,"force_gf":50},{"distance_mm":2.5,"force_gf":54},{"distance_mm":3.0,"force_gf":57},{"distance_mm":3.5,"force_gf":60},{"distance_mm":4.0,"force_gf":62}]'::jsonb,
'deep-thocky-smooth', 'dual-stage', 'POM', 'Polycarbonate', 0.65, ARRAY['alpaca', 'linear', 'premium', 'smooth', 'jwk', 'thocky']);

-- 19. Boba U4T (Tactile)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Boba U4T', 'Gazzew', 'tactile', 52.0, 67.0, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.3,"force_gf":22},{"distance_mm":0.6,"force_gf":45},{"distance_mm":1.0,"force_gf":60},{"distance_mm":1.3,"force_gf":65},{"distance_mm":1.5,"force_gf":48},{"distance_mm":2.0,"force_gf":38},{"distance_mm":2.5,"force_gf":44},{"distance_mm":3.0,"force_gf":52},{"distance_mm":3.5,"force_gf":60},{"distance_mm":4.0,"force_gf":67}]'::jsonb,
'deep-thocky', 'standard', 'POM', 'Nylon/UHMWPE blend', 0.65, ARRAY['gazzew', 'tactile', 'premium', 'enthusiast', 'thocky', 'sharp-bump']);

-- 20. Durock POM (Linear)
INSERT INTO switches (name, manufacturer, type, actuation_force_gf, bottom_out_force_gf, pre_travel_mm, total_travel_mm, force_curve, sound_profile, spring_type, stem_material, housing_material, price_usd, tags) VALUES
('Durock POM', 'Durock', 'linear', 55.0, 63.5, 2.00, 4.00,
'[{"distance_mm":0.0,"force_gf":0},{"distance_mm":0.5,"force_gf":14},{"distance_mm":1.0,"force_gf":27},{"distance_mm":1.5,"force_gf":41},{"distance_mm":2.0,"force_gf":55},{"distance_mm":2.5,"force_gf":58},{"distance_mm":3.0,"force_gf":60},{"distance_mm":3.5,"force_gf":62},{"distance_mm":4.0,"force_gf":63.5}]'::jsonb,
'deep-poppy', 'dual-stage', 'POM', 'POM', 0.55, ARRAY['durock', 'linear', 'premium', 'pom', 'smooth', 'unique-sound']);
