// Modularized from legacy.html; classic script intentionally preserves legacy global handlers.
    // ==================== SUBMISSIONS ====================
    function renderSubmissions(container) {
      const searchHtml = renderSearchBar('Search submissions by form or submitter...', 'handleSubmissionSearch');
      container.innerHTML = `
        <div class="animate-in space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            ${searchHtml}
          </div>
          <div id="submissionsTable" class="bg-white rounded-2xl border border-admin-200 overflow-hidden">
            ${renderSubmissionsTable(appState.submissions)}
          </div>
        </div>
      `;
    }

    function renderSubmissionsTable(submissions) {
      if (!submissions.length) return renderEmptyState('No submissions yet');
      return `
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-admin-100 bg-admin-50">
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Form</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Submitted By</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Email</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Data Preview</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Date</th>
                <th class="text-right px-5 py-3.5 text-xs font-semibold text-admin-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-admin-100">
              ${submissions.map(s => `
                <tr class="table-row-hover transition">
                  <td class="px-5 py-4">
                    <p class="text-sm font-semibold text-admin-900">${s.form_title}</p>
                  </td>
                  <td class="px-5 py-4 text-sm text-admin-700">${s.submitted_by}</td>
                  <td class="px-5 py-4 text-sm text-admin-500">${s.email}</td>
                  <td class="px-5 py-4 text-sm text-admin-600 max-w-[200px] truncate">${JSON.stringify(s.data).slice(0, 60)}...</td>
                  <td class="px-5 py-4 text-sm text-admin-500">${formatDate(s.created_at)}</td>
                  <td class="px-5 py-4 text-right">
                    <button onclick="viewSubmissionDetails(${s.id})" class="p-2 rounded-lg bg-admin-50 text-admin-500 hover:bg-admin-100 transition">
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

    function handleSubmissionSearch(query) {
      const filtered = filterData(appState.submissions, query, ['form_title', 'submitted_by', 'email']);
      document.getElementById('submissionsTable').innerHTML = renderSubmissionsTable(filtered);
    }

    function viewSubmissionDetails(id) {
      const s = appState.submissions.find(sub => sub.id === id);
      if (!s) return;
      showModal('Submission Details', `
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div><span class="text-admin-400">Form:</span> <span class="text-admin-700 font-medium">${s.form_title}</span></div>
            <div><span class="text-admin-400">Submitted:</span> <span class="text-admin-700">${formatDate(s.created_at)}</span></div>
            <div><span class="text-admin-400">By:</span> <span class="text-admin-700">${s.submitted_by}</span></div>
            <div><span class="text-admin-400">Email:</span> <span class="text-admin-700">${s.email}</span></div>
          </div>
          <div class="border-t border-admin-100 pt-4">
            <h4 class="text-sm font-semibold text-admin-700 mb-3">Submitted Data</h4>
            <div class="bg-admin-50 rounded-xl p-4">
              <pre class="text-xs text-admin-600 overflow-x-auto">${JSON.stringify(s.data, null, 2)}</pre>
            </div>
          </div>
        </div>
      `);
    }

