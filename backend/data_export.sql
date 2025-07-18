PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE companies (
	name VARCHAR(255) NOT NULL, 
	legal_name VARCHAR(255), 
	tax_id VARCHAR(50), 
	email VARCHAR(255) NOT NULL, 
	phone VARCHAR(50), 
	website VARCHAR(255), 
	address_line1 VARCHAR(255), 
	address_line2 VARCHAR(255), 
	city VARCHAR(100), 
	state VARCHAR(50), 
	postal_code VARCHAR(20), 
	country VARCHAR(100), 
	settings JSON, 
	is_active BOOLEAN, 
	subscription_plan VARCHAR(50), 
	subscription_status VARCHAR(50), 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (name)
);
CREATE TABLE users (
	email VARCHAR(255) NOT NULL, 
	hashed_password VARCHAR(255) NOT NULL, 
	first_name VARCHAR(100) NOT NULL, 
	last_name VARCHAR(100) NOT NULL, 
	phone VARCHAR(50), 
	role VARCHAR(17) NOT NULL, 
	is_active BOOLEAN, 
	is_superuser BOOLEAN, 
	company_id VARCHAR(36), 
	last_login DATETIME, 
	email_verified BOOLEAN, 
	email_verification_token VARCHAR(255), 
	password_reset_token VARCHAR(255), 
	password_reset_expires DATETIME, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(company_id) REFERENCES companies (id) ON DELETE CASCADE
);
INSERT INTO users VALUES('admin@example.com','$2b$12$lVPCiKmIHTXAWl0xe4PMDuv/v2edrg24/TksluINqKep3u5TRiL4q','Admin','User',NULL,'COMPANY_ADMIN',1,0,'default-company-id','2025-07-13 03:38:00.297072',0,NULL,NULL,NULL,'2025-07-13 03:37:42.704904','2025-07-13 03:38:00.297301','17a655c4-6af0-4069-b13b-b1a243fa5425');
CREATE TABLE properties (
	name VARCHAR(255) NOT NULL, 
	property_type VARCHAR(13) NOT NULL, 
	description VARCHAR, 
	address_line1 VARCHAR(255) NOT NULL, 
	address_line2 VARCHAR(255), 
	city VARCHAR(100) NOT NULL, 
	state VARCHAR(50) NOT NULL, 
	postal_code VARCHAR(20) NOT NULL, 
	country VARCHAR(100), 
	year_built INTEGER, 
	total_units INTEGER, 
	total_square_feet FLOAT, 
	lot_size FLOAT, 
	purchase_price FLOAT, 
	purchase_date DATETIME, 
	current_value FLOAT, 
	monthly_operating_expenses FLOAT, 
	property_tax_annual FLOAT, 
	insurance_annual FLOAT, 
	company_id VARCHAR(36) NOT NULL, 
	is_active BOOLEAN, 
	features JSON, 
	amenities JSON, 
	images JSON, 
	documents JSON, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(company_id) REFERENCES companies (id) ON DELETE CASCADE
);
CREATE TABLE tenants (
	first_name VARCHAR(100) NOT NULL, 
	last_name VARCHAR(100) NOT NULL, 
	email VARCHAR(255) NOT NULL, 
	phone VARCHAR(50) NOT NULL, 
	date_of_birth DATE, 
	ssn_last_four VARCHAR(4), 
	drivers_license VARCHAR(50), 
	status VARCHAR(11) NOT NULL, 
	emergency_contact_name VARCHAR(200), 
	emergency_contact_phone VARCHAR(50), 
	emergency_contact_relationship VARCHAR(100), 
	employer_name VARCHAR(255), 
	employer_phone VARCHAR(50), 
	job_title VARCHAR(200), 
	monthly_income FLOAT, 
	employment_start_date DATE, 
	background_check_completed BOOLEAN, 
	background_check_date DATE, 
	background_check_notes VARCHAR, 
	credit_score INTEGER, 
	"references" JSON, 
	previous_landlord_name VARCHAR(200), 
	previous_landlord_phone VARCHAR(50), 
	previous_address VARCHAR(500), 
	previous_rent_amount FLOAT, 
	company_id VARCHAR(36) NOT NULL, 
	documents JSON, 
	notes VARCHAR, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(company_id) REFERENCES companies (id) ON DELETE CASCADE
);
CREATE TABLE user_property_assignments (
	user_id VARCHAR(36), 
	property_id VARCHAR(36), 
	assigned_at DATETIME, 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
	FOREIGN KEY(property_id) REFERENCES properties (id) ON DELETE CASCADE
);
CREATE TABLE units (
	unit_number VARCHAR(50) NOT NULL, 
	unit_type VARCHAR(13) NOT NULL, 
	floor INTEGER, 
	status VARCHAR(11) NOT NULL, 
	is_furnished BOOLEAN, 
	bedrooms INTEGER, 
	bathrooms FLOAT, 
	square_feet FLOAT, 
	market_rent FLOAT NOT NULL, 
	deposit_amount FLOAT, 
	property_id VARCHAR(36) NOT NULL, 
	features JSON, 
	utilities_included JSON, 
	notes VARCHAR, 
	images JSON, 
	floor_plan_url VARCHAR, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(property_id) REFERENCES properties (id) ON DELETE CASCADE
);
CREATE TABLE leases (
	lease_number VARCHAR(100), 
	lease_type VARCHAR(14) NOT NULL, 
	status VARCHAR(10) NOT NULL, 
	start_date DATE NOT NULL, 
	end_date DATE NOT NULL, 
	move_in_date DATE, 
	move_out_date DATE, 
	rent_amount FLOAT NOT NULL, 
	deposit_amount FLOAT NOT NULL, 
	deposit_paid BOOLEAN, 
	deposit_paid_date DATE, 
	pet_deposit FLOAT, 
	payment_due_day INTEGER, 
	late_fee_amount FLOAT, 
	late_fee_grace_days INTEGER, 
	unit_id VARCHAR(36) NOT NULL, 
	tenant_id VARCHAR(36) NOT NULL, 
	company_id VARCHAR(36) NOT NULL, 
	additional_occupants JSON, 
	pets_allowed BOOLEAN, 
	pet_details JSON, 
	utilities_included JSON, 
	signed_lease_url VARCHAR, 
	documents JSON, 
	termination_date DATE, 
	termination_reason VARCHAR, 
	termination_notes VARCHAR, 
	special_terms VARCHAR, 
	notes VARCHAR, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT check_end_date_after_start_date CHECK (end_date > start_date), 
	CONSTRAINT check_positive_rent CHECK (rent_amount > 0), 
	CONSTRAINT check_non_negative_deposit CHECK (deposit_amount >= 0), 
	UNIQUE (lease_number), 
	FOREIGN KEY(unit_id) REFERENCES units (id) ON DELETE CASCADE, 
	FOREIGN KEY(tenant_id) REFERENCES tenants (id) ON DELETE CASCADE, 
	FOREIGN KEY(company_id) REFERENCES companies (id) ON DELETE CASCADE
);
CREATE TABLE payments (
	amount FLOAT NOT NULL, 
	payment_date DATE NOT NULL, 
	payment_type VARCHAR(11) NOT NULL, 
	payment_method VARCHAR(13) NOT NULL, 
	status VARCHAR(9) NOT NULL, 
	transaction_id VARCHAR(255), 
	reference_number VARCHAR(255), 
	lease_id VARCHAR(36) NOT NULL, 
	tenant_id VARCHAR(36) NOT NULL, 
	processed_date DATE, 
	processor_fee FLOAT, 
	description VARCHAR(500), 
	notes TEXT, 
	is_late BOOLEAN, 
	late_fee_amount FLOAT, 
	refund_amount FLOAT, 
	refund_date DATE, 
	refund_reason VARCHAR(500), 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(lease_id) REFERENCES leases (id) ON DELETE CASCADE, 
	FOREIGN KEY(tenant_id) REFERENCES tenants (id) ON DELETE CASCADE
);
CREATE TABLE maintenance_requests (
	title VARCHAR(255) NOT NULL, 
	description TEXT NOT NULL, 
	priority VARCHAR(6) NOT NULL, 
	status VARCHAR(11) NOT NULL, 
	unit_id VARCHAR NOT NULL, 
	tenant_id VARCHAR, 
	reported_by_name VARCHAR(255), 
	reported_by_phone VARCHAR(50), 
	reported_by_email VARCHAR(255), 
	assigned_to VARCHAR, 
	scheduled_date DATETIME, 
	completed_date DATETIME, 
	estimated_cost FLOAT, 
	actual_cost FLOAT, 
	notes TEXT, 
	photos TEXT, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(unit_id) REFERENCES units (id), 
	FOREIGN KEY(tenant_id) REFERENCES tenants (id)
);
CREATE TABLE conversations (
	id VARCHAR(36) NOT NULL, 
	type VARCHAR(12), 
	status VARCHAR(8), 
	created_by_id VARCHAR(36) NOT NULL, 
	subject VARCHAR(255), 
	property_id VARCHAR(36), 
	unit_id VARCHAR(36), 
	tenant_id VARCHAR(36), 
	maintenance_request_id VARCHAR(36), 
	is_urgent BOOLEAN, 
	tags JSON, 
	extra_data JSON, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	last_message_at DATETIME, 
	PRIMARY KEY (id), 
	FOREIGN KEY(created_by_id) REFERENCES users (id), 
	FOREIGN KEY(property_id) REFERENCES properties (id), 
	FOREIGN KEY(unit_id) REFERENCES units (id), 
	FOREIGN KEY(tenant_id) REFERENCES tenants (id), 
	FOREIGN KEY(maintenance_request_id) REFERENCES maintenance_requests (id)
);
CREATE TABLE message_templates (
	id VARCHAR(36) NOT NULL, 
	name VARCHAR(255) NOT NULL, 
	category VARCHAR(100), 
	subject VARCHAR(255), 
	content TEXT NOT NULL, 
	variables JSON, 
	usage_count INTEGER, 
	last_used_at DATETIME, 
	created_by_id VARCHAR(36), 
	is_public BOOLEAN, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(created_by_id) REFERENCES users (id)
);
CREATE TABLE conversation_participants (
	id VARCHAR(36) NOT NULL, 
	conversation_id VARCHAR(36) NOT NULL, 
	user_id VARCHAR(36), 
	participant_type VARCHAR(8) NOT NULL, 
	participant_name VARCHAR(255) NOT NULL, 
	participant_email VARCHAR(255), 
	participant_phone VARCHAR(50), 
	can_reply BOOLEAN, 
	can_add_participants BOOLEAN, 
	is_admin BOOLEAN, 
	joined_at DATETIME NOT NULL, 
	left_at DATETIME, 
	last_read_at DATETIME, 
	is_active BOOLEAN, 
	email_notifications BOOLEAN, 
	sms_notifications BOOLEAN, 
	push_notifications BOOLEAN, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(conversation_id) REFERENCES conversations (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);
CREATE TABLE messages (
	id VARCHAR(36) NOT NULL, 
	conversation_id VARCHAR(36) NOT NULL, 
	sender_id VARCHAR(36), 
	sender_name VARCHAR(255) NOT NULL, 
	sender_type VARCHAR(8), 
	content TEXT NOT NULL, 
	content_type VARCHAR(50), 
	extra_data JSON, 
	is_read BOOLEAN, 
	is_edited BOOLEAN, 
	is_deleted BOOLEAN, 
	created_at DATETIME NOT NULL, 
	edited_at DATETIME, 
	read_at DATETIME, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(conversation_id) REFERENCES conversations (id), 
	FOREIGN KEY(sender_id) REFERENCES users (id)
);
CREATE TABLE message_attachments (
	id VARCHAR(36) NOT NULL, 
	message_id VARCHAR(36) NOT NULL, 
	file_name VARCHAR(255) NOT NULL, 
	file_type VARCHAR(100), 
	file_size INTEGER, 
	file_url VARCHAR(500) NOT NULL, 
	mime_type VARCHAR(100), 
	thumbnail_url VARCHAR(500), 
	extra_data JSON, 
	uploaded_at DATETIME NOT NULL, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(message_id) REFERENCES messages (id)
);
CREATE UNIQUE INDEX ix_users_email ON users (email);
COMMIT;
