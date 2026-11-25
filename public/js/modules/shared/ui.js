// Modularized from legacy.html; classic script intentionally preserves legacy global handlers.
    // ==================== UI HELPERS ====================
    
    // Shared screen for menu areas whose database-backed CRUD screen was not in the original legacy file.
    function renderModulePlaceholder(container, title, message, icon) {
      container.innerHTML = `
        <div class="animate-in max-w-3xl mx-auto py-10">
          <div class="bg-white rounded-2xl border border-admin-200 p-8 md:p-10 text-center shadow-sm">
            <div class="w-14 h-14 mx-auto rounded-2xl bg-pharma-50 text-pharma-600 flex items-center justify-center"><i data-lucide="${icon}" class="w-7 h-7"></i></div>
            <h3 class="mt-5 text-xl font-bold text-admin-900">${title}</h3>
            <p class="mt-2 text-sm leading-6 text-admin-500">${message}</p>
            <div class="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-100 px-3 py-1.5 text-xs font-medium text-amber-800">
              <i data-lucide="info" class="w-4 h-4"></i> Module scaffold — no existing data removed
            </div>
          </div>
        </div>`;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function toggleSidebar() {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('mobileOverlay');
      sidebar.classList.toggle('-translate-x-full');
      overlay.classList.toggle('hidden');
    }

    function showToast(message, type = 'success') {
      const container = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      const colors = type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-pharma-50 border-pharma-200 text-pharma-700';
      const icon = type === 'error' ? 'alert-circle' : type === 'warning' ? 'alert-triangle' : 'check-circle';
      toast.className = `toast-in flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${colors} max-w-sm`;
      toast.innerHTML = `
        <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${type === 'success' ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : type === 'error' ? 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' : 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'}"/></svg>
        <span class="text-sm font-medium">${message}</span>
      `;
      container.appendChild(toast);
      setTimeout(() => {
        toast.classList.remove('toast-in');
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    }

    function showConfirmDialog(title, message, onConfirm) {
      document.getElementById('confirmTitle').textContent = title;
      document.getElementById('confirmMessage').textContent = message;
      document.getElementById('confirmDialog').classList.remove('hidden');
      document.getElementById('confirmActionBtn').onclick = () => {
        closeConfirmDialog();
        onConfirm();
      };
    }

    function closeConfirmDialog() {
      document.getElementById('confirmDialog').classList.add('hidden');
    }

    function toggleNotifications() {
      showToast('No new notifications', 'warning');
    }

    function refreshData() {
      const btn = document.querySelector('[onclick="refreshData()"] svg');
      if (btn) {
        btn.style.animation = 'spin 1s linear';
        setTimeout(() => btn.style.animation = '', 1000);
      }
      if (sbClient) loadRealData();
      else {
        useMockData();
        showToast('Data refreshed');
      }
    }

    function logout() {
      if (confirm('Are you sure you want to logout?')) {
        if (sbClient) sbClient.auth.signOut();
        showToast('Logged out successfully');
        setTimeout(() => location.reload(), 1000);
      }
    }

    function formatCurrency(amount) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
    }

    function formatDate(dateStr) {
      if (!dateStr) return '-';
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    function getStatusBadge(status) {
      const map = {
        verified: 'bg-pharma-100 text-pharma-700 border-pharma-200',
        pending: 'bg-amber-100 text-amber-700 border-amber-200',
        rejected: 'bg-red-100 text-red-700 border-red-200',
        active: 'bg-pharma-100 text-pharma-700 border-pharma-200',
        inactive: 'bg-admin-100 text-admin-600 border-admin-200',
        published: 'bg-pharma-100 text-pharma-700 border-pharma-200',
        draft: 'bg-admin-100 text-admin-600 border-admin-200',
        delivered: 'bg-pharma-100 text-pharma-700 border-pharma-200',
        processing: 'bg-blue-100 text-blue-700 border-blue-200',
        shipped: 'bg-purple-100 text-purple-700 border-purple-200',
        paid: 'bg-pharma-100 text-pharma-700 border-pharma-200',
        pending_pay: 'bg-amber-100 text-amber-700 border-amber-200'
      };
      const cls = map[status] || map.active;
      return `<span class="status-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
    }

    function getInitials(name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    function renderEmptyState(message) {
      return `
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <div class="w-16 h-16 rounded-2xl bg-admin-100 flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-admin-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
          </div>
          <p class="text-admin-500 font-medium">${message}</p>
        </div>
      `;
    }

    function renderSkeleton(count = 4) {
      return Array(count).fill(0).map(() => `
        <div class="bg-white rounded-xl p-4 border border-admin-100">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-full skeleton"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 w-1/3 skeleton rounded"></div>
              <div class="h-3 w-1/4 skeleton rounded"></div>
            </div>
          </div>
        </div>
      `).join('');
    }

    // ==================== SEARCH & FILTER ====================
    function filterData(data, query, fields) {
      if (!query) return data;
      const q = query.toLowerCase();
      return data.filter(item => fields.some(f => String(item[f] || '').toLowerCase().includes(q)));
    }

    function renderSearchBar(placeholder, onSearch, extraFilters = '') {
      return `
        <div class="flex flex-col sm:flex-row gap-3 mb-6">
          <div class="relative flex-1 max-w-md">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input type="text" placeholder="${placeholder}" 
              class="search-input w-full pl-10 pr-4 py-2.5 bg-white border border-admin-200 rounded-xl text-sm text-admin-900 placeholder-admin-400 focus:outline-none focus:border-pharma-400 transition"
              oninput="(${onSearch})(this.value)">
          </div>
          ${extraFilters}
        </div>
      `;
    }

    // ==================== DASHBOARD ====================
    function getZoneSummary() {
      return ZONES.filter(zone => activeAccessZone === 'all' || zone === activeAccessZone).map(zone => ({
        zone,
        doctors: appState.doctors.filter(d => d.zone === zone).length,
        verifiedDoctors: appState.doctors.filter(d => d.zone === zone && d.status === 'verified').length,
        chemists: appState.chemists.filter(c => c.zone === zone).length,
        activeChemists: appState.chemists.filter(c => c.zone === zone && c.is_active).length
      }));
    }

    function renderZoneTable(rows) {
      return `<div class="overflow-x-auto"><table class="w-full"><thead><tr class="border-b border-admin-100 bg-admin-50">
        <th class="text-left px-4 py-3 text-xs font-semibold text-admin-500 uppercase">Zone</th>
        <th class="text-right px-4 py-3 text-xs font-semibold text-admin-500 uppercase">Doctors</th>
        <th class="text-right px-4 py-3 text-xs font-semibold text-admin-500 uppercase">Verified</th>
        <th class="text-right px-4 py-3 text-xs font-semibold text-admin-500 uppercase">Chemists</th>
        <th class="text-right px-4 py-3 text-xs font-semibold text-admin-500 uppercase">Active</th>
      </tr></thead><tbody class="divide-y divide-admin-100">${rows.map(r => `<tr class="table-row-hover"><td class="px-4 py-3 text-sm font-semibold text-admin-800">${r.zone}</td><td class="px-4 py-3 text-sm text-right">${r.doctors}</td><td class="px-4 py-3 text-sm text-right text-pharma-600 font-semibold">${r.verifiedDoctors}</td><td class="px-4 py-3 text-sm text-right">${r.chemists}</td><td class="px-4 py-3 text-sm text-right text-pharma-600 font-semibold">${r.activeChemists}</td></tr>`).join('')}</tbody></table></div>`;
    }

     {
    
      const doctors = appState.doctors || [];
      const patients = appState.patients || [];
      const medicines = appState.medicines || [];
      const chemists = appState.chemists || [];
      const forms = appState.forms || [];
      const blogs = appState.blogs || [];
      const zoneSummary = getZoneSummary();

      
      const verifiedDoctorsCount = doctors.filter(d => d.status === 'approved' || d.status === 'verified').length;
      const activeChemistsCount = chemists.filter(c => c.is_active || c.status === 'active' || c.status === 'approved').length;

      container.innerHTML = `
        <div class="space-y-6 animate-in">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            ${renderStatCard(activeAccessZone === 'all' ? '12 Zones' : activeAccessZone, activeAccessZone === 'all' ? ZONES.length : 1, 'store', 'bg-indigo-50 text-indigo-600', activeAccessZone === 'all' ? 'Zone-wise monitoring' : (ZONE_LABELS[activeAccessZone] || 'Assigned zone'))}
            ${renderStatCard('Doctors', doctors.length, 'users', 'bg-blue-50 text-blue-600', doctors.filter(d => d.status === 'verified').length + ' verified')}
            ${renderStatCard('Chemists', chemists.length, 'store', 'bg-amber-50 text-amber-600', chemists.filter(c => c.is_active).length + ' active')}
            ${renderStatCard('Patients', patients.length, 'user', 'bg-pharma-50 text-pharma-600', 'Active users')}
          </div>
          <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
            ${renderStatCard('Medicines', medicines.length, 'pill', 'bg-purple-50 text-purple-600', 'Under Chemist section')}
            ${renderStatCard('Forms', forms.length, 'file-text', 'bg-cyan-50 text-cyan-600', forms.reduce((s,f) => s + (f.submissions_count || 0), 0) + ' submissions')}
            ${renderStatCard('Blogs', appState.blogs.length, 'book-open', 'bg-indigo-50 text-indigo-600', appState.blogs.filter(b => b.status === 'published').length + ' published')}
          </div>

          <div class="bg-white rounded-2xl border border-admin-200 overflow-hidden card-hover">
            <div class="px-5 py-4 border-b border-admin-100 flex items-center justify-between">
              <div><h3 class="font-bold text-admin-900">Zone-wise Overview</h3><p class="text-xs text-admin-400 mt-1">Complete doctor and chemist distribution across all 12 zones</p></div>
              <button onclick="navigateTo('analytics')" class="text-xs font-medium text-pharma-600 hover:text-pharma-700">Open Analytics</button>
            </div>
            ${renderZoneTable(zoneSummary)}
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

          <div class="bg-gradient-to-r from-pharma-500 to-pharma-600 rounded-2xl p-6 text-white">
            <h3 class="text-lg font-bold mb-4">Quick Actions</h3>
            <div class="flex flex-wrap gap-3">
              <button onclick="navigateTo('chemists')" class="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition">Manage Chemists</button>
              <button onclick="navigateTo('medicines')" class="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition">Manage Medicine</button>
              <button onclick="navigateTo('doctors')" class="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition">Manage Doctors</button>
              <button onclick="navigateTo('analytics')" class="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition">Zone Analytics</button>
            </div>
          </div>
        </div>`;
    }

    function renderStatCard(title, value, icon, colorClass, subtitle) {
      return `
        <div class="stat-card bg-white rounded-2xl p-5 border border-admin-200 card-hover ${colorClass.split(' ')[1].replace('text-', 'text-opacity-10')}">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-xl ${colorClass.split(' ')[0]} flex items-center justify-center">
              <svg class="w-5 h-5 ${colorClass.split(' ')[1]}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                ${icon === 'users' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>' :
                  icon === 'user' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>' :
                  icon === 'pill' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>' :
                  icon === 'store' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>' :
                  icon === 'shopping-bag' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>' :
                  icon === 'file-text' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>' :
                  '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>'}
              </svg>
            </div>
            <span class="text-2xl font-black ${colorClass.split(' ')[1]}">${value}</span>
          </div>
          <p class="text-sm font-semibold text-admin-700">${title}</p>
          <p class="text-xs text-admin-400 mt-0.5">${subtitle}</p>
        </div>
      `;
    }

