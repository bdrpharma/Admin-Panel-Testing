// Modularized from legacy.html; classic script intentionally preserves legacy global handlers.
    // ==================== GUIDELINES ====================
    function renderGuidelines(container) {
      const searchHtml = renderSearchBar('Search guidelines by title or category...', 'handleGuidelineSearch',
        `<select onchange="handleGuidelineCategoryFilter(this.value)" class="px-3 py-2.5 bg-white border border-admin-200 rounded-xl text-sm text-admin-700 focus:outline-none focus:border-pharma-400">
          <option value="all">All Categories</option>
          <option value="Clinical">Clinical</option>
          <option value="Pharmacy">Pharmacy</option>
          <option value="Compliance">Compliance</option>
        </select>`);

      container.innerHTML = `
        <div class="animate-in space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex flex-col sm:flex-row gap-3 flex-1">${searchHtml}</div>
            <button onclick="showAddGuidelineModal()" class="btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg shadow-pharma-500/20">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
              Add Guideline
            </button>
          </div>
          <div id="guidelinesTable" class="bg-white rounded-2xl border border-admin-200 overflow-hidden">
            ${renderGuidelinesTable(appState.guidelines)}
          </div>
        </div>
      `;
    }

    function renderGuidelinesTable(guidelines) {
      if (!guidelines.length) return renderEmptyState('No guidelines found');
      return `
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-admin-100 bg-admin-50">
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Title</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Category</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Author</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Status</th>
                <th class="text-right px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-admin-100">
              ${guidelines.map(g => `
                <tr class="table-row-hover transition">
                  <td class="px-5 py-4">
                    <p class="text-sm font-semibold text-admin-900">${g.title}</p>
                    <p class="text-xs text-admin-400 truncate max-w-[300px]">${g.content?.slice(0, 80)}...</p>
                  </td>
                  <td class="px-5 py-4">
                    <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-50 text-cyan-600 border border-cyan-100">${g.category}</span>
                  </td>
                  <td class="px-5 py-4 text-sm text-admin-700">${g.author}</td>
                  <td class="px-5 py-4">${getStatusBadge(g.is_active ? 'active' : 'inactive')}</td>
                  <td class="px-5 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button onclick="viewGuideline(${g.id})" class="p-2 rounded-lg bg-admin-50 text-admin-500 hover:bg-admin-100 transition"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg></button>
                      <button onclick="editGuideline(${g.id})" class="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
                      <button onclick="deleteGuideline(${g.id})" class="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    function handleGuidelineSearch(query) {
      const filtered = filterData(appState.guidelines, query, ['title', 'author', 'category', 'content']);
      document.getElementById('guidelinesTable').innerHTML = renderGuidelinesTable(filtered);
    }

    function handleGuidelineCategoryFilter(cat) {
      let filtered = appState.guidelines;
      if (cat !== 'all') filtered = filtered.filter(g => g.category === cat);
      const query = document.querySelector('.search-input')?.value || '';
      if (query) filtered = filterData(filtered, query, ['title', 'author', 'category', 'content']);
      document.getElementById('guidelinesTable').innerHTML = renderGuidelinesTable(filtered);
    }

    function showAddGuidelineModal() {
      showModal('Add New Guideline', `
        <form onsubmit="handleAddGuideline(event)" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-admin-700 mb-1">Title</label>
            <input type="text" name="title" required class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-admin-700 mb-1">Category</label>
              <select name="category" class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400">
                <option>Clinical</option><option>Pharmacy</option><option>Compliance</option><option>Safety</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-admin-700 mb-1">Author</label>
              <input type="text" name="author" required class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-admin-700 mb-1">Content</label>
            <textarea name="content" rows="6" required class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400"></textarea>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" onclick="closeModal()" class="px-4 py-2 rounded-lg text-sm font-medium text-admin-600 hover:bg-admin-100 transition">Cancel</button>
            <button type="submit" class="btn-primary px-4 py-2 rounded-lg text-sm font-medium text-white">Add Guideline</button>
          </div>
        </form>
      `);
    }

    function handleAddGuideline(e) {
      e.preventDefault();
      const fd = new FormData(e.target);
      const newGuideline = {
        id: Date.now(),
        title: fd.get('title'), category: fd.get('category'), author: fd.get('author'),
        content: fd.get('content'), is_active: true, created_at: new Date().toISOString()
      };
      appState.guidelines.unshift(newGuideline);
      closeModal();
      showToast('Guideline added successfully');
      renderGuidelines(document.getElementById('contentArea'));
    }

    function viewGuideline(id) {
      const g = appState.guidelines.find(gl => gl.id === id);
      if (!g) return;
      showModal(g.title, `
        <div class="space-y-4">
          <div class="flex items-center gap-2 mb-2">
            <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-50 text-cyan-600 border border-cyan-100">${g.category}</span>
            <span class="text-xs text-admin-400">By ${g.author} &middot; ${formatDate(g.created_at)}</span>
          </div>
          <div class="prose prose-sm max-w-none text-admin-700 leading-relaxed">${g.content}</div>
        </div>
      `);
    }

    function editGuideline(id) {
      const g = appState.guidelines.find(gl => gl.id === id);
      if (!g) return;
      showModal('Edit Guideline', `
        <form onsubmit="handleEditGuideline(event, ${id})" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-admin-700 mb-1">Title</label>
            <input type="text" name="title" value="${g.title}" required class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-admin-700 mb-1">Category</label>
              <select name="category" class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400">
                <option ${g.category === 'Clinical' ? 'selected' : ''}>Clinical</option>
                <option ${g.category === 'Pharmacy' ? 'selected' : ''}>Pharmacy</option>
                <option ${g.category === 'Compliance' ? 'selected' : ''}>Compliance</option>
                <option ${g.category === 'Safety' ? 'selected' : ''}>Safety</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-admin-700 mb-1">Author</label>
              <input type="text" name="author" value="${g.author}" required class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-admin-700 mb-1">Content</label>
            <textarea name="content" rows="6" required class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400">${g.content}</textarea>
          </div>
          <div class="flex items-center gap-2">
            <input type="checkbox" name="is_active" ${g.is_active ? 'checked' : ''} class="w-4 h-4 text-pharma-500 rounded border-admin-300">
            <label class="text-sm text-admin-700">Active</label>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" onclick="closeModal()" class="px-4 py-2 rounded-lg text-sm font-medium text-admin-600 hover:bg-admin-100 transition">Cancel</button>
            <button type="submit" class="btn-primary px-4 py-2 rounded-lg text-sm font-medium text-white">Save Changes</button>
          </div>
        </form>
      `);
    }

    function handleEditGuideline(e, id) {
      e.preventDefault();
      const fd = new FormData(e.target);
      const idx = appState.guidelines.findIndex(g => g.id === id);
      if (idx >= 0) {
        appState.guidelines[idx] = { ...appState.guidelines[idx], title: fd.get('title'), category: fd.get('category'), author: fd.get('author'), content: fd.get('content'), is_active: !!fd.get('is_active') };
      }
      closeModal();
      showToast('Guideline updated successfully');
      renderGuidelines(document.getElementById('contentArea'));
    }

    function deleteGuideline(id) {
      const g = appState.guidelines.find(gl => gl.id === id);
      showConfirmDialog('Delete Guideline', `Delete "${g?.title}"?`, () => {
        appState.guidelines = appState.guidelines.filter(gl => gl.id !== id);
        showToast('Guideline deleted', 'warning');
        renderGuidelines(document.getElementById('contentArea'));
      });
    }

