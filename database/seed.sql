insert into users (first_name, last_name, email, password_hash, phone, role, country, additional_info)
values
  ('Rahul', 'Mehta', 'rahul@vendorbridge.local', 'replace-with-bcrypt-hash', '+91 90000 10001', 'Procurement Officer', 'India', 'Procurement head'),
  ('Priya', 'Shah', 'priya@vendorbridge.local', 'replace-with-bcrypt-hash', '+91 90000 10002', 'Manager / Approver', 'India', 'Finance manager'),
  ('Admin', 'User', 'admin@vendorbridge.local', 'replace-with-bcrypt-hash', '+91 90000 10003', 'Admin', 'India', 'System admin');

insert into vendors (name, category, gst_no, contact_no, email, address, rating, status)
values
  ('Infra Supplies Pvt Ltd', 'Construction', '27AABCS1429BZ0', 'XYZ Number', 'infra@example.com', '456 Industrial Estate, Surat', 4.5, 'Active'),
  ('Tech Core LTD', 'IT', '27AABCT1429BZ0', 'XYZ Number', 'techcore@example.com', 'IT Park, Ahmedabad', 3.8, 'Active'),
  ('FastLog Transport', 'Logistics', '27AABCF1429BZ0', 'XYZ Number', 'fastlog@example.com', 'Transport Nagar, Vadodara', 4.0, 'Blocked'),
  ('OfficeNeed Co.', 'Furniture', '24AAACO7623K1Z5', '+91 98200 44001', 'office@example.com', 'Furniture Market, Ahmedabad', 4.2, 'Pending');

insert into rfqs (title, category, description, deadline, status, created_by)
values ('Office Furniture procurement Q2', 'Furniture', 'Ergonomic chairs and standing desks for 3rd floor', '2025-06-15', 'Published', 1);

insert into rfq_items (rfq_id, item_name, quantity, unit)
values
  (1, 'Ergonomic chair', 25, 'NOS'),
  (1, 'Standing desks', 10, 'NOS');

insert into rfq_vendors (rfq_id, vendor_id)
values (1, 1), (1, 2), (1, 4);

insert into quotations (rfq_id, vendor_id, gst_percent, subtotal, gst_amount, grand_total, delivery_days, payment_terms, notes, status, submitted_at)
values
  (1, 1, 18, 157119, 28281, 185400, 10, '30 days', 'Lowest quotation', 'Selected', current_timestamp),
  (1, 2, 18, 182034, 32766, 214800, 7, '15 days', 'Fastest delivery', 'Submitted', current_timestamp),
  (1, 4, 18, 169500, 30510, 200010, 14, '30 days', 'Payment terms: 20 days net', 'Submitted', current_timestamp);

insert into approvals (quotation_id, level_no, approver_id, status, remarks, acted_at)
values
  (1, 1, 1, 'Approved', 'Commercially suitable.', current_timestamp),
  (1, 2, 2, 'Awaiting', null, null);

insert into purchase_orders (po_number, quotation_id, bill_to, ship_to, status, po_date)
values ('PO-2025-0068', 1, 'Your Organization Name, 123 Business Park, Ahmedabad, GSTIN:25383438AFB', '3rd floor', 'Generated', '2025-05-21');

insert into invoices (invoice_number, po_id, invoice_date, due_date, subtotal, cgst, sgst, grand_total, status)
values ('INV-2025-0068', 1, '2025-05-22', '2025-06-21', 169500, 15255, 15255, 200010, 'Pending Payment');

insert into activity_logs (module, entity_type, entity_id, message, actor_id, created_at)
values
  ('Approvals', 'quotation', 1, 'Quotation selected - Infra Supplies Pvt Ltd selected for Office Furniture Q2', 1, '2025-05-23 21:15:00'),
  ('Approvals', 'purchase_order', 1, 'Approval pending - PO-2024 awaiting L2 approval by Priya Shah', 1, '2025-05-22 09:15:00'),
  ('RFQ', 'rfq', 1, 'RFQ published - Office Furniture Q2 sent to 3 vendors', 1, '2025-05-19 10:00:00'),
  ('Vendors', 'vendor', 3, 'Vendor added - FastLog Transport registered and pending verification', 3, '2025-05-18 15:20:00');
