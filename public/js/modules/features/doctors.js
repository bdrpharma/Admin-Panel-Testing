// Modularized from legacy.html; classic script intentionally preserves legacy global handlers.
    // ==================== DOCTORS ====================
    function zoneOptions(selected = 'all') {
      return (activeAccessZone === 'all' ? `<option value="all">All Zones</option>` : '') + ZONES.filter(z => activeAccessZone === 'all' || z === activeAccessZone).map(z => `<option value="${z}" ${selected === z || (selected === 'all' && activeAccessZone === z) ? 'selected' : ''}>${z}${ZONE_LABELS[z] ? ' · '+ZONE_LABELS[z] : ''}</option>`).join('');
    }

    // var doctorStatusFilter = 'all';
    var doctorZoneFilter = 'all';
    // var doctorSearchQuery = '';

    function renderDoctors(container) {
      const searchHtml = renderSearchBar('Search doctors by name, email, specialization or zone...', 'handleDoctorSearch',
        `<select onchange="handleDoctorFilter(this.value)" class="px-3 py-2.5 bg-white border border-admin-200 rounded-xl text-sm"><option value="all">All Status</option><option value="verified">Verified</option><option value="pending">Pending</option><option value="rejected">Rejected</option></select>
         <select onchange="handleDoctorZoneFilter(this.value)" class="px-3 py-2.5 bg-white border border-admin-200 rounded-xl text-sm">${zoneOptions(doctorZoneFilter)}</select>`);
      container.innerHTML = `<div class="animate-in space-y-4"><div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">${searchHtml}</div><div id="doctorsTable" class="bg-white rounded-2xl border border-admin-200 overflow-hidden">${renderDoctorsTable(appState.doctors)}</div></div>`;
      applyDoctorFilters();
    }

    
    function renderDoctorsTable(doctors) {
      if (!doctors.length) return renderEmptyState('No doctors found');
      return `<div class="overflow-x-auto"><table class="w-full"><thead><tr class="border-b border-admin-100 bg-admin-50">
        <th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Doctor</th><th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Zone</th><th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Specialization</th><th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">License</th><th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Status</th><th class="text-right px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Actions</th>
      </tr></thead><tbody class="divide-y divide-admin-100">${doctors.map(d => `<tr class="table-row-hover"><td class="px-5 py-4"><p class="text-sm font-semibold text-admin-900">${d.full_name}</p><p class="text-xs text-admin-400">${d.email} · ${d.phone}</p></td><td class="px-5 py-4"><span class="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold">${d.zone || 'Unassigned'}</span></td><td class="px-5 py-4 text-sm text-admin-700">${d.specialization}</td><td class="px-5 py-4 text-sm font-mono text-admin-500">${d.license_no}</td><td class="px-5 py-4">${getStatusBadge(d.status)}</td><td class="px-5 py-4 text-right"><div class="flex justify-end gap-2">${d.status === 'pending' ? `<button onclick="verifyDoctor(${d.id})" class="px-2 py-1 rounded-lg bg-pharma-50 text-pharma-700 text-xs">Verify</button><button onclick="rejectDoctor(${d.id})" class="px-2 py-1 rounded-lg bg-red-50 text-red-600 text-xs">Reject</button>` : ''}<button onclick="viewDoctorDetails(${d.id})" class="px-2 py-1 rounded-lg bg-admin-100 text-admin-600 text-xs">View</button></div></td></tr>`).join('')}</tbody></table></div>`;
    }
    function applyDoctorFilters(){ let x=appState.doctors; if(doctorStatusFilter!=='all') x=x.filter(d=>d.status===doctorStatusFilter); if(doctorZoneFilter!=='all') x=x.filter(d=>String(d.zone || '').trim().toLowerCase()===doctorZoneFilter.toLowerCase()); if(doctorSearchQuery) x=filterData(x,doctorSearchQuery,['full_name','email','specialization','license_no','zone']); const el=document.getElementById('doctorsTable'); if(el) el.innerHTML=renderDoctorsTable(x); }
    function handleDoctorSearch(query){ doctorSearchQuery=query; applyDoctorFilters(); }
    function handleDoctorFilter(status){ doctorStatusFilter=status; applyDoctorFilters(); }
    function handleDoctorZoneFilter(zone){ doctorZoneFilter=zone; applyDoctorFilters(); }

 
async function verifyDoctor(id) {
  showConfirmDialog(
    'Verify Doctor',
    'Are you sure you want to verify this doctor?',
    async () => {
      const doctor = appState.doctors.find(d => String(d.id) === String(id));

      if (!doctor) {
        showToast('Doctor not found', 'error');
        return;
      }

      const { data, error } = await sbClient
        .from('doctors')
        .update({
          status: 'verified',
          approval_date: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error('Supabase verify error:', error);
        showToast('Verification failed: ' + error.message, 'error');
        return;
      }

      if (!data || data.length === 0) {
        console.error('No doctor updated. Check ID and Supabase RLS policies.');
        showToast('Doctor was not updated in Supabase', 'error');
        return;
      }

      doctor.status = data[0].status;
      doctor.approval_date = data[0].approval_date;

      showToast('Doctor verified successfully');
      renderDoctors(document.getElementById('contentArea'));
    }
  );
}

async function rejectDoctor(id) {
  showConfirmDialog(
    'Reject Doctor',
    'Are you sure you want to reject this doctor?',
    async () => {
      const doctor = appState.doctors.find(d => String(d.id) === String(id));

      if (!doctor) {
        showToast('Doctor not found', 'error');
        return;
      }

      const { data, error } = await sbClient
        .from('doctors')
        .update({ status: 'rejected' })
        .eq('id', id)
        .select();

      if (error) {
        console.error('Supabase reject error:', error);
        showToast('Rejection failed: ' + error.message, 'error');
        return;
      }

      if (!data || data.length === 0) {
        showToast('Doctor was not updated in Supabase', 'error');
        return;
      }

      doctor.status = data[0].status;

      showToast('Doctor rejected', 'warning');
      renderDoctors(document.getElementById('contentArea'));
    }
  );
}


    function viewDoctorDetails(id) {
      const d = appState.doctors.find(doc => doc.id === id);
      if (!d) return;
      showModal('Doctor Details', `
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold">${getInitials(d.full_name)}</div>
            <div>
              <h3 class="text-lg font-bold text-admin-900">${d.full_name}</h3>
              <p class="text-sm text-admin-500">${d.specialization} · ${d.zone || 'Unassigned'}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div><span class="text-admin-400">Email:</span> <span class="text-admin-700">${d.email}</span></div>
            <div><span class="text-admin-400">Phone:</span> <span class="text-admin-700">${d.phone}</span></div>
            <div><span class="text-admin-400">License:</span> <span class="text-admin-700 font-mono">${d.license_no}</span></div>
            <div><span class="text-admin-400">Status:</span> ${getStatusBadge(d.status)}</div>
            <div><span class="text-admin-400">Joined:</span> <span class="text-admin-700">${formatDate(d.created_at)}</span></div>
          </div>
        </div>
      `);
    }

