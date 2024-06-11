DROP TYPE IF EXISTS categ_produse;
DROP TYPE IF EXISTS tipuri_produse;

CREATE TYPE categ_produse AS ENUM( 'Gaming', 'Office', 'KeyCaps', 'suport pentru incheietura', 'spray de curatare','Business','Portabil','Standard');
CREATE TYPE tipuri_produse AS ENUM('Tastaturi', 'Accesorii');


CREATE TABLE IF NOT EXISTS produse (
   id SERIAL PRIMARY KEY,
   nume VARCHAR(50) UNIQUE NOT NULL,
   descriere TEXT,
   pret NUMERIC(8,2) NOT NULL,
   gramaj INT NOT NULL CHECK (gramaj >= 0),   
   tip_produs VARCHAR(50) DEFAULT 'tastaturi',
   categorie VARCHAR(50) DEFAULT 'Standard',
   imagine VARCHAR(300),
   data_adaugare TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   brand VARCHAR(50),
   tehnologie VARCHAR(50)
);

INSERT INTO produse (nume, descriere, pret, gramaj, tip_produs, categorie, imagine, brand, tehnologie)
VALUES
    ('Keyboard1', 'Mechanical gaming keyboard with RGB backlighting', 99.99, 1000, 'Tastaturi', 'Gaming', 'imag1.jpg', 'ExampleBrand', 'Mechanical'),
    ('Keyboard2', 'Wireless office keyboard with ergonomic design', 49.99, 800, 'Tastaturi', 'Office', 'imag2.jpg', 'ExampleBrand', 'Wireless'),
    ('KeyCaps1', 'Customizable keycaps set for mechanical keyboards', 29.99, 200, 'Accesorii', 'KeyCaps', 'imag3.jpg', 'ExampleBrand', NULL),
    ('Keyboard3', 'Compact portable keyboard for on-the-go use', 79.99, 600, 'Tastaturi', 'Portabil', 'imag4.jpg', 'ExampleBrand', 'Compact'),
    ('Cleaning Spray', 'Cleaning spray for removing dust and dirt from keyboards', 9.99, 250, 'Accesorii', 'Spray de curatare', 'imag5.jpg', 'ExampleBrand', NULL),
    ('Keyboard4', 'Standard wired keyboard for everyday use', 29.99, 900, 'Tastaturi', 'Standard', 'imag6.jpg', 'ExampleBrand', 'Membrane'),
    ('Wrist Rest', 'Ergonomic wrist rest for comfortable typing experience', 19.99, 150, 'Accesorii', 'suport pentru incheietura', 'imag7.jpg', 'ExampleBrand', NULL),
    ('Keyboard5', 'Mechanical gaming keyboard with customizable RGB lighting', 129.99, 1100, 'Tastaturi', 'Gaming', 'imag8.jpg', 'ExampleBrand', 'Mechanical'),
    ('Keyboard6', 'Mechanical keyboard with dedicated media keys', 89.99, 950, 'Tastaturi', 'Standard', 'imag9.jpg', 'ExampleBrand', 'Mechanical'),
    ('Keyboard7', 'Mechanical keyboard with tenkeyless design', 109.99, 850, 'Tastaturi', 'Gaming', 'imag10.jpg', 'ExampleBrand', 'Mechanical'),
    ('Mousepad', 'Large gaming mousepad with non-slip base', 14.99, 300, 'Accesorii', 'Gaming', 'imag11.jpg', 'ExampleBrand', NULL),
    ('Keyboard8', 'Mechanical keyboard with tactile switches', 99.99, 1000, 'Tastaturi', 'Gaming', 'imag12.jpg', 'ExampleBrand', 'Mechanical'),
    ('Keyboard9', 'Wireless mechanical keyboard with low-profile switches', 149.99, 850, 'Tastaturi', 'Portabil', 'imag13.jpg', 'ExampleBrand', 'Wireless'),
    ('Keyboard10', 'Compact mechanical keyboard with RGB backlighting', 119.99, 750, 'Tastaturi', 'Portabil', 'imag14.jpg', 'ExampleBrand', 'Mechanical'),
    ('Cleaning Kit', 'Keyboard cleaning kit with brush and cleaning solution', 12.99, 200, 'Accesorii', 'Spray de curatare', 'imag15.jpg', 'ExampleBrand', NULL),
    ('Keyboard11', 'Mechanical keyboard with programmable macro keys', 139.99, 1050, 'Tastaturi', 'Gaming', 'imag16.jpg', 'ExampleBrand', 'Mechanical'),
    ('Keyboard12', 'Wireless keyboard with slim design', 69.99, 700, 'Tastaturi', 'Portabil', 'imag17.jpg', 'ExampleBrand', 'Wireless'),
    ('KeyCaps2', 'Double-shot PBT keycaps set for mechanical keyboards', 39.99, 250, 'Accesorii', 'KeyCaps', 'imag18.jpg', 'ExampleBrand', NULL),
    ('Keyboard13', 'Mechanical keyboard with RGB backlighting and detachable wrist rest', 159.99, 1150, 'Tastaturi', 'Gaming', 'imag19.jpg', 'ExampleBrand', 'Mechanical'),
    ('Keyboard14', 'Mechanical keyboard with customizable hot-swappable switches', 179.99, 1200, 'Tastaturi', 'Gaming', 'imag20.jpg', 'ExampleBrand', 'Mechanical');

INSERT INTO produse (nume, descriere, pret, gramaj, tip_produs, categorie, imagine, brand, tehnologie)
VALUES
    ('Keyboard50', 'Mechanical gaming keyboard with RGB backlighting', 99.99, 1000, 'Tastaturi', 'Gaming', 'produs1.jpg', 'ExampleBrand', 'Mechanical');

