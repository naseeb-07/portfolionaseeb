// Check for authentication
const token = localStorage.getItem('adminToken');
if (!token) {
    window.location.href = 'login.html';
}

document.getElementById('addBlogForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const excerpt = document.getElementById('excerpt').value;
    const date = document.getElementById('date').value;
    const image = document.getElementById('image').value;
    const link = document.getElementById('link').value || '#';

    const statusMessage = document.getElementById('statusMessage');
    statusMessage.textContent = 'Submitting...';
    statusMessage.className = 'text-center font-medium mt-4 text-primary';

    try {
        const response = await fetch('/api/blogs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, excerpt, date, image, link })
        });

        if (response.ok) {
            statusMessage.textContent = 'Blog post added successfully!';
            statusMessage.className = 'text-center font-medium mt-4 text-green-400';
            document.getElementById('addBlogForm').reset();
        } else {
            const data = await response.json();
            if (response.status === 401 || response.status === 403) {
                statusMessage.textContent = 'Session expired. Please login again.';
                setTimeout(() => window.location.href = 'login.html', 2000);
            } else {
                throw new Error(data.message || 'Failed to add post');
            }
        }
    } catch (error) {
        statusMessage.textContent = 'Error: ' + error.message;
        statusMessage.className = 'text-center font-medium mt-4 text-red-400';
    }
});
