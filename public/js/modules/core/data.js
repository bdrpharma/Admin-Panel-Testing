// Modularized from legacy.html; classic script intentionally preserves legacy global handlers.
    // ==================== INITIALIZATION ====================
    document.addEventListener('DOMContentLoaded', () => {
      initSupabase();
      loadSection('dashboard');
      lucide.createIcons();
    });

    function initSupabase() {
      try {
        if (SUPABASE_URL.includes('your-project')) {
          console.log('Using mock data - configure your Supabase credentials in SUPABASE_URL and SUPABASE_ANON_KEY');
          useMockData();
          return;
        }
        sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase initialized');
        loadRealData();
      } catch (e) {
        console.error('Supabase init failed:', e);
        useMockData();
      }
    }

    function useMockData() {
      appState = { ...appState, ...MOCK_DATA };
      renderSection('dashboard');
    }


async function loadRealData() {
  appState.loading = true;

  try {
    // ==================== ZONES ====================
    const { data: zonesData, error: zonesError } = await sbClient
      .from('zones')
      .select('id, zone_name, zone_code')
      .order('id', { ascending: true });

    const zoneMap = {};

    if (zonesError) {
      console.error('Failed to load zones:', zonesError.message);
    } else {
      appState.zonesList = zonesData || [];

      // Use actual database zone names in all zone-linked screens.
      if (zonesData && zonesData.length > 0) {
        ZONES = zonesData.map(zone => zone.zone_name || `Zone ${zone.id}`);
      }

      (zonesData || []).forEach(zone => {
        const actualZoneName = zone.zone_name || `Zone ${zone.id}`;
        zoneMap[zone.id] = actualZoneName;

        // Preserve old Zone ID aliases for any legacy UI references.
        ZONE_LABELS[`Zone ${zone.id}`] = actualZoneName;
        ZONE_LABELS[actualZoneName] = zone.zone_code || '—';
      });

      console.log('Zones loaded successfully:', appState.zonesList);
      console.log('Zone mapping:', zoneMap);
    }

    // ==================== DOCTORS ====================
    const { data: doctorsData, error: docErr } = await sbClient
      .from('doctors')
      .select('*')
      .order('created_at', { ascending: false });

    if (!docErr && doctorsData) {
      appState.doctors = doctorsData.map(d => ({
        ...d,
        full_name: d.name || 'Unnamed Doctor',
        phone: d.mobile || '-',
        license_no: d.registration_number || '-',
        zone: zoneMap[d.zone_id] || (d.pin_code ? `PIN: ${d.pin_code}` : 'Unassigned')
      }));
    } else if (docErr) {
      console.error('Doctors load error:', docErr);
    }

    // ==================== USERS ====================
    const { data: usersData, error: usrErr } = await sbClient
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (!usrErr && usersData) {
      appState.patients = usersData.map(u => ({
        ...u,
        full_name: u.name || 'Unnamed User',
        phone: u.mobile || '-',
        zone: zoneMap[u.zone_id] || (u.pin_code ? `PIN: ${u.pin_code}` : 'Unassigned'),
        age: '-',
        gender: '-'
      }));
    } else if (usrErr) {
      console.error('Users load error:', usrErr);
    }

    // ==================== MEDICINES ====================
    const { data: medsData, error: medsError } = await sbClient
      .from('medicines')
      .select('*');

    if (!medsError && medsData) {
      appState.medicines = medsData;
    } else if (medsError) {
      console.error('Medicines load error:', medsError);
    }

    // ==================== CHEMISTS ====================
    const { data: chemistData, error: chemistError } = await sbClient
      .from('medical_stores')
      .select('*');

    if (!chemistError && chemistData) {
      appState.chemists = chemistData.map(c => ({
        ...c,
        owner_name: c.owner_name || c.contact_person || '-',
        license_no: c.license_no || c.dl_number || '-',
        phone: c.mobile || c.phone || '-',
        zone: zoneMap[c.zone_id] || 'Unassigned',
        is_active: c.status === 'active' || c.status === 'approved' || c.is_active === true
      }));
    } else if (chemistError) {
      console.error('Chemists load error:', chemistError);
    }

    // ==================== BLOGS ====================
    const { data: blogsData, error: blogsError } = await sbClient
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!blogsError && blogsData) {
      appState.blogs = blogsData;
    } else if (blogsError) {
      console.error('Blogs load error:', blogsError);
    }

    // ==================== PROGRAMS ====================
    const { data: programsData, error: programsError } = await sbClient
      .from('programs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!programsError && programsData) {
      appState.programs = programsData.map(p => ({
        ...p,
        zone: zoneMap[p.zone_id] || 'Unassigned'
      }));

      console.log('Programs loaded successfully:', appState.programs);
      console.log('Programs Count:', appState.programs.length);
    } else if (programsError) {
      console.error('Programs load error:', programsError);
    }

    // ==================== FORMS ====================
    const { data: formsData, error: formsError } = await sbClient
      .from('forms')
      .select('*');

    if (!formsError && formsData) {
      appState.forms = formsData;
    } else if (formsError) {
      console.error('Forms load error:', formsError);
    }

    // ==================== FORM SUBMISSIONS ====================
    const { data: subData, error: subError } = await sbClient
      .from('form_submissions')
      .select('*');

    if (!subError && subData) {
      appState.submissions = subData;
    } else if (subError) {
      console.error('Submissions load error:', subError);
    }

    // ==================== GUIDELINES ====================
    const { data: guidelinesData, error: guidelinesError } = await sbClient
      .from('guidelines')
      .select('*');

    if (!guidelinesError && guidelinesData) {
      appState.guidelines = guidelinesData;
    } else if (guidelinesError) {
      console.error('Guidelines load error:', guidelinesError);
    }

  } catch (e) {
    console.error('Load data error:', e);
  } finally {
    appState.loading = false;
    renderSection(currentSection);
  }
}
