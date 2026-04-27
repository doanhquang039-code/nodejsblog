// Profile Page JavaScript
class ProfileManager {
    constructor() {
        this.currentTab = 'posts';
        this.currentPage = 1;
        this.init();
    }

    init() {
        this.attachEventListeners();
        this.loadInitialData();
    }

    attachEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Load more posts
        const loadMoreBtn = document.querySelector('.load-more button');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMorePosts());
        }
    }

    switchTab(tabName) {
        // Update buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;
    }

    loadInitialData() {
        // Data is already loaded from server-side rendering
        console.log('Profile loaded');
    }

    async loadMorePosts() {
        const username = this.getUsername();
        this.currentPage++;

        try {
            const response = await fetch(`/api/profile/${username}/posts?page=${this.currentPage}`);
            const data = await response.json();

            if (data.success && data.posts.length > 0) {
                this.appendPosts(data.posts);
                
                // Hide load more button if no more posts
                if (this.currentPage >= data.pagination.pages) {
                    document.querySelector('.load-more').style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Failed to load more posts:', error);
            this.showError('Không thể tải thêm bài viết');
        }
    }

    appendPosts(posts) {
        const postsGrid = document.querySelector('.posts-grid');
        
        posts.forEach(post => {
            const postCard = this.createPostCard(post);
            postsGrid.insertAdjacentHTML('beforeend', postCard);
        });
    }

    createPostCard(post) {
        return `
            <article class="post-card">
                ${post.featuredImage ? `
                    <div class="post-image">
                        <img src="${post.featuredImage}" alt="${post.title}">
                    </div>
                ` : ''}
                <div class="post-content">
                    <h3 class="post-title">
                        <a href="/posts/${post.slug}">${post.title}</a>
                    </h3>
                    <p class="post-excerpt">${post.excerpt}</p>
                    <div class="post-meta">
                        <span>
                            <i class="fas fa-eye"></i>
                            ${post.views}
                        </span>
                        <span>
                            <i class="fas fa-heart"></i>
                            ${post.likes}
                        </span>
                        <span>
                            <i class="fas fa-calendar"></i>
                            ${new Date(post.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                    </div>
                </div>
            </article>
        `;
    }

    getUsername() {
        return window.location.pathname.split('/').pop();
    }

    showError(message) {
        // Simple error notification
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 1000;
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Follow/Unfollow functionality
async function toggleFollow(userId) {
    try {
        const response = await fetch(`/api/profile/${userId}/follow`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            // Update button
            const btn = event.target.closest('button');
            const isFollowing = data.action === 'followed';
            
            btn.className = `btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`;
            btn.innerHTML = `
                <i class="fas fa-${isFollowing ? 'user-check' : 'user-plus'}"></i>
                ${isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
            `;

            // Update follower count
            const followerStat = document.querySelector('.stat-item:nth-child(2) .stat-value');
            const currentCount = parseInt(followerStat.textContent);
            followerStat.textContent = isFollowing ? currentCount + 1 : currentCount - 1;

            showNotification(data.message, 'success');
        }
    } catch (error) {
        console.error('Follow error:', error);
        showNotification('Có lỗi xảy ra', 'error');
    }
}

// Send message functionality
function sendMessage(userId) {
    // Redirect to messages page or open chat
    window.location.href = `/messages?to=${userId}`;
}

// Show followers modal
async function showFollowers() {
    const username = window.location.pathname.split('/').pop();
    
    try {
        const response = await fetch(`/api/profile/${username}/followers`);
        const data = await response.json();

        if (data.success) {
            showUserListModal('Người theo dõi', data.followers);
        }
    } catch (error) {
        console.error('Failed to load followers:', error);
    }
}

// Show following modal
async function showFollowing() {
    const username = window.location.pathname.split('/').pop();
    
    try {
        const response = await fetch(`/api/profile/${username}/following`);
        const data = await response.json();

        if (data.success) {
            showUserListModal('Đang theo dõi', data.following);
        }
    } catch (error) {
        console.error('Failed to load following:', error);
    }
}

// Show user list modal
function showUserListModal(title, users) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${users.map(user => `
                    <div class="user-item">
                        <img src="${user.avatar || '/images/default-avatar.png'}" alt="${user.name}">
                        <div class="user-info">
                            <div class="user-name">${user.name}</div>
                            <div class="user-username">@${user.username}</div>
                        </div>
                        <a href="/profile/${user.username}" class="btn btn-secondary btn-sm">
                            Xem profile
                        </a>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        .modal-content {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 500px;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
        }
        .modal-header {
            padding: 20px;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .modal-close {
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #6b7280;
        }
        .modal-body {
            padding: 20px;
            overflow-y: auto;
        }
        .user-item {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 10px;
            background: #f9fafb;
        }
        .user-item img {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            object-fit: cover;
        }
        .user-info {
            flex: 1;
        }
        .user-name {
            font-weight: 600;
            margin-bottom: 2px;
        }
        .user-username {
            font-size: 14px;
            color: #6b7280;
        }
        .btn-sm {
            padding: 6px 16px;
            font-size: 13px;
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(modal);

    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Notification helper
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6'
    };

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize profile manager
let profileManager;
document.addEventListener('DOMContentLoaded', () => {
    profileManager = new ProfileManager();
});
