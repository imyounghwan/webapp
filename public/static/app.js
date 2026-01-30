console.log('🚀 MGINE AutoAnalyzer v3.0 - 상세 정보 포함');

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM loaded');
    
    const analyzeBtn = document.getElementById('analyzeBtn');
    const analyzeUrl = document.getElementById('analyzeUrl');
    const analyzeResult = document.getElementById('analyzeResult');
    
    if (!analyzeBtn || !analyzeUrl || !analyzeResult) {
        console.error('❌ Required elements not found!');
        return;
    }
    
    // 페이지 로드 시 localStorage에서 이전 분석 결과 복원
    const savedResult = localStorage.getItem('lastAnalysisResult');
    const savedUrl = localStorage.getItem('lastAnalysisUrl');
    console.log('🔍 Checking saved result...', { 
        hasSavedResult: !!savedResult, 
        hasSavedUrl: !!savedUrl,
        savedUrlValue: savedUrl
    });
    
    if (savedResult && savedUrl) {
        console.log('📦 Restoring saved analysis result...');
        try {
            const data = JSON.parse(savedResult);
            console.log('✅ Parsed data successfully:', {
                url: data.url,
                hasScore: !!data.predicted_score,
                version: data.version
            });
            analyzeUrl.value = savedUrl;
            displayResults(data, analyzeResult);
            console.log('✅ Results displayed successfully');
        } catch (e) {
            console.error('❌ Failed to restore saved result:', e);
            localStorage.removeItem('lastAnalysisResult');
            localStorage.removeItem('lastAnalysisUrl');
        }
    } else {
        console.log('ℹ️ No saved result found');
    }
    
    analyzeBtn.addEventListener('click', async () => {
        const url = analyzeUrl.value;
        
        if (!url) {
            alert('URL을 입력하세요');
            return;
        }
        
        console.log('🔍 Analyzing:', url);
        
        // 로딩 프로그레스 바 표시
        let progress = 0;
        analyzeResult.innerHTML = `
            <div style="text-align:center;padding:40px;">
                <div style="font-size:20px;font-weight:bold;color:#2563eb;margin-bottom:20px;">
                    🔍 분석 중...
                </div>
                <div style="max-width:500px;margin:0 auto;">
                    <div style="background:#e5e7eb;height:30px;border-radius:15px;overflow:hidden;position:relative;">
                        <div id="progressBar" style="background:linear-gradient(90deg, #3b82f6, #2563eb);height:100%;width:0%;transition:width 0.3s;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:14px;"></div>
                    </div>
                    <div id="progressText" style="margin-top:15px;color:#6b7280;font-size:14px;">페이지 분석 중...</div>
                </div>
            </div>
        `;
        analyzeResult.style.display = 'block';
        
        // 프로그레스 바 애니메이션
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        
        const progressSteps = [
            { progress: 10, text: '페이지 접속 중...' },
            { progress: 25, text: '메인 페이지 분석 중...' },
            { progress: 45, text: '서브 페이지 수집 중...' },
            { progress: 65, text: 'HTML 구조 분석 중...' },
            { progress: 80, text: 'Nielsen 평가 수행 중...' },
            { progress: 95, text: '종합 평가 중...' }
        ];
        
        let stepIndex = 0;
        const progressInterval = setInterval(() => {
            if (stepIndex < progressSteps.length) {
                const step = progressSteps[stepIndex];
                progressBar.style.width = step.progress + '%';
                progressBar.textContent = step.progress + '%';
                progressText.textContent = step.text;
                stepIndex++;
            }
        }, 800);
        
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
            
            clearInterval(progressInterval);
            
            if (!response.ok) throw new Error('분석 실패');
            
            // 완료 애니메이션
            progressBar.style.width = '100%';
            progressBar.textContent = '100%';
            progressText.textContent = '분석 완료! ✅';
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const data = await response.json();
            displayResults(data, analyzeResult);
        } catch (error) {
            clearInterval(progressInterval);
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
    console.log('🎨 displayResults called with:', {
        hasData: !!data,
        hasResultElement: !!resultElement,
        url: data?.url
    });
    
    if (!resultElement) {
        console.error('❌ resultElement is null!');
        resultElement = document.getElementById('analyzeResult');
        if (!resultElement) {
            console.error('❌ Cannot find analyzeResult element!');
            return;
        }
    }
    
    const { predicted_score, url, analysis_date, version, improvements, analyzed_pages, summary } = data;
    
    // 전체 점수 재계산 (수정된 항목이 있을 경우)
    if (predicted_score) {
        const convenienceItems = predicted_score.convenience_items || [];
        const designItems = predicted_score.design_items || [];
        
        // 편의성 평균 계산
        if (convenienceItems.length > 0) {
            const convenienceSum = convenienceItems.reduce((sum, item) => sum + (item.score || 0), 0);
            predicted_score.convenience = convenienceSum / convenienceItems.length;
            console.log('🔄 Recalculated convenience score:', predicted_score.convenience.toFixed(2));
        }
        
        // 디자인 평균 계산
        if (designItems.length > 0) {
            const designSum = designItems.reduce((sum, item) => sum + (item.score || 0), 0);
            predicted_score.design = designSum / designItems.length;
            console.log('🔄 Recalculated design score:', predicted_score.design.toFixed(2));
        }
        
        // 전체 평균 계산
        predicted_score.overall = (predicted_score.convenience + predicted_score.design) / 2;
        console.log('🔄 Recalculated overall score:', predicted_score.overall.toFixed(2));
    }
    
    // localStorage에 분석 결과 저장 (새로고침 시 복원용)
    try {
        localStorage.setItem('lastAnalysisResult', JSON.stringify(data));
        localStorage.setItem('lastAnalysisUrl', url);
        console.log('💾 Analysis result saved to localStorage');
    } catch (e) {
        console.warn('Failed to save to localStorage:', e);
    }
    
    // 분석된 페이지 정보
    const analyzedPagesHTML = analyzed_pages ? `
        <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:15px;margin-bottom:20px;border-radius:8px;">
            <div style="font-weight:bold;color:#92400e;margin-bottom:10px;">📄 분석된 페이지 (총 ${analyzed_pages.total_count}개)</div>
            <div style="font-size:13px;color:#78350f;line-height:1.8;">
                <strong>메인 페이지:</strong> <a href="${analyzed_pages.main_page}" target="_blank" style="color:#2563eb;text-decoration:none;">${analyzed_pages.main_page}</a><br>
                ${analyzed_pages.sub_pages.length > 0 ? `
                <strong>서브 페이지 (${analyzed_pages.sub_pages.length}개):</strong><br>
                ${analyzed_pages.sub_pages.map((page, idx) => 
                    `${idx + 1}. <a href="${page}" target="_blank" style="color:#2563eb;text-decoration:none;">${page}</a>`
                ).join('<br>')}
                ` : ''}
                <br><br>
                ℹ️ ${analyzed_pages.note}
            </div>
        </div>
    ` : '';
    
    // 버전 및 개선사항 정보 제거
    const improvementsHTML = '';
    
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
                
                <!-- 다운로드 버튼 추가 -->
                <div style="margin-top:20px;display:flex;justify-content:center;gap:10px;">
                    <button id="downloadPdfBtn" style="background:#ef4444;color:white;border:none;border-radius:8px;padding:12px 24px;cursor:pointer;font-size:14px;font-weight:600;display:flex;align-items:center;gap:8px;transition:all 0.2s;" onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">
                        <span>📄</span> PDF 다운로드
                    </button>
                    <button id="downloadPptBtn" style="background:#f59e0b;color:white;border:none;border-radius:8px;padding:12px 24px;cursor:pointer;font-size:14px;font-weight:600;display:flex;align-items:center;gap:8px;transition:all 0.2s;" onmouseover="this.style.background='#d97706'" onmouseout="this.style.background='#f59e0b'">
                        <span>📊</span> PPT 다운로드
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // 총평
    const summaryHTML = summary ? `
        <div style="background:#fefce8;border:2px solid #eab308;border-radius:12px;padding:20px;margin-bottom:20px;">
            <div style="font-size:18px;font-weight:bold;color:#854d0e;margin-bottom:15px;">📋 종합 평가 총평</div>
            <div style="font-size:14px;color:#713f12;line-height:1.8;white-space:pre-line;">${summary}</div>
        </div>
    ` : '';
    
    // 편의성 항목
    let convenienceHTML = '<h3 style="color:#059669;margin-bottom:15px;padding-bottom:10px;border-bottom:2px solid #059669;">📊 편의성 항목 (21개)</h3>';
    predicted_score.convenience_items.forEach((item, itemIndex) => {
        const scoreColor = item.score >= 4.5 ? '#059669' : item.score >= 3.5 ? '#3b82f6' : item.score >= 2.5 ? '#f59e0b' : '#ef4444';
        const itemId = `item-conv-${itemIndex}`;
        convenienceHTML += `
            <div id="${itemId}" style="border-left:4px solid ${scoreColor};background:white;border-radius:8px;padding:18px;margin-bottom:18px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px;">
                    <div style="flex:1;">
                        <div style="font-weight:bold;color:#1f2937;font-size:16px;margin-bottom:5px;">
                            ${item.item}
                        </div>
                        <div style="font-size:11px;color:#3b82f6;font-weight:600;">${item.principle || ''}</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div id="${itemId}-score" style="font-size:28px;font-weight:bold;color:${scoreColor};">${item.score.toFixed(1)}</div>
                        <button 
                            class="edit-score-btn"
                            data-item-id="${itemId}"
                            data-item-id-value="${item.item_id}"
                            data-item-name="${item.item}"
                            data-original-score="${item.score}"
                            data-url="${url}"
                            data-diagnosis="${(item.diagnosis || '').replace(/"/g, '&quot;')}"
                            style="background:#3b82f6;color:white;border:none;border-radius:6px;padding:8px 12px;cursor:pointer;font-size:12px;transition:all 0.2s;"
                            onmouseover="this.style.background='#2563eb'"
                            onmouseout="this.style.background='#3b82f6'"
                        >
                            ✏️ 수정
                        </button>
                    </div>
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
                
                <div id="${itemId}-diagnosis" data-original="${(item.diagnosis || '').replace(/"/g, '&quot;')}" style="background:#${item.score >= 4.0 ? 'dcfce7' : item.score >= 3.0 ? 'dbeafe' : 'fee2e2'};padding:12px;border-radius:6px;margin-bottom:10px;">
                    <div style="font-size:13px;color:#${item.score >= 4.0 ? '166534' : item.score >= 3.0 ? '1e40af' : 'dc2626'};line-height:1.6;">
                        📊 <strong>진단 결과:</strong> ${item.diagnosis || '진단 정보 없음'}
                    </div>
                </div>
                
                <div style="font-size:11px;color:#6b7280;margin-bottom:8px;">
                    🔗 <strong>평가 페이지 (${item.evaluated_pages ? item.evaluated_pages.length : 1}개):</strong><br>
                    ${item.evaluated_pages ? 
                        item.evaluated_pages.map((page, idx) => 
                            `${idx + 1}. <a href="${page}" target="_blank" style="color:#2563eb;text-decoration:none;">${page}</a>`
                        ).join('<br>') 
                        : `<a href="${item.evaluated_url}" target="_blank" style="color:#2563eb;text-decoration:none;">${item.evaluated_url}</a>`
                    }
                </div>
                
                <div style="margin-top:12px;height:10px;background:#e5e7eb;border-radius:5px;overflow:hidden;">
                    <div style="height:100%;background:${scoreColor};width:${(item.score/5)*100}%;transition:width 0.3s;"></div>
                </div>
            </div>
        `;
    });
    
    // 디자인 항목
    let designHTML = '<h3 style="color:#7c3aed;margin-bottom:15px;margin-top:40px;padding-bottom:10px;border-bottom:2px solid #7c3aed;">🎨 디자인 항목 (5개)</h3>';
    predicted_score.design_items.forEach((item, itemIndex) => {
        const scoreColor = item.score >= 4.5 ? '#059669' : item.score >= 3.5 ? '#3b82f6' : item.score >= 2.5 ? '#f59e0b' : '#ef4444';
        const itemId = `item-design-${itemIndex}`;
        designHTML += `
            <div id="${itemId}" style="border-left:4px solid ${scoreColor};background:white;border-radius:8px;padding:18px;margin-bottom:18px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px;">
                    <div style="flex:1;">
                        <div style="font-weight:bold;color:#1f2937;font-size:16px;margin-bottom:5px;">
                            ${item.item}
                        </div>
                        <div style="font-size:11px;color:#7c3aed;font-weight:600;">${item.principle || ''}</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div id="${itemId}-score" style="font-size:28px;font-weight:bold;color:${scoreColor};">${item.score.toFixed(1)}</div>
                        <button 
                            class="edit-score-btn"
                            data-item-id="${itemId}"
                            data-item-id-value="${item.item_id}"
                            data-item-name="${item.item}"
                            data-original-score="${item.score}"
                            data-url="${url}"
                            data-diagnosis="${(item.diagnosis || '').replace(/"/g, '&quot;')}"
                            style="background:#7c3aed;color:white;border:none;border-radius:6px;padding:8px 12px;cursor:pointer;font-size:12px;transition:all 0.2s;"
                            onmouseover="this.style.background='#6d28d9'"
                            onmouseout="this.style.background='#7c3aed'"
                        >
                            ✏️ 수정
                        </button>
                    </div>
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
                
                <div id="${itemId}-diagnosis" data-original="${(item.diagnosis || '').replace(/"/g, '&quot;')}" style="background:#${item.score >= 4.0 ? 'dcfce7' : item.score >= 3.0 ? 'dbeafe' : 'fee2e2'};padding:12px;border-radius:6px;margin-bottom:10px;">
                    <div style="font-size:13px;color:#${item.score >= 4.0 ? '166534' : item.score >= 3.0 ? '1e40af' : 'dc2626'};line-height:1.6;">
                        📊 <strong>진단 결과:</strong> ${item.diagnosis || '진단 정보 없음'}
                    </div>
                </div>
                
                <div style="font-size:11px;color:#6b7280;margin-bottom:8px;">
                    🔗 <strong>평가 페이지 (${item.evaluated_pages ? item.evaluated_pages.length : 1}개):</strong><br>
                    ${item.evaluated_pages ? 
                        item.evaluated_pages.map((page, idx) => 
                            `${idx + 1}. <a href="${page}" target="_blank" style="color:#2563eb;text-decoration:none;">${page}</a>`
                        ).join('<br>') 
                        : `<a href="${item.evaluated_url}" target="_blank" style="color:#2563eb;text-decoration:none;">${item.evaluated_url}</a>`
                    }
                </div>
                
                <div style="margin-top:12px;height:10px;background:#e5e7eb;border-radius:5px;overflow:hidden;">
                    <div style="height:100%;background:${scoreColor};width:${(item.score/5)*100}%;transition:width 0.3s;"></div>
                </div>
            </div>
        `;
    });
    
    resultElement.innerHTML = `
        <div style="max-width:1200px;margin:0 auto;padding:20px;">
            ${analyzedPagesHTML}
            ${improvementsHTML}
            ${scoreHTML}
            ${summaryHTML}
            ${convenienceHTML}
            ${designHTML}
        </div>
    `;
    
    // 결과 영역 표시
    resultElement.style.display = 'block';
    console.log('✅ Results displayed successfully');
    
    // 수정 버튼에 이벤트 리스너 추가
    document.querySelectorAll('.edit-score-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = this.getAttribute('data-item-id');
            const itemIdValue = this.getAttribute('data-item-id-value');
            const itemName = this.getAttribute('data-item-name');
            const originalScore = parseFloat(this.getAttribute('data-original-score'));
            const url = this.getAttribute('data-url');
            const diagnosis = this.getAttribute('data-diagnosis').replace(/&quot;/g, '"');
            
            editScore(itemId, itemIdValue, itemName, originalScore, url, diagnosis);
        });
    });
    
    // 다운로드 버튼에 이벤트 리스너 추가
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const downloadPptBtn = document.getElementById('downloadPptBtn');
    
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', () => {
            downloadPDF(data);
        });
    }
    
    if (downloadPptBtn) {
        downloadPptBtn.addEventListener('click', () => {
            downloadPPT(data);
        });
    }
}

/**
 * 점수 수정 함수 (인라인 편집)
 */
window.editScore = async function(itemId, itemIdValue, itemName, originalScore, url, originalDiagnosis) {
    console.log('🔍 editScore called with itemId:', itemId);
    console.log('🔍 itemIdValue:', itemIdValue);
    console.log('🔍 itemName:', itemName);
    
    const scoreElementId = `${itemId}-score`;
    const diagnosisElementId = `${itemId}-diagnosis`;
    
    console.log('🔍 Looking for scoreElement with ID:', scoreElementId);
    console.log('🔍 Looking for diagnosisElement with ID:', diagnosisElementId);
    
    const scoreElement = document.getElementById(scoreElementId);
    const diagnosisElement = document.getElementById(diagnosisElementId);
    
    console.log('📍 scoreElement:', scoreElement);
    console.log('📍 diagnosisElement:', diagnosisElement);
    
    if (!scoreElement) {
        console.error('❌ scoreElement is NULL!');
        console.error('❌ Tried to find ID:', scoreElementId);
        console.error('❌ All elements with class edit-score-btn:', document.querySelectorAll('.edit-score-btn').length);
        alert(`오류: 점수 요소를 찾을 수 없습니다.\nID: ${scoreElementId}\n\n페이지를 새로고침 후 다시 시도해주세요.`);
        return;
    }
    
    if (!scoreElement.parentElement) {
        console.error('❌ scoreElement.parentElement is NULL!');
        alert('오류: 점수 요소의 부모 요소를 찾을 수 없습니다.');
        return;
    }
    
    // 현재 점수를 입력 필드로 변경
    const currentScore = parseFloat(scoreElement.textContent);
    const currentDiagnosis = diagnosisElement ? diagnosisElement.textContent.replace('📊 진단 결과: ', '') : '';
    
    // 수정 UI 생성
    const editHTML = `
        <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end;">
            <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:14px;color:#6b7280;">점수:</span>
                <input 
                    type="number" 
                    id="${itemId}-input" 
                    min="2.0" 
                    max="5.0" 
                    step="0.5" 
                    value="${currentScore}"
                    style="width:80px;font-size:24px;font-weight:bold;padding:4px 8px;border:2px solid #3b82f6;border-radius:6px;text-align:center;"
                />
            </div>
            <div style="display:flex;gap:4px;">
                <button 
                    id="${itemId}-save-btn"
                    style="background:#10b981;color:white;border:none;border-radius:4px;padding:4px 8px;cursor:pointer;font-size:11px;"
                >
                    ✓ 저장
                </button>
                <button 
                    id="${itemId}-cancel-btn"
                    style="background:#ef4444;color:white;border:none;border-radius:4px;padding:4px 8px;cursor:pointer;font-size:11px;"
                >
                    ✗ 취소
                </button>
            </div>
            <textarea 
                id="${itemId}-reason" 
                placeholder="수정 사유 (선택사항)"
                style="width:300px;height:50px;font-size:11px;padding:6px;border:1px solid #d1d5db;border-radius:4px;resize:vertical;"
            ></textarea>
        </div>
    `;
    
    scoreElement.parentElement.innerHTML = editHTML;
    
    // 저장 버튼에 이벤트 리스너 추가
    document.getElementById(`${itemId}-save-btn`).addEventListener('click', () => {
        saveScore(itemId, itemIdValue, itemName, originalScore, url);
    });
    
    // 취소 버튼에 이벤트 리스너 추가
    document.getElementById(`${itemId}-cancel-btn`).addEventListener('click', () => {
        cancelEdit(itemId, currentScore, currentDiagnosis);
    });
    
    // 진단 텍스트도 편집 가능하게 변경
    if (diagnosisElement) {
        diagnosisElement.innerHTML = `
            <textarea 
                id="${itemId}-diagnosis-input" 
                placeholder="진단 결과를 입력하세요"
                style="width:100%;min-height:80px;font-size:13px;padding:8px;border:2px solid #3b82f6;border-radius:4px;resize:vertical;font-family:inherit;line-height:1.6;"
            >${currentDiagnosis}</textarea>
        `;
    }
    
    // 입력 필드에 포커스
    document.getElementById(`${itemId}-input`).focus();
}

/**
 * 점수 저장 함수
 */
window.saveScore = async function(itemId, itemIdValue, itemName, originalScore, url) {
    const inputElement = document.getElementById(`${itemId}-input`);
    const reasonElement = document.getElementById(`${itemId}-reason`);
    const diagnosisInputElement = document.getElementById(`${itemId}-diagnosis-input`);
    
    const correctedScore = parseFloat(inputElement.value);
    const reason = reasonElement.value.trim();
    const correctedDiagnosis = diagnosisInputElement ? diagnosisInputElement.value.trim() : null;
    
    // 유효성 검사
    if (correctedScore < 2.0 || correctedScore > 5.0) {
        alert('점수는 2.0 ~ 5.0 사이여야 합니다.');
        return;
    }
    
    // 변경사항 없으면 취소
    if (correctedScore === originalScore && !correctedDiagnosis) {
        const diagnosisElement = document.getElementById(`${itemId}-diagnosis`);
        const originalDiagnosis = diagnosisElement ? diagnosisElement.getAttribute('data-original') : '';
        cancelEdit(itemId, originalScore, originalDiagnosis);
        return;
    }
    
    // 로딩 표시 (input 영역 전체를 "저장 중..."으로 변경)
    const saveBtn = document.getElementById(`${itemId}-save-btn`);
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = '저장 중...';
        saveBtn.style.background = '#9ca3af';
    }
    
    try {
        // API 호출
        const response = await fetch('/api/corrections', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: url,
                evaluated_at: new Date().toISOString(),
                item_id: itemIdValue,
                item_name: itemName,
                original_score: originalScore,
                corrected_score: correctedScore,
                correction_reason: reason || null,
                admin_comment: reason || null,
                corrected_diagnosis: correctedDiagnosis || null,
                corrected_by: 'admin'
            })
        });
        
        if (!response.ok) {
            throw new Error('저장 실패');
        }
        
        const result = await response.json();
        
        // 성공! localStorage 업데이트
        const savedResult = localStorage.getItem('lastAnalysisResult');
        if (savedResult) {
            try {
                const data = JSON.parse(savedResult);
                // 수정된 점수를 반영하여 다시 저장
                if (data.predicted_score) {
                    // 편의성/디자인 항목 찾아서 업데이트
                    const items = data.predicted_score.convenience_items || [];
                    const designItems = data.predicted_score.design_items || [];
                    const allItems = [...items, ...designItems];
                    
                    for (let item of allItems) {
                        if (item.item_id === itemIdValue) {
                            item.score = correctedScore;
                            if (correctedDiagnosis) {
                                item.diagnosis = correctedDiagnosis;
                            }
                            break;
                        }
                    }
                    
                    // 업데이트된 데이터 저장
                    localStorage.setItem('lastAnalysisResult', JSON.stringify(data));
                }
            } catch (e) {
                console.error('Failed to update localStorage:', e);
            }
        }
        
        // 성공 메시지 및 새로고침
        alert(`✅ 저장 완료!\n\n항목: ${itemName}\n원본: ${originalScore.toFixed(1)}점 → 수정: ${correctedScore.toFixed(1)}점\n\n페이지를 새로고침하여 결과를 확인하세요.`);
        location.reload();
        
    } catch (error) {
        console.error('저장 오류:', error);
        alert('❌ 저장 실패: ' + error.message + '\n\n다시 시도해주세요.');
        location.reload();
    }
}

/**
 * 편집 취소 함수
 */
window.cancelEdit = function(itemId, originalScore, originalDiagnosis) {
    const scoreColor = originalScore >= 4.5 ? '#059669' : originalScore >= 3.5 ? '#3b82f6' : originalScore >= 2.5 ? '#f59e0b' : '#ef4444';
    const scoreElement = document.getElementById(`${itemId}-score`);
    const diagnosisElement = document.getElementById(`${itemId}-diagnosis`);
    
    const isConvenienceItem = itemId.includes('conv');
    const buttonBgColor = isConvenienceItem ? '#3b82f6' : '#7c3aed';
    const buttonHoverColor = isConvenienceItem ? '#2563eb' : '#6d28d9';
    
    // 원래 상태로 복원
    scoreElement.parentElement.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;">
            <div id="${itemId}-score" style="font-size:28px;font-weight:bold;color:${scoreColor};">${originalScore.toFixed(1)}</div>
            <button 
                class="edit-score-btn"
                data-item-id="${itemId}"
                data-item-id-value=""
                data-item-name=""
                data-original-score="${originalScore}"
                data-url=""
                data-diagnosis="${(originalDiagnosis || '').replace(/"/g, '&quot;')}"
                style="background:${buttonBgColor};color:white;border:none;border-radius:6px;padding:8px 12px;cursor:pointer;font-size:12px;transition:all 0.2s;"
                onmouseover="this.style.background='${buttonHoverColor}'"
                onmouseout="this.style.background='${buttonBgColor}'"
            >
                ✏️ 수정
            </button>
        </div>
    `;
    
    // 새로 생성된 버튼에 이벤트 리스너 추가
    const newBtn = scoreElement.parentElement.querySelector('.edit-score-btn');
    if (newBtn) {
        newBtn.addEventListener('click', function() {
            const itemId = this.getAttribute('data-item-id');
            const itemIdValue = this.getAttribute('data-item-id-value');
            const itemName = this.getAttribute('data-item-name');
            const originalScore = parseFloat(this.getAttribute('data-original-score'));
            const url = this.getAttribute('data-url');
            const diagnosis = this.getAttribute('data-diagnosis').replace(/&quot;/g, '"');
            
            editScore(itemId, itemIdValue, itemName, originalScore, url, diagnosis);
        });
    }
    
    // 진단 텍스트 복원
    if (diagnosisElement && originalDiagnosis) {
        const bgColor = originalScore >= 4.0 ? 'dcfce7' : originalScore >= 3.0 ? 'dbeafe' : 'fee2e2';
        const textColor = originalScore >= 4.0 ? '166534' : originalScore >= 3.0 ? '1e40af' : 'dc2626';
        diagnosisElement.innerHTML = `
            <div style="font-size:13px;color:#${textColor};line-height:1.6;">
                📊 <strong>진단 결과:</strong> ${originalDiagnosis}
            </div>
        `;
    }
}

/**
 * PDF 다운로드 함수
 */
async function downloadPDF(data) {
    try {
        const btn = document.getElementById('downloadPdfBtn');
        btn.disabled = true;
        btn.innerHTML = '<span>⏳</span> PDF 생성 중...';
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const { predicted_score, url, analysis_date } = data;
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        let yPos = 20;
        
        // 제목
        pdf.setFontSize(20);
        pdf.setTextColor(37, 99, 235);
        pdf.text('MGINE AutoAnalyzer', pageWidth / 2, yPos, { align: 'center' });
        
        yPos += 10;
        pdf.setFontSize(16);
        pdf.setTextColor(107, 114, 128);
        pdf.text('UI/UX 분석 보고서', pageWidth / 2, yPos, { align: 'center' });
        
        yPos += 15;
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`분석 URL: ${url}`, 20, yPos);
        yPos += 7;
        pdf.text(`분석 일시: ${new Date(analysis_date).toLocaleString('ko-KR')}`, 20, yPos);
        
        // 종합 점수
        yPos += 15;
        pdf.setFontSize(14);
        pdf.setTextColor(37, 99, 235);
        pdf.text('종합 점수', 20, yPos);
        
        yPos += 10;
        pdf.setFontSize(24);
        pdf.text(predicted_score.overall.toFixed(2), pageWidth / 2, yPos, { align: 'center' });
        
        yPos += 10;
        pdf.setFontSize(12);
        pdf.text(`편의성: ${predicted_score.convenience.toFixed(2)}`, pageWidth / 2 - 30, yPos);
        pdf.text(`디자인: ${predicted_score.design.toFixed(2)}`, pageWidth / 2 + 10, yPos);
        
        // 새 페이지 - 편의성 항목
        pdf.addPage();
        yPos = 20;
        pdf.setFontSize(14);
        pdf.setTextColor(5, 150, 105);
        pdf.text('편의성 항목 (21개)', 20, yPos);
        
        yPos += 10;
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        
        (predicted_score.convenience_items || []).forEach((item, idx) => {
            if (yPos > pageHeight - 20) {
                pdf.addPage();
                yPos = 20;
            }
            
            pdf.setFont(undefined, 'bold');
            pdf.text(`${idx + 1}. ${item.item}`, 20, yPos);
            yPos += 6;
            
            pdf.setFont(undefined, 'normal');
            pdf.text(`점수: ${item.score.toFixed(1)} / 5.0`, 25, yPos);
            yPos += 6;
            
            const diagnosis = item.diagnosis || '진단 없음';
            const lines = pdf.splitTextToSize(`진단: ${diagnosis}`, pageWidth - 50);
            pdf.text(lines, 25, yPos);
            yPos += lines.length * 5 + 5;
        });
        
        // 새 페이지 - 디자인 항목
        pdf.addPage();
        yPos = 20;
        pdf.setFontSize(14);
        pdf.setTextColor(124, 58, 237);
        pdf.text('디자인 항목 (5개)', 20, yPos);
        
        yPos += 10;
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        
        (predicted_score.design_items || []).forEach((item, idx) => {
            if (yPos > pageHeight - 20) {
                pdf.addPage();
                yPos = 20;
            }
            
            pdf.setFont(undefined, 'bold');
            pdf.text(`${idx + 1}. ${item.item}`, 20, yPos);
            yPos += 6;
            
            pdf.setFont(undefined, 'normal');
            pdf.text(`점수: ${item.score.toFixed(1)} / 5.0`, 25, yPos);
            yPos += 6;
            
            const diagnosis = item.diagnosis || '진단 없음';
            const lines = pdf.splitTextToSize(`진단: ${diagnosis}`, pageWidth - 50);
            pdf.text(lines, 25, yPos);
            yPos += lines.length * 5 + 5;
        });
        
        // PDF 저장
        const filename = `UIUX_분석보고서_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(filename);
        
        btn.disabled = false;
        btn.innerHTML = '<span>📄</span> PDF 다운로드';
        alert('✅ PDF 다운로드 완료!');
        
    } catch (error) {
        console.error('PDF 생성 오류:', error);
        alert('❌ PDF 생성 실패: ' + error.message);
        const btn = document.getElementById('downloadPdfBtn');
        btn.disabled = false;
        btn.innerHTML = '<span>📄</span> PDF 다운로드';
    }
}

/**
 * PPT 다운로드 함수
 */
async function downloadPPT(data) {
    try {
        const btn = document.getElementById('downloadPptBtn');
        btn.disabled = true;
        btn.innerHTML = '<span>⏳</span> PPT 생성 중...';
        
        const pptx = new PptxGenJS();
        const { predicted_score, url, analysis_date } = data;
        
        // 슬라이드 1: 표지
        let slide = pptx.addSlide();
        slide.background = { color: '2563eb' };
        slide.addText('MGINE AutoAnalyzer', {
            x: 0.5, y: 1.5, w: 9, h: 1,
            fontSize: 44, bold: true, color: 'FFFFFF', align: 'center'
        });
        slide.addText('UI/UX 분석 보고서', {
            x: 0.5, y: 2.7, w: 9, h: 0.7,
            fontSize: 28, color: 'E5E7EB', align: 'center'
        });
        slide.addText(`분석 일시: ${new Date(analysis_date).toLocaleString('ko-KR')}`, {
            x: 0.5, y: 5, w: 9, h: 0.5,
            fontSize: 14, color: 'D1D5DB', align: 'center'
        });
        
        // 슬라이드 2: 종합 점수
        slide = pptx.addSlide();
        slide.addText('종합 점수', {
            x: 0.5, y: 0.5, w: 9, h: 0.7,
            fontSize: 32, bold: true, color: '1F2937'
        });
        slide.addText(predicted_score.overall.toFixed(2), {
            x: 0.5, y: 1.5, w: 9, h: 1.5,
            fontSize: 72, bold: true, color: '2563eb', align: 'center'
        });
        slide.addText(`편의성: ${predicted_score.convenience.toFixed(2)}  |  디자인: ${predicted_score.design.toFixed(2)}`, {
            x: 0.5, y: 3.5, w: 9, h: 0.7,
            fontSize: 24, color: '6B7280', align: 'center'
        });
        slide.addText(`분석 URL: ${url}`, {
            x: 0.5, y: 5, w: 9, h: 0.5,
            fontSize: 12, color: '9CA3AF', align: 'center'
        });
        
        // 슬라이드 3-4: 편의성 항목 (상위 10개)
        const convItems = (predicted_score.convenience_items || []).slice(0, 10);
        for (let i = 0; i < convItems.length; i += 5) {
            slide = pptx.addSlide();
            slide.addText(`편의성 항목 (${i + 1}-${Math.min(i + 5, convItems.length)})`, {
                x: 0.5, y: 0.3, w: 9, h: 0.5,
                fontSize: 24, bold: true, color: '059669'
            });
            
            let yPos = 1;
            convItems.slice(i, i + 5).forEach((item, idx) => {
                slide.addText(`${i + idx + 1}. ${item.item}`, {
                    x: 0.7, y: yPos, w: 8.6, h: 0.4,
                    fontSize: 14, bold: true, color: '1F2937'
                });
                slide.addText(`점수: ${item.score.toFixed(1)} / 5.0`, {
                    x: 1, y: yPos + 0.4, w: 8.3, h: 0.3,
                    fontSize: 12, color: '059669'
                });
                yPos += 1;
            });
        }
        
        // 슬라이드 5: 디자인 항목
        slide = pptx.addSlide();
        slide.addText('디자인 항목', {
            x: 0.5, y: 0.3, w: 9, h: 0.5,
            fontSize: 24, bold: true, color: '7c3aed'
        });
        
        let yPos = 1;
        (predicted_score.design_items || []).forEach((item, idx) => {
            slide.addText(`${idx + 1}. ${item.item}`, {
                x: 0.7, y: yPos, w: 8.6, h: 0.4,
                fontSize: 14, bold: true, color: '1F2937'
            });
            slide.addText(`점수: ${item.score.toFixed(1)} / 5.0`, {
                x: 1, y: yPos + 0.4, w: 8.3, h: 0.3,
                fontSize: 12, color: '7c3aed'
            });
            yPos += 1;
        });
        
        // PPT 저장
        const filename = `UIUX_분석보고서_${new Date().toISOString().split('T')[0]}.pptx`;
        await pptx.writeFile({ fileName: filename });
        
        btn.disabled = false;
        btn.innerHTML = '<span>📊</span> PPT 다운로드';
        alert('✅ PPT 다운로드 완료!');
        
    } catch (error) {
        console.error('PPT 생성 오류:', error);
        alert('❌ PPT 생성 실패: ' + error.message);
        const btn = document.getElementById('downloadPptBtn');
        btn.disabled = false;
        btn.innerHTML = '<span>📊</span> PPT 다운로드';
    }
}
