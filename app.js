'use strict';

// ─── DATA ───────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id:'dashboard',   label:'Dashboard',        icon:'grid' },
  { id:'vendors',     label:'Vendors',          icon:'users' },
  { id:'rfqs',        label:'RFQs',             icon:'file' },
  { id:'quotations',  label:'Quotations',       icon:'clipboard' },
  { id:'comparison',  label:'Quotations',       icon:'bar-chart', hidden:true },
  { id:'approvals',   label:'Approvals',        icon:'check-circle', hidden:true },
  { id:'pos',         label:'Purchase Orders',  icon:'shopping-bag' },
  { id:'invoices',    label:'Invoices',         icon:'credit-card' },
  { id:'activity',    label:'Activity Log',     icon:'activity' },
  { id:'reports',     label:'Reports',          icon:'trending-up' },
];

const ROLE_ACCESS = {
  'Admin':               ['dashboard','vendors','rfqs','quotations','comparison','approvals','pos','invoices','activity','reports'],
  'Procurement Officer': ['dashboard','vendors','rfqs','comparison','approvals','pos','invoices','activity','reports'],
  'Vendor':              ['dashboard','quotations','pos','invoices','activity'],
  'Manager / Approver':  ['dashboard','comparison','approvals','pos','invoices','activity','reports'],
};

const DEFAULT_USERS = [
  { firstName:'Rishit', lastName:'Patel',   email:'rishitpatel2509@gmail.com',   password:'password123', phone:'+91 98765 43210', role:'Procurement Officer', country:'India', info:'Procurement Officer' },
  { firstName:'Siddharth', lastName:'Mehta', email:'approver@vendorbridge.local', password:'password123', phone:'+91 90000 10002', role:'Manager / Approver',  country:'India', info:'Finance Manager' },
  { firstName:'Admin', lastName:'User',     email:'admin@vendorbridge.local',     password:'password123', phone:'+91 90000 10003', role:'Admin',               country:'India', info:'System Administrator' },
  { firstName:'Rahul', lastName:'Sharma',   email:'vendor@vendorbridge.local',    password:'password123', phone:'+91 90000 10004', role:'Vendor',              country:'India', info:'Infra Supplies Pvt Ltd' },
  { firstName:'Rohan', lastName:'Deshmukh', email:'rohan@vendorbridge.local',     password:'password123', phone:'+91 90000 10005', role:'Procurement Officer', country:'India', info:'Procurement Officer' },
];

let APP_VENDORS = [
  { id:1, name:'Infra Supplies Pvt Ltd', category:'Furniture',    gst:'29ABCDE1234F125', contactName:'Rahul Sharma',  email:'sales@infrasupplies.com', phone:'+91 98765 43210', rating:4.8, status:'Active' },
  { id:2, name:'Office Steel Co.',       category:'Furniture',    gst:'19MNOPQ9012MN24', contactName:'Sanjay Gupta',  email:'gov@officesteel.com',      phone:'+91 98300 12345', rating:4.2, status:'Active' },
  { id:3, name:'PaperKraft Stationery', category:'Stationery',   gst:'07RSTUV3456NA29', contactName:'Neha Patel',    email:'support@paperkraft.com',   phone:'+91 91234 56789', rating:4.6, status:'Active' },
  { id:4, name:'TechCore Ltd',           category:'IT Hardware',  gst:'27GHIJK5678LZ23', contactName:'Vikram Aditya', email:'contracts@techcore.com',   phone:'+91 99988 77665', rating:4.5, status:'Active' },
];

let APP_RFQS = [
  { id:1, title:'Office Furniture Procurement Q2', category:'Furniture', deadline:'2026-06-30', vendors:[1,2], quotations:2, status:'Published' },
];

let APP_LINE_ITEMS = [
  { item:'Ergonomic chair with lumbar support', qty:25, unit:'NOS' },
  { item:'Motorized standing desks', qty:10, unit:'NOS' },
];

const QUOTE_ITEMS = [
  { item:'Ergonomic chair with lumbar support', qty:25, price:4500, delivery:12 },
  { item:'Motorized standing desks',            qty:10, price:7290, delivery:12 },
];

const PO_LIST = [
  { id:1, poNum:'PO-2026-0001', rfqTitle:'Office Furniture Procurement Q2', vendor:'Infra Supplies Pvt Ltd', total:'2,18,772', status:'SENT' },
];

let APP_ACTIVITY = [
  { ts:'6/6/2026, 11:05:29 AM', module:'AUTH',     user:'Rishit Patel',    role:'Procurement Officer', event:'User logged in',           detail:'Login successful for rishitpatel2509@gmail.com' },
  { ts:'6/6/2026, 11:05:10 AM', module:'AUTH',     user:'Rishit Patel',    role:'Procurement Officer', event:'User logged out',          detail:'Session terminated' },
  { ts:'6/6/2026, 10:58:37 AM', module:'AUTH',     user:'Rishit Patel',    role:'Procurement Officer', event:'User logged in',           detail:'Login successful for rishitpatel2509@gmail.com' },
  { ts:'6/6/2026, 10:58:12 AM', module:'AUTH',     user:'Rishit Patel',    role:'Procurement Officer', event:'User registered',          detail:'Account created for rishitpatel2509@gmail.com with role PROCUREMENT_OFFICER' },
  { ts:'6/6/2026, 10:09:22 AM', module:'RFQ',      user:'Rohan Deshmukh',  role:'Procurement Officer', event:'Created RFQ "Office Furniture Procurement Q2"', detail:'RFQ details created and assigned to Infra Supplies and Office Steel.' },
  { ts:'6/6/2026, 10:09:22 AM', module:'QUOTATION',user:'Rahul Sharma',    role:'Vendor',              event:'Submitted Quotation for RFQ "Office Furniture Procurement Q2"', detail:'Submitted total price: Rs. 1,85,400 with 12 days delivery timeline.' },
  { ts:'6/6/2026, 10:09:22 AM', module:'APPROVAL', user:'Siddharth Mehta', role:'Manager',             event:'Approved RFQ "Office Furniture Procurement Q2"', detail:'Remarks: Vendor 1 has the lowest bid and a faster delivery schedule.' },
];

// ─── STATE ──────────────────────────────────────────────────────────────────
let currentUser = null;

// ─── UTILS ──────────────────────────────────────────────────────────────────
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

function toast(msg, type='') {
  const el = $('#toast');
  el.textContent = msg;
  el.style.background = type==='error' ? '#dc2626' : '#1e293b';
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

function initials(u) {
  return ((u.firstName?.[0]||'')+(u.lastName?.[0]||'')).toUpperCase() || 'VB';
}

function getUsers() {
  const s = localStorage.getItem('vb-users');
  if (s) return JSON.parse(s);
  localStorage.setItem('vb-users', JSON.stringify(DEFAULT_USERS));
  return DEFAULT_USERS;
}
function saveUsers(arr) { localStorage.setItem('vb-users', JSON.stringify(arr)); }

function allowedPages() { return ROLE_ACCESS[currentUser?.role] || []; }
function ensureAllowed(id) {
  const p = allowedPages();
  return p.includes(id) ? id : p[0] || 'dashboard';
}

// ─── ICONS ──────────────────────────────────────────────────────────────────
function icon(name) {
  const icons = {
    'grid':        '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    'users':       '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    'file':        '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    'clipboard':   '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>',
    'bar-chart':   '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    'check-circle':'<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    'shopping-bag':'<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    'credit-card': '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
    'activity':    '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    'trending-up': '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
  };
  return icons[name] || '';
}

// ─── NAV ────────────────────────────────────────────────────────────────────
function renderNav() {
  const access = allowedPages();
  $('#nav').innerHTML = NAV_ITEMS
    .filter(n => access.includes(n.id) && !n.hidden)
    .map(n => `<button data-page="${n.id}">${icon(n.icon)} ${n.label}</button>`)
    .join('');
  $$('#nav button').forEach(b => b.addEventListener('click', () => showPage(b.dataset.page)));
}

function showPage(id) {
  const pid = ensureAllowed(id);
  $$('.page').forEach(p => p.classList.toggle('active', p.id === pid));
  $$('#nav button').forEach(b => b.classList.toggle('active', b.dataset.page === pid));
  const item = NAV_ITEMS.find(n => n.id === pid);
  $('#pageTitle').textContent = item ? item.label : '';
  // Page-specific renders
  if (pid === 'vendors') renderVendors();
  if (pid === 'rfqs') { renderRFQs(); $('#createRFQPanel').classList.add('hidden'); }
  if (pid === 'quotations') renderQuoteItems();
  if (pid === 'comparison') renderComparison();
  if (pid === 'pos') renderPOs();
  if (pid === 'invoices') renderInvoices();
  if (pid === 'activity') renderActivity();
  if (pid === 'reports') renderReports();
  if (pid === 'dashboard') renderDashboard();
}

// ─── AUTH ────────────────────────────────────────────────────────────────────
function login(e) {
  e.preventDefault();
  const email = $('#loginEmail').value.trim().toLowerCase();
  const pass = $('#loginPassword').value;
  const role = $('#loginRole').value;
  const user = getUsers().find(u => u.email.toLowerCase() === email);
  if (!user) { toast('Email not registered. Please sign up.', 'error'); return; }
  if (user.password !== pass) { toast('Wrong password.', 'error'); return; }
  if (user.role !== role) { toast(`Role mismatch — this account is ${user.role}.`); $('#loginRole').value = user.role; return; }
  currentUser = user;
  sessionStorage.setItem('vb-session', user.email);
  // Log login
  APP_ACTIVITY.unshift({ ts: new Date().toLocaleString('en-IN'), module:'AUTH', user:`${user.firstName} ${user.lastName}`, role: user.role, event:'User logged in', detail:`Login successful for ${user.email}` });
  $('#auth').classList.add('hidden');
  $('#app').classList.remove('hidden');
  renderApp();
  toast(`Welcome back, ${user.firstName}!`);
}

function register(e) {
  e.preventDefault();
  const email = $('#registerEmail').value.trim().toLowerCase();
  const users = getUsers();
  if (users.some(u => u.email.toLowerCase() === email)) {
    toast('Account already exists. Please login.'); switchAuth('login'); $('#loginEmail').value = email; return;
  }
  const user = {
    firstName: $('#registerFirstName').value.trim(),
    lastName: $('#registerLastName').value.trim(),
    email, password: $('#registerPassword').value,
    phone: $('#registerPhone').value.trim(),
    role: $('#registerRole').value,
    country: $('#registerCountry').value.trim(), info: ''
  };
  users.push(user); saveUsers(users);
  APP_ACTIVITY.unshift({ ts: new Date().toLocaleString('en-IN'), module:'AUTH', user:`${user.firstName} ${user.lastName}`, role: user.role, event:'User registered', detail:`Account created for ${user.email} with role ${user.role.toUpperCase().replace(/ /g,'_')}` });
  toast('Registered! Now login.');
  switchAuth('login'); $('#loginEmail').value = email; $('#loginRole').value = user.role;
}

function logout() {
  APP_ACTIVITY.unshift({ ts: new Date().toLocaleString('en-IN'), module:'AUTH', user:`${currentUser.firstName} ${currentUser.lastName}`, role: currentUser.role, event:'User logged out', detail:'Session terminated' });
  currentUser = null;
  sessionStorage.removeItem('vb-session');
  $('#app').classList.add('hidden');
  $('#auth').classList.remove('hidden');
  $('#loginPassword').value = '';
  toast('Signed out successfully.');
}

function switchAuth(to) {
  $('#loginForm').classList.toggle('hidden', to !== 'login');
  $('#registerForm').classList.toggle('hidden', to !== 'register');
}

function restoreSession() {
  const email = sessionStorage.getItem('vb-session');
  if (!email) return;
  const user = getUsers().find(u => u.email === email);
  if (!user) return;
  currentUser = user;
  $('#auth').classList.add('hidden');
  $('#app').classList.remove('hidden');
  renderApp();
}

// ─── RENDER APP ─────────────────────────────────────────────────────────────
function renderApp() {
  // Sidebar user
  $('#sidebarAvatar').textContent = initials(currentUser);
  $('#sidebarName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
  $('#sidebarRole').textContent = currentUser.role;
  renderNav();
  showPage('dashboard');
}

// ─── DASHBOARD ──────────────────────────────────────────────────────────────
function renderDashboard() {
  const name = currentUser.firstName.toUpperCase();
  $('#dashWelcomeLabel').textContent = `WELCOME BACK, ${name}`;
  $('#dashTitle').textContent = `${currentUser.role} Dashboard`;

  // KPIs
  $('#kpiVendors').textContent = APP_VENDORS.filter(v => v.status === 'Active').length;
  $('#kpiRFQs').textContent = APP_RFQS.filter(r => r.status === 'Published').length;

  // Hero buttons by role
  const heroMap = {
    'Admin':               [['rfqs','+ New RFQ'],['vendors','Manage Vendors']],
    'Procurement Officer': [['rfqs','+ New RFQ'],['vendors','Add Vendor']],
    'Vendor':              [['quotations','Submit Quotation'],['invoices','View Invoices']],
    'Manager / Approver':  [['approvals','Pending Approvals'],['reports','View Reports']],
  };
  $('#dashHeroBtns').innerHTML = (heroMap[currentUser.role]||[]).map(([p,l],i) =>
    `<button class="${i===0?'btn-teal':'btn-dark'}" data-goto="${p}">${l}</button>`
  ).join('');
  $$('[data-goto]').forEach(b => b.addEventListener('click', () => showPage(b.dataset.goto)));

  // Recent audit
  const recent = APP_ACTIVITY.slice(0, 5);
  $('#dashAuditList').innerHTML = recent.map(a => `
    <div class="audit-item">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div class="audit-item-text">${a.event}</div>
        <div class="audit-item-date">${a.ts.split(',')[0]}</div>
      </div>
      <div class="audit-item-sub">${a.detail}</div>
      <div class="audit-item-sub">By ${a.user} (${a.role.toUpperCase().replace(/ /g,'_')})</div>
    </div>`).join('');

  // Shortcuts
  const shortcuts = {
    'Procurement Officer': ['Manage RFQ Assignments','Release Purchase Orders','Process Vendor Invoices'],
    'Admin':               ['Manage Users','View All Logs','System Settings'],
    'Vendor':              ['View Open RFQs','Submit Quotation','Track Payments'],
    'Manager / Approver':  ['Review Quotations','Approve POs','View Reports'],
  };
  const sc = shortcuts[currentUser.role] || [];
  const scPages = {
    'Manage RFQ Assignments':'rfqs', 'Release Purchase Orders':'pos', 'Process Vendor Invoices':'invoices',
    'Manage Users':'vendors', 'View All Logs':'activity', 'System Settings':'reports',
    'View Open RFQs':'rfqs', 'Submit Quotation':'quotations', 'Track Payments':'invoices',
    'Review Quotations':'comparison', 'Approve POs':'approvals', 'View Reports':'reports',
  };
  $('#dashShortcuts').innerHTML = sc.map(s =>
    `<div class="shortcut-item" data-goto="${scPages[s]||'dashboard'}">
      <span>${s}</span><span class="shortcut-arrow">→</span>
    </div>`).join('');
  $$('#dashShortcuts [data-goto]').forEach(b => b.addEventListener('click', () => showPage(b.dataset.goto)));
}

// ─── VENDORS ────────────────────────────────────────────────────────────────
function renderVendors() {
  const q = ($('#vendorSearch')?.value || '').toLowerCase();
  const cat = $('#vendorCatFilter')?.value || '';
  const status = $('#vendorStatusFilter')?.value || '';
  const list = APP_VENDORS.filter(v => {
    const text = `${v.name} ${v.email} ${v.gst}`.toLowerCase();
    return (!q || text.includes(q)) && (!cat || v.category === cat) && (!status || v.status === status);
  });
  $('#vendorRows').innerHTML = list.map(v => `
    <tr>
      <td><strong>${v.name}</strong></td>
      <td>${v.category}</td>
      <td style="font-size:12px;font-family:monospace">${v.gst}</td>
      <td><div style="font-weight:600">${v.contactName}</div><div style="font-size:12px;color:var(--muted)">${v.email}</div><div style="font-size:12px;color:var(--muted)">${v.phone}</div></td>
      <td><div class="rating"><span class="star">⭐</span> ${v.rating}</div></td>
      <td><span class="badge badge-${v.status.toLowerCase()}">${v.status.toUpperCase()}</span></td>
      <td>
        <button class="delete-btn" data-del-vendor="${v.id}" title="Remove vendor">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </button>
      </td>
    </tr>`).join('');
  $$('[data-del-vendor]').forEach(b => b.addEventListener('click', () => {
    const id = Number(b.dataset.delVendor);
    if (!confirm('Remove this vendor?')) return;
    APP_VENDORS = APP_VENDORS.filter(v => v.id !== id);
    renderVendors();
    toast('Vendor removed.');
  }));
}

// ─── RFQs ───────────────────────────────────────────────────────────────────
function renderRFQs() {
  const q = ($('#rfqSearch')?.value||'').toLowerCase();
  const st = $('#rfqStatusFilter')?.value || '';
  const list = APP_RFQS.filter(r => (!q||r.title.toLowerCase().includes(q)) && (!st||r.status===st));
  $('#rfqRows').innerHTML = list.map(r => `
    <tr>
      <td><strong>${r.title}</strong></td>
      <td>${r.category}</td>
      <td>${new Date(r.deadline).toLocaleDateString('en-IN')}</td>
      <td>${r.vendors.length}</td>
      <td>${r.quotations}</td>
      <td><span class="badge badge-${r.status==='Published'?'active':r.status==='Draft'?'pending':'blocked'}">${r.status.toUpperCase()}</span></td>
      <td><button class="action-btn" data-view-rfq="${r.id}">Detail</button></td>
    </tr>`).join('');
}

// ─── LINE ITEMS ──────────────────────────────────────────────────────────────
function renderLineItems() {
  $('#lineItems').innerHTML = APP_LINE_ITEMS.map((row, i) => `
    <tr>
      <td><input value="${row.item}" data-li="${i}" data-key="item" style="min-width:200px"/></td>
      <td><input type="number" min="1" value="${row.qty}" data-li="${i}" data-key="qty" style="width:70px"/></td>
      <td><input value="${row.unit}" data-li="${i}" data-key="unit" style="width:70px"/></td>
      <td><button class="delete-btn" data-rm-li="${i}">✕</button></td>
    </tr>`).join('');
  const assigned = APP_VENDORS.slice(0,2);
  $('#assignedVendors').innerHTML = assigned.map(v => `
    <span class="vendor-pill">${v.name}<button data-rm-assign="${v.id}">✕</button></span>`).join('');
}

// ─── QUOTE ITEMS ─────────────────────────────────────────────────────────────
function renderQuoteItems() {
  $('#quoteItems').innerHTML = QUOTE_ITEMS.map((row, i) => `
    <tr>
      <td>${row.item}</td>
      <td>${row.qty}</td>
      <td><input type="number" min="0" value="${row.price}" data-qi="${i}" data-key="price" style="width:100px"/></td>
      <td>Rs. ${(row.qty * row.price).toLocaleString('en-IN')}</td>
      <td><input type="number" min="1" value="${row.delivery}" data-qi="${i}" data-key="delivery" style="width:70px"/></td>
    </tr>`).join('');
  renderQuoteTotals();
}

function renderQuoteTotals() {
  const sub = QUOTE_ITEMS.reduce((s,r) => s + r.qty * r.price, 0);
  const gst = Number($('#gstInput')?.value || 18);
  const gstAmt = Math.round(sub * gst / 100);
  const grand = sub + gstAmt;
  $('#quoteTotals').innerHTML = `
    <div class="total-row"><span>Subtotal</span><span>Rs. ${sub.toLocaleString('en-IN')}</span></div>
    <div class="total-row"><span>GST (${gst}%)</span><span>Rs. ${gstAmt.toLocaleString('en-IN')}</span></div>
    <div class="total-row grand"><span>Grand Total</span><span>Rs. ${grand.toLocaleString('en-IN')}</span></div>`;
}

// ─── COMPARISON ──────────────────────────────────────────────────────────────
function renderComparison() {
  const rows = [
    ['Grand Total',     ['Rs. 2,18,772','Rs. 2,14,800','Rs. 2,00,010'], 2],
    ['GST %',           ['18%','18%','18%'], -1],
    ['Delivery (days)', ['12 days','7 days','14 days'], 1],
    ['Vendor Rating',   ['⭐ 4.8/5','⭐ 4.2/5','⭐ 4.5/5'], 0],
    ['Payment Terms',   ['30 days','15 days','30 days'], -1],
  ];
  $('#comparisonRows').innerHTML = rows.map(([label, vals, best]) => `
    <tr>
      <td>${label}</td>
      ${vals.map((v,i) => `<td class="${i===best?'lowest-cell':''}">${v}</td>`).join('')}
    </tr>`).join('') +
    `<tr><td>Select &amp; Approve</td>
      <td><button class="btn-teal" data-select-quote style="width:100%">Select</button></td>
      <td><button class="secondary" style="width:100%">Select</button></td>
      <td><button class="secondary" style="width:100%">Select</button></td>
    </tr>`;
  $$('[data-select-quote]').forEach(b => b.addEventListener('click', () => {
    APP_ACTIVITY.unshift({ ts: new Date().toLocaleString('en-IN'), module:'APPROVAL', user:`${currentUser.firstName} ${currentUser.lastName}`, role: currentUser.role, event:'Quotation selected', detail:'Infra Supplies Pvt Ltd selected for Office Furniture Procurement Q2' });
    showPage('approvals');
    toast('Approval workflow initiated.');
  }));
}

// ─── PURCHASE ORDERS ─────────────────────────────────────────────────────────
function renderPOs() {
  $('#poRows').innerHTML = PO_LIST.map(po => `
    <tr>
      <td><strong>${po.poNum}</strong></td>
      <td>${po.rfqTitle}</td>
      <td>${po.vendor}</td>
      <td>Rs. ${po.total}</td>
      <td><span class="badge badge-sent">${po.status}</span></td>
      <td><button class="action-btn" data-view-po="${po.id}">Details</button></td>
    </tr>`).join('');
  $$('[data-view-po]').forEach(b => b.addEventListener('click', () => {
    showInvoiceDetail();
    toast('PO details loaded.');
  }));
}

// ─── INVOICES ────────────────────────────────────────────────────────────────
function renderInvoices() {
  $('#invoiceRows').innerHTML = `
    <tr>
      <td><strong>INV-2026-1001</strong></td>
      <td>PO-2026-0001</td>
      <td>Infra Supplies Pvt Ltd</td>
      <td>Rs. 2,18,772</td>
      <td><span class="badge badge-pending">PENDING PAYMENT</span></td>
      <td><button class="action-btn" id="viewInvoiceBtn">View Invoice</button></td>
    </tr>`;
  $('#viewInvoiceBtn')?.addEventListener('click', showInvoiceDetail);
}

function showInvoiceDetail() {
  const card = $('#invoiceDetailCard');
  if (!card) return;
  card.style.display = 'flex';
}

// ─── ACTIVITY LOG ────────────────────────────────────────────────────────────
function renderActivity() {
  const filter = $('#activityFilter')?.value || '';
  const list = filter ? APP_ACTIVITY.filter(a => a.module === filter) : APP_ACTIVITY;
  const badgeClass = { AUTH:'badge-auth', RFQ:'badge-rfq', QUOTATION:'badge-quotation', APPROVAL:'badge-approval', PO:'badge-sent', INVOICE:'badge-pending' };
  $('#activityRows').innerHTML = list.map(a => `
    <tr>
      <td style="font-size:12px;white-space:nowrap">${a.ts}</td>
      <td><span class="badge ${badgeClass[a.module]||'badge-auth'}">${a.module}</span></td>
      <td>
        <div style="font-weight:700">${a.user}</div>
        <div style="font-size:11px;color:var(--muted)">Role: ${a.role}</div>
      </td>
      <td style="font-weight:600">${a.event}</td>
      <td style="color:var(--muted);font-size:12px">${a.detail}</td>
    </tr>`).join('');
}

// ─── REPORTS ────────────────────────────────────────────────────────────────
function renderReports() {
  // Spend by category chart
  const cats = ['Furniture','IT Hardware','Stationery','Logistics'];
  const vals = [0, 0, 0, 0];
  const maxV = Math.max(...vals, 1);
  $('#categoryChart').innerHTML = cats.map((c,i) => `
    <div class="chart-bar-wrap">
      <div class="chart-val">${vals[i]}</div>
      <div class="chart-bar" style="height:${Math.max(4, vals[i]/maxV*160)}px"></div>
      <div class="chart-label">${c}</div>
    </div>`).join('');

  // Monthly trend
  const months = ['Jan 26','Feb 26','Mar 26','Apr 26','May 26','Jun 26'];
  const mvals  = [0,0,0,0,0,0];
  const mmax = Math.max(...mvals,1);
  $('#monthlyChart').innerHTML = months.map((m,i) => `
    <div class="chart-bar-wrap">
      <div class="chart-val">${mvals[i]}</div>
      <div class="chart-bar" style="height:${Math.max(4, mvals[i]/mmax*160)}px"></div>
      <div class="chart-label">${m}</div>
    </div>`).join('');
}

// ─── VENDOR MODAL ────────────────────────────────────────────────────────────
function openVendorModal() { $('#addVendorModal').classList.remove('hidden'); }
function closeVendorModal() { $('#addVendorModal').classList.add('hidden'); }

function saveVendor() {
  const name = $('#vName').value.trim();
  const gst = $('#vGST').value.trim();
  if (!name || !gst) { toast('Name and GSTIN are required.','error'); return; }
  const v = {
    id: Date.now(), name, category: $('#vCat').value, gst,
    contactName: $('#vContactName').value.trim(), email: $('#vEmail').value.trim(),
    phone: $('#vPhone').value.trim(), rating: 0, status: 'Active'
  };
  APP_VENDORS.push(v);
  APP_ACTIVITY.unshift({ ts: new Date().toLocaleString('en-IN'), module:'RFQ', user:`${currentUser.firstName} ${currentUser.lastName}`, role: currentUser.role, event:`Vendor added: ${name}`, detail:`${name} registered as ${v.category} vendor.` });
  closeVendorModal();
  renderVendors();
  toast(`${name} added successfully!`);
  // reset
  ['vName','vGST','vContactName','vEmail','vPhone'].forEach(id => { const el = $(`#${id}`); if(el) el.value=''; });
}

// ─── MARK PAID ────────────────────────────────────────────────────────────────
function markPaid() {
  const badge = $('#invStatusBadge');
  if (badge) { badge.textContent = 'PAID'; badge.className = 'inv-badge-paid'; }
  const btn = $('#markPaidBtn');
  if (btn) { btn.textContent = '✓ Payment Recorded'; btn.disabled = true; btn.style.background='#16a34a'; }
  APP_ACTIVITY.unshift({ ts: new Date().toLocaleString('en-IN'), module:'INVOICE', user:`${currentUser.firstName} ${currentUser.lastName}`, role: currentUser.role, event:'Invoice marked as paid', detail:'INV-2026-1001 against PO-2026-0001 marked paid.' });
  toast('Payment recorded successfully!');
}

// ─── BIND EVENTS ─────────────────────────────────────────────────────────────
function bindEvents() {
  // Auth
  $('#loginForm').addEventListener('submit', login);
  $('#registerForm').addEventListener('submit', register);
  $$('[data-auth-switch]').forEach(b => b.addEventListener('click', () => switchAuth(b.dataset.authSwitch)));
  $('#logoutBtn').addEventListener('click', logout);
  $('#forgotPasswordBtn')?.addEventListener('click', () => toast('Password reset requires admin. Contact admin@vendorbridge.local'));
  $('#loginEmail').addEventListener('change', () => {
    const u = getUsers().find(u => u.email.toLowerCase() === $('#loginEmail').value.trim().toLowerCase());
    if (u) $('#loginRole').value = u.role;
  });

  // Vendor page
  $('#vendorSearch').addEventListener('input', renderVendors);
  $('#vendorCatFilter').addEventListener('change', renderVendors);
  $('#vendorStatusFilter').addEventListener('change', renderVendors);
  $('#addVendorBtn').addEventListener('click', openVendorModal);
  $('#closeVendorModal').addEventListener('click', closeVendorModal);
  $('#cancelVendorModal').addEventListener('click', closeVendorModal);
  $('#saveVendorBtn').addEventListener('click', saveVendor);
  $('#addVendorModal').addEventListener('click', e => { if(e.target === $('#addVendorModal')) closeVendorModal(); });

  // RFQ
  $('#rfqSearch').addEventListener('input', renderRFQs);
  $('#rfqStatusFilter').addEventListener('change', renderRFQs);
  $('#newRFQBtn').addEventListener('click', () => {
    $('#createRFQPanel').classList.remove('hidden');
    $('#newRFQBtn').classList.add('hidden');
    renderLineItems();
  });
  $('#cancelRFQ').addEventListener('click', () => {
    $('#createRFQPanel').classList.add('hidden');
    $('#newRFQBtn').classList.remove('hidden');
  });
  $('#addLineItem').addEventListener('click', () => {
    APP_LINE_ITEMS.push({ item:'New item', qty:1, unit:'NOS' });
    renderLineItems();
  });
  $('#lineItems').addEventListener('input', e => {
    const i = Number(e.target.dataset.li);
    if(!isNaN(i)) APP_LINE_ITEMS[i][e.target.dataset.key] = e.target.dataset.key==='qty' ? Number(e.target.value) : e.target.value;
  });
  $('#lineItems').addEventListener('click', e => {
    const i = Number(e.target.dataset.rmLi);
    if(!isNaN(i) && e.target.dataset.rmLi !== undefined) { APP_LINE_ITEMS.splice(i,1); renderLineItems(); }
  });
  $('#assignVendorBtn').addEventListener('click', () => toast('Vendor selection dialog — click active vendor from list to assign.'));
  $('#sendRFQ').addEventListener('click', () => {
    const title = $('#rfqTitle').value.trim();
    if (!title) { toast('RFQ title is required.','error'); return; }
    const deadline = $('#rfqDeadline').value;
    APP_RFQS.push({ id: Date.now(), title, category: $('#rfqCategory').value, deadline, vendors:[1,2], quotations:0, status:'Published' });
    APP_ACTIVITY.unshift({ ts: new Date().toLocaleString('en-IN'), module:'RFQ', user:`${currentUser.firstName} ${currentUser.lastName}`, role: currentUser.role, event:`Created RFQ "${title}"`, detail:`RFQ details created and sent to vendors.` });
    $('#createRFQPanel').classList.add('hidden');
    $('#newRFQBtn').classList.remove('hidden');
    renderRFQs();
    toast(`RFQ "${title}" published!`);
  });
  $('#saveDraftRFQ').addEventListener('click', () => toast('Draft saved.'));

  // Quotation
  $('#quoteItems').addEventListener('input', e => {
    const i = Number(e.target.dataset.qi);
    if(!isNaN(i)) { QUOTE_ITEMS[i][e.target.dataset.key] = Number(e.target.value); renderQuoteItems(); }
  });
  $('#gstInput').addEventListener('input', renderQuoteTotals);
  $('#submitQuote').addEventListener('click', () => {
    APP_ACTIVITY.unshift({ ts: new Date().toLocaleString('en-IN'), module:'QUOTATION', user:`${currentUser.firstName} ${currentUser.lastName}`, role: currentUser.role, event:'Quotation submitted', detail:'Quotation submitted for Office Furniture Procurement Q2.' });
    toast('Quotation submitted successfully!');
  });

  // Approvals
  $('#approveBtn').addEventListener('click', () => {
    const remark = $('#approvalRemark').value || 'No remarks.';
    APP_ACTIVITY.unshift({ ts: new Date().toLocaleString('en-IN'), module:'APPROVAL', user:`${currentUser.firstName} ${currentUser.lastName}`, role: currentUser.role, event:'Approved quotation', detail:`Remarks: ${remark}` });
    toast('Approval recorded. PO can now be generated.');
  });
  $('#rejectBtn').addEventListener('click', () => {
    const remark = $('#approvalRemark').value || 'No remarks.';
    APP_ACTIVITY.unshift({ ts: new Date().toLocaleString('en-IN'), module:'APPROVAL', user:`${currentUser.firstName} ${currentUser.lastName}`, role: currentUser.role, event:'Rejected quotation', detail:`Remarks: ${remark}` });
    toast('Request rejected.');
  });

  // Invoice
  $('#markPaidBtn')?.addEventListener('click', markPaid);
  $('#downloadPDFBtn')?.addEventListener('click', () => { window.print(); toast('Use browser Print → Save as PDF.'); });
  $('#emailInvoiceBtn')?.addEventListener('click', () => toast('Email queued (no third-party API used).'));

  // Activity log filter
  $('#activityFilter').addEventListener('change', renderActivity);

  // Reports export
  $('#exportCSVBtn').addEventListener('click', () => {
    const csv = 'Month,Spend\n' + ['Jan 26','Feb 26','Mar 26','Apr 26','May 26','Jun 26'].map((m,i)=>`${m},0`).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = 'vendorbridge-spend.csv';
    a.click();
    toast('Spend CSV exported.');
  });

  // View trail
  $('#viewTrailBtn')?.addEventListener('click', () => showPage('activity'));

  // Theme toggle (simple dark mode hint)
  $('#themeBtn')?.addEventListener('click', () => toast('Dark mode coming soon!'));
  $('#notifBtn')?.addEventListener('click', () => toast('No new notifications.'));
}

// ─── INIT ────────────────────────────────────────────────────────────────────
getUsers();
bindEvents();
restoreSession();
