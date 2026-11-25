// Modularized from legacy.html; classic script intentionally preserves legacy global handlers.
// ==================== ZONES ====================

function escapeZoneHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
}

function renderZones(container) {
  const rows = getZoneSummary();
  const zones = appState.zonesList || [];

  container.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      ${renderStatCard('Total Zones', ZONES.length, 'store', 'bg-indigo-50 text-indigo-600', 'All zones in one admin workspace')}
      ${renderStatCard('Doctors', appState.doctors.length, 'users', 'bg-blue-50 text-blue-600', 'Across all zones')}
      ${renderStatCard('Chemists', appState.chemists.length, 'store', 'bg-amber-50 text-amber-600', 'Across all zones')}
    </div>

    <div class="bg-white rounded-2xl border border-admin-200 p-5 mb-6">
      <div class="mb-4">
        <h3 class="font-bold text-admin-900">Add New Zone</h3>
        <p class="text-xs text-admin-400 mt-1">Create a zone and generate its PIN range</p>
      </div>
      <form id="addZoneForm" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="zoneName" class="block text-sm font-medium mb-2">Zone Name</label>
          <input id="zoneName" name="zone_name" type="text" maxlength="100" required
            placeholder="Example: Nashik Zone"
            class="w-full border border-admin-200 rounded-xl px-4 py-3 text-sm">
        </div>
        <div>
          <label for="zoneCode" class="block text-sm font-medium mb-2">Zone Code</label>
          <input id="zoneCode" name="zone_code" type="text" maxlength="20" required
            placeholder="Example: NSK"
            class="w-full border border-admin-200 rounded-xl px-4 py-3 text-sm">
        </div>
        <div>
          <label for="pinStart" class="block text-sm font-medium mb-2">PIN Start</label>
          <input id="pinStart" name="pin_start" type="text" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required
            placeholder="422001"
            class="w-full border border-admin-200 rounded-xl px-4 py-3 text-sm">
        </div>
        <div>
          <label for="pinEnd" class="block text-sm font-medium mb-2">PIN End</label>
          <input id="pinEnd" name="pin_end" type="text" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required
            placeholder="422010"
            class="w-full border border-admin-200 rounded-xl px-4 py-3 text-sm">
        </div>
        <div class="sm:col-span-2 flex items-center gap-3">
          <button type="submit" id="createZoneBtn"
            class="bg-pharma-600 hover:bg-pharma-700 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl text-sm">
            Create Zone
          </button>
          <span class="text-xs text-admin-400">Maximum 5,000 PIN codes per zone</span>
        </div>
      </form>
    </div>

    <div class="bg-white rounded-2xl border border-admin-200 overflow-hidden">
      <div class="px-5 py-4 border-b border-admin-100">
        <h3 class="font-bold text-admin-900">All Zones (${ZONES.length})</h3>
        <p class="text-xs text-admin-400 mt-1">Zone-wise doctor and chemist summary</p>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead><tr class="border-b border-admin-100 bg-admin-50">
            <th class="text-left px-5 py-3 text-xs font-semibold text-admin-500 uppercase">Zone Name</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-admin-500 uppercase">Zone Code</th>
            <th class="text-right px-5 py-3 text-xs font-semibold text-admin-500 uppercase">Doctors</th>
            <th class="text-right px-5 py-3 text-xs font-semibold text-admin-500 uppercase">Verified Doctors</th>
            <th class="text-right px-5 py-3 text-xs font-semibold text-admin-500 uppercase">Chemists</th>
            <th class="text-right px-5 py-3 text-xs font-semibold text-admin-500 uppercase">Active Chemists</th>
          </tr></thead>
          <tbody class="divide-y divide-admin-100">
            ${rows.map(r => {
              const zone = zones.find(z => z.zone_name === r.zone);
              return `<tr class="table-row-hover">
                <td class="px-5 py-4 text-sm font-semibold text-admin-800">${escapeZoneHtml(r.zone)}</td>
                <td class="px-5 py-4 text-sm text-admin-600">${escapeZoneHtml(zone?.zone_code || ZONE_LABELS[r.zone] || '—')}</td>
                <td class="px-5 py-4 text-sm text-right">${r.doctors}</td>
                <td class="px-5 py-4 text-sm text-right text-pharma-600 font-semibold">${r.verifiedDoctors}</td>
                <td class="px-5 py-4 text-sm text-right">${r.chemists}</td>
                <td class="px-5 py-4 text-sm text-right text-pharma-600 font-semibold">${r.activeChemists}</td>
              </tr>`;
            }).join('')}
            ${rows.length ? '' : '<tr><td colspan="6" class="px-5 py-8 text-center text-sm text-admin-400">No zones found in Supabase.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;

  const form = container.querySelector('#addZoneForm');
  if (form) form.addEventListener('submit', handleCreateZone);
}

// ==================== CREATE ZONE ====================

async function handleCreateZone(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const zoneName = form.elements.zone_name.value.trim();
  const zoneCode = form.elements.zone_code.value.trim();
  const pinStart = form.elements.pin_start.value.trim();
  const pinEnd = form.elements.pin_end.value.trim();
  const button = form.querySelector('#createZoneBtn');

  if (!zoneName || !zoneCode) {
    showToast('Zone Name and Zone Code are required', 'error');
    return;
  }
  if (!/^\d{6}$/.test(pinStart) || !/^\d{6}$/.test(pinEnd)) {
    showToast('PIN must contain exactly 6 digits', 'error');
    return;
  }
  if (Number(pinEnd) < Number(pinStart)) {
    showToast('PIN End must be greater than or equal to PIN Start', 'error');
    return;
  }
  if (Number(pinEnd) - Number(pinStart) > 4999) {
    showToast('Maximum 5,000 PIN codes are allowed per zone', 'error');
    return;
  }
  if (!sbClient) {
    showToast('Supabase is not connected', 'error');
    return;
  }

  button.disabled = true;
  button.textContent = 'Creating...';

  try {
    const { data, error } = await sbClient.functions.invoke('create-zone', {
      body: {
        zone_name: zoneName,
        zone_code: zoneCode,
        pin_start: pinStart,
        pin_end: pinEnd
      }
    });

    if (error) throw error;
    if (!data?.success) throw new Error(data?.error || 'Zone creation failed');

    showToast(`Zone created successfully (ID: ${data.zone_id})`);
    form.reset();
    await loadRealData();
  } catch (error) {
    console.error('Create zone error:', error);
    showToast(error?.message || 'Unable to create zone', 'error');
  } finally {
    const currentButton = document.getElementById('createZoneBtn');
    if (currentButton) {
      currentButton.disabled = false;
      currentButton.textContent = 'Create Zone';
    }
  }
}
