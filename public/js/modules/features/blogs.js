
// ==================== BLOGS ====================

function renderBlogs(container) {
  const searchHtml = renderSearchBar(
    'Search blogs by title or author...',
    'handleBlogSearch',
    `<select onchange="handleBlogStatusFilter(this.value)" class="px-3 py-2.5 bg-white border border-admin-200 rounded-xl text-sm text-admin-700 focus:outline-none focus:border-pharma-400">
      <option value="all">All Status</option>
      <option value="published">Published</option>
      <option value="draft">Draft</option>
    </select>`
  );

  container.innerHTML = `
    <div class="animate-in space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex flex-col sm:flex-row gap-3 flex-1">
          ${searchHtml}
        </div>

        <button onclick="showAddBlogModal()" class="btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg shadow-pharma-500/20">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          New Blog
        </button>
      </div>

      <div id="blogsGrid" class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${renderBlogsGrid(appState.blogs || [])}
      </div>
    </div>
  `;
}


// ==================== BLOG GRID ====================

function renderBlogsGrid(blogs) {
  if (!blogs || !blogs.length) {
    return `<div class="col-span-full">${renderEmptyState('No blogs found')}</div>`;
  }

  return blogs.map(b => `
    <div class="bg-white rounded-2xl border border-admin-200 overflow-hidden card-hover group">

      <div class="h-32 bg-gradient-to-br from-pharma-400 to-pharma-600 relative overflow-hidden">

        <div class="absolute inset-0 flex items-center justify-center">
          <svg class="w-12 h-12 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
          </svg>
        </div>

        ${b.featured_image_url ? `
          <img
            src="${b.featured_image_url}"
            alt="${b.title || 'Blog image'}"
            class="absolute inset-0 w-full h-full object-cover"
            onerror="this.style.display='none'"
          >
        ` : ''}

        <div class="absolute top-3 right-3 z-10">
          ${getStatusBadge(b.status)}
        </div>
      </div>

      <div class="p-5">

        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs font-medium text-pharma-600 bg-pharma-50 px-2 py-0.5 rounded-full">
            ${b.target_audience || 'Health'}
          </span>
        </div>

        <h3 class="text-base font-bold text-admin-900 mb-2 line-clamp-2 group-hover:text-pharma-600 transition">
          ${b.title || 'Untitled Blog'}
        </h3>

        <p class="text-sm text-admin-500 mb-2 line-clamp-2">
          ${b.short_description || ''}
        </p>

        <p class="text-xs text-admin-400 mb-4">
          By ${b.published_by || 'Unknown'} &middot; ${formatDate(b.created_at)}
        </p>

        <div class="flex items-center gap-2">

          <button onclick="toggleBlogStatus(${b.id})"
            class="flex-1 py-2 rounded-lg text-xs font-medium ${b.status === 'published' ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-pharma-50 text-pharma-600 hover:bg-pharma-100'} transition">
            ${b.status === 'published' ? 'Unpublish' : 'Publish'}
          </button>

          <button onclick="editBlog(${b.id})"
            class="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>

          <button onclick="deleteBlog(${b.id})"
            class="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>

        </div>
      </div>
    </div>
  `).join('');
}


// ==================== BLOG SEARCH ====================

function handleBlogSearch(query) {
  const filtered = filterData(
    appState.blogs || [],
    query,
    ['title', 'published_by', 'target_audience']
  );

  document.getElementById('blogsGrid').innerHTML =
    renderBlogsGrid(filtered);
}


// ==================== BLOG STATUS FILTER ====================

function handleBlogStatusFilter(status) {
  let filtered = appState.blogs || [];

  if (status !== 'all') {
    filtered = filtered.filter(b => b.status === status);
  }

  const query = document.querySelector('.search-input')?.value || '';

  if (query) {
    filtered = filterData(
      filtered,
      query,
      ['title', 'published_by', 'target_audience']
    );
  }

  document.getElementById('blogsGrid').innerHTML =
    renderBlogsGrid(filtered);
}


// ==================== ADD BLOG MODAL ====================

function showAddBlogModal() {
  showModal('Create New Blog', `
    <form onsubmit="handleAddBlog(event)" class="space-y-4">

      <div>
        <label class="block text-sm font-medium text-admin-700 mb-1">Title</label>
        <input type="text" name="title" required
          class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400">
      </div>

      <div>
        <label class="block text-sm font-medium text-admin-700 mb-1">Short Description</label>
        <textarea name="short_description" rows="2"
          class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400"></textarea>
      </div>

      <!-- FEATURED IMAGE URL -->
      <div>
        <label class="block text-sm font-medium text-admin-700 mb-1">
          Featured Image URL
        </label>
        <input
          type="url"
          name="featured_image_url"
          placeholder="https://example.com/image.jpg"
          class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400"
        >
        <p class="text-xs text-admin-400 mt-1">
          Paste an image URL. Image upload is not required.
        </p>
      </div>

      <div class="grid grid-cols-2 gap-4">

        <div>
          <label class="block text-sm font-medium text-admin-700 mb-1">Target Audience</label>
          <select name="target_audience"
            class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400">
            <option>Health Tips</option>
            <option>Prevention</option>
            <option>Mental Health</option>
            <option>Nutrition</option>
            <option>News</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-admin-700 mb-1">Published By</label>
          <input type="text" name="published_by" required
            class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400">
        </div>

      </div>

      <div>
        <label class="block text-sm font-medium text-admin-700 mb-1">Content</label>
        <textarea name="content" rows="6"
          class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400"></textarea>
      </div>

      <div class="flex items-center gap-2">
        <input type="checkbox" name="publish_now"
          class="w-4 h-4 text-pharma-500 rounded border-admin-300">
        <label class="text-sm text-admin-700">Publish immediately</label>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <button type="button" onclick="closeModal()"
          class="px-4 py-2 rounded-lg text-sm font-medium text-admin-600 hover:bg-admin-100 transition">
          Cancel
        </button>

        <button type="submit"
          class="btn-primary px-4 py-2 rounded-lg text-sm font-medium text-white">
          Create Blog
        </button>
      </div>

    </form>
  `);
}


// ==================== ADD BLOG TO SUPABASE ====================

async function handleAddBlog(e) {
  e.preventDefault();

  if (!sbClient) {
    showToast('Supabase is not connected', 'error');
    return;
  }

  const fd = new FormData(e.target);
  const publishNow = fd.get('publish_now') === 'on';

  const newBlog = {
    title: fd.get('title'),
    short_description: fd.get('short_description'),
    featured_image_url: fd.get('featured_image_url') || null,
    target_audience: fd.get('target_audience'),
    published_by: fd.get('published_by'),
    content: fd.get('content'),
    status: publishNow ? 'published' : 'draft',
    published_at: publishNow ? new Date().toISOString() : null
  };

  try {
    const { data, error } = await sbClient
      .from('blogs')
      .insert([newBlog])
      .select()
      .single();

    if (error) throw error;

    appState.blogs = [data, ...(appState.blogs || [])];

    closeModal();
    showToast('Blog created successfully');

    renderBlogs(document.getElementById('contentArea'));

  } catch (error) {
    console.error('Add blog error:', error);
    showToast(error.message || 'Failed to create blog', 'error');
  }
}


// ==================== EDIT BLOG MODAL ====================

function editBlog(id) {
  const b = (appState.blogs || []).find(bl => Number(bl.id) === Number(id));

  if (!b) return;

  showModal('Edit Blog', `
    <form onsubmit="handleEditBlog(event, ${id})" class="space-y-4">

      <div>
        <label class="block text-sm font-medium text-admin-700 mb-1">Title</label>
        <input type="text" name="title"
          value="${b.title || ''}" required
          class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400">
      </div>

      <div>
        <label class="block text-sm font-medium text-admin-700 mb-1">Short Description</label>
        <textarea name="short_description" rows="2"
          class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400">${b.short_description || ''}</textarea>
      </div>

      <!-- FEATURED IMAGE URL -->
      <div>
        <label class="block text-sm font-medium text-admin-700 mb-1">
          Featured Image URL
        </label>
        <input
          type="url"
          name="featured_image_url"
          value="${b.featured_image_url || ''}"
          placeholder="https://example.com/image.jpg"
          class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400"
        >
        <p class="text-xs text-admin-400 mt-1">
          Paste a new URL to change the blog image.
        </p>
      </div>

      <div class="grid grid-cols-2 gap-4">

        <div>
          <label class="block text-sm font-medium text-admin-700 mb-1">Target Audience</label>
          <select name="target_audience"
            class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400">

            ${['Health Tips', 'Prevention', 'Mental Health', 'Nutrition', 'News'].map(option =>
              `<option ${b.target_audience === option ? 'selected' : ''}>${option}</option>`
            ).join('')}

          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-admin-700 mb-1">Published By</label>
          <input type="text" name="published_by"
            value="${b.published_by || ''}" required
            class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400">
        </div>

      </div>

      <div>
        <label class="block text-sm font-medium text-admin-700 mb-1">Content</label>
        <textarea name="content" rows="6"
          class="w-full px-3 py-2 border border-admin-200 rounded-lg text-sm focus:outline-none focus:border-pharma-400">${b.content || ''}</textarea>
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


// ==================== UPDATE BLOG IN SUPABASE ====================

async function handleEditBlog(e, id) {
  e.preventDefault();

  if (!sbClient) {
    showToast('Supabase is not connected', 'error');
    return;
  }

  const fd = new FormData(e.target);

  const updatedBlog = {
    title: fd.get('title'),
    short_description: fd.get('short_description'),
    featured_image_url: fd.get('featured_image_url') || null,
    target_audience: fd.get('target_audience'),
    published_by: fd.get('published_by'),
    content: fd.get('content')
  };

  try {
    const { data, error } = await sbClient
      .from('blogs')
      .update(updatedBlog)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    appState.blogs = (appState.blogs || []).map(b =>
      Number(b.id) === Number(id) ? data : b
    );

    closeModal();
    showToast('Blog updated successfully');

    renderBlogs(document.getElementById('contentArea'));

  } catch (error) {
    console.error('Update blog error:', error);
    showToast(error.message || 'Failed to update blog', 'error');
  }
}


// ==================== PUBLISH / UNPUBLISH BLOG ====================

async function toggleBlogStatus(id) {
  if (!sbClient) {
    showToast('Supabase is not connected', 'error');
    return;
  }

  const blog = (appState.blogs || []).find(
    b => Number(b.id) === Number(id)
  );

  if (!blog) return;

  const newStatus = blog.status === 'published' ? 'draft' : 'published';

  const updateData = {
    status: newStatus,
    published_at: newStatus === 'published'
      ? new Date().toISOString()
      : null
  };

  try {
    const { data, error } = await sbClient
      .from('blogs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    appState.blogs = (appState.blogs || []).map(b =>
      Number(b.id) === Number(id) ? data : b
    );

    showToast(
      newStatus === 'published' ? 'Blog published successfully' : 'Blog unpublished'
    );

    renderBlogs(document.getElementById('contentArea'));

  } catch (error) {
    console.error('Toggle blog status error:', error);
    showToast(error.message || 'Failed to update blog status', 'error');
  }
}


// ==================== DELETE BLOG FROM SUPABASE ====================

function deleteBlog(id) {
  const b = (appState.blogs || []).find(
    bl => Number(bl.id) === Number(id)
  );

  if (!b) return;

  if (!sbClient) {
    showToast('Supabase is not connected', 'error');
    return;
  }

  showConfirmDialog(
    'Delete Blog',
    `Delete "${b.title}"?`,
    async () => {
      try {
        const { error } = await sbClient
          .from('blogs')
          .delete()
          .eq('id', id);

        if (error) throw error;

        appState.blogs = (appState.blogs || []).filter(
          bl => Number(bl.id) !== Number(id)
        );

        showToast('Blog deleted successfully', 'warning');

        renderBlogs(document.getElementById('contentArea'));

      } catch (error) {
        console.error('Delete blog error:', error);
        showToast(error.message || 'Failed to delete blog', 'error');
      }
    }
  );
}
