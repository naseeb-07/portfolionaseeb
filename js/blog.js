// function to fetch blogs from the API
async function fetchBlogs() {
    try {
        const response = await fetch('/api/blogs');
        if (!response.ok) {
            throw new Error('Failed to fetch blogs');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching blogs:', error);
        return [];
    }
}

export async function initBlog() {
    const container = document.getElementById('blog-container');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    if (!container || !loadMoreBtn) return;

    // Fetch blogs from API
    const blogPosts = await fetchBlogs();

    if (blogPosts.length === 0) {
        container.innerHTML = '<p class="text-center opacity-70 col-span-3">No articles found. Check back later!</p>';
        loadMoreBtn.style.display = 'none';
        return;
    }

    let shownCount = 3;

    function renderPosts() {
        container.innerHTML = '';

        const postsToShow = blogPosts.slice(0, shownCount);

        postsToShow.forEach(post => {
            const article = document.createElement('article');
            article.className = 'glass rounded-3xl overflow-hidden transition hover:scale-105 duration-300 flex flex-col';
            article.innerHTML = `
                <div class="h-48 overflow-hidden">
                    <img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover">
                </div>
                <div class="p-6 flex flex-col flex-grow">
                    <div class="flex justify-between items-center mb-3">
                        <span class="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">Article</span>
                        <span class="text-xs opacity-60">${post.date}</span>
                    </div>
                    <h3 class="font-bold text-xl mb-2 hover:text-primary transition cursor-pointer">${post.title}</h3>
                    <p class="text-sm opacity-80 mb-4 flex-grow">${post.excerpt}</p>
                    <a href="${post.link}" class="text-primary font-medium text-sm hover:underline mt-auto inline-flex items-center gap-1">
                        Read More 
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                    </a>
                </div>
            `;
            container.appendChild(article);
        });

        // Hide button if all posts are shown
        if (shownCount >= blogPosts.length) {
            loadMoreBtn.style.display = 'none';
        }
    }

    loadMoreBtn.addEventListener('click', () => {
        shownCount += 3; // Load 3 more (or remaining)
        renderPosts();
    });

    // Initial render
    renderPosts();
}
