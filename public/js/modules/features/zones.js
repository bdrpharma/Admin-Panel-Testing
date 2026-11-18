// Modularized from legacy.html; classic script intentionally preserves legacy global handlers.
    // ==================== ANALYTICS ====================
    function renderZones(container) {
      const rows = getZoneSummary();
      container.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          ${renderStatCard('Total Zones', ZONES.length, 'store', 'bg-indigo-50 text-indigo-600', 'All zones in one admin workspace')}
          ${renderStatCard('Doctors', appState.doctors.length, 'users', 'bg-blue-50 text-blue-600', 'Across all zones')}
          ${renderStatCard('Chemists', appState.chemists.length, 'store', 'bg-amber-50 text-amber-600', 'Across all zones')}
        </div>
        <div class="bg-white rounded-2xl border border-admin-200 overflow-hidden">
          <div class="px-5 py-4 border-b border-admin-100"><h3 class="font-bold text-admin-900">All 12 Zones</h3><p class="text-xs text-admin-400 mt-1">Zone is a data category, not a separate admin permission. The admin can view every zone.</p></div>
          <div class="overflow-x-auto"><table class="w-full"><thead><tr class="border-b border-admin-100 bg-admin-50"><th class="text-left px-5 py-3 text-xs font-semibold text-admin-500 uppercase">Zone</th><th class="text-left px-5 py-3 text-xs font-semibold text-admin-500 uppercase">Location</th><th class="text-right px-5 py-3 text-xs font-semibold text-admin-500 uppercase">Doctors</th><th class="text-right px-5 py-3 text-xs font-semibold text-admin-500 uppercase">Verified Doctors</th><th class="text-right px-5 py-3 text-xs font-semibold text-admin-500 uppercase">Chemists</th><th class="text-right px-5 py-3 text-xs font-semibold text-admin-500 uppercase">Active Chemists</th></tr></thead><tbody class="divide-y divide-admin-100">${rows.map(r => `<tr class="table-row-hover"><td class="px-5 py-4 text-sm font-semibold text-admin-800">${r.zone}</td><td class="px-5 py-4 text-sm text-admin-600">${ZONE_LABELS[r.zone] || '—'}</td><td class="px-5 py-4 text-sm text-right">${r.doctors}</td><td class="px-5 py-4 text-sm text-right text-pharma-600 font-semibold">${r.verifiedDoctors}</td><td class="px-5 py-4 text-sm text-right">${r.chemists}</td><td class="px-5 py-4 text-sm text-right text-pharma-600 font-semibold">${r.activeChemists}</td></tr>`).join('')}</tbody></table></div>
        </div>`;
    }

