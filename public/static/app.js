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
                        <div id="progressBar" style="background:linear-gradient(90deg, #0066FF, #00C9A7);height:100%;width:0%;transition:width 0.3s;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:14px;"></div>
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
            const sessionId = localStorage.getItem('session_id');
            if (!sessionId) {
                alert('로그인이 필요합니다.');
                window.location.href = '/login';
                return;
            }
            
            // 평가 모드 가져오기
            const selectedMode = document.querySelector('input[name="evalMode"]:checked')?.value || 'mgine';
            
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Session-ID': sessionId
                },
                body: JSON.stringify({ url, mode: selectedMode })
            });
            
            clearInterval(progressInterval);
            
            if (response.status === 401) {
                alert('세션이 만료되었습니다. 다시 로그인해주세요.');
                localStorage.removeItem('session_id');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return;
            }
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: '분석 실패', message: '서버 오류' }));
                throw new Error(errorData.details || errorData.message || '분석 실패');
            }
            
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
            
            // 상세한 에러 메시지 표시
            let errorTitle = '❌ 분석 실패';
            let errorMessage = error.message || '알 수 없는 오류가 발생했습니다.';
            let errorSuggestion = '';
            
            if (errorMessage.includes('CORS') || errorMessage.includes('차단')) {
                errorTitle = '🚫 접근 차단';
                errorSuggestion = '해당 웹사이트가 외부 접근을 차단하고 있습니다. 다른 URL을 시도해보세요.';
            } else if (errorMessage.includes('찾을 수 없습니다') || errorMessage.includes('404')) {
                errorTitle = '🔍 페이지 없음';
                errorSuggestion = 'URL이 올바른지 확인해주세요. (예: https://example.com)';
            } else if (errorMessage.includes('타임아웃') || errorMessage.includes('timeout')) {
                errorTitle = '⏱️ 시간 초과';
                errorSuggestion = '웹사이트 응답이 느립니다. 잠시 후 다시 시도해주세요.';
            } else if (errorMessage.includes('네트워크') || errorMessage.includes('network')) {
                errorTitle = '🌐 네트워크 오류';
                errorSuggestion = '인터넷 연결을 확인하거나 나중에 다시 시도해주세요.';
            }
            
            analyzeResult.innerHTML = `
                <div style="background: linear-gradient(135deg, rgba(255, 87, 87, 0.1), rgba(255, 87, 87, 0.05)); border: 2px solid rgba(255, 87, 87, 0.3); border-radius: 16px; padding: 40px; margin: 20px 0; text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 20px;">😔</div>
                    <div style="color: #FF5F57; font-weight: 800; font-size: 1.5rem; margin-bottom: 15px;">${errorTitle}</div>
                    <div style="color: var(--text); font-size: 1.05rem; margin-bottom: 10px; line-height: 1.6;">${errorMessage}</div>
                    ${errorSuggestion ? `<div style="background: rgba(0, 102, 255, 0.1); border-radius: 10px; padding: 15px; margin-top: 20px; color: #0066FF; font-size: 0.95rem;">💡 ${errorSuggestion}</div>` : ''}
                    <button onclick="location.reload()" style="margin-top: 25px; padding: 12px 30px; background: linear-gradient(135deg, #0066FF, #0052CC); color: white; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 1rem;">
                        🔄 다시 시도
                    </button>
                </div>
            `;
        }
    });
});

function displayResults(data, resultElement) {
    console.log('🎨 displayResults called with:', {
        hasData: !!data,
        hasResultElement: !!resultElement,
        url: data?.url,
        mode: data?.mode
    });
    
    if (!resultElement) {
        console.error('❌ resultElement is null!');
        resultElement = document.getElementById('analyzeResult');
        if (!resultElement) {
            console.error('❌ Cannot find analyzeResult element!');
            return;
        }
    }
    
    // KRDS(공공) 모드 체크
    if (data.mode === 'public') {
        displayKRDSResults(data, resultElement);
        return;
    }
    
    // MGINE 모드 (기존 Nielsen 로직)
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
        <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);padding:30px;margin-bottom:30px;border-radius:20px;backdrop-filter:blur(10px);">
            <div style="font-weight:700;color:#E5E7EB;margin-bottom:20px;font-size:18px;display:flex;align-items:center;gap:10px;">
                <span style="font-size:24px;">📄</span> 분석된 페이지 (총 ${analyzed_pages.total_count}개)
            </div>
            <div style="font-size:16px;color:#D1D5DB;line-height:2;">
                <div style="margin-bottom:15px;">
                    <strong style="color:#9CA3AF;font-size:14px;text-transform:uppercase;letter-spacing:1px;">메인 페이지</strong><br>
                    <a href="${analyzed_pages.main_page}" target="_blank" style="color:#0066FF;text-decoration:none;font-weight:500;word-break:break-all;">${analyzed_pages.main_page}</a>
                </div>
                ${analyzed_pages.sub_pages.length > 0 ? `
                <div style="margin-top:25px;">
                    <strong style="color:#9CA3AF;font-size:14px;text-transform:uppercase;letter-spacing:1px;">서브 페이지 (${analyzed_pages.sub_pages.length}개)</strong>
                    <div style="margin-top:15px;display:grid;gap:10px;">
                        ${analyzed_pages.sub_pages.map((page, idx) => 
                            `<div style="padding:10px;background:rgba(255,255,255,0.03);border-radius:8px;border:1px solid rgba(255,255,255,0.05);">
                                <span style="color:#9CA3AF;font-weight:600;margin-right:10px;">${idx + 1}.</span>
                                <a href="${page}" target="_blank" style="color:#0066FF;text-decoration:none;font-weight:500;word-break:break-all;">${page}</a>
                            </div>`
                        ).join('')}
                    </div>
                </div>
                ` : ''}
                <div style="margin-top:25px;padding:20px;background:rgba(0,102,255,0.05);border-radius:12px;border:1px solid rgba(0,102,255,0.1);">
                    <div style="color:#9CA3AF;font-size:15px;line-height:1.8;">
                        <span style="color:#0066FF;font-weight:700;">ℹ️</span> ${analyzed_pages.note}
                    </div>
                </div>
            </div>
        </div>
    ` : '';
    
    // 버전 및 개선사항 정보 제거
    const improvementsHTML = '';
    
    // 종합 점수
    const scoreHTML = `
        <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:40px;margin-bottom:30px;backdrop-filter:blur(10px);">
            <div style="text-align:center;">
                <div style="font-size:16px;color:#9CA3AF;margin-bottom:15px;font-weight:500;">종합 점수</div>
                <div style="font-size:72px;font-weight:900;background:linear-gradient(135deg, #0066FF, #00C9A7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:20px;">${predicted_score.overall.toFixed(2)}</div>
                <div style="display:flex;justify-content:center;gap:50px;margin-top:30px;">
                    <div style="text-align:center;">
                        <div style="font-size:14px;color:#9CA3AF;margin-bottom:8px;font-weight:500;">편의성</div>
                        <div style="font-size:36px;font-weight:800;color:#00C9A7;">${predicted_score.convenience.toFixed(2)}</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:14px;color:#9CA3AF;margin-bottom:8px;font-weight:500;">디자인</div>
                        <div style="font-size:36px;font-weight:800;color:#9333EA;">${predicted_score.design.toFixed(2)}</div>
                    </div>
                </div>
                
                <!-- 다운로드 버튼 추가 -->
                <div style="margin-top:40px;display:flex;justify-content:center;gap:15px;flex-wrap:wrap;">
                    <button id="downloadPdfBtn" style="background:#ef4444;color:white;border:none;border-radius:12px;padding:16px 32px;cursor:pointer;font-size:16px;font-weight:700;display:flex;align-items:center;gap:10px;transition:all 0.3s;box-shadow:0 10px 30px rgba(239,68,68,0.3);" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 15px 40px rgba(239,68,68,0.5)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 10px 30px rgba(239,68,68,0.3)'">
                        <span style="font-size:20px;">📄</span> PDF 다운로드
                    </button>
                    <button id="downloadPptBtn" style="background:#f59e0b;color:white;border:none;border-radius:12px;padding:16px 32px;cursor:pointer;font-size:16px;font-weight:700;display:flex;align-items:center;gap:10px;transition:all 0.3s;box-shadow:0 10px 30px rgba(245,158,11,0.3);" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 15px 40px rgba(245,158,11,0.5)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 10px 30px rgba(245,158,11,0.3)'">
                        <span style="font-size:20px;">📊</span> PPT 다운로드
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // 총평
    const summaryHTML = summary ? `
        <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:30px;margin-bottom:30px;backdrop-filter:blur(10px);">
            <div style="font-size:20px;font-weight:800;color:#E5E7EB;margin-bottom:20px;display:flex;align-items:center;gap:10px;">
                <span style="font-size:28px;">📋</span> 종합 평가 총평
            </div>
            <div style="font-size:16px;color:#D1D5DB;line-height:2;white-space:pre-line;padding:20px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.05);">${summary}</div>
        </div>
    ` : '';
    
    // 편의성 항목
    let convenienceHTML = '<h3 style="color:#00C9A7;font-size:24px;font-weight:800;margin-bottom:25px;padding-bottom:15px;border-bottom:3px solid #00C9A7;">📊 편의성 항목 (21개)</h3>';
    predicted_score.convenience_items.forEach((item, itemIndex) => {
        const scoreColor = item.score >= 4.5 ? '#00C9A7' : item.score >= 3.5 ? '#0066FF' : item.score >= 2.5 ? '#f59e0b' : '#ef4444';
        const itemId = `item-conv-${itemIndex}`;
        convenienceHTML += `
            <div id="${itemId}" style="border-left:4px solid ${scoreColor};background:rgba(255,255,255,0.05);border-radius:16px;padding:24px;margin-bottom:20px;border:1px solid rgba(255,255,255,0.1);backdrop-filter:blur(10px);transition:all 0.3s;" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 10px 30px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='none'">
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:15px;gap:20px;">
                    <div style="flex:1;">
                        <div style="font-weight:700;color:#E5E7EB;font-size:18px;margin-bottom:8px;line-height:1.4;">
                            ${item.item}
                        </div>
                        <div style="font-size:13px;color:#0066FF;font-weight:600;background:rgba(0,102,255,0.1);padding:4px 10px;border-radius:6px;display:inline-block;">${item.principle || ''}</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:15px;">
                        <div id="${itemId}-score" style="font-size:36px;font-weight:900;color:${scoreColor};">${item.score.toFixed(1)}</div>
                        <button 
                            class="edit-score-btn"
                            data-item-id="${itemId}"
                            data-item-id-value="${item.item_id}"
                            data-item-name="${item.item}"
                            data-original-score="${item.score}"
                            data-url="${url}"
                            data-diagnosis="${(item.diagnosis || '').replace(/"/g, '&quot;')}"
                            style="background:#0066FF;color:white;border:none;border-radius:10px;padding:10px 16px;cursor:pointer;font-size:14px;font-weight:600;transition:all 0.3s;box-shadow:0 4px 12px rgba(0,102,255,0.3);"
                            onmouseover="this.style.background='#00C9A7';this.style.transform='scale(1.05)'"
                            onmouseout="this.style.background='#0066FF';this.style.transform='scale(1)'"
                        >
                            ✏️ 수정
                        </button>
                    </div>
                </div>
                
                <div style="background:rgba(0,102,255,0.05);padding:16px;border-radius:12px;margin-bottom:12px;border:1px solid rgba(0,102,255,0.1);">
                    <div style="font-size:15px;color:#E5E7EB;line-height:1.8;font-weight:500;">
                        📝 <strong style="color:#0066FF;">항목 설명:</strong> ${item.description || '설명 없음'}
                    </div>
                </div>
                
                <div style="background:rgba(245,158,11,0.05);padding:16px;border-radius:12px;margin-bottom:12px;border:1px solid rgba(245,158,11,0.1);">
                    <div style="font-size:15px;color:#E5E7EB;line-height:1.8;font-weight:500;">
                        💡 <strong style="color:#f59e0b;">중요한 이유:</strong> ${item.why_important || '정보 없음'}
                    </div>
                </div>
                
                <div style="background:rgba(255,255,255,0.03);padding:16px;border-radius:12px;margin-bottom:12px;border:1px solid rgba(255,255,255,0.1);">
                    <div style="font-size:15px;color:#E5E7EB;line-height:1.8;font-weight:500;">
                        🔍 <strong style="color:#9CA3AF;">평가 기준:</strong> ${item.evaluation_criteria || '정보 없음'}
                    </div>
                </div>
                
                <div id="${itemId}-diagnosis" data-original="${(item.diagnosis || '').replace(/"/g, '&quot;')}" style="background:${item.score >= 4.0 ? 'rgba(0,201,167,0.1)' : item.score >= 3.0 ? 'rgba(0,102,255,0.1)' : 'rgba(239,68,68,0.1)'};padding:16px;border-radius:12px;margin-bottom:12px;border:2px solid ${item.score >= 4.0 ? '#00C9A7' : item.score >= 3.0 ? '#0066FF' : '#ef4444'};">
                    <div style="font-size:15px;color:#E5E7EB;line-height:1.8;font-weight:500;">
                        📊 <strong style="color:${scoreColor};">진단 결과:</strong> ${item.diagnosis || '진단 정보 없음'}
                    </div>
                </div>
                
                <div style="font-size:13px;color:#9CA3AF;margin-bottom:10px;font-weight:500;">
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
    let designHTML = '<h3 style="color:#9333EA;font-size:24px;font-weight:800;margin-bottom:25px;margin-top:50px;padding-bottom:15px;border-bottom:3px solid #9333EA;">🎨 디자인 항목 (5개)</h3>';
    predicted_score.design_items.forEach((item, itemIndex) => {
        const scoreColor = item.score >= 4.5 ? '#00C9A7' : item.score >= 3.5 ? '#0066FF' : item.score >= 2.5 ? '#f59e0b' : '#ef4444';
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
                    style="width:80px;font-size:24px;font-weight:bold;padding:4px 8px;border:2px solid #0066FF;border-radius:6px;text-align:center;"
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
                style="width:100%;min-height:80px;font-size:13px;padding:8px;border:2px solid #0066FF;border-radius:4px;resize:vertical;font-family:inherit;line-height:1.6;"
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
        // 세션 ID 확인
        const sessionId = localStorage.getItem('session_id');
        if (!sessionId) {
            alert('로그인이 필요합니다.');
            window.location.href = '/login';
            return;
        }
        
        // API 호출
        const response = await fetch('/api/admin/corrections', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-ID': sessionId
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
                corrected_by: 1 // user_id from session
            })
        });
        
        if (response.status === 401 || response.status === 403) {
            alert('관리자 권한이 필요합니다.');
            return;
        }
        
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
    const scoreColor = originalScore >= 4.5 ? '#00C9A7' : originalScore >= 3.5 ? '#0066FF' : originalScore >= 2.5 ? '#f59e0b' : '#ef4444';
    const scoreElement = document.getElementById(`${itemId}-score`);
    const diagnosisElement = document.getElementById(`${itemId}-diagnosis`);
    
    const isConvenienceItem = itemId.includes('conv');
    const buttonBgColor = isConvenienceItem ? '#0066FF' : '#9333EA';
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
 * PDF 다운로드 함수 (html2canvas 방식)
 */
async function downloadPDF(data) {
    try {
        const btn = document.getElementById('downloadPdfBtn');
        btn.disabled = true;
        btn.innerHTML = '<span>⏳</span> PDF 생성 중...';
        
        // 화면 캡처 영역 선택
        const resultElement = document.getElementById('analyzeResult');
        if (!resultElement) {
            throw new Error('분석 결과를 찾을 수 없습니다.');
        }
        
        // 수정 버튼 숨기기 (PDF에 불필요)
        const editButtons = resultElement.querySelectorAll('.edit-score-btn, #downloadPdfBtn, #downloadPptBtn');
        editButtons.forEach(btn => btn.style.display = 'none');
        
        // html2canvas로 캡처
        const canvas = await html2canvas(resultElement, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });
        
        // 버튼 다시 표시
        editButtons.forEach(btn => btn.style.display = '');
        
        // PDF 생성
        const { jsPDF } = window.jspdf;
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        let position = 0;
        
        // 이미지를 PDF에 추가
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // 페이지가 넘어가면 새 페이지 추가
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
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
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<span>📄</span> PDF 다운로드';
        }
    }
}

/**
 * PPT 다운로드 함수 (html2canvas 방식)
 */
async function downloadPPT(data) {
    try {
        const btn = document.getElementById('downloadPptBtn');
        btn.disabled = true;
        btn.innerHTML = '<span>⏳</span> PPT 생성 중...';
        
        // 화면 캡처 영역 선택
        const resultElement = document.getElementById('analyzeResult');
        if (!resultElement) {
            throw new Error('분석 결과를 찾을 수 없습니다.');
        }
        
        // 수정 버튼 숨기기
        const editButtons = resultElement.querySelectorAll('.edit-score-btn, #downloadPdfBtn, #downloadPptBtn');
        editButtons.forEach(btn => btn.style.display = 'none');
        
        // 1. 전체 화면 캡처
        const fullCanvas = await html2canvas(resultElement, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });
        
        // 버튼 다시 표시
        editButtons.forEach(btn => btn.style.display = '');
        
        const pptx = new PptxGenJS();
        pptx.layout = 'LAYOUT_16x9';
        pptx.author = 'MGINE AutoAnalyzer';
        pptx.title = 'UI/UX 분석 보고서';
        
        // 전체 이미지를 슬라이드 높이에 맞게 분할
        const slideWidth = 10;  // inches
        const slideHeight = 5.625;  // inches (16:9)
        const canvasWidth = fullCanvas.width;
        const canvasHeight = fullCanvas.height;
        
        // 슬라이드 높이에 해당하는 캔버스 높이 계산
        const pixelsPerSlide = Math.floor((slideHeight / slideWidth) * canvasWidth);
        const totalSlides = Math.ceil(canvasHeight / pixelsPerSlide);
        
        console.log(`📊 Creating ${totalSlides} slides from captured content...`);
        
        // 각 슬라이드별로 이미지 분할
        for (let i = 0; i < totalSlides; i++) {
            const slide = pptx.addSlide();
            
            // 해당 슬라이드에 해당하는 영역 추출
            const yStart = i * pixelsPerSlide;
            const yEnd = Math.min((i + 1) * pixelsPerSlide, canvasHeight);
            const sliceHeight = yEnd - yStart;
            
            // 임시 캔버스 생성
            const sliceCanvas = document.createElement('canvas');
            sliceCanvas.width = canvasWidth;
            sliceCanvas.height = sliceHeight;
            const sliceCtx = sliceCanvas.getContext('2d');
            
            // 해당 영역 복사
            sliceCtx.drawImage(
                fullCanvas,
                0, yStart, canvasWidth, sliceHeight,
                0, 0, canvasWidth, sliceHeight
            );
            
            // 이미지를 슬라이드에 추가 (전체 화면 채우기)
            const imgData = sliceCanvas.toDataURL('image/png');
            slide.addImage({
                data: imgData,
                x: 0,
                y: 0,
                w: slideWidth,
                h: slideHeight
            });
            
            // 슬라이드 번호 추가 (우측 하단)
            slide.addText(`${i + 1} / ${totalSlides}`, {
                x: 8.5,
                y: 5.1,
                w: 1.3,
                h: 0.4,
                fontSize: 10,
                color: '666666',
                align: 'right',
                valign: 'bottom'
            });
        }
        
        // PPT 저장
        const filename = `UIUX_분석보고서_${new Date().toISOString().split('T')[0]}.pptx`;
        await pptx.writeFile({ fileName: filename });
        
        btn.disabled = false;
        btn.innerHTML = '<span>📊</span> PPT 다운로드';
        alert(`✅ PPT 다운로드 완료! (${totalSlides}개 슬라이드)`);
        
    } catch (error) {
        console.error('PPT 생성 오류:', error);
        alert('❌ PPT 생성 실패: ' + error.message);
        const btn = document.getElementById('downloadPptBtn');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<span>📊</span> PPT 다운로드';
        }
    }
}

/**
 * KRDS (공공 UI/UX) 결과 표시 함수
 */
function displayKRDSResults(data, resultElement) {
    const { krds, url, analyzed_at, total_pages, analyzed_pages, structure, metadata } = data;
    const { principles, compliance_level, accessibility_score, scores, issues } = krds;
    
    // 준수 레벨 색상
    const levelColors = {
        'AAA': '#00C9A7',
        'AA': '#0066FF',
        'A': '#FFA500',
        'Fail': '#FF5F57'
    };
    
    const levelColor = levelColors[compliance_level] || '#999';
    
    // localStorage에 결과 저장
    try {
        localStorage.setItem('lastAnalysisResult', JSON.stringify(data));
        localStorage.setItem('lastAnalysisUrl', url);
    } catch (e) {
        console.warn('Failed to save to localStorage:', e);
    }
    
    resultElement.innerHTML = `
        <div class="result-card" style="animation: fadeInUp 0.6s ease-out;">
            <!-- 헤더 -->
            <div class="result-header" style="background: linear-gradient(135deg, #00C9A7, #0066FF); padding: 40px; border-radius: 20px 20px 0 0; color: white;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div>
                        <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 10px;">
                            <i class="fas fa-shield-alt"></i> 공공 UI/UX 분석 (KRDS)
                        </div>
                        <h3 style="font-size: 1.8rem; font-weight: 800; margin: 0;">${url}</h3>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 3rem; font-weight: 900; line-height: 1; margin-bottom: 10px;">${accessibility_score}<span style="font-size: 1.5rem; opacity: 0.8;">/100</span></div>
                        <div style="display: inline-block; padding: 8px 20px; background: ${levelColor}; border-radius: 20px; font-weight: 700; font-size: 1.1rem;">
                            ${compliance_level} 등급
                        </div>
                    </div>
                </div>
                <div style="font-size: 0.85rem; opacity: 0.8;">
                    <i class="fas fa-calendar"></i> ${new Date(analyzed_at).toLocaleString('ko-KR')} |
                    <i class="fas fa-file-alt"></i> ${total_pages}개 페이지 분석 |
                    <i class="fas fa-bookmark"></i> KWCAG 2.2 (${metadata.criterion_count}개 항목)
                </div>
            </div>
            
            <!-- 4대 원칙 점수 -->
            <div class="principles-section" style="padding: 40px; background: rgba(255, 255, 255, 0.02);">
                <h4 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 30px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-chart-bar" style="color: #0066FF;"></i>
                    4대 접근성 원칙 평가
                </h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                    <div class="principle-card" style="background: rgba(0, 102, 255, 0.05); border: 2px solid rgba(0, 102, 255, 0.2); border-radius: 15px; padding: 25px; text-align: center;">
                        <div style="font-size: 2.5rem; color: #0066FF; margin-bottom: 10px;">
                            <i class="fas fa-eye"></i>
                        </div>
                        <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 5px;">인식의 용이성</div>
                        <div style="font-size: 0.85rem; color: #9CA3AF; margin-bottom: 15px;">Perceivable</div>
                        <div style="font-size: 2rem; font-weight: 900; color: #0066FF;">${principles.perceivable.toFixed(1)}</div>
                    </div>
                    <div class="principle-card" style="background: rgba(0, 201, 167, 0.05); border: 2px solid rgba(0, 201, 167, 0.2); border-radius: 15px; padding: 25px; text-align: center;">
                        <div style="font-size: 2.5rem; color: #00C9A7; margin-bottom: 10px;">
                            <i class="fas fa-hand-pointer"></i>
                        </div>
                        <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 5px;">운용의 용이성</div>
                        <div style="font-size: 0.85rem; color: #9CA3AF; margin-bottom: 15px;">Operable</div>
                        <div style="font-size: 2rem; font-weight: 900; color: #00C9A7;">${principles.operable.toFixed(1)}</div>
                    </div>
                    <div class="principle-card" style="background: rgba(255, 165, 0, 0.05); border: 2px solid rgba(255, 165, 0, 0.2); border-radius: 15px; padding: 25px; text-align: center;">
                        <div style="font-size: 2.5rem; color: #FFA500; margin-bottom: 10px;">
                            <i class="fas fa-book-open"></i>
                        </div>
                        <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 5px;">이해의 용이성</div>
                        <div style="font-size: 0.85rem; color: #9CA3AF; margin-bottom: 15px;">Understandable</div>
                        <div style="font-size: 2rem; font-weight: 900; color: #FFA500;">${principles.understandable.toFixed(1)}</div>
                    </div>
                    <div class="principle-card" style="background: rgba(147, 51, 234, 0.05); border: 2px solid rgba(147, 51, 234, 0.2); border-radius: 15px; padding: 25px; text-align: center;">
                        <div style="font-size: 2.5rem; color: #9333EA; margin-bottom: 10px;">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 5px;">견고성</div>
                        <div style="font-size: 0.85rem; color: #9CA3AF; margin-bottom: 15px;">Robust</div>
                        <div style="font-size: 2rem; font-weight: 900; color: #9333EA;">${principles.robust.toFixed(1)}</div>
                    </div>
                </div>
            </div>
            
            <!-- 주요 이슈 -->
            ${issues.length > 0 ? `
            <div class="issues-section" style="padding: 40px; background: rgba(255, 87, 87, 0.03); border-top: 1px solid rgba(255, 255, 255, 0.1);">
                <h4 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 30px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-exclamation-triangle" style="color: #FF5F57;"></i>
                    발견된 접근성 이슈 (${issues.length}건)
                </h4>
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    ${issues.map(issue => {
                        const severityColors = {
                            critical: '#FF5F57',
                            serious: '#FFA500',
                            moderate: '#0066FF',
                            minor: '#00C9A7'
                        };
                        const severityLabels = {
                            critical: '심각',
                            serious: '중요',
                            moderate: '보통',
                            minor: '경미'
                        };
                        const color = severityColors[issue.severity] || '#999';
                        const label = severityLabels[issue.severity] || issue.severity;
                        
                        return `
                            <div style="background: rgba(255, 255, 255, 0.02); border-left: 4px solid ${color}; border-radius: 10px; padding: 20px;">
                                <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 10px;">
                                    <div style="flex: 1;">
                                        <span style="display: inline-block; padding: 4px 12px; background: ${color}; color: white; border-radius: 12px; font-size: 0.75rem; font-weight: 700; margin-right: 10px;">${label}</span>
                                        <span style="font-weight: 700; font-size: 1.05rem;">${issue.item}</span>
                                    </div>
                                </div>
                                <div style="color: #9CA3AF; font-size: 0.95rem; margin-bottom: 10px;">${issue.description}</div>
                                <div style="background: rgba(0, 102, 255, 0.1); border-radius: 8px; padding: 12px; font-size: 0.9rem;">
                                    <strong style="color: #0066FF;">💡 권장사항:</strong> ${issue.recommendation}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            ` : ''}
            
            <!-- 분석 페이지 정보 -->
            <div class="pages-info" style="padding: 40px; background: rgba(255, 255, 255, 0.02); border-top: 1px solid rgba(255, 255, 255, 0.1);">
                <h4 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 20px;">
                    <i class="fas fa-file-alt"></i> 분석된 페이지 (총 ${total_pages}개)
                </h4>
                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                    ${analyzed_pages.map(page => `
                        <a href="${page}" target="_blank" style="display: inline-block; padding: 8px 16px; background: rgba(0, 102, 255, 0.1); border: 1px solid rgba(0, 102, 255, 0.3); border-radius: 20px; font-size: 0.85rem; color: #0066FF; text-decoration: none; transition: all 0.3s;">
                            <i class="fas fa-external-link-alt"></i> ${page}
                        </a>
                    `).join('')}
                </div>
            </div>
            
            <!-- 액션 버튼 -->
            <div class="action-buttons" style="padding: 30px 40px; background: rgba(255, 255, 255, 0.02); border-top: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0 0 20px 20px; display: flex; gap: 15px; justify-content: center;">
                <button onclick="window.print()" style="padding: 15px 30px; background: linear-gradient(135deg, #0066FF, #0052CC); color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.3s; font-size: 1rem;">
                    <i class="fas fa-print"></i> 인쇄하기
                </button>
                <button onclick="location.reload()" style="padding: 15px 30px; background: rgba(255, 255, 255, 0.05); color: var(--text); border: 2px solid var(--border); border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.3s; font-size: 1rem;">
                    <i class="fas fa-redo"></i> 새로 분석
                </button>
            </div>
        </div>
    `;
}
