BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "users" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
    "admin" BOOLEAN, -- forse meglio TEXT
	"email"	TEXT,
	"name"	TEXT,
	"salt"	TEXT,
	"password"	TEXT
);
CREATE TABLE IF NOT EXISTS "ticket" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
    "category" TEXT,
	"state"	TEXT,
	"owner_id"	INTEGER, -- oppure nome
    "title" TEXT,
    "description" TEXT,
	"date"	DATETIME
    -- magari booleano per vedere se ci sono altri textblock, cosi non faccio chiamata inutile al db
);
CREATE TABLE IF NOT EXISTS "text_block" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"text"	TEXT,
	"author_id"	INTEGER,
	"date"	DATETIME,
	"ticket_id"	INTEGER
);

-- forse invece di author_id e owner_id più appropriato user_id in entrambi visto che si riferiscono alla stessa feature

-- Inserimento utenti
INSERT INTO "users" (admin, email, name, salt, password) VALUES (TRUE, 'admin1@webapp.com', 'admin1', 'X4PEIIA0v2LkMd1K', '11b02dbf84bd96a58c2d723a2d0067f1638ac96387d6d1e56717e6bbf2434fd09cc2734d8149e96266c9940f2cb6d45af73f8650b1a3d61efee3b1174b2aa5ff'); -- pwd=admin1
INSERT INTO "users" (admin, email, name, salt, password) VALUES (TRUE, 'admin2@webapp.com', 'admin2', 'j6wEjENptqmii5aD', '8e46457d3cd1b5b613bec85f1e9ee8aecf56cb6c852c354f5624d32d150245bc2ab8727dcaae93207401e5319fff036fc6992f36e2f0ce570dd2332e991b0624'); -- pwd=admin2
INSERT INTO "users" (admin, email, name, salt, password) VALUES (FALSE, 'user1@webapp.com', 'user1', '6oAKIxuO3Pa3ORfJ', '3902bd2b867ee507a7c86a8427d90400c9723de17eaf68c92c83637ac8cbd93d18af63d48a97513df55cd24e67d9b367e4e5d91278e000ee8202ffb641201aa8'); -- pwd=user1
INSERT INTO "users" (admin, email, name, salt, password) VALUES (FALSE, 'user2@webapp.com', 'user2', 'C8BAgtsBe8RUqFne', '9f40877f22bce0519fe938bd6435b33ee43cb088415179b98ff573a92731b219bb7548cbb8ab68f8df95ba5ad0e7399ebe5a77a65ab20604fcd7b075a392de4d'); -- pwd=user2
INSERT INTO "users" (admin, email, name, salt, password) VALUES (FALSE, 'user3@webapp.com', 'user3', 'qtFCbJVrEJmq9LD6', '6779e02d5f29a346eca734a530f28a46b0e09e9c61fb6e32ca5ce1d4285c62547549de12acc4d80a7a7620b71c9d26de0c0a6f2b4204d601aabbe4dfdbec6093'); -- pwd=user3

-- Inserimento ticket
INSERT INTO "ticket" (category, state, owner_id, title, description, date) VALUES ('inquiry', 'Open', 1, 'Inquiry Issue 1', 'Description of Inquiry Issue 1', '2024-06-01 08:15:30');
INSERT INTO "ticket" (category, state, owner_id, title, description, date) VALUES ('maintenance', 'Closed', 1, 'Maintenance Issue 1', 'Description of Maintenance Issue 1', '2024-05-15 14:45:00');
INSERT INTO "ticket" (category, state, owner_id, title, description, date) VALUES ('new feature', 'Open', 2, 'New Feature Issue 1', 'Description of New Feature Issue 1', '2024-06-02 09:30:15');
INSERT INTO "ticket" (category, state, owner_id, title, description, date) VALUES ('administrative', 'Closed', 2, 'Administrative Issue 1', 'Description of Administrative Issue 1', '2024-05-20 16:00:45');
INSERT INTO "ticket" (category, state, owner_id, title, description, date) VALUES ('payment', 'Open', 3, 'Payment Issue 1', 'Description of Payment Issue 1', '2024-06-03 11:25:00');
INSERT INTO "ticket" (category, state, owner_id, title, description, date) VALUES ('maintenance', 'Closed', 3, 'Maintenance Issue 2', 'Description of Maintenance Issue 2', '2024-05-25 13:10:20');
INSERT INTO "ticket" (category, state, owner_id, title, description, date) VALUES ('new feature', 'Open', 4, 'New Feature Issue 2', 'Description of New Feature Issue 2', '2024-06-04 10:50:30');

-- Inserimento text_block
-- Ticket con un solo blocco di testo
INSERT INTO "text_block" (text, author_id, date, ticket_id) VALUES ('Initial text block for Inquiry Issue 1.', 1, '2024-06-01 08:20:00', 1);

-- Ticket con tre blocchi di testo
INSERT INTO "text_block" (text, author_id, date, ticket_id) VALUES ('First text block for New Feature Issue 1 with.', 2, '2024-06-02 09:35:15', 3);
INSERT INTO "text_block" (text, author_id, date, ticket_id) VALUES ('Second text block for New Feature Issue 1.
With a new line.', 3, '2024-06-02 09:40:30', 3);
-- INSERT INTO "text_block" (text, author_id, date, ticket_id) VALUES ('Third block for New Feature Issue 1.', 2, '2024-06-02 09:45:45', 3);

-- Ticket con tre blocchi di testo
INSERT INTO "text_block" (text, author_id, date, ticket_id) VALUES ('First text block for New Feature Issue.', 4, '2024-06-04 10:55:30', 7);
INSERT INTO "text_block" (text, author_id, date, ticket_id) VALUES ('Second text block for New Feature Issue 2', 5, '2024-06-05 11:00:00', 7);
INSERT INTO "text_block" (text, author_id, date, ticket_id) VALUES ('Third block for New Feature Issue 2.
New line here.', 4, '2024-06-06 11:05:45', 7);

COMMIT;

-- sqlite3 db.db -cmd "PRAGMA foriegn_keys = ON;" < create_sqlite_db.sql