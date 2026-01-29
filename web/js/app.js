// AutoAnalyzer - JavaScript Application

// Global variables
let allSites = [];
let ageGroupSummary = {};
let rankings = {};

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    console.log('✅ AutoAnalyzer 초기화 중...');
    
    try {
        await loadData();
        renderStats();
        renderAgeGroupChart();
        renderTop5Sites();
        renderBottom5Sites();
        renderQScoresChart();
        renderSitesTable();
        
        // Event listeners
        document.getElementById('searchInput').addEventListener('input', filterTable);
        document.getElementById('sortSelect').addEventListener('change', sortTable);
        
        // Modal
        const modal = document.getElementById('siteModal');
        const closeBtn = document.getElementsByClassName('close')[0];
        closeBtn.onclick = () => modal.style.display = 'none';
        window.onclick = (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        };
        
        console.log('✅ 초기화 완료');
    } catch (error) {
        console.error('❌ 초기화 실패:', error);
        alert('데이터를 불러오는데 실패했습니다: ' + error.message);
    }
});

// Load data from JSON files
async function loadData() {
    console.log('📥 데이터 로드 중...');
    
    try {
        // Load site averages
        const sitesResponse = await fetch('data/site_averages.json');
        allSites = await sitesResponse.json();
        
        // Load age group summary
        const ageResponse = await fetch('data/age_group_summary.json');
        ageGroupSummary = await ageResponse.json();
        
        // Load rankings
        const rankingsResponse = await fetch('data/rankings.json');
        rankings = await rankingsResponse.json();
        
        console.log(`✅ ${allSites.length}개 기관 데이터 로드 완료`);
    } catch (error) {
        console.error('데이터 로드 실패:', error);
        throw error;
    }
}

// Render statistics
function renderStats() {
    const totalScores = allSites.map(s => s.total_avg);
    const avgScore = (totalScores.reduce((a, b) => a + b, 0) / totalScores.length).toFixed(2);
    
    document.getElementById('totalSites').textContent = allSites.length;
    document.getElementById('avgScore').textContent = avgScore;
}

// Render age group chart
function renderAgeGroupChart() {
    const ctx = document.getElementById('ageGroupChart').getContext('2d');
    
    const ageGroups = Object.keys(ageGroupSummary);
    const totalAvgs = ageGroups.map(ag => ageGroupSummary[ag].total_avg);
    const convenienceAvgs = ageGroups.map(ag => ageGroupSummary[ag].convenience_avg);
    const designAvgs = ageGroups.map(ag => ageGroupSummary[ag].design_avg);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ageGroups,
            datasets: [
                {
                    label: '종합 점수',
                    data: totalAvgs,
                    backgroundColor: 'rgba(79, 70, 229, 0.8)',
                    borderColor: 'rgba(79, 70, 229, 1)',
                    borderWidth: 2
                },
                {
                    label: '편의성',
                    data: convenienceAvgs,
                    backgroundColor: 'rgba(6, 182, 212, 0.8)',
                    borderColor: 'rgba(6, 182, 212, 1)',
                    borderWidth: 2
                },
                {
                    label: '디자인',
                    data: designAvgs,
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: '연령대별 평가 점수 비교',
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    ticks: {
                        stepSize: 0.5
                    }
                }
            }
        }
    });
}

// Render Q scores chart
function renderQScoresChart() {
    const ctx = document.getElementById('qScoresChart').getContext('2d');
    
    // Calculate average Q scores across all sites
    const qLabels = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10'];
    const qAvgs = qLabels.map(q => {
        const scores = allSites.map(s => s.scores[q]);
        return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
    });
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: qLabels,
            datasets: [{
                label: '평균 점수',
                data: qAvgs,
                fill: true,
                backgroundColor: 'rgba(79, 70, 229, 0.2)',
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 3,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Q1~Q10 항목별 평균 점수',
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    ticks: {
                        stepSize: 0.5
                    }
                }
            }
        }
    });
}

// Render top 5 sites
function renderTop5Sites() {
    const container = document.getElementById('top5Sites');
    container.innerHTML = '';
    
    rankings.top_5.forEach((site, index) => {
        const card = createRankingCard(site, index + 1, 'high');
        container.appendChild(card);
    });
}

// Render bottom 5 sites
function renderBottom5Sites() {
    const container = document.getElementById('bottom5Sites');
    container.innerHTML = '';
    
    rankings.bottom_5.forEach((site, index) => {
        const card = createRankingCard(site, allSites.length - 4 + index, 'low');
        container.appendChild(card);
    });
}

// Create ranking card
function createRankingCard(site, rank, level) {
    const card = document.createElement('div');
    card.className = 'ranking-card';
    
    let badgeClass = '';
    if (rank === 1) badgeClass = 'gold';
    else if (rank === 2) badgeClass = 'silver';
    else if (rank === 3) badgeClass = 'bronze';
    
    card.innerHTML = `
        <div class="ranking-badge ${badgeClass}">${rank}</div>
        <div class="site-name">${site.name}</div>
        <div class="site-url">${site.url}</div>
        <div class="score-display">
            <div class="score-circle ${level}">
                ${site.total_avg.toFixed(2)}
            </div>
            <div class="score-details">
                <div class="score-item">
                    <span class="score-label">편의성</span>
                    <span class="score-value">${site.convenience_avg.toFixed(2)}</span>
                </div>
                <div class="score-item">
                    <span class="score-label">디자인</span>
                    <span class="score-value">${site.design_avg.toFixed(2)}</span>
                </div>
            </div>
        </div>
        <button class="btn-detail" onclick="showSiteDetail('${site.name}')">
            <i class="fas fa-chart-line"></i> 상세 보기
        </button>
    `;
    
    return card;
}

// Render sites table
function renderSitesTable(sites = allSites) {
    const tbody = document.getElementById('sitesTableBody');
    tbody.innerHTML = '';
    
    sites.forEach((site, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${site.name}</strong></td>
            <td><strong>${site.total_avg.toFixed(2)}</strong></td>
            <td>${site.convenience_avg.toFixed(2)}</td>
            <td>${site.design_avg.toFixed(2)}</td>
            <td>
                <button class="btn-detail" onclick="showSiteDetail('${site.name}')">
                    상세
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Filter table
function filterTable() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allSites.filter(site => 
        site.name.toLowerCase().includes(searchTerm)
    );
    renderSitesTable(filtered);
}

// Sort table
function sortTable() {
    const sortValue = document.getElementById('sortSelect').value;
    let sorted = [...allSites];
    
    switch(sortValue) {
        case 'total_desc':
            sorted.sort((a, b) => b.total_avg - a.total_avg);
            break;
        case 'total_asc':
            sorted.sort((a, b) => a.total_avg - b.total_avg);
            break;
        case 'convenience_desc':
            sorted.sort((a, b) => b.convenience_avg - a.convenience_avg);
            break;
        case 'design_desc':
            sorted.sort((a, b) => b.design_avg - a.design_avg);
            break;
        case 'name':
            sorted.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
            break;
    }
    
    renderSitesTable(sorted);
}

// Show site detail modal
function showSiteDetail(siteName) {
    const site = allSites.find(s => s.name === siteName);
    if (!site) return;
    
    const modal = document.getElementById('siteModal');
    const modalBody = document.getElementById('modalBody');
    
    // Generate Q scores bars
    const qScoresBars = Object.entries(site.scores).map(([q, score]) => {
        const percentage = (score / 5) * 100;
        const color = score >= 4.5 ? '#10b981' :
                      score >= 4.0 ? '#06b6d4' :
                      score >= 3.5 ? '#f59e0b' : '#ef4444';
        
        return `
            <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="font-weight: 500;">${q}</span>
                    <span style="font-weight: bold;">${score.toFixed(2)}</span>
                </div>
                <div style="width: 100%; background: #e2e8f0; border-radius: 10px; height: 10px;">
                    <div style="width: ${percentage}%; background: ${color}; height: 10px; border-radius: 10px; transition: width 0.5s;"></div>
                </div>
            </div>
        `;
    }).join('');
    
    // Generate age group data
    const ageGroupData = Object.entries(site.age_groups || {}).map(([age, data]) => `
        <div style="background: #f8fafc; padding: 15px; border-radius: 10px; margin-bottom: 10px;">
            <div style="font-weight: bold; margin-bottom: 10px;">${age}</div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 0.9rem;">
                <div>종합: <strong>${data.total_avg.toFixed(2)}</strong></div>
                <div>편의성: <strong>${data.convenience_avg.toFixed(2)}</strong></div>
                <div>디자인: <strong>${data.design_avg.toFixed(2)}</strong></div>
            </div>
        </div>
    `).join('');
    
    modalBody.innerHTML = `
        <h2 style="margin-bottom: 20px; color: #4f46e5;">
            <i class="fas fa-building"></i>
            ${site.name}
        </h2>
        
        <div style="margin-bottom: 30px;">
            <a href="${site.url}" target="_blank" style="color: #06b6d4; text-decoration: none;">
                <i class="fas fa-external-link-alt"></i>
                ${site.url}
            </a>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #4f46e5, #4338ca); color: white; border-radius: 10px;">
                <div style="font-size: 2rem; font-weight: bold;">${site.total_avg.toFixed(2)}</div>
                <div>종합 점수</div>
            </div>
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; border-radius: 10px;">
                <div style="font-size: 2rem; font-weight: bold;">${site.convenience_avg.toFixed(2)}</div>
                <div>편의성</div>
            </div>
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #10b981, #059669); color: white; border-radius: 10px;">
                <div style="font-size: 2rem; font-weight: bold;">${site.design_avg.toFixed(2)}</div>
                <div>디자인</div>
            </div>
        </div>
        
        <h3 style="margin-bottom: 15px;">
            <i class="fas fa-list-check"></i>
            항목별 점수 (Q1~Q10)
        </h3>
        <div style="margin-bottom: 30px;">
            ${qScoresBars}
        </div>
        
        <h3 style="margin-bottom: 15px;">
            <i class="fas fa-users"></i>
            연령대별 평가
        </h3>
        <div>
            ${ageGroupData}
        </div>
    `;
    
    modal.style.display = 'block';
}
