(function () {
  const grid = document.getElementById("achievementsGrid");
  const leaderboardSection = document.getElementById("leaderboardSection");
  const leaderboardList = document.getElementById("leaderboardList");
  const tabs = document.querySelectorAll(".tab-btn");
  const filters = document.querySelectorAll(".filter-btn");

  let achievements = [];
  let activeTab = "all";

  async function api(path, options = {}) {
    const response = await fetch(path, { credentials: "include", ...options });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(body.message || body.error || "Request failed");
    }
    return body.data;
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function renderAchievements() {
    leaderboardSection.style.display = activeTab === "leaderboard" ? "block" : "none";
    grid.style.display = activeTab === "leaderboard" ? "none" : "grid";

    if (activeTab === "leaderboard") return;

    const filtered = achievements.filter((achievement) => {
      if (activeTab === "unlocked") return achievement.is_completed;
      if (activeTab === "locked") return !achievement.is_completed;
      return true;
    });

    grid.innerHTML = filtered.length
      ? filtered.map((achievement) => {
          const progress = achievement.requirement_value
            ? Math.min(100, Math.round(((achievement.progress || 0) / achievement.requirement_value) * 100))
            : 0;
          return `
            <div class="achievement-card ${achievement.is_completed ? "unlocked" : "locked"}">
              <div class="achievement-icon" style="background:${achievement.color || "#64748b"}">
                <i class="${achievement.icon || "fas fa-trophy"}"></i>
              </div>
              <div class="achievement-info">
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-description">${achievement.description || ""}</div>
                <div class="achievement-points">${achievement.points || 0} điểm</div>
                <div class="achievement-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" style="width:${progress}%"></div>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join("")
      : '<div class="empty-state">Không có dữ liệu thành tích.</div>';
  }

  async function loadAchievements() {
    try {
      achievements = await api("/api/achievements/me");
    } catch (error) {
      achievements = await api("/api/achievements").catch(() => []);
    }
    renderAchievements();
  }

  async function loadStats() {
    try {
      const stats = await api("/api/achievements/me/stats");
      setText("userPoints", stats.total_points || 0);
      setText("userLevel", stats.level || 1);
      setText("userAchievements", stats.achievements_unlocked || 0);
      setText("userRank", `#${stats.global_rank || "-"}`);
    } catch (error) {
      setText("userRank", "#-");
    }
  }

  async function loadLeaderboard(period = "all") {
    const data = await api(`/api/achievements/leaderboard?period=${period}`).catch(() => []);
    leaderboardList.innerHTML = data.length
      ? data.map((entry) => `
        <div class="leaderboard-item">
          <div class="leaderboard-rank">#${entry.rank}</div>
          <div class="leaderboard-user">${entry.user?.name || entry.user?.email || "User"}</div>
          <div class="leaderboard-points">${entry.total_points || 0} điểm</div>
        </div>
      `).join("")
      : '<div class="empty-state">Chưa có dữ liệu bảng xếp hạng.</div>';
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      activeTab = tab.dataset.tab;
      renderAchievements();
      if (activeTab === "leaderboard") loadLeaderboard();
    });
  });

  filters.forEach((filter) => {
    filter.addEventListener("click", () => {
      filters.forEach((item) => item.classList.remove("active"));
      filter.classList.add("active");
      const periodMap = { week: "weekly", month: "monthly" };
      loadLeaderboard(periodMap[filter.dataset.period] || "all");
    });
  });

  loadStats();
  loadAchievements();
})();
