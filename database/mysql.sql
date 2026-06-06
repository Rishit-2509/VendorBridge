create table users (
  id bigint primary key auto_increment,
  first_name varchar(80) not null,
  last_name varchar(80) not null,
  email varchar(160) not null unique,
  password_hash text not null,
  phone varchar(40),
  role enum('Admin', 'Procurement Officer', 'Vendor', 'Manager / Approver') not null,
  country varchar(80),
  additional_info text,
  created_at timestamp not null default current_timestamp
);

create table vendors (
  id bigint primary key auto_increment,
  name varchar(180) not null,
  category varchar(80) not null,
  gst_no varchar(40) not null unique,
  contact_no varchar(40) not null,
  email varchar(160),
  address text,
  rating decimal(2,1) default 0,
  status enum('Active', 'Pending', 'Blocked') not null default 'Pending',
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp on update current_timestamp
);

create table rfqs (
  id bigint primary key auto_increment,
  title varchar(220) not null,
  category varchar(80) not null,
  description text,
  deadline date not null,
  status enum('Draft', 'Published', 'Closed', 'Approved') not null default 'Draft',
  created_by bigint,
  created_at timestamp not null default current_timestamp,
  foreign key (created_by) references users(id)
);

create table rfq_items (
  id bigint primary key auto_increment,
  rfq_id bigint not null,
  item_name varchar(180) not null,
  quantity decimal(12,2) not null,
  unit varchar(30) not null,
  foreign key (rfq_id) references rfqs(id) on delete cascade
);

create table rfq_vendors (
  rfq_id bigint not null,
  vendor_id bigint not null,
  invited_at timestamp not null default current_timestamp,
  primary key (rfq_id, vendor_id),
  foreign key (rfq_id) references rfqs(id) on delete cascade,
  foreign key (vendor_id) references vendors(id)
);

create table quotations (
  id bigint primary key auto_increment,
  rfq_id bigint not null,
  vendor_id bigint not null,
  gst_percent decimal(5,2) not null default 18,
  subtotal decimal(14,2) not null default 0,
  gst_amount decimal(14,2) not null default 0,
  grand_total decimal(14,2) not null default 0,
  delivery_days int not null,
  payment_terms varchar(160),
  notes text,
  status enum('Draft', 'Submitted', 'Selected', 'Rejected') not null default 'Draft',
  submitted_at timestamp null,
  unique key uq_quote_vendor (rfq_id, vendor_id),
  foreign key (rfq_id) references rfqs(id),
  foreign key (vendor_id) references vendors(id)
);

create table quotation_items (
  id bigint primary key auto_increment,
  quotation_id bigint not null,
  rfq_item_id bigint,
  unit_price decimal(14,2) not null,
  total decimal(14,2) not null,
  delivery_days int not null,
  foreign key (quotation_id) references quotations(id) on delete cascade,
  foreign key (rfq_item_id) references rfq_items(id)
);

create table approvals (
  id bigint primary key auto_increment,
  quotation_id bigint not null,
  level_no int not null,
  approver_id bigint,
  status enum('Awaiting', 'Approved', 'Rejected') not null default 'Awaiting',
  remarks text,
  acted_at timestamp null,
  created_at timestamp not null default current_timestamp,
  foreign key (quotation_id) references quotations(id),
  foreign key (approver_id) references users(id)
);

create table purchase_orders (
  id bigint primary key auto_increment,
  po_number varchar(40) not null unique,
  quotation_id bigint not null,
  bill_to text not null,
  ship_to text,
  status enum('Generated', 'Sent', 'Closed') not null default 'Generated',
  po_date date not null,
  created_at timestamp not null default current_timestamp,
  foreign key (quotation_id) references quotations(id)
);

create table invoices (
  id bigint primary key auto_increment,
  invoice_number varchar(40) not null unique,
  po_id bigint not null,
  invoice_date date not null,
  due_date date not null,
  subtotal decimal(14,2) not null,
  cgst decimal(14,2) not null,
  sgst decimal(14,2) not null,
  grand_total decimal(14,2) not null,
  status enum('Pending Payment', 'Paid', 'Overdue') not null default 'Pending Payment',
  created_at timestamp not null default current_timestamp,
  foreign key (po_id) references purchase_orders(id)
);

create table activity_logs (
  id bigint primary key auto_increment,
  module varchar(40) not null,
  entity_type varchar(60),
  entity_id bigint,
  message text not null,
  actor_id bigint,
  created_at timestamp not null default current_timestamp,
  foreign key (actor_id) references users(id)
);

delimiter //
create trigger activity_logs_no_update
before update on activity_logs
for each row
begin
  signal sqlstate '45000' set message_text = 'activity_logs are immutable';
end//

create trigger activity_logs_no_delete
before delete on activity_logs
for each row
begin
  signal sqlstate '45000' set message_text = 'activity_logs are immutable';
end//
delimiter ;

create index idx_vendors_status on vendors(status);
create index idx_rfqs_status on rfqs(status);
create index idx_activity_logs_module_time on activity_logs(module, created_at);
