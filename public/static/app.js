console.log('🚀 AutoAnalyzer v2.2 - Simple Styles');

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
    const { predicted_score } = data;
    
    // 편의성 항목
    let convenienceHTML = '';
    for (const [key, item] of Object.entries(predicted_score.convenience_items)) {
        const itemName = key.replace(/_/g, ' ');
        const scoreColor = item.score >= 4.5 ? '#059669' : item.score >= 3.5 ? '#3b82f6' : item.score >= 2.5 ? '#f59e0b' : '#ef4444';
        convenienceHTML += `
            <div style="border-left:4px solid ${scoreColor};background:white;border-radius:8px;padding:15px;margin-bottom:15px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">
                    <div style="font-weight:600;color:#1f2937;">
                        ${itemName} <span style="color:#059669;font-weight:bold;font-size:13px;">(편의성 항목)</span>
                    </div>
                    <div style="font-size:24px;font-weight:bold;color:${scoreColor};">${item.score.toFixed(2)}</div>
                </div>
                <div style="font-size:12px;color:#6b7280;margin-bottom:8px;">📋 ${item.category.replace(/_/g, ' ')}</div>
                <div style="background:#f9fafb;padding:10px;border-radius:6px;font-size:14px;color:#374151;">
                    ${item.diagnosis}
                </div>
                <div style="margin-top:10px;height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden;">
                    <div style="height:100%;background:${scoreColor};width:${(item.score/5)*100}%;"></div>
                </div>
            </div>
        `;
    }
    
    // 디자인 항목
    let designHTML = '';
    for (const [key, item] of Object.entries(predicted_score.design_items)) {
        const itemName = key.replace(/_/g, ' ');
        const scoreColor = item.score >= 4.5 ? '#059669' : item.score >= 3.5 ? '#3b82f6' : item.score >= 2.5 ? '#f59e0b' : '#ef4444';
        designHTML += `
            <div style="border-left:4px solid ${scoreColor};background:white;border-radius:8px;padding:15px;margin-bottom:15px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">
                    <div style="font-weight:600;color:#1f2937;">
                        ${itemName} <span style="color:#9333ea;font-weight:bold;font-size:13px;">(디자인 항목)</span>
                    </div>
                    <div style="font-size:24px;font-weight:bold;color:${scoreColor};">${item.score.toFixed(2)}</div>
                </div>
                <div style="font-size:12px;color:#6b7280;margin-bottom:8px;">📋 ${item.category.replace(/_/g, ' ')}</div>
                <div style="background:#f9fafb;padding:10px;border-radius:6px;font-size:14px;color:#374151;">
                    ${item.diagnosis}
                </div>
                <div style="margin-top:10px;height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden;">
                    <div style="height:100%;background:${scoreColor};width:${(item.score/5)*100}%;"></div>
                </div>
            </div>
        `;
    }
    
    resultElement.innerHTML = `
        <div style="margin-top:30px;">
            <!-- 종합 점수 -->
            <div style="background:linear-gradient(to right, #eff6ff, #eef2ff);border:1px solid #bfdbfe;border-radius:12px;padding:30px;margin-bottom:30px;">
                <div style="text-align:center;margin-bottom:20px;">
                    <div style="font-size:48px;font-weight:bold;color:#2563eb;">${predicted_score.overall.toFixed(2)}</div>
                    <div style="color:#6b7280;margin-top:5px;">종합 점수 (5점 만점)</div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px;">
                    <div style="background:white;border-radius:10px;padding:20px;text-align:center;">
                        <div style="font-size:28px;font-weight:bold;color:#059669;">${predicted_score.convenience.toFixed(2)}</div>
                        <div style="font-size:14px;color:#6b7280;">편의성 (13개 항목)</div>
                    </div>
                    <div style="background:white;border-radius:10px;padding:20px;text-align:center;">
                        <div style="font-size:28px;font-weight:bold;color:#9333ea;">${predicted_score.design.toFixed(2)}</div>
                        <div style="font-size:14px;color:#6b7280;">디자인 (12개 항목)</div>
                    </div>
                </div>
            </div>
            
            <!-- 편의성 항목 -->
            <div style="background:linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);border-radius:12px;padding:30px;margin-bottom:30px;border:2px solid #86efac;">
                <div style="background:#059669;color:white;font-size:24px;font-weight:bold;padding:20px;border-radius:10px;margin-bottom:20px;">
                    📊 편의성 항목 (13개)
                </div>
                <div style="background:white;padding:15px;border-radius:8px;margin-bottom:20px;font-weight:600;color:#374151;">
                    💡 사용자가 기능을 얼마나 쉽게 사용할 수 있는가?
                </div>
                ${convenienceHTML}
            </div>
            
            <!-- 디자인 항목 -->
            <div style="background:linear-gradient(135deg, #fae8ff 0%, #f3e8ff 100%);border-radius:12px;padding:30px;border:2px solid #d8b4fe;">
                <div style="background:#9333ea;color:white;font-size:24px;font-weight:bold;padding:20px;border-radius:10px;margin-bottom:20px;">
                    🎨 디자인 항목 (12개)
                </div>
                <div style="background:white;padding:15px;border-radius:8px;margin-bottom:20px;font-weight:600;color:#374151;">
                    💡 시각적 디자인과 정보 구조가 얼마나 좋은가?
                </div>
                ${designHTML}
            </div>
        </div>
    `;
}
