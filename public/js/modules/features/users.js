// Modularized from legacy.html; classic script intentionally preserves legacy global handlers.
    // ==================== USERS (legacy data key: patients) ====================
    function renderPatients(container) {
      const searchHtml = renderSearchBar('Search patients by name, email, or phone...', 'handlePatientSearch');
      container.innerHTML = `
        <div class="animate-in space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            ${searchHtml}
          </div>
          <div id="patientsTable" class="bg-white rounded-2xl border border-admin-200 overflow-hidden">
            ${renderPatientsTable(appState.patients)}
          </div>
        </div>
      `;
    }

    function renderPatientsTable(patients) {
      if (!patients.length) return renderEmptyState('No patients found');
      return `
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-admin-100 bg-admin-50">
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Patient</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Age/Gender</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Phone</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Address</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Joined</th>
                <th class="text-right px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-admin-100">
              ${patients.map(p => `
                <tr class="table-row-hover transition">
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-pharma-400 to-pharma-600 flex items-center justify-center text-white text-sm font-bold">${getInitials(p.full_name)}</div>
                      <div>
                        <p class="text-sm font-semibold text-admin-900">${p.full_name}</p>
                        <p class="text-xs text-admin-400">${p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-5 py-4 text-sm text-admin-700">${p.age} / ${p.gender}</td>
                  <td class="px-5 py-4 text-sm text-admin-500">${p.phone}</td>
                  <td class="px-5 py-4 text-sm text-admin-500 max-w-[200px] truncate">${p.address}</td>
                  <td class="px-5 py-4 text-sm text-admin-500">${formatDate(p.created_at)}</td>
                  <td class="px-5 py-4 text-right">
                    <button onclick="viewPatientDetails(${p.id})" class="p-2 rounded-lg bg-admin-50 text-admin-500 hover:bg-admin-100 transition">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    function handlePatientSearch(query) {
      const filtered = filterData(appState.patients, query, ['full_name', 'email', 'phone', 'address']);
      document.getElementById('patientsTable').innerHTML = renderPatientsTable(filtered);
    }

    function viewPatientDetails(id) {
      const p = appState.patients.find(pt => pt.id === id);
      if (!p) return;
      showModal('Patient Details', `
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-pharma-400 to-pharma-600 flex items-center justify-center text-white text-xl font-bold">${getInitials(p.full_name)}</div>
            <div>
              <h3 class="text-lg font-bold text-admin-900">${p.full_name}</h3>
              <p class="text-sm text-admin-500">${p.email}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div><span class="text-admin-400">Age:</span> <span class="text-admin-700">${p.age}</span></div>
            <div><span class="text-admin-400">Gender:</span> <span class="text-admin-700 capitalize">${p.gender}</span></div>
            <div><span class="text-admin-400">Phone:</span> <span class="text-admin-700">${p.phone}</span></div>
            <div><span class="text-admin-400">Address:</span> <span class="text-admin-700">${p.address}</span></div>
            <div><span class="text-admin-400">Joined:</span> <span class="text-admin-700">${formatDate(p.created_at)}</span></div>
          </div>
        </div>
      `);
    }

