// ==================== PROGRAMS ====================

function renderPrograms(container) {
  const programs = appState.programs || [];

  container.innerHTML = `
    <div class="animate-in space-y-4">

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex-1">
          <input
            type="text"
            id="programSearch"
            oninput="handleProgramSearch(this.value)"
            placeholder="Search programs by title or type..."
            class="w-full px-4 py-2.5 bg-white border border-admin-200 rounded-xl text-sm focus:outline-none focus:border-pharma-400"
          >
        </div>

        <button onclick="showAddProgramModal()"
          class="btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg shadow-pharma-500/20">
          + New Program
        </button>
      </div>

      <div class="flex flex-wrap gap-2">
        <button onclick="handleProgramStatusFilter('all')"
          class="px-3 py-2 rounded-lg text-sm bg-admin-100 text-admin-700">
          All
        </button>
        <button onclick="handleProgramStatusFilter('active')"
          class="px-3 py-2 rounded-lg text-sm bg-green-50 text-green-700">
          Active
        </button>
        <button onclick="handleProgramStatusFilter('inactive')"
          class="px-3 py-2 rounded-lg text-sm bg-red-50 text-red-700">
          Inactive
        </button>
      </div>

      <div id="programsGrid" class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${renderProgramsGrid(programs)}
      </div>

    </div>
  `;
}


// ==================== PROGRAM GRID ====================

function renderProgramsGrid(programs) {
  if (!programs || !programs.length) {
    return `<div class="col-span-full">${renderEmptyState('No programs found')}</div>`;
  }

  return programs.map(p => `
    <div class="bg-white rounded-2xl border border-admin-200 overflow-hidden card-hover">

      <div class="h-36 relative bg-gradient-to-br from-pharma-400 to-pharma-600">

        ${
          p.banner_image_url
            ? `<img src="${p.banner_image_url}"
                alt="Program Banner"
                class="w-full h-full object-cover"
                onerror="this.style.display='none'">`
            : `<div class="absolute inset-0 flex items-center justify-center">
                <svg class="w-12 h-12 text-white/40" fill="none"
                  stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v14H4V6a1 1 0 011-1z"/>
                </svg>
              </div>`
        }

        <div class="absolute top-3 right-3">
          ${getStatusBadge(p.status)}
        </div>
      </div>

      <div class="p-5">

        <span class="text-xs font-medium text-pharma-600 bg-pharma-50 px-2 py-1 rounded-full">
          ${p.program_type || 'General'}
        </span>

        <h3 class="text-base font-bold text-admin-900 mt-3 mb-2">
          ${p.title || 'Untitled Program'}
        </h3>

        <p class="text-sm text-admin-500 mb-3">
          ${p.short_description || ''}
        </p>

        <div class="text-xs text-admin-500 space-y-1 mb-4">
          <p>Start: ${p.start_date || 'Not set'}</p>
          <p>End: ${p.end_date || 'Not set'}</p>
          <p>Registration:
            <span class="${p.registration_open ? 'text-green-600' : 'text-red-500'} font-semibold">
              ${p.registration_open ? 'Open' : 'Closed'}
            </span>
          </p>
          <p>Zone: ${getProgramZoneName(p.zone_id)}</p>
        </div>

        <div class="flex items-center gap-2">

          <button onclick="toggleProgramStatus(${p.id})"
            class="flex-1 py-2 rounded-lg text-xs font-medium
            ${p.status === 'active'
              ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
              : 'bg-green-50 text-green-600 hover:bg-green-100'}">
            ${p.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>

          <button onclick="editProgram(${p.id})"
            class="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
            <i data-lucide="edit" class="w-4 h-4"></i>
          </button>

          <button onclick="deleteProgram(${p.id})"
            class="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>

        </div>
      </div>
    </div>
  `).join('');
}


// ==================== PROGRAM ZONE NAME ====================

function getProgramZoneName(zoneId) {
  if (!zoneId) return 'All Zones';

  const zone = (appState.zones || []).find(
    z => Number(z.id) === Number(zoneId)
  );

  return zone ? (zone.name || zone.zone_name || `Zone ${zoneId}`) : `Zone ${zoneId}`;
}


// ==================== PROGRAM SEARCH ====================

let currentProgramStatusFilter = 'all';

function handleProgramSearch(query) {
  let filtered = appState.programs || [];

  if (currentProgramStatusFilter !== 'all') {
    filtered = filtered.filter(
      p => p.status === currentProgramStatusFilter
    );
  }

  if (query) {
    filtered = filterData(
      filtered,
      query,
      ['title', 'short_description', 'program_type', 'created_by']
    );
  }

  document.getElementById('programsGrid').innerHTML =
    renderProgramsGrid(filtered);

  if (window.lucide) lucide.createIcons();
}


// ==================== PROGRAM STATUS FILTER ====================

function handleProgramStatusFilter(status) {
  currentProgramStatusFilter = status;

  const query = document.getElementById('programSearch')?.value || '';

  handleProgramSearch(query);
}


// ==================== ZONE OPTIONS ====================

function getProgramZoneOptions(selectedZoneId = '') {
  const zones = appState.zones || [];

  return `
    <option value="">All Zones</option>
    ${zones.map(z => `
      <option value="${z.id}"
        ${Number(selectedZoneId) === Number(z.id) ? 'selected' : ''}>
        ${z.name || z.zone_name || `Zone ${z.id}`}
      </option>
    `).join('')}
  `;
}


// ==================== ADD PROGRAM MODAL ====================

function showAddProgramModal() {
  showModal('Create New Program', `
    <form onsubmit="handleAddProgram(event)" class="space-y-4">

      <div>
        <label class="block text-sm font-medium text-admin-700 mb-1">Program Title</label>
        <input type="text" name="title" required
          class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm">
      </div>

      <div>
        <label class="block text-sm font-medium text-admin-700 mb-1">Short Description</label>
        <textarea name="short_description" rows="3"
          class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm"></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-admin-700 mb-1">Banner Image URL</label>
        <input type="url" name="banner_image_url"
          placeholder="https://example.com/banner.jpg"
          class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm">
      </div>

      <div>
        <label class="block text-sm font-medium text-admin-700 mb-1">Program Type</label>
        <input type="text" name="program_type"
          placeholder="e.g. Cancer Care, Cardiac Care"
          class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm">
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-admin-700 mb-1">Start Date</label>
          <input type="date" name="start_date"
            class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm">
        </div>

        <div>
          <label class="block text-sm font-medium text-admin-700 mb-1">End Date</label>
          <input type="date" name="end_date"
            class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm">
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-admin-700 mb-1">Zone</label>
        <select name="zone_id"
          class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm">
          ${getProgramZoneOptions()}
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-admin-700 mb-1">Created By</label>
        <input type="text" name="created_by"
          class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm">
      </div>

      <div class="flex items-center gap-2">
        <input type="checkbox" name="registration_open" checked>
        <label class="text-sm text-admin-700">Registration Open</label>
      </div>

      <div>
        <label class="block text-sm font-medium text-admin-700 mb-1">Status</label>
        <select name="status"
          class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <button type="button" onclick="closeModal()"
          class="px-4 py-2 rounded-lg text-sm text-admin-600">
          Cancel
        </button>

        <button type="submit"
          class="btn-primary px-4 py-2 rounded-lg text-sm text-white">
          Create Program
        </button>
      </div>

    </form>
  `);
}


// ==================== ADD PROGRAM TO SUPABASE ====================

async function handleAddProgram(e) {
  e.preventDefault();

  if (!sbClient) {
    showToast('Supabase is not connected', 'error');
    return;
  }

  const fd = new FormData(e.target);

  const newProgram = {
    title: fd.get('title'),
    short_description: fd.get('short_description') || null,
    banner_image_url: fd.get('banner_image_url') || null,
    program_type: fd.get('program_type') || null,
    start_date: fd.get('start_date') || null,
    end_date: fd.get('end_date') || null,
    registration_open: fd.get('registration_open') === 'on',
    zone_id: fd.get('zone_id') ? Number(fd.get('zone_id')) : null,
    status: fd.get('status') || 'active',
    created_by: fd.get('created_by') || null
  };

  try {
    const { data, error } = await sbClient
      .from('programs')
      .insert([newProgram])
      .select()
      .single();

    if (error) throw error;

    appState.programs = [data, ...(appState.programs || [])];

    closeModal();
    showToast('Program created successfully');
    renderPrograms(document.getElementById('contentArea'));

  } catch (error) {
    console.error('Add program error:', error);
    showToast(error.message || 'Failed to create program', 'error');
  }
}


// ==================== EDIT PROGRAM MODAL ====================

function editProgram(id) {
  const p = (appState.programs || []).find(
    item => Number(item.id) === Number(id)
  );

  if (!p) return;

  showModal('Edit Program', `
    <form onsubmit="handleEditProgram(event, ${id})" class="space-y-4">

      <div>
        <label class="block text-sm font-medium text-admin-700 mb-1">Program Title</label>
        <input type="text" name="title"
          value="${p.title || ''}" required
          class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm">
      </div>

      <div>
        <label class="block text-sm font-medium text-admin-700 mb-1">Short Description</label>
        <textarea name="short_description" rows="3"
          class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm">${p.short_description || ''}</textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-admin-700 mb-1">Banner Image URL</label>
        <input type="url" name="banner_image_url"
          value="${p.banner_image_url || ''}"
          placeholder="https://example.com/banner.jpg"
          class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm">
      </div>

      <div>
        <label class="block text-sm font-medium text-admin-700 mb-1">Program Type</label>
        <input type="text" name="program_type"
          value="${p.program_type || ''}"
          class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm">
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-admin-700 mb-1">Start Date</label>
          <input type="date" name="start_date"
            value="${p.start_date || ''}"
            class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm">
        </div>

        <div>
          <label class="block text-sm font-medium text-admin-700 mb-1">End Date</label>
          <input type="date" name="end_date"
            value="${p.end_date || ''}"
            class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm">
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-admin-700 mb-1">Zone</label>
        <select name="zone_id"
          class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm">
          ${getProgramZoneOptions(p.zone_id)}
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-admin-700 mb-1">Created By</label>
        <input type="text" name="created_by"
          value="${p.created_by || ''}"
          class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm">
      </div>

      <div class="flex items-center gap-2">
        <input type="checkbox" name="registration_open"
          ${p.registration_open ? 'checked' : ''}>
        <label class="text-sm text-admin-700">Registration Open</label>
      </div>

      <div>
        <label class="block text-sm font-medium text-admin-700 mb-1">Status</label>
        <select name="status"
          class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm">
          <option value="active" ${p.status === 'active' ? 'selected' : ''}>Active</option>
          <option value="inactive" ${p.status === 'inactive' ? 'selected' : ''}>Inactive</option>
        </select>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <button type="button" onclick="closeModal()"
          class="px-4 py-2 rounded-lg text-sm text-admin-600">
          Cancel
        </button>

        <button type="submit"
          class="btn-primary px-4 py-2 rounded-lg text-sm text-white">
          Save Changes
        </button>
      </div>

    </form>
  `);
}


// ==================== UPDATE PROGRAM IN SUPABASE ====================

async function handleEditProgram(e, id) {
  e.preventDefault();

  if (!sbClient) {
    showToast('Supabase is not connected', 'error');
    return;
  }

  const fd = new FormData(e.target);

  const updatedProgram = {
    title: fd.get('title'),
    short_description: fd.get('short_description') || null,
    banner_image_url: fd.get('banner_image_url') || null,
    program_type: fd.get('program_type') || null,
    start_date: fd.get('start_date') || null,
    end_date: fd.get('end_date') || null,
    registration_open: fd.get('registration_open') === 'on',
    zone_id: fd.get('zone_id') ? Number(fd.get('zone_id')) : null,
    status: fd.get('status') || 'active',
    created_by: fd.get('created_by') || null
  };

  try {
    const { data, error } = await sbClient
      .from('programs')
      .update(updatedProgram)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    appState.programs = (appState.programs || []).map(p =>
      Number(p.id) === Number(id) ? data : p
    );

    closeModal();
    showToast('Program updated successfully');
    renderPrograms(document.getElementById('contentArea'));

  } catch (error) {
    console.error('Update program error:', error);
    showToast(error.message || 'Failed to update program', 'error');
  }
}


// ==================== ACTIVATE / DEACTIVATE PROGRAM ====================

async function toggleProgramStatus(id) {
  if (!sbClient) {
    showToast('Supabase is not connected', 'error');
    return;
  }

  const program = (appState.programs || []).find(
    p => Number(p.id) === Number(id)
  );

  if (!program) return;

  const newStatus = program.status === 'active' ? 'inactive' : 'active';

  try {
    const { data, error } = await sbClient
      .from('programs')
      .update({ status: newStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    appState.programs = (appState.programs || []).map(p =>
      Number(p.id) === Number(id) ? data : p
    );

    showToast(
      newStatus === 'active'
        ? 'Program activated successfully'
        : 'Program deactivated successfully'
    );

    renderPrograms(document.getElementById('contentArea'));

  } catch (error) {
    console.error('Toggle program error:', error);
    showToast(error.message || 'Failed to update program status', 'error');
  }
}


// ==================== DELETE PROGRAM ====================

function deleteProgram(id) {
  const program = (appState.programs || []).find(
    p => Number(p.id) === Number(id)
  );

  if (!program) return;

  showConfirmDialog(
    'Delete Program',
    `Delete "${program.title}"?`,
    async () => {
      try {
        const { error } = await sbClient
          .from('programs')
          .delete()
          .eq('id', id);

        if (error) throw error;

        appState.programs = (appState.programs || []).filter(
          p => Number(p.id) !== Number(id)
        );

        showToast('Program deleted successfully', 'warning');
        renderPrograms(document.getElementById('contentArea'));

      } catch (error) {
        console.error('Delete program error:', error);
        showToast(error.message || 'Failed to delete program', 'error');
      }
    }
  );
}