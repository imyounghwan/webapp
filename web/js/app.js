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
