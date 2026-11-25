
// ==================== MEDICINES ====================
// Existing Admin Panel UI preserved.
// Supabase medicines table integration.

function escapeMedicineHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderMedicines(container) {
  const categories = [...new Set(
    (appState.medicines || []).map(m => m.category).filter(Boolean)
  )];

  const searchHtml = renderSearchBar(
    'Search medicines by name or category...',
    'handleMedicineSearch',
    `<select id="medicineCategoryFilter"
      onchange="handleMedicineCategoryFilter(this.value)"
      class="px-3 py-2.5 bg-white border border-admin-200 rounded-xl text-sm text-admin-700 focus:outline-none focus:border-pharma-400">
      <option value="all">All Categories</option>
      ${categories.map(c => `<option value="${escapeMedicineHtml(c)}">${escapeMedicineHtml(c)}</option>`).join('')}
    </select>`
  );

  container.innerHTML = `
    <div class="animate-in space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex flex-col sm:flex-row gap-3 flex-1">
          ${searchHtml}
        </div>
        <button onclick="showAddMedicineModal()"
          class="btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg shadow-pharma-500/20">
          + Add Medicine
        </button>
      </div>
      <div id="medicinesTable" class="bg-white rounded-2xl border border-admin-200 overflow-hidden">
        ${renderMedicinesTable(appState.medicines || [])}
      </div>
    </div>`;
}

function renderMedicinesTable(medicines) {
  if (!medicines.length) return renderEmptyState('No medicines found');

  return `
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-admin-100 bg-admin-50">
            <th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Name</th>
            <th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Company</th>
            <th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Category</th>
            <th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Strength / Form</th>
            <th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Prescription</th>
            <th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Status</th>
            <th class="text-right px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-admin-100">
          ${medicines.map(m => `
            <tr class="table-row-hover transition">
              <td class="px-5 py-4">
                <p class="text-sm font-semibold text-admin-900">${escapeMedicineHtml(m.medicine_name)}</p>
                <p class="text-xs text-admin-400 truncate max-w-[200px]">${escapeMedicineHtml(m.composition || m.description || '')}</p>
              </td>
              <td class="px-5 py-4 text-sm text-admin-600">${escapeMedicineHtml(m.company_name || '-')}</td>
              <td class="px-5 py-4">
                <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-600 border border-purple-100">${escapeMedicineHtml(m.category || '-')}</span>
              </td>
              <td class="px-5 py-4 text-sm text-admin-600">
                ${escapeMedicineHtml(m.strength || '-')}
                <p class="text-xs text-admin-400">${escapeMedicineHtml(m.dosage_form || '')}</p>
              </td>
              <td class="px-5 py-4 text-sm">${m.prescription_required ? 'Required' : 'Not Required'}</td>
              <td class="px-5 py-4 text-sm">${escapeMedicineHtml(m.status || 'active')}</td>
              <td class="px-5 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button onclick="editMedicine(${Number(m.id)})"
                    class="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition" title="Edit">✎</button>
                  <button onclick="deleteMedicine(${Number(m.id)})"
                    class="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition" title="Delete">🗑</button>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function filterMedicines(query, category) {
  let filtered = appState.medicines || [];

  if (category && category !== 'all') {
    filtered = filtered.filter(m => m.category === category);
  }

  if (query.trim()) {
    const q = query.toLowerCase();
    filtered = filtered.filter(m =>
      [m.medicine_name, m.company_name, m.composition,
       m.description, m.category, m.strength, m.dosage_form]
        .some(v => String(v || '').toLowerCase().includes(q))
    );
  }

  return filtered;
}

function handleMedicineSearch(query) {
  const category = document.getElementById('medicineCategoryFilter')?.value || 'all';
  document.getElementById('medicinesTable').innerHTML =
    renderMedicinesTable(filterMedicines(query, category));
}

function handleMedicineCategoryFilter(category) {
  const query = document.querySelector('.search-input')?.value || '';
  document.getElementById('medicinesTable').innerHTML =
    renderMedicinesTable(filterMedicines(query, category));
}

// ==================== FORM ====================

function medicineFormFields(m = {}) {
  const categories = [...new Set([
    ...(appState.medicines || []).map(x => x.category).filter(Boolean),
    'Painkiller', 'Antibiotic', 'Antihistamine',
    'Antidiabetic', 'Antacid', 'Supplement'
  ])];

  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-admin-700 mb-1">Medicine Name *</label>
        <input name="medicine_name" required value="${escapeMedicineHtml(m.medicine_name || '')}"
          class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm" placeholder="Medicine name">
      </div>
      <div>
        <label class="block text-sm font-medium text-admin-700 mb-1">Company Name</label>
        <input name="company_name" value="${escapeMedicineHtml(m.company_name || '')}"
          class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm" placeholder="Company name">
      </div>
      <div>
        <label class="block text-sm font-medium text-admin-700 mb-1">Category</label>
        <input name="category" list="medicineCategories" value="${escapeMedicineHtml(m.category || '')}"
          class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm" placeholder="Category">
        <datalist id="medicineCategories">
          ${categories.map(c => `<option value="${escapeMedicineHtml(c)}"></option>`).join('')}
        </datalist>
      </div>
      <div>
        <label class="block text-sm font-medium text-admin-700 mb-1">Dosage Form</label>
        <input name="dosage_form" value="${escapeMedicineHtml(m.dosage_form || '')}"
          class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm" placeholder="Tablet / Syrup / Capsule">
      </div>
      <div>
        <label class="block text-sm font-medium text-admin-700 mb-1">Strength</label>
        <input name="strength" value="${escapeMedicineHtml(m.strength || '')}"
          class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm" placeholder="500mg">
      </div>
      <div>
        <label class="block text-sm font-medium text-admin-700 mb-1">Status</label>
        <select name="status" class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm">
          <option value="active" ${String(m.status || 'active').toLowerCase() === 'active' ? 'selected' : ''}>Active</option>
          <option value="inactive" ${String(m.status || '').toLowerCase() === 'inactive' ? 'selected' : ''}>Inactive</option>
        </select>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-admin-700 mb-1">Composition</label>
      <textarea name="composition" rows="2" class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm">${escapeMedicineHtml(m.composition || '')}</textarea>
    </div>
    <div>
      <label class="block text-sm font-medium text-admin-700 mb-1">Description</label>
      <textarea name="description" rows="3" class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm">${escapeMedicineHtml(m.description || '')}</textarea>
    </div>
    <div>
      <label class="block text-sm font-medium text-admin-700 mb-1">Image URL</label>
      <input type="url" name="image_url" value="${escapeMedicineHtml(m.image_url || '')}"
        class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm" placeholder="https://...">
    </div>
    <div class="flex items-center gap-2">
      <input type="checkbox" name="prescription_required" id="medicinePrescriptionRequired"
        value="true" ${m.prescription_required ? 'checked' : ''} class="w-4 h-4">
      <label for="medicinePrescriptionRequired" class="text-sm font-medium text-admin-700">Prescription Required</label>
    </div>`;
}

function getMedicineFormPayload(form) {
  const fd = new FormData(form);

  return {
    medicine_name: String(fd.get('medicine_name') || '').trim(),
    company_name: String(fd.get('company_name') || '').trim() || null,
    composition: String(fd.get('composition') || '').trim() || null,
    description: String(fd.get('description') || '').trim() || null,
    image_url: String(fd.get('image_url') || '').trim() || null,
    status: String(fd.get('status') || 'active'),
    category: String(fd.get('category') || '').trim() || null,
    dosage_form: String(fd.get('dosage_form') || '').trim() || null,
    strength: String(fd.get('strength') || '').trim() || null,
    prescription_required: fd.get('prescription_required') === 'true',
    updated_at: new Date().toISOString()
  };
}

// ==================== ADD ====================

function showAddMedicineModal() {
  showModal('Add New Medicine', `
    <form onsubmit="handleAddMedicine(event)" class="space-y-4">
      ${medicineFormFields()}
      <div class="flex justify-end gap-3 pt-2">
        <button type="button" onclick="closeModal()"
          class="px-4 py-2 rounded-lg text-sm font-medium text-admin-600 hover:bg-admin-100">Cancel</button>
        <button type="submit" class="btn-primary px-4 py-2 rounded-lg text-sm font-medium text-white">Add Medicine</button>
      </div>
    </form>`);
}

async function handleAddMedicine(e) {
  e.preventDefault();
  if (!sbClient) return showToast('Supabase is not connected', 'error');

  const form = e.target;
  const payload = getMedicineFormPayload(form);

  if (!payload.medicine_name) return showToast('Medicine name is required', 'error');

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = 'Saving...';

  try {
    const { data, error } = await sbClient
      .from('medicines')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    appState.medicines = [data, ...(appState.medicines || [])];
    closeModal();
    showToast('Medicine added successfully');
    renderMedicines(document.getElementById('contentArea'));
  } catch (error) {
    console.error('Add medicine error:', error);
    showToast(error.message || 'Failed to add medicine', 'error');
    button.disabled = false;
    button.textContent = 'Add Medicine';
  }
}

// ==================== EDIT ====================

function editMedicine(id) {
  const medicine = (appState.medicines || []).find(m => String(m.id) === String(id));
  if (!medicine) return showToast('Medicine not found', 'error');

  showModal('Edit Medicine', `
    <form onsubmit="handleEditMedicine(event, ${Number(id)})" class="space-y-4">
      ${medicineFormFields(medicine)}
      <div class="flex justify-end gap-3 pt-2">
        <button type="button" onclick="closeModal()"
          class="px-4 py-2 rounded-lg text-sm font-medium text-admin-600 hover:bg-admin-100">Cancel</button>
        <button type="submit" class="btn-primary px-4 py-2 rounded-lg text-sm font-medium text-white">Save Changes</button>
      </div>
    </form>`);
}

async function handleEditMedicine(e, id) {
  e.preventDefault();
  if (!sbClient) return showToast('Supabase is not connected', 'error');

  const form = e.target;
  const payload = getMedicineFormPayload(form);
  if (!payload.medicine_name) return showToast('Medicine name is required', 'error');

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = 'Updating...';

  try {
    const { data, error } = await sbClient
      .from('medicines')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    appState.medicines = (appState.medicines || []).map(m =>
      String(m.id) === String(id) ? data : m
    );

    closeModal();
    showToast('Medicine updated successfully');
    renderMedicines(document.getElementById('contentArea'));
  } catch (error) {
    console.error('Update medicine error:', error);
    showToast(error.message || 'Failed to update medicine', 'error');
    button.disabled = false;
    button.textContent = 'Save Changes';
  }
}

// ==================== DELETE ====================

function deleteMedicine(id) {
  const medicine = (appState.medicines || []).find(m => String(m.id) === String(id));
  if (!medicine) return showToast('Medicine not found', 'error');

  showConfirmDialog(
    'Delete Medicine',
    `Are you sure you want to delete "${medicine.medicine_name || 'this medicine'}"?`,
    async () => {
      if (!sbClient) return showToast('Supabase is not connected', 'error');

      try {
        const { error } = await sbClient
          .from('medicines')
          .delete()
          .eq('id', id);

        if (error) throw error;

        appState.medicines = (appState.medicines || []).filter(
          m => String(m.id) !== String(id)
        );

        showToast('Medicine deleted successfully', 'warning');
        renderMedicines(document.getElementById('contentArea'));
      } catch (error) {
        console.error('Delete medicine error:', error);
        showToast(error.message || 'Failed to delete medicine', 'error');
      }
    }
  );
}
