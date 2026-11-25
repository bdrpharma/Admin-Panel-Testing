
// Modularized from legacy.html; classic script intentionally preserves legacy global handlers.
// ==================== CHEMISTS ====================

chemistZoneFilter = 'all';
chemistSearchQuery = '';

// ==================== RENDER CHEMISTS ====================

function renderChemists(container) {
  const searchHtml = renderSearchBar(
    'Search chemists by name, owner, pincode or zone...',
    'handleChemistSearch',
    `<select onchange="handleChemistZoneFilter(this.value)" class="px-3 py-2.5 bg-white border border-admin-200 rounded-xl text-sm">
      ${zoneOptions(chemistZoneFilter)}
    </select>`
  );

  container.innerHTML = `
    <div class="animate-in space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex flex-col sm:flex-row gap-3 flex-1">
          ${searchHtml}
        </div>

        <button onclick="showAddChemistModal()" class="btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold">
          + Add Chemist
        </button>
      </div>

      <div id="chemistsTable" class="bg-white rounded-2xl border border-admin-200 overflow-hidden">
        ${renderChemistsTable(appState.chemists)}
      </div>
    </div>
  `;

  applyChemistFilters();
}

// ==================== CHEMISTS TABLE ====================

function renderChemistsTable(chemists) {
  if (!chemists.length) {
    return renderEmptyState('No chemists found');
  }

  return `
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-admin-100 bg-admin-50">
            <th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Chemist</th>
            <th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Zone</th>
            <th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Owner</th>
            <th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Pincode</th>
            <th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Status</th>
            <th class="text-right px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Actions</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-admin-100">
          ${chemists.map(c => {
            const isActive = c.status === 'Active' || c.is_active === true;

            return `
              <tr class="table-row-hover">
                <td class="px-5 py-4">
                  <p class="text-sm font-semibold text-admin-900">
                    ${c.name || c.store_name || '-'}
                  </p>
                  <p class="text-xs text-admin-400">
                    ${c.address || '-'} · ${c.phone || c.mobile || '-'}
                  </p>
                </td>

                <td class="px-5 py-4">
                  <span class="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold">
                    ${c.zone || 'Unassigned'}
                  </span>
                </td>

                <td class="px-5 py-4 text-sm text-admin-700">
                  ${c.owner_name || '-'}
                </td>

                <td class="px-5 py-4 text-sm font-mono text-admin-700">
                  ${c.pin_code || '-'}
                </td>

                <td class="px-5 py-4">
                  ${getStatusBadge(isActive ? 'active' : 'inactive')}
                </td>

                <td class="px-5 py-4 text-right">
                  <button onclick="editChemist(${c.id})" class="px-2 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs mr-2">
                    Edit
                  </button>

                  <button onclick="deleteChemist(${c.id})" class="px-2 py-1 rounded-lg bg-red-50 text-red-600 text-xs">
                    Delete
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ==================== FILTERS ====================

function applyChemistFilters() {
  let x = appState.chemists;

  if (chemistZoneFilter !== 'all') {
    x = x.filter(c =>
      String(c.zone || '').trim().toLowerCase() ===
      chemistZoneFilter.toLowerCase()
    );
  }

  if (chemistSearchQuery) {
    x = filterData(x, chemistSearchQuery, [
      'name',
      'store_name',
      'owner_name',
      'address',
      'zone',
      'pin_code',
      'phone',
      'mobile',
      'email'
    ]);
  }

  const el = document.getElementById('chemistsTable');

  if (el) {
    el.innerHTML = renderChemistsTable(x);
  }
}

function handleChemistSearch(query) {
  chemistSearchQuery = query;
  applyChemistFilters();
}

function handleChemistZoneFilter(zone) {
  chemistZoneFilter = zone;
  applyChemistFilters();
}

// ==================== ADD CHEMIST MODAL ====================

function showAddChemistModal() {
  showModal('Add New Chemist', `
    <form onsubmit="handleAddChemist(event)" class="space-y-4">

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-admin-700 mb-1">Chemist Name</label>
          <input type="text" name="name" required
            class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400">
        </div>

        <div>
          <label class="block text-sm font-medium text-admin-700 mb-1">Owner Name</label>
          <input type="text" name="owner_name" required
            class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400">
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-admin-700 mb-1">Email</label>
          <input type="email" name="email"
            class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400">
        </div>

        <div>
          <label class="block text-sm font-medium text-admin-700 mb-1">Phone</label>
          <input type="tel" name="phone" required
            class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400">
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-admin-700 mb-1">Address</label>
        <textarea name="address" rows="2"
          class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400"></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-admin-700 mb-1">Pincode</label>
        <input type="text" name="pin_code" maxlength="6" pattern="[0-9]{6}"
          inputmode="numeric" placeholder="Enter 6 digit Pincode" required
          class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400">
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <button type="button" onclick="closeModal()"
          class="px-4 py-2 rounded-lg text-sm font-medium text-admin-600 hover:bg-admin-100 transition">
          Cancel
        </button>

        <button type="submit"
          class="btn-primary px-4 py-2 rounded-lg text-sm font-medium text-white">
          Add Chemist
        </button>
      </div>

    </form>
  `);
}

// ==================== ADD CHEMIST HANDLER ====================

async function handleAddChemist(e) {
  e.preventDefault();

  const fd = new FormData(e.target);

  const newChemist = {
    store_name: fd.get('name'),
    owner_name: fd.get('owner_name'),
    email: fd.get('email') || null,
    mobile: fd.get('phone'),
    address: fd.get('address') || null,
    pin_code: fd.get('pin_code'),
    status: 'Inactive'
  };

  try {
    if (!sbClient) {
      throw new Error('Supabase connection not available');
    }

    const { data, error } = await sbClient
      .from('medical_stores')
      .insert([newChemist])
      .select()
      .single();

    if (error) throw error;

    appState.chemists.unshift({
      ...data,
      name: data.store_name,
      phone: data.mobile,
      zone: 'Unassigned',
      is_active: false
    });

    closeModal();
    showToast('Chemist added successfully');

    renderChemists(document.getElementById('contentArea'));

  } catch (error) {
    console.error('Add Chemist Error:', JSON.stringify(error, null, 2));
    showToast('Failed to add chemist: ' + error.message, 'error');
  }
}

// ==================== EDIT CHEMIST MODAL ====================

function editChemist(id) {
  const c = appState.chemists.find(ch => ch.id === id);

  if (!c) return;

  const isActive = c.status === 'Active' || c.is_active === true;

  showModal('Edit Chemist', `
    <form onsubmit="handleEditChemist(event, ${id})" class="space-y-4">

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-admin-700 mb-1">Chemist Name</label>
          <input type="text" name="name" value="${c.name || c.store_name || ''}" required
            class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400">
        </div>

        <div>
          <label class="block text-sm font-medium text-admin-700 mb-1">Owner Name</label>
          <input type="text" name="owner_name" value="${c.owner_name || ''}" required
            class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400">
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-admin-700 mb-1">Email</label>
          <input type="email" name="email" value="${c.email || ''}"
            class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400">
        </div>

        <div>
          <label class="block text-sm font-medium text-admin-700 mb-1">Phone</label>
          <input type="tel" name="phone" value="${c.phone || c.mobile || ''}" required
            class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400">
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-admin-700 mb-1">Address</label>
        <textarea name="address" rows="2"
          class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400">${c.address || ''}</textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-admin-700 mb-1">Pincode</label>
        <input type="text" name="pin_code" value="${c.pin_code || ''}"
          maxlength="6" pattern="[0-9]{6}" inputmode="numeric" required
          class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400">
      </div>

      <div class="flex items-center gap-2">
        <input type="checkbox" name="is_active" ${isActive ? 'checked' : ''}
          class="w-4 h-4 text-pharma-500 rounded border-admin-300">

        <label class="text-sm text-admin-700">Active</label>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <button type="button" onclick="closeModal()"
          class="px-4 py-2 rounded-lg text-sm font-medium text-admin-600 hover:bg-admin-100 transition">
          Cancel
        </button>

        <button type="submit"
          class="btn-primary px-4 py-2 rounded-lg text-sm font-medium text-white">
          Save Changes
        </button>
      </div>

    </form>
  `);
}

// ==================== EDIT CHEMIST HANDLER ====================

async function handleEditChemist(e, id) {
  e.preventDefault();

  const fd = new FormData(e.target);
  const isActive = fd.get('is_active') === 'on';

  const updatedChemist = {
    store_name: fd.get('name'),
    owner_name: fd.get('owner_name'),
    email: fd.get('email') || null,
    mobile: fd.get('phone'),
    address: fd.get('address') || null,
    pin_code: fd.get('pin_code'),
    status: isActive ? 'Active' : 'Inactive'
  };

  try {
    if (!sbClient) {
      throw new Error('Supabase connection not available');
    }

    const { data, error } = await sbClient
      .from('medical_stores')
      .update(updatedChemist)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const idx = appState.chemists.findIndex(c => c.id === id);

    if (idx >= 0) {
      appState.chemists[idx] = {
        ...appState.chemists[idx],
        ...data,
        name: data.store_name,
        phone: data.mobile,
        is_active: data.status === 'Active'
      };
    }

    closeModal();
    showToast('Chemist updated successfully');

    renderChemists(document.getElementById('contentArea'));

  } catch (error) {
    console.error('Update Chemist Error:', JSON.stringify(error, null, 2));
    showToast('Failed to update chemist: ' + error.message, 'error');
  }
}

// ==================== DELETE CHEMIST ====================

function deleteChemist(id) {
  const c = appState.chemists.find(ch => ch.id === id);

  showConfirmDialog(
    'Delete Chemist',
    `Delete "${c?.name || c?.store_name || 'this chemist'}"?`,

    async () => {
      try {
        if (!sbClient) {
          throw new Error('Supabase connection not available');
        }

        const { error } = await sbClient
          .from('medical_stores')
          .delete()
          .eq('id', id);

        if (error) throw error;

        appState.chemists = appState.chemists.filter(ch => ch.id !== id);

        showToast('Chemist deleted successfully', 'warning');

        renderChemists(document.getElementById('contentArea'));

      } catch (error) {
        console.error('Delete Chemist Error:', JSON.stringify(error, null, 2));
        showToast('Failed to delete chemist: ' + error.message, 'error');
      }
    }
  );
}
