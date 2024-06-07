
-- users
CREATE TABLE users (
	id SERIAL PRIMARY KEY NOT NULL,
	username TEXT NOT NULL UNIQUE,
	password TEXT NOT NULL UNIQUE,
	email TEXT UNIQUE NOT NULL,
	role TEXT DEFAULT 'user',
	created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	--for reset password
	reset_token TEXT,
	reset_token_expires TIMESTAMPTZ;
);


-- ALTER TABLE auction_items ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'active';
-- items
CREATE TABLE auction_items (
	id SERIAL PRIMARY KEY NOT NULL,
	name TEXT NOT NULL,
	description TEXT NOT NULL,
	starting_price decimal NOT NULL,
	current_price decimal DEFAULT 0,
	image_url TEXT,
	end_time TIMESTAMP NOT NULL,
	created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	owner_id INT,
	status VARCHAR(50) NOT NULL DEFAULT 'active',
	CONSTRAINT fk_users_items 
		FOREIGN KEY (owner_id) 
			REFERENCES users (id)
);

-- making the owner and item realation..
-- ALTER TABLE auction_items ADD owner_id INT; 

-- ALTER TABLE auction_items ADD
-- CONSTRAINT fk_users_items FOREIGN KEY (owner_id) REFERENCES users (id); 

INSERT INTO auction_items (name, description, starting_price, end_time)
VALUES ('gold brick', 'Solid gold brick of 24 carrat', 1500,'2024-10-01 23:59:59.727');


-- fucntion
-- CREATE FUNCTION set_current_price_to_starting_price() RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.current_price := NEW.starting_price;
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- --trigger
-- CREATE TRIGGER set_current_price_before_insert
-- BEFORE INSERT ON auction_items
-- FOR EACH ROW
-- EXECUTE FUNCTION set_current_price_to_starting_price();

-- bids
CREATE TABLE bids (
	id SERIAL PRIMARY KEY,
	item_id INT,
	user_id INT,
	bid_amount decimal NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_users
		FOREIGN KEY (user_id)
			REFERENCES users (id),

	CONSTRAINT fk_auction_items
		FOREIGN KEY (item_id)
			REFERENCES auction_items (id)
	
);

-- create bid
INSERT INTO bids (item_id, user_id, bid_amount)
VALUES (4, 2, 150000);

-- Notifications
CREATE TABLE notifications (
	id SERIAL PRIMARY KEY,
	user_id INT,
	message TEXT NOT NULL,
	is_read BOOLEAN DEFAULT false,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_users
		FOREIGN KEY (user_id)
			REFERENCES users (id)
);

-- 
INSERT INTO notifications (user_id, message)
VALUES (2, 'Its time to palce your first bid');