/**
 * Admin Dashboard JavaScript
 */

class AdminDashboard {
    constructor() {
        this.charts = {};
        this.init();
    }

    async init() {
        await this.loadDashboardData();
        this.initCharts();
        this.initRealtime();
    }

    async loadDashboardData() {
        try {
            const response = await fetch('/api/dashboard/admin');
            const data = await response.json();

            if (data.success) {
                this.updateStats(data.stats);
                this.updateCharts(data.charts);
                this.updateLists(data.lists);
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.showError('Không thể tải dữ liệu dashboard');
        }
    }

    updateStats(stats) {
        document.getElementById('totalUsers').textContent = this.formatNumber(stats.totalUsers);
        document.getElementById('totalPosts').textContent = this.formatNumber(stats.totalPosts);
        document.getElementById('totalComments').textContent = this.formatNumber(stats.totalComments);
        document.getElementById('totalViews').textContent = this.formatNumber(stats.totalViews);
    }

    initCharts() {
        // User Growth Chart
        const userGrowthCtx = document.getElementById('userGrowthChart');
        if (userGrowthCtx) {
            this.charts.userGrowth = new Chart(userGrowthCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Người dùng mới',
                        data: [],
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0
                            }
                        }
                    }
                }
            });
        }

        // Role Distribution Chart
        const roleDistCtx = document.getElementById('roleDistributionChart');
        if (roleDistCtx) {
            this.charts.roleDistribution = new Chart(roleDistCtx, {
                type: 'doughnut',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: [
                            '#ef4444',
                            '#8b5cf6',
                            '#10b981',
                            '#3b82f6'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }

    updateCharts(charts) {
        // Update User Growth Chart
        if (this.charts.userGrowth && charts.userGrowth) {
            const labels = charts.userGrowth.map(item => this.formatDate(item.date));
            const data = charts.userGrowth.map(item => item.count);

            this.charts.userGrowth.data.labels = labels;
            this.charts.userGrowth.data.datasets[0].data = data;
            this.charts.userGrowth.update();
        }

        // Update Role Distribution Chart
        if (this.charts.roleDistribution && charts.roleDistribution) {
            const labels = charts.roleDistribution.map(item => this.getRoleDisplayName(item.role));
            const data = charts.roleDistribution.map(item => item.count);

            this.charts.roleDistribution.data.labels = labels;
            this.charts.roleDistribution.data.datasets[0].data = data;
            this.charts.roleDistribution.update();
        }
    }

    updateLists(lists) {
        // Update Recent Activities
        if (lists.recentActivities) {
            this.renderActivities(lists.recentActivities);
        }

        // Update Top Authors
        if (lists.topAuthors) {
            this.renderTopAuthors(lists.topAuthors);
        }

        // Update Popular Posts
        if (lists.popularPosts) {
            this.renderPopularPosts(lists.popularPosts);
        }
    }

    renderActivities(activities) {
        const container = document.getElementById('recentActivities');
        if (!container) return;

        if (activities.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>Chưa có hoạt động nào</p></div>';
            return;
        }

        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-${this.getActivityIcon(activity.action)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-text">
                        <strong>${activity.User?.name || 'Unknown'}</strong>
                        ${activity.description}
                    </div>
                    <div class="activity-time">
                        ${this.formatTimeAgo(activity.created_at)}
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderTopAuthors(authors) {
        const container = document.getElementById('topAuthors');
        if (!container) return;

        if (authors.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>Chưa có dữ liệu</p></div>';
            return;
        }

        container.innerHTML = authors.map((author, index) => `
            <div class="author-item">
                <div class="author-rank">#${index + 1}</div>
                <img src="${author.avatar || '/images/default-avatar.png'}" 
                     alt="${author.name}" 
                     class="author-avatar">
                <div class="author-info">
                    <div class="author-name">${author.name}</div>
                    <div class="author-stats">
                        ${author.post_count} bài viết
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderPopularPosts(posts) {
        const container = document.getElementById('popularPosts');
        if (!container) return;

        if (posts.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>Chưa có bài viết nào</p></div>';
            return;
        }

        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Tiêu đề</th>
                        <th>Tác giả</th>
                        <th>Lượt xem</th>
                        <th>Lượt thích</th>
                        <th>Ngày tạo</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    ${posts.map(post => `
                        <tr>
                            <td>
                                <a href="/posts/${post.slug}" target="_blank">
                                    ${post.title}
                                </a>
                            </td>
                            <td>${post.author?.name || 'Unknown'}</td>
                            <td>${this.formatNumber(post.views)}</td>
                            <td>${this.formatNumber(post.likes)}</td>
                            <td>${this.formatDate(post.created_at)}</td>
                            <td>
                                <button class="btn-icon" onclick="editPost(${post.id})" title="Sửa">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-icon" onclick="deletePost(${post.id})" title="Xóa">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    initRealtime() {
        // Refresh data every 30 seconds
        setInterval(() => {
            this.loadDashboardData();
        }, 30000);
    }

    // Helper methods
    formatNumber(num) {
        if (!num) return '0';
        return new Intl.NumberFormat('vi-VN').format(num);
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('vi-VN');
    }

    formatTimeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        
        if (seconds < 60) return 'Vừa xong';
        if (seconds < 3600) return Math.floor(seconds / 60) + ' phút trước';
        if (seconds < 86400) return Math.floor(seconds / 3600) + ' giờ trước';
        return Math.floor(seconds / 86400) + ' ngày trước';
    }

    getActivityIcon(action) {
        const icons = {
            'create': 'plus-circle',
            'update': 'edit',
            'delete': 'trash',
            'publish': 'check-circle',
            'login': 'sign-in-alt'
        };
        return icons[action] || 'circle';
    }

    getRoleDisplayName(role) {
        const names = {
            'admin': 'Quản trị viên',
            'editor': 'Biên tập viên',
            'author': 'Tác giả',
            'reader': 'Độc giả'
        };
        return names[role] || role;
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
            z-index: 10000;
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new AdminDashboard();
});

// Global functions
function editPost(postId) {
    window.location.href = `/admin/posts/${postId}/edit`;
}

function deletePost(postId) {
    if (confirm('Bạn có chắc muốn xóa bài viết này?')) {
        fetch(`/api/posts/${postId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.dashboard.loadDashboardData();
            }
        });
    }
}
