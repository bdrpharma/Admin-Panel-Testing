// Modularized from legacy.html; classic script intentionally preserves legacy global handlers.
    // ==================== NAVIGATION ====================
    function navigateTo(section) {
      if(section==='analytics' && activeAccessZone!=='all'){ showToast('Analytics is available to Super Admin only','error'); return; }
      currentSection = section;
      document.querySelectorAll('.sidebar-link').forEach(el => {
        el.classList.remove('active');
        if (el.dataset.section === section) el.classList.add('active');
      });
      loadSection(section);
      if (window.innerWidth < 1024) toggleSidebar();
    }

   function loadSection(section) {
      const titles = {
        dashboard: { title: 'Dashboard', subtitle: 'Overview of your pharmacy' },
        doctors: { title: 'Doctors', subtitle: 'Manage and verify doctors' },
        users: { title: 'Users', subtitle: 'View and manage registered users' },
        patients: { title: 'Users', subtitle: 'View and manage registered users' },
        medicines: { title: 'Medicines', subtitle: 'Manage medicine inventory' },
        chemists: { title: 'Chemists', subtitle: 'Manage pharmacy partners' },
        blogs: { title: 'Blogs', subtitle: 'Content management' },
        forms: { title: 'Forms', subtitle: 'Create and manage forms' },
        submissions: { title: 'Form Submissions', subtitle: 'View submitted data' },
        analytics: { title: 'Analytics', subtitle: 'Zone-wise doctor and chemist analysis' },
        zones: { title: 'Zones', subtitle: 'Manage and review all 12 zones' },
        guidelines: { title: 'Guidelines', subtitle: 'Manage clinical and pharmacy guidelines' },
        programs: { title: 'Programs', subtitle: 'Manage outreach and health programs' },
        notifications: { title: 'Notifications', subtitle: 'Review admin notifications' },
        'learning-resources': { title: 'Learning Resources', subtitle: 'Manage educational resources' },
        faq: { title: 'FAQ', subtitle: 'Frequently asked questions' }
      };
      const t = titles[section] || titles.dashboard;
      const titleEl = document.getElementById('pageTitle');
      const subtitleEl = document.getElementById('pageSubtitle');
      if (titleEl) titleEl.textContent = t.title;
      if (subtitleEl) subtitleEl.textContent = t.subtitle;
      renderSection(section);
    }
    
// ==================== RENDER DASHBOARD ====================
   function renderDashboard(container) {
  if (!container) container = document.getElementById('contentArea');
  if (!container) return;

        const doctors = appState.doctors || [];
      const patients = appState.patients || []; 
      const medicines = appState.medicines || [];
      const chemists = appState.chemists || [];
      const forms = appState.forms || [];
      const blogs = appState.blogs || [];
      const zoneSummary = typeof getZoneSummary === 'function' ? getZoneSummary() : [];

      const verifiedDoctorsCount = doctors.filter(d => d.status === 'approved' || d.status === 'verified').length;
      const activeChemistsCount = chemists.filter(c => c.is_active || c.status === 'active' || c.status === 'approved').length;

      container.innerHTML = `
        <div class="space-y-6 animate-in">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            ${renderStatCard(activeAccessZone === 'all' ? '12 Zones' : activeAccessZone, activeAccessZone === 'all' ? ZONES.length : 1, 'store', 'bg-indigo-50 text-indigo-600', activeAccessZone === 'all' ? 'Zone-wise monitoring' : (ZONE_LABELS[activeAccessZone] || 'Assigned zone'))}
            ${renderStatCard('Doctors', doctors.length, 'users', 'bg-blue-50 text-blue-600', verifiedDoctorsCount + ' verified')}
            ${renderStatCard('Chemists', chemists.length, 'store', 'bg-amber-50 text-amber-600', activeChemistsCount + ' active')}
            ${renderStatCard('Users', patients.length, 'user', 'bg-pharma-50 text-pharma-600', 'Registered users')}
          </div>
          <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
            ${renderStatCard('Medicines', medicines.length, 'pill', 'bg-purple-50 text-purple-600', 'Under Chemist section')}
            ${renderStatCard('Forms', forms.length, 'file-text', 'bg-cyan-50 text-cyan-600', forms.reduce((s,f) => s + (f.submissions_count || 0), 0) + ' submissions')}
            ${renderStatCard('Blogs', blogs.length, 'book-open', 'bg-indigo-50 text-indigo-600', blogs.filter(b => b.status === 'published').length + ' published')}
          </div>

          <div class="bg-white rounded-2xl border border-admin-200 overflow-hidden card-hover">
            <div class="px-5 py-4 border-b border-admin-100 flex items-center justify-between">
              <div><h3 class="font-bold text-admin-900">Zone-wise Overview</h3><p class="text-xs text-admin-400 mt-1">Complete doctor and chemist distribution across all 12 zones</p></div>
              <button onclick="navigateTo('analytics')" class="text-xs font-medium text-pharma-600 hover:text-pharma-700">Open Analytics</button>
            </div>
            ${typeof renderZoneTable === 'function' ? renderZoneTable(zoneSummary) : ''}
          </div>

          <div class="grid lg:grid-cols-2 gap-6">
            <div class="bg-white rounded-2xl border border-admin-200 p-5 card-hover">
              <h3 class="font-bold text-admin-900 mb-4">Doctor Coverage by Zone</h3>
              <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">${zoneSummary.map(z => `<div class="rounded-xl bg-admin-50 p-3 text-center"><p class="text-xs text-admin-400">${z.zone}</p><p class="text-xl font-black text-blue-600">${z.doctors}</p></div>`).join('')}</div>
            </div>
            <div class="bg-white rounded-2xl border border-admin-200 p-5 card-hover">
              <h3 class="font-bold text-admin-900 mb-4">Chemist Coverage by Zone</h3>
              <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">${zoneSummary.map(z => `<div class="rounded-xl bg-admin-50 p-3 text-center"><p class="text-xs text-admin-400">${z.zone}</p><p class="text-xl font-black text-amber-600">${z.chemists}</p></div>`).join('')}</div>
            </div>
          </div>
        </div>`;
    }

    function renderSection(section) {
      const container = document.getElementById('contentArea');
      container.innerHTML = '';
      switch (section) {
        case 'dashboard': renderDashboard(container); break;
        case 'doctors': renderDoctors(container); break;
        case 'users':
        case 'patients': renderPatients(container); break;
        case 'medicines': renderMedicines(container); break;
        case 'chemists': renderChemists(container); break;
        case 'blogs': renderBlogs(container); break;
        case 'forms': renderForms(container); break;
        case 'submissions': renderSubmissions(container); break;
        case 'analytics': renderAnalytics(container); break;
        case 'zones': renderZones(container); break;
        case 'guidelines': renderGuidelines(container); break;
        case 'programs': renderPrograms(container); break;
        case 'notifications': renderNotificationsPage(container); break;
        case 'learning-resources': renderLearningResources(container); break;
        case 'faq': renderFaq(container); break;
      }
      lucide.createIcons();
    }

