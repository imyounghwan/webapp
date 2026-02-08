// AutoAnalyzer - JavaScript Application

// Global variables
let allSites = [];
let ageGroupSummary = {};
let rankings = {};
let nielsenReports = []; // Nielsen 상세 분석 데이터
let integratedNielsen = []; // 통합 Nielsen 점수 (국민평가 + KRDS)
let krdsImageAnalysis = []; // KRDS 이미지 분석 결과
let finalIntegratedScores = []; // 최종 통합 점수 (국민평가 + KRDS + 휴리스틱)

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
        
        // Load Nielsen detailed reports
        const nielsenResponse = await fetch('data/nielsen_detailed_reports.json');
        nielsenReports = await nielsenResponse.json();
        
        // Load integrated Nielsen scores (국민평가 + KRDS)
        const integratedResponse = await fetch('data/integrated_nielsen_scores.json');
        integratedNielsen = await integratedResponse.json();
        
        // Load KRDS image analysis
        const krdsImageResponse = await fetch('data/nielsen_mapped_results.json');
        krdsImageAnalysis = await krdsImageResponse.json();
        
        // Load FINAL integrated scores (국민평가 + KRDS + 휴리스틱) ⭐ 최종 통합!
        const finalIntegratedResponse = await fetch('data/final_integrated_scores.json');
        const finalData = await finalIntegratedResponse.json();
        finalIntegratedScores = finalData.agencies || [];
        
        console.log(`✅ ${allSites.length}개 기관 데이터 로드 완료`);
        console.log(`   - 최종 통합 점수: ${finalIntegratedScores.length}개 기관`);
        console.log(`   - 3개 데이터 모두: ${finalIntegratedScores.filter(a => a.data_sources.length === 3).length}개`);
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

// Render top 5 sites (최종 통합 점수 기준)
function renderTop5Sites() {
    const container = document.getElementById('top5Sites');
    container.innerHTML = '';
    
    // 최종 통합 점수 기준으로 정렬
    if (finalIntegratedScores.length > 0) {
        const sorted = [...finalIntegratedScores].sort((a, b) => b.final_nielsen_score - a.final_nielsen_score);
        const top5 = sorted.slice(0, 5);
        
        top5.forEach((scoreData, index) => {
            const site = allSites.find(s => s.site_name === scoreData.site_name || s.name === scoreData.site_name);
            if (site) {
                const card = createRankingCard({
                    ...site,
                    final_score: scoreData.final_nielsen_score,
                    data_sources: scoreData.data_sources
                }, index + 1, 'high');
                container.appendChild(card);
            }
        });
    } else {
        // Fallback: 기존 rankings 데이터 사용
        rankings.top_5.forEach((site, index) => {
            const card = createRankingCard(site, index + 1, 'high');
            container.appendChild(card);
        });
    }
}

// Render bottom 5 sites (최종 통합 점수 기준)
function renderBottom5Sites() {
    const container = document.getElementById('bottom5Sites');
    container.innerHTML = '';
    
    // 최종 통합 점수 기준으로 정렬
    if (finalIntegratedScores.length > 0) {
        const sorted = [...finalIntegratedScores].sort((a, b) => a.final_nielsen_score - b.final_nielsen_score);
        const bottom5 = sorted.slice(0, 5);
        
        bottom5.forEach((scoreData, index) => {
            const site = allSites.find(s => s.site_name === scoreData.site_name || s.name === scoreData.site_name);
            if (site) {
                const card = createRankingCard({
                    ...site,
                    final_score: scoreData.final_nielsen_score,
                    data_sources: scoreData.data_sources
                }, allSites.length - 4 + index, 'low');
                container.appendChild(card);
            }
        });
    } else {
        // Fallback: 기존 rankings 데이터 사용
        rankings.bottom_5.forEach((site, index) => {
            const card = createRankingCard(site, allSites.length - 4 + index, 'low');
            container.appendChild(card);
        });
    }
}

// Create ranking card
function createRankingCard(site, rank, level) {
    const card = document.createElement('div');
    card.className = 'ranking-card';
    
    let badgeClass = '';
    if (rank === 1) badgeClass = 'gold';
    else if (rank === 2) badgeClass = 'silver';
    else if (rank === 3) badgeClass = 'bronze';
    
    // 데이터 소스 태그 생성
    let dataSourceTag = '';
    if (site.data_sources && site.data_sources.length === 3) {
        dataSourceTag = '<span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 3px; font-size: 0.75rem; margin-top: 5px; display: inline-block;">국민+KRDS+휴리스틱</span>';
    } else if (site.data_sources && site.data_sources.includes('krds')) {
        dataSourceTag = '<span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 3px; font-size: 0.75rem; margin-top: 5px; display: inline-block;">+KRDS</span>';
    } else if (site.data_sources && site.data_sources.includes('heuristic')) {
        dataSourceTag = '<span style="background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 3px; font-size: 0.75rem; margin-top: 5px; display: inline-block;">+휴리스틱</span>';
    }
    
    card.innerHTML = `
        <div class="ranking-badge ${badgeClass}">${rank}</div>
        <div class="site-name">${site.name}</div>
        <div class="site-url">${site.url}</div>
        <div class="score-display">
            <div class="score-circle ${level}">
                ${site.final_score ? site.final_score.toFixed(2) : site.total_avg.toFixed(2)}
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
                ${site.final_score ? '<div class="score-item" style="grid-column: 1/-1; text-align: center;">' + dataSourceTag + '</div>' : ''}
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
        // 최종 통합 점수 찾기 (국민평가 + KRDS + 휴리스틱)
        const finalScore = finalIntegratedScores.find(f => f.site_name === site.name);
        
        // 기존 통합 Nielsen 점수 (국민평가 + KRDS만)
        const nielsenData = integratedNielsen.find(n => n.site_name === site.name);
        
        // 데이터 소스 태그 생성
        let dataSourceTag = '';
        if (finalScore && finalScore.data_sources) {
            const sources = finalScore.data_sources;
            if (sources.length === 3) {
                dataSourceTag = '<span style="background: #10b981; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.7rem; margin-left: 5px;">3개 통합</span>';
            } else if (sources.includes('krds')) {
                dataSourceTag = '<span style="background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 3px; font-size: 0.7rem; margin-left: 5px;">+KRDS</span>';
            } else if (sources.includes('heuristic')) {
                dataSourceTag = '<span style="background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 3px; font-size: 0.7rem; margin-left: 5px;">+휴리스틱</span>';
            }
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${site.name}</strong></td>
            <td><strong>${site.total_avg.toFixed(2)}</strong></td>
            <td>${site.convenience_avg.toFixed(2)}</td>
            <td>${site.design_avg.toFixed(2)}</td>
            <td>
                ${finalScore ? `
                    <strong style="color: #10b981; font-size: 1.1em;">${finalScore.final_nielsen_score.toFixed(2)}</strong>
                    ${dataSourceTag}
                ` : (nielsenData ? `
                    <strong style="color: #f59e0b;">${nielsenData.nielsen_average.toFixed(2)}</strong>
                ` : '-')}
            </td>
            <td>
                <button class="btn-detail" onclick="showNielsenReport('${site.name}')" style="background: #10b981; margin-right: 5px;" title="Nielsen 25항목 상세">
                    <i class="fas fa-microscope"></i>
                </button>
            </td>
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
    
    // 통합 Nielsen 점수 찾기
    const nielsenData = integratedNielsen.find(n => n.site_name === siteName);
    
    // KRDS 이미지 분석 찾기
    const imageAnalysis = krdsImageAnalysis.agencies ? 
        krdsImageAnalysis.agencies.find(a => a.agency === siteName) : null;
    
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
        
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;">
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
            ${nielsenData ? `
                <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; border-radius: 10px; position: relative;">
                    <div style="font-size: 2rem; font-weight: bold;">${nielsenData.nielsen_average.toFixed(2)}</div>
                    <div>Nielsen 통합</div>
                    ${nielsenData.has_krds ? '<div style="position: absolute; top: 5px; right: 5px; background: white; color: #f59e0b; padding: 2px 6px; border-radius: 5px; font-size: 0.7rem; font-weight: bold;">+KRDS</div>' : ''}
                </div>
            ` : ''}
        </div>
        
        <h3 style="margin-bottom: 15px;">
            <i class="fas fa-list-check"></i>
            항목별 점수 (Q1~Q10)
        </h3>
        <div style="margin-bottom: 30px;">
            ${qScoresBars}
        </div>
        
        ${nielsenData ? `
            <h3 style="margin-bottom: 15px;">
                <i class="fas fa-microscope"></i>
                Nielsen 10원칙 분석
                ${nielsenData.has_krds ? '<span style="background: #f59e0b; color: white; padding: 3px 8px; border-radius: 5px; font-size: 0.8rem; margin-left: 10px;">KRDS 통합</span>' : ''}
            </h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 30px;">
                ${Object.entries(nielsenData.nielsen_scores).map(([key, score]) => {
                    const percentage = (score / 5) * 100;
                    const color = score >= 4.5 ? '#10b981' :
                                  score >= 4.0 ? '#06b6d4' :
                                  score >= 3.5 ? '#f59e0b' : '#ef4444';
                    const labels = {
                        'N1_visibility': '시스템 상태 가시성',
                        'N2_match': '현실 세계 일치',
                        'N3_control': '사용자 제어',
                        'N4_consistency': '일관성',
                        'N5_error_prevention': '오류 예방',
                        'N6_recognition': '인식 용이성',
                        'N7_flexibility': '유연성',
                        'N8_minimalism': '미니멀 디자인',
                        'N9_error_recovery': '오류 복구',
                        'N10_help': '도움말'
                    };
                    return `
                        <div style="background: #f8fafc; padding: 15px; border-radius: 10px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span style="font-weight: 500; font-size: 0.9rem;">${labels[key]}</span>
                                <span style="font-weight: bold; color: ${color};">${score.toFixed(2)}</span>
                            </div>
                            <div style="width: 100%; background: #e2e8f0; border-radius: 10px; height: 8px;">
                                <div style="width: ${percentage}%; background: ${color}; height: 8px; border-radius: 10px; transition: width 0.5s;"></div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            ${nielsenData.krds_score ? `
                <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 20px; border-radius: 10px; margin-bottom: 30px;">
                    <h4 style="margin: 0 0 10px 0; color: #92400e;">
                        <i class="fas fa-award"></i>
                        KRDS 편의성 평가
                    </h4>
                    <div style="font-size: 1.5rem; font-weight: bold; color: #92400e;">
                        ${nielsenData.krds_score.toFixed(2)} / 5.0
                    </div>
                    <div style="font-size: 0.9rem; color: #78350f; margin-top: 5px;">
                        (원점수: ${(nielsenData.krds_score * 20).toFixed(1)} / 100)
                    </div>
                </div>
            ` : ''}
        ` : ''}
        
        ${imageAnalysis ? `
            <div style="background: ${imageAnalysis.classification === 'good_practice' ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)' : 'linear-gradient(135deg, #fee2e2, #fecaca)'}; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px 0; color: ${imageAnalysis.classification === 'good_practice' ? '#065f46' : '#991b1b'};">
                    <i class="fas fa-${imageAnalysis.classification === 'good_practice' ? 'check-circle' : 'exclamation-triangle'}"></i>
                    KRDS 이미지 기반 UI/UX 진단
                    <span style="background: ${imageAnalysis.classification === 'good_practice' ? '#10b981' : '#ef4444'}; color: white; padding: 3px 10px; border-radius: 5px; font-size: 0.8rem; margin-left: 10px;">
                        ${imageAnalysis.classification === 'good_practice' ? '✓ 우수' : '⚠ 개선 필요'}
                    </span>
                </h3>
                
                <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: #1f2937;">
                        <i class="fas fa-thumbs-up"></i> 
                        잘한 점
                    </h4>
                    <ul style="margin: 0; padding-left: 20px; color: #374151;">
                        ${imageAnalysis.ui_ux_findings.strengths.map(s => `<li style="margin-bottom: 5px;">${s}</li>`).join('')}
                    </ul>
                </div>
                
                ${imageAnalysis.ui_ux_findings.weaknesses.length > 0 ? `
                    <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <h4 style="margin: 0 0 10px 0; color: #1f2937;">
                            <i class="fas fa-exclamation-circle"></i>
                            개선 필요 사항
                        </h4>
                        <ul style="margin: 0; padding-left: 20px; color: #374151;">
                            ${imageAnalysis.ui_ux_findings.weaknesses.map(w => `<li style="margin-bottom: 5px;">${w}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                <div style="background: white; padding: 15px; border-radius: 8px;">
                    <h4 style="margin: 0 0 10px 0; color: #1f2937;">
                        <i class="fas fa-microscope"></i>
                        Nielsen 원칙 매핑
                    </h4>
                    ${imageAnalysis.nielsen_principles_affected.map(np => `
                        <div style="margin-bottom: 10px; padding: 10px; background: #f3f4f6; border-left: 3px solid #4f46e5; border-radius: 5px;">
                            <div style="font-weight: bold; color: #4f46e5; margin-bottom: 5px;">
                                ${np.principle}
                            </div>
                            <ul style="margin: 5px 0 0 0; padding-left: 20px; font-size: 0.9rem; color: #6b7280;">
                                ${np.items.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                            <div style="margin-top: 8px; font-size: 0.85rem;">
                                <span style="background: ${np.impact === 'high' ? '#ef4444' : np.impact === 'medium' ? '#f59e0b' : '#10b981'}; color: white; padding: 2px 8px; border-radius: 3px;">
                                    영향도: ${np.impact === 'high' ? '높음' : np.impact === 'medium' ? '보통' : '낮음'}
                                </span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                ${imageAnalysis.recommendation ? `
                    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 15px; border-left: 4px solid #f59e0b;">
                        <h4 style="margin: 0 0 8px 0; color: #92400e;">
                            <i class="fas fa-lightbulb"></i>
                            개선 권장사항
                        </h4>
                        <p style="margin: 0; color: #78350f;">${imageAnalysis.recommendation}</p>
                    </div>
                ` : ''}
            </div>
        ` : ''}
        
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

// Show Nielsen detailed report
function showNielsenReport(siteName) {
    const report = nielsenReports.find(r => r.site_name === siteName);
    if (!report) {
        alert('Nielsen 상세 분석 데이터를 찾을 수 없습니다.');
        return;
    }
    
    const modal = document.getElementById('siteModal');
    const modalBody = document.getElementById('modalBody');
    
    // Nielsen 10원칙별 분석 생성
    let principlesHTML = '';
    
    const principleCodes = [
        'N1_visibility', 'N2_real_world', 'N3_control', 'N4_consistency', 'N5_prevention',
        'N6_recognition', 'N7_flexibility', 'N8_minimalist', 'N9_error_recovery', 'N10_help'
    ];
    
    principleCodes.forEach((code, idx) => {
        const principle = report.principles[code];
        if (!principle) return;
        
        const score = principle.overall_score;
        const percentage = (score / 5) * 100;
        const color = score >= 4.5 ? '#10b981' :
                      score >= 4.0 ? '#06b6d4' :
                      score >= 3.5 ? '#f59e0b' : '#ef4444';
        
        // 세부 항목 생성
        let itemsHTML = '';
        Object.entries(principle.items).forEach(([itemCode, itemData]) => {
            const itemPercentage = (itemData.score / 5) * 100;
            const itemColor = itemData.level === 'excellent' ? '#10b981' :
                              itemData.level === 'good' ? '#06b6d4' : '#ef4444';
            
            const emoji = itemData.level === 'excellent' ? '✅' :
                          itemData.level === 'good' ? '⚠️' : '❌';
            
            itemsHTML += `
                <div style="margin-left: 20px; margin-bottom: 20px; padding: 15px; background: #f8fafc; border-left: 4px solid ${itemColor}; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-weight: 600; color: #1e293b;">${itemCode} ${itemData.name}</span>
                        <span style="font-weight: bold; color: ${itemColor};">${itemData.score.toFixed(2)}</span>
                    </div>
                    <div style="width: 100%; background: #e2e8f0; border-radius: 10px; height: 8px; margin-bottom: 10px;">
                        <div style="width: ${itemPercentage}%; background: ${itemColor}; height: 8px; border-radius: 10px; transition: width 0.5s;"></div>
                    </div>
                    <div style="margin-bottom: 10px; font-size: 0.95rem; color: #475569;">
                        ${emoji} <strong>진단:</strong> ${itemData.diagnosis}
                    </div>
                    <div style="font-size: 0.9rem; color: #64748b; padding: 10px; background: white; border-radius: 6px;">
                        💡 <strong>개선 방안:</strong> ${itemData.improvement}
                    </div>
                </div>
            `;
        });
        
        principlesHTML += `
            <div style="margin-bottom: 30px; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h4 style="margin: 0; font-size: 1.1rem; color: #1e293b;">
                        <i class="fas fa-check-circle" style="color: ${color};"></i>
                        ${idx + 1}. ${principle.name}
                    </h4>
                    <span style="font-size: 1.3rem; font-weight: bold; color: ${color};">${score.toFixed(2)}/5.0</span>
                </div>
                <div style="width: 100%; background: #e2e8f0; border-radius: 10px; height: 12px; margin-bottom: 20px;">
                    <div style="width: ${percentage}%; background: ${color}; height: 12px; border-radius: 10px; transition: width 0.5s;"></div>
                </div>
                ${itemsHTML}
            </div>
        `;
    });
    
    modalBody.innerHTML = `
        <h2 style="margin-bottom: 20px; color: #1e293b;">
            <i class="fas fa-microscope"></i>
            ${siteName} - Nielsen 상세 분석
        </h2>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #4f46e5, #4338ca); color: white; border-radius: 10px;">
                <div style="font-size: 2rem; font-weight: bold;">${report.overall_score.toFixed(2)}</div>
                <div>Nielsen 종합 점수</div>
            </div>
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; border-radius: 10px;">
                <div style="font-size: 2rem; font-weight: bold;">25</div>
                <div>세부 평가 항목</div>
            </div>
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #10b981, #059669); color: white; border-radius: 10px;">
                <div style="font-size: 2rem; font-weight: bold;">10</div>
                <div>Nielsen 원칙</div>
            </div>
        </div>
        
        <div style="background: #f1f5f9; padding: 15px; border-radius: 10px; margin-bottom: 30px;">
            <h4 style="margin-bottom: 10px;">
                <i class="fas fa-info-circle"></i>
                Nielsen 10가지 사용성 원칙 기반 분석
            </h4>
            <p style="margin: 0; font-size: 0.95rem; color: #475569;">
                제이콥 닐슨(Jakob Nielsen)의 10가지 사용성 원칙을 기반으로 25개 세부 항목을 평가했습니다.
                각 항목은 실제 사용자 평가 데이터(Q1~Q10)를 기반으로 점수가 산출되며, 
                구체적인 진단과 개선 방안이 제시됩니다.
            </p>
        </div>
        
        <h3 style="margin-bottom: 20px;">
            <i class="fas fa-chart-bar"></i>
            10가지 원칙별 상세 분석
        </h3>
        ${principlesHTML}
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin-top: 30px;">
            <h4 style="margin-bottom: 15px;">
                <i class="fas fa-lightbulb"></i>
                개선 우선순위
            </h4>
            <p style="font-size: 0.95rem; color: #475569; margin-bottom: 15px;">
                낮은 점수를 받은 항목부터 개선하면 사용성 향상 효과가 큽니다:
            </p>
            <ol style="font-size: 0.95rem; color: #475569; margin: 0; padding-left: 25px;">
                ${Object.entries(report.principles)
                    .flatMap(([code, principle]) => 
                        Object.entries(principle.items).map(([itemCode, itemData]) => ({
                            code: itemCode,
                            name: itemData.name,
                            score: itemData.score,
                            improvement: itemData.improvement
                        }))
                    )
                    .sort((a, b) => a.score - b.score)
                    .slice(0, 5)
                    .map((item, idx) => `
                        <li style="margin-bottom: 10px;">
                            <strong>${item.code} ${item.name}</strong> (${item.score.toFixed(2)}점)<br>
                            <span style="color: #64748b; font-size: 0.9rem;">${item.improvement}</span>
                        </li>
                    `).join('')}
            </ol>
        </div>
    `;
    
    modal.style.display = 'block';
}

// 실시간 URL 분석
document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const analyzeUrl = document.getElementById('analyzeUrl');
    const analyzeStatus = document.getElementById('analyzeStatus');
    const analyzeResult = document.getElementById('analyzeResult');
    
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', async () => {
            const url = analyzeUrl.value.trim();
            
            if (!url) {
                alert('URL을 입력해주세요');
                return;
            }
            
            // URL 형식 검증
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                alert('올바른 URL 형식이 아닙니다 (http:// 또는 https://로 시작해야 합니다)');
                return;
            }
            
            try {
                // UI 상태 변경
                analyzeBtn.disabled = true;
                analyzeStatus.style.display = 'block';
                analyzeResult.style.display = 'none';
                
                // 백엔드 API 호출
                const response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ url })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                
                // 결과 표시
                displayAnalysisResult(result);
                
            } catch (error) {
                console.error('분석 실패:', error);
                analyzeResult.innerHTML = `
                    <div style="color: #ef4444; padding: 20px; text-align: center;">
                        <i class="fas fa-exclamation-circle" style="font-size: 3rem; margin-bottom: 15px;"></i>
                        <h3>분석 실패</h3>
                        <p>${error.message}</p>
                        <p style="color: #64748b; margin-top: 10px;">백엔드 API 서버가 실행 중인지 확인해주세요.</p>
                    </div>
                `;
                analyzeResult.style.display = 'block';
            } finally {
                analyzeBtn.disabled = false;
                analyzeStatus.style.display = 'none';
            }
        });
    }
});

// 분석 결과 표시
function displayAnalysisResult(result) {
    const analyzeResult = document.getElementById('analyzeResult');
    
    const nielsenScores = result.predicted_score?.nielsen_scores || {};
    const nielsenDiagnoses = result.predicted_score?.nielsen_diagnoses || {};
    const overallScore = result.predicted_score?.overall || 0;
    const convenience = result.predicted_score?.convenience || 0;
    const design = result.predicted_score?.design || 0;
    
    let scoresHTML = '';
    Object.entries(nielsenScores).forEach(([key, score]) => {
        const labels = {
            // N1: 시스템 상태 가시성 (3개)
            'N1_1_current_location': 'N1.1 현재 위치 표시',
            'N1_2_loading_status': 'N1.2 로딩 상태 표시',
            'N1_3_action_feedback': 'N1.3 행동 피드백',
            
            // N2: 현실 세계 일치 (3개)
            'N2_1_familiar_terms': 'N2.1 친숙한 용어',
            'N2_2_natural_flow': 'N2.2 자연스러운 흐름',
            'N2_3_real_world_metaphor': 'N2.3 현실 세계 은유',
            
            // N3: 사용자 제어와 자유 (3개)
            'N3_1_undo_redo': 'N3.1 실행 취소/재실행',
            'N3_2_exit_escape': 'N3.2 나가기/취소',
            'N3_3_flexible_navigation': 'N3.3 유연한 네비게이션',
            
            // N4: 일관성과 표준 (3개)
            'N4_1_visual_consistency': 'N4.1 시각적 일관성',
            'N4_2_terminology_consistency': 'N4.2 용어 일관성',
            'N4_3_standard_compliance': 'N4.3 표준 준수',
            
            // N5: 오류 예방 (3개)
            'N5_1_input_validation': 'N5.1 입력 검증',
            'N5_2_confirmation_dialog': 'N5.2 확인 대화상자',
            'N5_3_constraints': 'N5.3 제약 조건',
            
            // N6: 인식보다 회상 (3개)
            'N6_1_visible_options': 'N6.1 보이는 옵션',
            'N6_2_recognition_cues': 'N6.2 인식 단서',
            'N6_3_memory_load': 'N6.3 기억 부담 최소화',
            
            // N7: 유연성과 효율성 (3개) - 엠진의 '숙련도 기반 효율성 3축 모델'
            'N7_1_shortcuts': 'N7.1 단축키/빠른 접근',
            'N7_2_customization': 'N7.2 맞춤 설정',
            'N7_1_accelerators': 'N7.1 가속 장치',
            'N7_2_personalization': 'N7.2 개인화',
            'N7_3_batch_operations': 'N7.3 일괄 처리',
            
            // N8: 미니멀 디자인 (3개)
            'N8_1_essential_info': 'N8.1 핵심 정보만',
            'N8_2_clean_interface': 'N8.2 깔끔한 인터페이스',
            'N8_3_visual_hierarchy': 'N8.3 시각적 계층',
            
            // N9: 오류 인식과 복구 (3개)
            'N9_1_error_messages': 'N9.1 명확한 오류 메시지',
            'N9_2_recovery_support': 'N9.2 복구 지원',
            'N9_3_error_prevention_info': 'N9.3 오류 예방 정보',
            
            // N10: 도움말과 문서 (2개)
            'N10_1_help_access': 'N10.1 도움말 접근성',
            'N10_2_documentation': 'N10.2 문서화'
        };
        
        // 각 항목에 대한 상세 설명
        const descriptions = {
            'N1_1_current_location': '사용자가 웹사이트 내에서 현재 어디에 있는지 명확하게 알 수 있도록 하는 요소 (Breadcrumb, 페이지 제목 등)',
            'N1_2_loading_status': '페이지 로딩, 데이터 처리 등 시스템이 작업 중일 때 사용자에게 진행 상황을 알려주는 시각적 피드백',
            'N1_3_action_feedback': '사용자의 행동(클릭, 입력 등)에 대해 시스템이 즉각적으로 반응하여 행동이 성공했는지 알려주는 기능',
            
            'N2_1_familiar_terms': '사용자가 이해하기 쉬운 일상적인 언어와 용어를 사용하여 전문 용어나 기술 용어를 최소화',
            'N2_2_natural_flow': '사용자의 작업 흐름이 현실 세계의 논리적 순서와 일치하도록 설계',
            'N2_3_real_world_metaphor': '실제 세계의 사물이나 개념(폴더, 휴지통 등)을 디지털 인터페이스에 적용하여 직관성 향상',
            
            'N3_1_undo_redo': '사용자가 실수로 수행한 작업을 쉽게 되돌리거나 다시 실행할 수 있는 기능',
            'N3_2_exit_escape': '원치 않는 상황이나 화면에서 명확하게 빠져나올 수 있는 방법 제공 (취소 버튼, X 버튼 등)',
            'N3_3_flexible_navigation': '사용자가 원하는 위치로 자유롭게 이동할 수 있는 다양한 네비게이션 수단 제공',
            
            'N4_1_visual_consistency': '버튼, 색상, 레이아웃 등 시각적 요소가 사이트 전체에서 일관되게 사용됨',
            'N4_2_terminology_consistency': '동일한 개념에 대해 동일한 용어를 일관되게 사용 (예: "삭제"와 "제거"를 혼용하지 않음)',
            'N4_3_standard_compliance': '웹 접근성 표준(WCAG), HTML5 표준 등 업계 표준 및 가이드라인 준수',
            
            'N5_1_input_validation': '사용자가 잘못된 형식의 데이터를 입력하기 전에 미리 검증하여 오류 발생 예방',
            'N5_2_confirmation_dialog': '삭제, 제출 등 중요한 작업 수행 전에 확인 메시지를 표시하여 실수 방지',
            'N5_3_constraints': '입력 필드에 허용되는 값의 범위나 형식을 명확히 표시하여 오류 가능성 감소',
            
            'N6_1_visible_options': '사용자가 기억에 의존하지 않고 화면에서 직접 선택할 수 있도록 옵션을 명확히 표시',
            'N6_2_recognition_cues': '아이콘, 색상, 레이블 등 시각적 단서를 제공하여 사용자가 쉽게 인식할 수 있도록 지원',
            'N6_3_memory_load': '사용자가 많은 정보를 기억할 필요 없이 인터페이스만으로 작업을 완료할 수 있도록 설계',
            
            'N7_1_shortcuts': '숙련된 사용자를 위한 키보드 단축키, 빠른 링크 등 효율적인 작업 수단 제공',
            'N7_2_customization': '사용자가 인터페이스를 개인의 선호에 맞게 조정할 수 있는 기능 (글꼴 크기, 테마 등)',
            'N7_1_accelerators': '숙련자 가속 장치: 키보드 단축키(15점) + 빠른 메뉴(12점) + 최근 이용(8점) + Skip Nav(5점)',
            'N7_2_personalization': '개인화: 설정(15점) + 글자 크기(10점) + 테마(5점) + 언어(5점)',
            'N7_3_batch_operations': '일괄 처리: 전체 선택(15점) + 일괄 작업(10점)',
            
            'N8_1_essential_info': '꼭 필요한 정보만 표시하고 불필요한 요소는 제거하여 인지 부담 감소',
            'N8_2_clean_interface': '깔끔하고 정돈된 레이아웃으로 시각적 혼잡함 최소화',
            'N8_3_visual_hierarchy': '중요한 정보를 강조하고 덜 중요한 정보는 부각하지 않는 명확한 시각적 계층 구조',
            
            'N9_1_error_messages': '오류 발생 시 문제가 무엇인지, 어떻게 해결할 수 있는지 명확하고 이해하기 쉬운 메시지 제공',
            'N9_2_recovery_support': '오류 발생 후 사용자가 쉽게 복구할 수 있도록 구체적인 해결 방법 제시',
            'N9_3_error_prevention_info': '오류가 발생하기 전에 미리 정보를 제공하여 예방 (예: 입력 형식 안내)',
            
            'N10_1_help_access': '사용자가 필요할 때 쉽게 도움말이나 FAQ에 접근할 수 있는 명확한 경로 제공',
            'N10_2_documentation': '사용 방법, 기능 설명 등이 체계적으로 문서화되어 있어 사용자가 스스로 학습 가능'
        };
        
        const percentage = (score / 5) * 100;
        const color = score >= 4.5 ? '#10b981' :
                      score >= 4.0 ? '#06b6d4' :
                      score >= 3.5 ? '#f59e0b' : '#ef4444';
        
        const diagnosis = nielsenDiagnoses[key] || '';
        const description = descriptions[key] || '';
        
        scoresHTML += `
            <div style="margin-bottom: 20px; padding: 20px; background: white; border-radius: 10px; border-left: 4px solid ${color}; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <span style="font-weight: 700; color: #1e293b; font-size: 1.05rem;">${labels[key] || key}</span>
                    <span style="font-weight: bold; color: ${color}; font-size: 1.5rem;">${score.toFixed(2)}</span>
                </div>
                
                <!-- 측정 항목 설명 -->
                <div style="background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 12px; border-left: 3px solid ${color};">
                    <div style="font-size: 0.85rem; color: #475569; line-height: 1.6;">
                        <strong>📋 측정 항목:</strong> ${description}
                    </div>
                </div>
                
                <!-- 진행 바 -->
                <div style="width: 100%; background: #e2e8f0; border-radius: 10px; height: 10px; margin-bottom: 12px;">
                    <div style="width: ${percentage}%; background: ${color}; height: 10px; border-radius: 10px; transition: width 0.5s;"></div>
                </div>
                
                <!-- 평가 근거 -->
                <div style="font-size: 0.9rem; color: #64748b; line-height: 1.6;">
                    <strong>🔍 평가 근거:</strong> ${diagnosis}
                </div>
            </div>
        `;
    });
    
    analyzeResult.innerHTML = `
        <h3 style="color: #4f46e5; margin-bottom: 20px;">
            <i class="fas fa-check-circle"></i>
            분석 완료 - ${result.url}
        </h3>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #4f46e5, #4338ca); color: white; border-radius: 10px;">
                <div style="font-size: 2.5rem; font-weight: bold;">${overallScore.toFixed(2)}</div>
                <div>종합 점수</div>
            </div>
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; border-radius: 10px;">
                <div style="font-size: 2.5rem; font-weight: bold;">${convenience.toFixed(2)}</div>
                <div>편의성</div>
            </div>
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #10b981, #059669); color: white; border-radius: 10px;">
                <div style="font-size: 2.5rem; font-weight: bold;">${design.toFixed(2)}</div>
                <div>디자인</div>
            </div>
        </div>
        
        <h4 style="margin-bottom: 15px;">
            <i class="fas fa-list-check"></i>
            Nielsen 25개 세부 항목 점수
        </h4>
        ${scoresHTML}
        
        ${result.recommendations && result.recommendations.length > 0 ? `
            <h4 style="margin-top: 30px; margin-bottom: 15px;">
                <i class="fas fa-lightbulb"></i> 
                개선 권장사항
            </h4>
            <ul style="list-style: none; padding: 0;">
                ${result.recommendations.map(rec => `
                    <li style="padding: 15px; background: white; border-left: 4px solid #f59e0b; margin-bottom: 10px; border-radius: 5px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        ${rec}
                    </li>
                `).join('')}
            </ul>
        ` : ''}
    `;
    
    analyzeResult.style.display = 'block';
}
