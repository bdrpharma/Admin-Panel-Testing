// Modularized from legacy.html; classic script intentionally preserves legacy global handlers.
    // ==================== FORMS ====================
    function renderForms(container) {
      const searchHtml = renderSearchBar('Search forms by title...', 'handleFormSearch');
      container.innerHTML = `
        <div class="animate-in space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex flex-col sm:flex-row gap-3 flex-1">${searchHtml}</div>
            <button onclick="showAddFormModal()" class="btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg shadow-pharma-500/20">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
              Create Form
            </button>
          </div>
          <div id="formsTable" class="bg-white rounded-2xl border border-admin-200 overflow-hidden">
            ${renderFormsTable(appState.forms)}
          </div>
        </div>
      `;
    }

    function renderFormsTable(forms) {
      if (!forms.length) return renderEmptyState('No forms found');
      return `
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-admin-100 bg-admin-50">
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Form</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Description</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Fields</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Submissions</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Status</th>
                <th class="text-right px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-admin-100">
              ${forms.map(f => `
                <tr class="table-row-hover transition">
                  <td class="px-5 py-4">
                    <p class="text-sm font-semibold text-admin-900">${f.title}</p>
                    <p class="text-xs text-admin-400">${formatDate(f.created_at)}</p>
                  </td>
                  <td class="px-5 py-4 text-sm text-admin-600 max-w-[250px] truncate">${f.description}</td>
                  <td class="px-5 py-4 text-sm text-admin-700">${f.fields_count}</td>
                  <td class="px-5 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-pharma-50 text-pharma-600">${f.submissions_count}</span>
                  </td>
                  <td class="px-5 py-4">${getStatusBadge(f.is_active ? 'active' : 'inactive')}</td>
                  <td class="px-5 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button onclick="viewFormSubmissions(${f.id})" class="p-2 rounded-lg bg-pharma-50 text-pharma-600 hover:bg-pharma-100 transition" title="View Submissions"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></button>
                      <button onclick="editForm(${f.id})" class="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
                      <button onclick="deleteForm(${f.id})" class="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    function handleFormSearch(query) {
      const filtered = filterData(appState.forms, query, ['title', 'description']);
      document.getElementById('formsTable').innerHTML = renderFormsTable(filtered);
    }

    function showAddFormModal() {
      showModal('Create New Form', `
        <form onsubmit="handleAddForm(event)" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-admin-700 mb-1">Form Title</label>
            <input type="text" name="title" required class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400">
          </div>
          <div>
            <label class="block text-sm font-medium text-admin-700 mb-1">Description</label>
            <textarea name="description" rows="2" class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-admin-700 mb-1">Fields (JSON format)</label>
            <textarea name="fields" rows="4" placeholder='[{"name":"full_name","type":"text","required":true}, {"name":"email","type":"email","required":true}]' class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm font-mono focus:outline-none focus:border-pharma-400"></textarea>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" onclick="closeModal()" class="px-4 py-2 rounded-lg text-sm font-medium text-admin-600 hover:bg-admin-100 transition">Cancel</button>
            <button type="submit" class="btn-primary px-4 py-2 rounded-lg text-sm font-medium text-white">Create Form</button>
          </div>
        </form>
      `);
    }

    function handleAddForm(e) {
      e.preventDefault();
      const fd = new FormData(e.target);
      const fieldsStr = fd.get('fields');
      let fieldsCount = 0;
      try { fieldsCount = JSON.parse(fieldsStr).length; } catch(e) {}
      const newForm = {
        id: Date.now(),
        title: fd.get('title'), description: fd.get('description'),
        fields_count: fieldsCount, submissions_count: 0,
        is_active: true, created_at: new Date().toISOString()
      };
      appState.forms.unshift(newForm);
      closeModal();
      showToast('Form created successfully');
      renderForms(document.getElementById('contentArea'));
    }

    function editForm(id) {
      const f = appState.forms.find(frm => frm.id === id);
      if (!f) return;
      showModal('Edit Form', `
        <form onsubmit="handleEditForm(event, ${id})" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-admin-700 mb-1">Form Title</label>
            <input type="text" name="title" value="${f.title}" required class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400">
          </div>
          <div>
            <label class="block text-sm font-medium text-admin-700 mb-1">Description</label>
            <textarea name="description" rows="2" class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400">${f.description}</textarea>
          </div>
          <div class="flex items-center gap-2">
            <input type="checkbox" name="is_active" ${f.is_active ? 'checked' : ''} class="w-4 h-4 text-pharma-500 rounded border-admin-300">
            <label class="text-sm text-admin-700">Active</label>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" onclick="closeModal()" class="px-4 py-2 rounded-lg text-sm font-medium text-admin-600 hover:bg-admin-100 transition">Cancel</button>
            <button type="submit" class="btn-primary px-4 py-2 rounded-lg text-sm font-medium text-white">Save Changes</button>
          </div>
        </form>
      `);
    }

    function handleEditForm(e, id) {
      e.preventDefault();
      const fd = new FormData(e.target);
      const idx = appState.forms.findIndex(f => f.id === id);
      if (idx >= 0) {
        appState.forms[idx] = { ...appState.forms[idx], title: fd.get('title'), description: fd.get('description'), is_active: !!fd.get('is_active') };
      }
      closeModal();
      showToast('Form updated successfully');
      renderForms(document.getElementById('contentArea'));
    }

    function deleteForm(id) {
      const f = appState.forms.find(frm => frm.id === id);
      showConfirmDialog('Delete Form', `Delete "${f?.title}"? All submissions will be lost.`, () => {
        appState.forms = appState.forms.filter(frm => frm.id !== id);
        showToast('Form deleted', 'warning');
        renderForms(document.getElementById('contentArea'));
      });
    }

    function viewFormSubmissions(formId) {
      navigateTo('submissions');
    }

