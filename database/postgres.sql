create table users (
  id bigserial primary key,
  first_name varchar(80) not null,
  last_name varchar(80) not null,
  email varchar(160) not null unique,
  password_hash text not null,
  phone varchar(40),
  role varchar(40) not null check (role in ('Admin', 'Procurement Officer', 'Vendor', 'Manager / Approver')),
  country varchar(80),
  additional_info text,
  created_at timestamptz not null default now()
);

create table vendors (
  id bigserial primary key,
  name varchar(180) not null,
  category varchar(80) not null,
  gst_no varchar(40) not null unique,
  contact_no varchar(40) not null,
  email varchar(160),
  address text,
  rating numeric(2,1) default 0,
  status varchar(20) not null default 'Pending' check (status in ('Active', 'Pending', 'Blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table rfqs (
  id bigserial primary key,
  title varchar(220) not null,
  category varchar(80) not null,
  description text,
  deadline date not null,
  status varchar(24) not null default 'Draft' check (status in ('Draft', 'Published', 'Closed', 'Approved')),
  created_by bigint references users(id),
  created_at timestamptz not null default now()
);

create table rfq_items (
  id bigserial primary key,
  rfq_id bigint not null references rfqs(id) on delete cascade,
  item_name varchar(180) not null,
  quantity numeric(12,2) not null,
  unit varchar(30) not null
);

create table rfq_vendors (
  rfq_id bigint not null references rfqs(id) on delete cascade,
  vendor_id bigint not null references vendors(id),
  invited_at timestamptz not null default now(),
  primary key (rfq_id, vendor_id)
);

create table quotations (
  id bigserial primary key,
  rfq_id bigint not null references rfqs(id),
  vendor_id bigint not null references vendors(id),
  gst_percent numeric(5,2) not null default 18,
  subtotal numeric(14,2) not null default 0,
  gst_amount numeric(14,2) not null default 0,
  grand_total numeric(14,2) not null default 0,
  delivery_days integer not null,
  payment_terms varchar(160),
  notes text,
  status varchar(24) not null default 'Draft' check (status in ('Draft', 'Submitted', 'Selected', 'Rejected')),
  submitted_at timestamptz,
  unique (rfq_id, vendor_id)
);

create table quotation_items (
  id bigserial primary key,
  quotation_id bigint not null references quotations(id) on delete cascade,
  rfq_item_id bigint references rfq_items(id),
  unit_price numeric(14,2) not null,
  total numeric(14,2) not null,
  delivery_days integer not null
);

create table approvals (
  id bigserial primary key,
  quotation_id bigint not null references quotations(id),
  level_no integer not null,
  approver_id bigint references users(id),
  status varchar(24) not null default 'Awaiting' check (status in ('Awaiting', 'Approved', 'Rejected')),
  remarks text,
  acted_at timestamptz,
  created_at timestamptz not null default now()
);

create table purchase_orders (
  id bigserial primary key,
  po_number varchar(40) not null unique,
  quotation_id bigint not null references quotations(id),
  bill_to text not null,
  ship_to text,
  status varchar(24) not null default 'Generated' check (status in ('Generated', 'Sent', 'Closed')),
  po_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table invoices (
  id bigserial primary key,
  invoice_number varchar(40) not null unique,
  po_id bigint not null references purchase_orders(id),
  invoice_date date not null,
  due_date date not null,
  subtotal numeric(14,2) not null,
  cgst numeric(14,2) not null,
  sgst numeric(14,2) not null,
  grand_total numeric(14,2) not null,
  status varchar(24) not null default 'Pending Payment' check (status in ('Pending Payment', 'Paid', 'Overdue')),
  created_at timestamptz not null default now()
);

create table activity_logs (
  id bigserial primary key,
  module varchar(40) not null,
  entity_type varchar(60),
  entity_id bigint,
  message text not null,
  actor_id bigint references users(id),
  created_at timestamptz not null default now()
);

create or replace rule activity_logs_no_update as on update to activity_logs do instead nothing;
create or replace rule activity_logs_no_delete as on delete to activity_logs do instead nothing;

create index idx_vendors_status on vendors(status);
create index idx_rfqs_status on rfqs(status);
create index idx_activity_logs_module_time on activity_logs(module, created_at desc);
