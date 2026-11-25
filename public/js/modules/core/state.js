// Modularized from legacy.html; classic script intentionally preserves legacy global handlers.
   // ==================== SUPABASE CONFIG & GLOBAL STATE ====================
    const SUPABASE_URL = 'https://lvmemzsxqadlvmmoqxmq.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_PxoSPumuTmxaQv6jpw_hbA_B-C1VlIQ';

    let sbClient = null;
    let currentUser = null;
    let currentSection = 'dashboard';

    // Keep the 12 operational zones available even when the Supabase zones table is empty.
    let ZONES = Array.from({ length: 12 }, (_, i) => `Zone ${i + 1}`);
    let ZONE_LABELS = {
      'Zone 1': 'Mumbai', 'Zone 2': 'Pune', 'Zone 3': 'Nashik',
      'Zone 4': 'Nagpur', 'Zone 5': 'Thane', 'Zone 6': 'Kolhapur',
      'Zone 7': 'Chhatrapati Sambhajinagar', 'Zone 8': 'Solapur',
      'Zone 9': 'Amravati', 'Zone 10': 'Satara', 'Zone 11': 'Ratnagiri',
      'Zone 12': 'Jalgaon'
    };
    var doctorStatusFilter = 'all';
    var doctorSearchQuery = '';
    var doctorZoneFilter = 'all';

    var activeAccessZone = 'all';
    var chemistZoneFilter = 'all';
    // ==================== MOCK DATA (for demo / fallback) ====================
    const MOCK_DATA = {
      doctors: [
        { id: 1, zone: 'Zone 1', full_name: 'Dr. Sarah Johnson', email: 'sarah.j@hospital.com', phone: '+1 555-0101', specialization: 'Cardiology', license_no: 'MD-2024-001', status: 'verified', created_at: '2024-01-15' },
        { id: 2, zone: 'Zone 2', full_name: 'Dr. Michael Chen', email: 'm.chen@clinic.org', phone: '+1 555-0102', specialization: 'Pediatrics', license_no: 'MD-2024-002', status: 'pending', created_at: '2024-02-20' },
        { id: 3, zone: 'Zone 3', full_name: 'Dr. Emily Rodriguez', email: 'emily.r@health.net', phone: '+1 555-0103', specialization: 'Dermatology', license_no: 'MD-2024-003', status: 'verified', created_at: '2024-03-10' },
        { id: 4, zone: 'Zone 4', full_name: 'Dr. James Wilson', email: 'j.wilson@med.com', phone: '+1 555-0104', specialization: 'Neurology', license_no: 'MD-2024-004', status: 'rejected', created_at: '2024-04-05' },
        { id: 5, zone: 'Zone 5', full_name: 'Dr. Aisha Patel', email: 'a.patel@care.io', phone: '+1 555-0105', specialization: 'General Medicine', license_no: 'MD-2024-005', status: 'pending', created_at: '2024-05-12' },

        { id: 6, zone: 'Zone 6', full_name: 'Dr. Rohan Mehta', email: 'rohan.m@care.com', phone: '+1 555-0106', specialization: 'Orthopedics', license_no: 'MD-2024-006', status: 'verified', created_at: '2024-05-20' },
        { id: 7, zone: 'Zone 7', full_name: 'Dr. Neha Sharma', email: 'neha.s@care.com', phone: '+1 555-0107', specialization: 'Gynecology', license_no: 'MD-2024-007', status: 'verified', created_at: '2024-05-21' },
        { id: 8, zone: 'Zone 8', full_name: 'Dr. Arjun Rao', email: 'arjun.r@care.com', phone: '+1 555-0108', specialization: 'ENT', license_no: 'MD-2024-008', status: 'pending', created_at: '2024-05-22' },
        { id: 9, zone: 'Zone 9', full_name: 'Dr. Priya Nair', email: 'priya.n@care.com', phone: '+1 555-0109', specialization: 'General Medicine', license_no: 'MD-2024-009', status: 'verified', created_at: '2024-05-23' },
        { id: 10, zone: 'Zone 10', full_name: 'Dr. Vikram Shah', email: 'vikram.s@care.com', phone: '+1 555-0110', specialization: 'Cardiology', license_no: 'MD-2024-010', status: 'pending', created_at: '2024-05-24' },
        { id: 11, zone: 'Zone 11', full_name: 'Dr. Kavya Iyer', email: 'kavya.i@care.com', phone: '+1 555-0111', specialization: 'Dermatology', license_no: 'MD-2024-011', status: 'verified', created_at: '2024-05-25' },
        { id: 12, zone: 'Zone 12', full_name: 'Dr. Aman Verma', email: 'aman.v@care.com', phone: '+1 555-0112', specialization: 'Pediatrics', license_no: 'MD-2024-012', status: 'verified', created_at: '2024-05-26' },
      ],
      patients: [
        { id: 1, zone: 'Zone 1', full_name: 'John Doe', email: 'john@email.com', phone: '+1 555-1001', age: 34, gender: 'male', address: '123 Main St', created_at: '2024-01-10' },
        { id: 2, zone: 'Zone 2', full_name: 'Jane Smith', email: 'jane@email.com', phone: '+1 555-1002', age: 28, gender: 'female', address: '456 Oak Ave', created_at: '2024-02-15' },
        { id: 3, zone: 'Zone 3', full_name: 'Robert Brown', email: 'rob@email.com', phone: '+1 555-1003', age: 52, gender: 'male', address: '789 Pine Rd', created_at: '2024-03-20' },
        { id: 4, zone: 'Zone 4', full_name: 'Lisa Davis', email: 'lisa@email.com', phone: '+1 555-1004', age: 41, gender: 'female', address: '321 Elm St', created_at: '2024-04-01' },
        { id: 5, zone: 'Zone 5', full_name: 'Tom Wilson', email: 'tom@email.com', phone: '+1 555-1005', age: 29, gender: 'male', address: '654 Maple Dr', created_at: '2024-05-18' },
      ],
      medicines: [
        { id: 1, name: 'Paracetamol 500mg', category: 'Painkiller', description: 'Pain and fever relief', buying_price: 500, selling_price: 1000, stock_qty: 100, expiry_date: '2027-12-31', created_at: '2024-01-15' },
        { id: 2, name: 'Amoxicillin 500mg', category: 'Antibiotic', description: 'Broad-spectrum antibiotic', buying_price: 1500, selling_price: 3000, stock_qty: 50, expiry_date: '2026-09-30', created_at: '2024-02-10' },
        { id: 3, name: 'Cetirizine 10mg', category: 'Antihistamine', description: 'Allergy relief', buying_price: 300, selling_price: 800, stock_qty: 120, expiry_date: '2028-05-15', created_at: '2024-03-05' },
        { id: 4, name: 'Metformin 500mg', category: 'Antidiabetic', description: 'Blood sugar control', buying_price: 1200, selling_price: 2500, stock_qty: 45, expiry_date: '2027-03-25', created_at: '2024-03-15' },
        { id: 5, name: 'Omeprazole 20mg', category: 'Antacid', description: 'Acid reflux treatment', buying_price: 800, selling_price: 1500, stock_qty: 60, expiry_date: '2027-08-10', created_at: '2024-04-01' },
      ],
      chemists: [
        { id: 1, zone: 'Zone 1', name: 'City Pharmacy', owner_name: 'Ahmed Hassan', email: 'city@pharm.com', phone: '+1 555-2001', address: '123 Downtown', license_no: 'PH-001', is_active: true, created_at: '2024-01-01' },
        { id: 2, zone: 'Zone 2', name: 'HealthPlus Chemist', owner_name: 'Maria Garcia', email: 'health@plus.com', phone: '+1 555-2002', address: '456 Uptown', license_no: 'PH-002', is_active: true, created_at: '2024-02-01' },
        { id: 3, zone: 'Zone 3', name: 'MediCare Store', owner_name: 'David Kim', email: 'medi@care.com', phone: '+1 555-2003', address: '789 Midtown', license_no: 'PH-003', is_active: false, created_at: '2024-03-01' },

        { id: 4, zone: 'Zone 4', name: 'Wellness Pharmacy', owner_name: 'Ravi Kumar', email: 'wellness@pharm.com', phone: '+1 555-2004', address: 'Zone 4 Market', license_no: 'PH-004', is_active: true, created_at: '2024-03-10' },
        { id: 5, zone: 'Zone 5', name: 'CarePoint Chemist', owner_name: 'Nisha Patel', email: 'carepoint@pharm.com', phone: '+1 555-2005', address: 'Zone 5 Center', license_no: 'PH-005', is_active: true, created_at: '2024-03-15' },
        { id: 6, zone: 'Zone 6', name: 'LifeCare Medical', owner_name: 'Amit Shah', email: 'lifecare@pharm.com', phone: '+1 555-2006', address: 'Zone 6 Road', license_no: 'PH-006', is_active: true, created_at: '2024-03-20' },
        { id: 7, zone: 'Zone 7', name: 'Green Cross Chemist', owner_name: 'Sneha Rao', email: 'greencross@pharm.com', phone: '+1 555-2007', address: 'Zone 7 Square', license_no: 'PH-007', is_active: true, created_at: '2024-03-25' },
        { id: 8, zone: 'Zone 8', name: 'MediHub Pharmacy', owner_name: 'Karan Singh', email: 'medihub@pharm.com', phone: '+1 555-2008', address: 'Zone 8 Plaza', license_no: 'PH-008', is_active: false, created_at: '2024-04-01' },
        { id: 9, zone: 'Zone 9', name: 'Apollo Local Chemist', owner_name: 'Pooja Nair', email: 'apollo.local@pharm.com', phone: '+1 555-2009', address: 'Zone 9 Main St', license_no: 'PH-009', is_active: true, created_at: '2024-04-05' },
        { id: 10, zone: 'Zone 10', name: 'Prime Pharmacy', owner_name: 'Vikas Mehta', email: 'prime@pharm.com', phone: '+1 555-2010', address: 'Zone 10 Market', license_no: 'PH-010', is_active: true, created_at: '2024-04-10' },
        { id: 11, zone: 'Zone 11', name: 'HealthFirst Chemist', owner_name: 'Anjali Iyer', email: 'healthfirst@pharm.com', phone: '+1 555-2011', address: 'Zone 11 Road', license_no: 'PH-011', is_active: true, created_at: '2024-04-15' },
        { id: 12, zone: 'Zone 12', name: 'Community Pharmacy', owner_name: 'Rahul Verma', email: 'community@pharm.com', phone: '+1 555-2012', address: 'Zone 12 Center', license_no: 'PH-012', is_active: true, created_at: '2024-04-20' },
      ],
      orders: [
        { id: 1, order_no: 'ORD-2024-001', patient_id: 1, patient_name: 'John Doe', total_amount: 2500, status: 'delivered', payment_status: 'paid', created_at: '2024-06-01', items: [{name:'Paracetamol',qty:2,price:1000},{name:'Cetirizine',qty:1,price:800}] },
        { id: 2, order_no: 'ORD-2024-002', patient_id: 2, patient_name: 'Jane Smith', total_amount: 3000, status: 'processing', payment_status: 'pending', created_at: '2024-06-02', items: [{name:'Amoxicillin',qty:1,price:3000}] },
        { id: 3, order_no: 'ORD-2024-003', patient_id: 3, patient_name: 'Robert Brown', total_amount: 1500, status: 'shipped', payment_status: 'paid', created_at: '2024-06-03', items: [{name:'Omeprazole',qty:1,price:1500}] },
        { id: 4, order_no: 'ORD-2024-004', patient_id: 1, patient_name: 'John Doe', total_amount: 5000, status: 'pending', payment_status: 'pending', created_at: '2024-06-04', items: [{name:'Metformin',qty:2,price:2500}] },
      ],
      blogs: [
        { id: 1, title: 'Understanding Diabetes Management', author: 'Dr. Sarah Johnson', category: 'Health Tips', status: 'published', views: 1240, created_at: '2024-05-01' },
        { id: 2, title: 'The Importance of Vaccination', author: 'Dr. Michael Chen', category: 'Prevention', status: 'published', views: 890, created_at: '2024-05-15' },
        { id: 3, title: 'Seasonal Allergies: A Complete Guide', author: 'Dr. Emily Rodriguez', category: 'Health Tips', status: 'draft', views: 0, created_at: '2024-06-01' },
        { id: 4, title: 'Mental Health Awareness Month', author: 'Dr. James Wilson', category: 'Mental Health', status: 'published', views: 567, created_at: '2024-06-10' },
      ],
      forms: [
        { id: 1, title: 'Patient Feedback Form', description: 'Collect patient experience feedback', fields_count: 8, submissions_count: 45, is_active: true, created_at: '2024-04-01' },
        { id: 2, title: 'Medicine Request Form', description: 'Request out-of-stock medicines', fields_count: 5, submissions_count: 23, is_active: true, created_at: '2024-04-15' },
        { id: 3, title: 'Doctor Registration', description: 'New doctor onboarding form', fields_count: 12, submissions_count: 8, is_active: true, created_at: '2024-05-01' },
      ],
      submissions: [
        { id: 1, form_title: 'Patient Feedback Form', submitted_by: 'John Doe', email: 'john@email.com', data: {rating:5,feedback:'Great service!'}, created_at: '2024-06-01' },
        { id: 2, form_title: 'Medicine Request Form', submitted_by: 'Jane Smith', email: 'jane@email.com', data: {medicine:'Insulin',urgency:'high'}, created_at: '2024-06-02' },
        { id: 3, form_title: 'Patient Feedback Form', submitted_by: 'Robert Brown', email: 'rob@email.com', data: {rating:4,feedback:'Good but slow delivery'}, created_at: '2024-06-03' },
      ],
      guidelines: [
        { id: 1, title: 'Hypertension Management Protocol', category: 'Clinical', content: 'Guidelines for managing high blood pressure...', author: 'Dr. Sarah Johnson', is_active: true, created_at: '2024-01-01' },
        { id: 2, title: 'Antibiotic Stewardship', category: 'Pharmacy', content: 'Best practices for antibiotic prescription...', author: 'Dr. Michael Chen', is_active: true, created_at: '2024-02-01' },
        { id: 3, title: 'Patient Data Privacy', category: 'Compliance', content: 'HIPAA compliance guidelines...', author: 'Admin', is_active: true, created_at: '2024-03-01' },
      ]
    };

    // ==================== STATE ====================
    let appState = {
      doctors: [],
      patients: [],
      medicines: [],
      chemists: [],
      blogs: [],
      forms: [],
      submissions: [],
      guidelines: [],
      loading: false,
      searchQuery: '',
      filterStatus: 'all',
      chartInstances: {}
    };

    // ==================== SINGLE ADMIN / ALL-ZONE ACCESS ====================
 function handleDemoLogin() {
      const userEl = document.getElementById('loginUsername');
      const passEl = document.getElementById('loginPassword');
      const errEl = document.getElementById('loginError');

      const user = userEl ? userEl.value.trim() : '';
      const pass = passEl ? passEl.value.trim() : '';

      if (user !== 'admin' || pass !== 'BDR@2026') { 
        if (errEl) errEl.classList.remove('hidden'); 
        return; 
      }

      if (errEl) errEl.classList.add('hidden');

      currentUser = { name: 'BDR Admin', role: 'admin', zone: 'all' };

      const nameEl = document.getElementById('userName');
      if (nameEl) nameEl.textContent = currentUser.name;

      const avatarEl = document.getElementById('userAvatar');
      if (avatarEl) avatarEl.textContent = 'A';

    
      const gate = document.getElementById('loginGate');
      if (gate) {
        gate.style.setProperty('display', 'none', 'important');
      }

      try {
        if (typeof renderSection === 'function') {
          renderSection(currentSection || 'dashboard');
        }
      } catch (err) {
        console.warn('Render fallback:', err);
      }

      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

