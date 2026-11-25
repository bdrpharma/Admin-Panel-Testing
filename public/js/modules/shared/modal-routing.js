// Modularized from legacy.html; classic script intentionally preserves legacy global handlers.
    // ==================== MODAL SYSTEM ====================
    function showModal(title, content) {
      const existing = document.getElementById('appModal');
      if (existing) existing.remove();

      const modal = document.createElement('div');
      modal.id = 'appModal';
      modal.className = 'fixed inset-0 z-[80] flex items-center justify-center p-4';
      modal.innerHTML = `
        <div class="absolute inset-0 bg-black/40 modal-backdrop" onclick="closeModal()"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden animate-in flex flex-col">
          <div class="px-6 py-4 border-b border-admin-100 flex items-center justify-between shrink-0">
            <h3 class="text-lg font-bold text-admin-900">${title}</h3>
            <button onclick="closeModal()" class="p-2 rounded-lg hover:bg-admin-100 text-admin-400 transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="p-6 overflow-y-auto">${content}</div>
        </div>
      `;
      document.body.appendChild(modal);
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      const modal = document.getElementById('appModal');
      if (modal) {
        modal.remove();
        document.body.style.overflow = '';
      }
    }

    // Close modal on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
        closeConfirmDialog();
      }
    });

    // ==================== HASH ROUTING ====================
    window.addEventListener('hashchange', () => {
      const hash = location.hash.slice(1) || 'dashboard';
      if (hash !== currentSection) navigateTo(hash === 'patients' ? 'users' : hash);
    });

    // Initialize from hash
    if (location.hash) {
      const hash = location.hash.slice(1);
      if (document.querySelector(`[data-section="${hash}"]`)) {
        navigateTo(hash);
      }
    }
