console.log('🚀 AutoAnalyzer v3.0 - 상세 정보 포함');

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM loaded');
    
    const analyzeBtn = document.getElementById('analyzeBtn');
    const analyzeUrl = document.getElementById('analyzeUrl');
    const analyzeResult = document.getElementById('analyzeResult');
    
    if (!analyzeBtn || !analyzeUrl || !analyzeResult) {
        console.error('❌ Required elements not found!');
        return;
    }
    
    analyzeBtn.addEventListener('click', async () => {
        const url = analyzeUrl.value;
        
        if (!url) {
            alert('URL을 입력하세요');
            return;
        }
        
        console.log('🔍 Analyzing:', url);
        analyzeResult.innerHTML = '<div style="text-align:center;padding:30px;color:#666;">🔍 분석 중...</div>';
        analyzeResult.style.display = 'block';
        
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
            
            if (!response.ok) throw new Error('분석 실패');
            
            const data = await response.json();
            displayResults(data, analyzeResult);
        } catch (error) {
            console.error('❌ Error:', error);
            analyzeResult.innerHTML = `
                <div style="background:#fee;border:1px solid #fcc;border-radius:8px;padding:20px;margin:20px 0;">
                    <div style="color:#c00;font-weight:bold;font-size:18px;">❌ 분석 실패</div>
                    <div style="color:#666;margin-top:10px;">${error.message}</div>
                </div>
            `;
        }
    });
});

function displayResults(data, resultElement) {
    const { predicted_score, url, analysis_date, version, improvements } = data;
    
    // 버전 및 개선사항 정보
    const improvementsHTML = improvements ? `
        <div style="background:#e0f2fe;border-left:4px solid #0ea5e9;padding:15px;margin-bottom:20px;border-radius:8px;">
            <div style="font-weight:bold;color:#075985;margin-bottom:10px;">📊 평가 체계 v${version || '3.0'} 개선사항</div>
            <div style="font-size:13px;color:#0c4a6e;line-height:1.8;">
                ✅ 총 ${improvements.total_items}개 독립 항목 (중복 ${improvements.removed_duplicates}개 제거)<br>
                ✅ ${improvements.score_levels}단계 점수 체계 (2단계→7단계)<br>
                ✅ 검색 탐지 개선: ${improvements.search_detection}
            </div>
        </div>
    ` : '';
    
    // 종합 점수
    const scoreHTML = `
        <div style="background:white;border-radius:12px;padding:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
            <div style="text-align:center;">
                <div style="font-size:14px;color:#6b7280;margin-bottom:10px;">종합 점수</div>
                <div style="font-size:48px;font-weight:bold;color:#2563eb;margin-bottom:10px;">${predicted_score.overall.toFixed(2)}</div>
                <div style="display:flex;justify-content:center;gap:30px;margin-top:15px;">
                    <div>
                        <div style="font-size:12px;color:#6b7280;">편의성</div>
                        <div style="font-size:24px;font-weight:bold;color:#059669;">${predicted_score.convenience.toFixed(2)}</div>
                    </div>
                    <div>
                        <div style="font-size:12px;color:#6b7280;">디자인</div>
                        <div style="font-size:24px;font-weight:bold;color:#7c3aed;">${predicted_score.design.toFixed(2)}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 편의성 항목
    let convenienceHTML = '<h3 style="color:#059669;margin-bottom:15px;padding-bottom:10px;border-bottom:2px solid #059669;">📊 편의성 항목 (13개)</h3>';
    predicted_score.convenience_items.forEach(item => {
        const scoreColor = item.score >= 4.5 ? '#059669' : item.score >= 3.5 ? '#3b82f6' : item.score >= 2.5 ? '#f59e0b' : '#ef4444';
        convenienceHTML += `
            <div style="border-left:4px solid ${scoreColor};background:white;border-radius:8px;padding:18px;margin-bottom:18px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px;">
                    <div>
                        <div style="font-weight:bold;color:#1f2937;font-size:16px;margin-bottom:5px;">
                            ${item.item}
                        </div>
                        <div style="font-size:11px;color:#3b82f6;font-weight:600;">${item.principle || ''}</div>
                    </div>
                    <div style="font-size:28px;font-weight:bold;color:${scoreColor};">${item.score.toFixed(1)}</div>
                </div>
                
                <div style="background:#f0f9ff;padding:12px;border-radius:6px;margin-bottom:10px;">
                    <div style="font-size:13px;color:#1e40af;line-height:1.6;">
                        📝 <strong>항목 설명:</strong> ${item.description || '설명 없음'}
                    </div>
                </div>
                
                <div style="background:#fef3c7;padding:12px;border-radius:6px;margin-bottom:10px;">
                    <div style="font-size:13px;color:#92400e;line-height:1.6;">
                        💡 <strong>중요한 이유:</strong> ${item.why_important || '정보 없음'}
                    </div>
                </div>
                
                <div style="background:#f9fafb;padding:12px;border-radius:6px;margin-bottom:10px;">
                    <div style="font-size:13px;color:#374151;line-height:1.6;">
                        🔍 <strong>평가 기준:</strong> ${item.evaluation_criteria || '정보 없음'}
                    </div>
                </div>
                
                <div style="background:#${item.score >= 4.0 ? 'dcfce7' : item.score >= 3.0 ? 'dbeafe' : 'fee2e2'};padding:12px;border-radius:6px;margin-bottom:10px;">
                    <div style="font-size:13px;color:#${item.score >= 4.0 ? '166534' : item.score >= 3.0 ? '1e40af' : 'dc2626'};line-height:1.6;">
                        📊 <strong>진단 결과:</strong> ${item.diagnosis || '진단 정보 없음'}
                    </div>
                </div>
                
                <div style="font-size:11px;color:#6b7280;margin-bottom:8px;">
                    🔗 평가 페이지: <a href="${item.evaluated_url}" target="_blank" style="color:#2563eb;text-decoration:none;">${item.evaluated_url}</a>
                </div>
                
                <div style="margin-top:12px;height:10px;background:#e5e7eb;border-radius:5px;overflow:hidden;">
                    <div style="height:100%;background:${scoreColor};width:${(item.score/5)*100}%;transition:width 0.3s;"></div>
                </div>
            </div>
        `;
    });
    
    // 디자인 항목
    let designHTML = '<h3 style="color:#7c3aed;margin-bottom:15px;margin-top:40px;padding-bottom:10px;border-bottom:2px solid #7c3aed;">🎨 디자인 항목 (9개)</h3>';
    predicted_score.design_items.forEach(item => {
        const scoreColor = item.score >= 4.5 ? '#059669' : item.score >= 3.5 ? '#3b82f6' : item.score >= 2.5 ? '#f59e0b' : '#ef4444';
        designHTML += `
            <div style="border-left:4px solid ${scoreColor};background:white;border-radius:8px;padding:18px;margin-bottom:18px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px;">
                    <div>
                        <div style="font-weight:bold;color:#1f2937;font-size:16px;margin-bottom:5px;">
                            ${item.item}
                        </div>
                        <div style="font-size:11px;color:#7c3aed;font-weight:600;">${item.principle || ''}</div>
                    </div>
                    <div style="font-size:28px;font-weight:bold;color:${scoreColor};">${item.score.toFixed(1)}</div>
                </div>
                
                <div style="background:#f5f3ff;padding:12px;border-radius:6px;margin-bottom:10px;">
                    <div style="font-size:13px;color:#5b21b6;line-height:1.6;">
                        📝 <strong>항목 설명:</strong> ${item.description || '설명 없음'}
                    </div>
                </div>
                
                <div style="background:#fef3c7;padding:12px;border-radius:6px;margin-bottom:10px;">
                    <div style="font-size:13px;color:#92400e;line-height:1.6;">
                        💡 <strong>중요한 이유:</strong> ${item.why_important || '정보 없음'}
                    </div>
                </div>
                
                <div style="background:#f9fafb;padding:12px;border-radius:6px;margin-bottom:10px;">
                    <div style="font-size:13px;color:#374151;line-height:1.6;">
                        🔍 <strong>평가 기준:</strong> ${item.evaluation_criteria || '정보 없음'}
                    </div>
                </div>
                
                <div style="background:#${item.score >= 4.0 ? 'dcfce7' : item.score >= 3.0 ? 'dbeafe' : 'fee2e2'};padding:12px;border-radius:6px;margin-bottom:10px;">
                    <div style="font-size:13px;color:#${item.score >= 4.0 ? '166534' : item.score >= 3.0 ? '1e40af' : 'dc2626'};line-height:1.6;">
                        📊 <strong>진단 결과:</strong> ${item.diagnosis || '진단 정보 없음'}
                    </div>
                </div>
                
                <div style="font-size:11px;color:#6b7280;margin-bottom:8px;">
                    🔗 평가 페이지: <a href="${item.evaluated_url}" target="_blank" style="color:#2563eb;text-decoration:none;">${item.evaluated_url}</a>
                </div>
                
                <div style="margin-top:12px;height:10px;background:#e5e7eb;border-radius:5px;overflow:hidden;">
                    <div style="height:100%;background:${scoreColor};width:${(item.score/5)*100}%;transition:width 0.3s;"></div>
                </div>
            </div>
        `;
    });
    
    resultElement.innerHTML = `
        <div style="max-width:1200px;margin:0 auto;padding:20px;">
            ${improvementsHTML}
            ${scoreHTML}
            ${convenienceHTML}
            ${designHTML}
        </div>
    `;
}
