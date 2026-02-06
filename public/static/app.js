console.log('🚀 MGINE AutoAnalyzer v3.1 - 직접 선별 모드 추가');

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM loaded');
    
    const analyzeBtn = document.getElementById('analyzeBtn');
    const analyzeManualBtn = document.getElementById('analyzeManualBtn');
    const analyzeUrl = document.getElementById('analyzeUrl');
    const analyzeResult = document.getElementById('analyzeResult');
    
    // 모드 전환 버튼
    const autoModeBtn = document.getElementById('autoModeBtn');
    const manualModeBtn = document.getElementById('manualModeBtn');
    const autoModeSection = document.getElementById('autoModeSection');
    const manualModeSection = document.getElementById('manualModeSection');
    
    // 모드 전환 핸들러
    if (autoModeBtn && manualModeBtn) {
        autoModeBtn.addEventListener('click', () => {
            autoModeBtn.classList.add('active');
            manualModeBtn.classList.remove('active');
            autoModeSection.style.display = 'block';
            manualModeSection.style.display = 'none';
        });
        
        manualModeBtn.addEventListener('click', () => {
            manualModeBtn.classList.add('active');
            autoModeBtn.classList.remove('active');
            manualModeSection.style.display = 'block';
            autoModeSection.style.display = 'none';
        });
    }
    
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
    
    // 자동 수집 모드 분석
    analyzeBtn.addEventListener('click', async () => {
        const url = analyzeUrl.value;
        
        if (!url) {
            alert('URL을 입력하세요');
            return;
        }
        
        console.log('🔍 Analyzing (Auto Mode):', url);
        performAnalysis({ url }, analyzeResult);
    });
    
    // 직접 선별 모드 분석
    if (analyzeManualBtn) {
        analyzeManualBtn.addEventListener('click', async () => {
            // 입력된 URL 수집
            const urlInputs = document.querySelectorAll('.manual-url-input');
            const urls = [];
            
            urlInputs.forEach((input, index) => {
                const url = input.value.trim();
                if (url && url.startsWith('http')) {
                    urls.push(url);
                }
            });
            
            if (urls.length === 0) {
                alert('최소 1개 이상의 유효한 URL을 입력하세요.\n(메인 페이지는 필수입니다)');
                return;
            }
            
            console.log(`🔍 Analyzing (Manual Mode): ${urls.length} pages`, urls);
            performAnalysis({ urls }, analyzeResult);
        });
    }
    
    // 통합 분석 함수
    async function performAnalysis(requestBody, resultContainer) {
        
        // 로딩 프로그레스 바 표시
        let progress = 0;
        resultContainer.innerHTML = `
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
        resultContainer.style.display = 'block';
        
        // 프로그레스 바 애니메이션
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        
        const progressSteps = [
            { progress: 10, text: '페이지 접속 중...' },
            { progress: 20, text: '메인 페이지 분석 중...' },
            { progress: 35, text: '서브 페이지 수집 중...' },
            { progress: 50, text: 'HTML 구조 분석 중...' },
            { progress: 65, text: 'UI/UX 평가 수행 중...' },
            { progress: 78, text: '접근성 검사 중...' },
            { progress: 88, text: '종합 평가 중...' }
        ];
        
        let stepIndex = 0;
        let currentProgress = 0;
        const progressInterval = setInterval(() => {
            if (stepIndex < progressSteps.length) {
                const step = progressSteps[stepIndex];
                currentProgress = step.progress;
                progressBar.style.width = step.progress + '%';
                progressBar.textContent = step.progress + '%';
                progressText.textContent = step.text;
                stepIndex++;
            } else {
                // 88% 이후에는 천천히 증가 (최대 97%까지)
                if (currentProgress < 97) {
                    currentProgress += 0.5;
                    progressBar.style.width = currentProgress + '%';
                    progressBar.textContent = Math.floor(currentProgress) + '%';
                }
            }
        }, stepIndex < progressSteps.length ? 1200 : 400);  // 초반은 빠르게, 후반은 천천히
        
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
                body: JSON.stringify({ ...requestBody, mode: selectedMode })
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
            displayResults(data, resultContainer);
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
            
            resultContainer.innerHTML = `
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
    }
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
    const { predicted_score, url, analysis_date, version, improvements, analyzed_pages, summary, convenience_items, design_items } = data;
    
    console.log('📊 MGINE 데이터:', { 
        convenience_items_length: convenience_items?.length, 
        design_items_length: design_items?.length,
        predicted_score,
        has_convenience_items: !!convenience_items,
        has_design_items: !!design_items
    });
    
    // 전체 점수 재계산 (수정된 항목이 있을 경우)
    if (predicted_score) {
        const convenienceItems = convenience_items || [];
        const designItems = design_items || [];
        
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
                    <button id="downloadPdfBtn" style="background:#ef4444;color:white;border:none;border-radius:12px;padding:16px 32px;cursor:pointer;font-size:16px;font-weight:700;display:flex;align-items:center;gap:10px;transition:all 0.3s;box-shadow:0 10px 30px rgba(239,68,68,0.3);" >
                        <span style="font-size:20px;">📄</span> PDF 다운로드
                    </button>
                    <button id="downloadPptBtn" style="background:#f59e0b;color:white;border:none;border-radius:12px;padding:16px 32px;cursor:pointer;font-size:16px;font-weight:700;display:flex;align-items:center;gap:10px;transition:all 0.3s;box-shadow:0 10px 30px rgba(245,158,11,0.3);" >
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
    const convenienceItemsList = convenience_items || [];
    console.log('📊 편의성 항목 수:', convenienceItemsList.length);
    let convenienceHTML = '<h3 style="color:#00C9A7;font-size:24px;font-weight:800;margin-bottom:25px;padding-bottom:15px;border-bottom:3px solid #00C9A7;">📊 편의성 항목 (21개)</h3>';
    convenienceItemsList.forEach((item, itemIndex) => {
        const scoreColor = item.score >= 4.5 ? '#00C9A7' : item.score >= 3.5 ? '#0066FF' : item.score >= 2.5 ? '#f59e0b' : '#ef4444';
        const itemId = `item-conv-${itemIndex}`;
        convenienceHTML += `
            <div id="${itemId}" style="border-left:4px solid ${scoreColor};background:rgba(255,255,255,0.05);border-radius:16px;padding:24px;margin-bottom:20px;border:1px solid rgba(255,255,255,0.1);backdrop-filter:blur(10px);transition:all 0.3s;" >
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
                            data-description="${(item.description || '').replace(/"/g, '&quot;')}"
                            data-recommendation="${(item.recommendation || '').replace(/"/g, '&quot;')}"
                            style="background:#0066FF;color:white;border:none;border-radius:10px;padding:10px 16px;cursor:pointer;font-size:14px;font-weight:600;transition:all 0.3s;box-shadow:0 4px 12px rgba(0,102,255,0.3);position:relative;z-index:100;"
                            
                            
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
                
                <div id="${itemId}-diagnosis" data-original="${(item.description || '').replace(/"/g, '&quot;')}" style="background:${item.score >= 4.0 ? 'rgba(0,201,167,0.1)' : item.score >= 3.0 ? 'rgba(0,102,255,0.1)' : 'rgba(239,68,68,0.1)'};padding:16px;border-radius:12px;margin-bottom:12px;border:2px solid ${item.score >= 4.0 ? '#00C9A7' : item.score >= 3.0 ? '#0066FF' : '#ef4444'};">
                    <div style="font-size:15px;color:#E5E7EB;line-height:1.8;font-weight:500;">
                        📊 <strong style="color:${scoreColor};">진단 결과:</strong> ${item.description || '진단 정보 없음'}
                    </div>
                </div>
                
                ${item.recommendation ? `
                <div id="${itemId}-recommendation" style="background:rgba(0,102,255,0.05);padding:16px;border-radius:12px;margin-bottom:12px;border:1px solid rgba(0,102,255,0.2);">
                    <div style="font-size:15px;color:#E5E7EB;line-height:1.8;font-weight:500;">
                        💡 <strong style="color:#0066FF;">권장사항:</strong> ${item.recommendation}
                    </div>
                </div>
                ` : ''}
                
                <div style="font-size:13px;color:#9CA3AF;margin-bottom:10px;font-weight:500;">
                    🔗 <strong>평가 페이지 (${item.affected_pages ? item.affected_pages.length : 0}개):</strong><br>
                    ${item.affected_pages && item.affected_pages.length > 0 ? 
                        item.affected_pages.slice(0, 3).map((page, idx) => 
                            `${idx + 1}. <a href="${page}" target="_blank" style="color:#2563eb;text-decoration:none;word-break:break-all;">${page.length > 60 ? page.substring(0, 60) + '...' : page}</a>`
                        ).join('<br>') + (item.affected_pages.length > 3 ? `<br><span style="color:#6B7280;">외 ${item.affected_pages.length - 3}개</span>` : '')
                        : `<span style="color:#6B7280;">전체 페이지</span>`
                    }
                </div>
                
                <div style="margin-top:12px;height:10px;background:#e5e7eb;border-radius:5px;overflow:hidden;">
                    <div style="height:100%;background:${scoreColor};width:${(item.score/5)*100}%;transition:width 0.3s;"></div>
                </div>
            </div>
        `;
    });
    
    // 디자인 항목
    const designItemsList = design_items || [];
    let designHTML = '<h3 style="color:#9333EA;font-size:24px;font-weight:800;margin-bottom:25px;margin-top:50px;padding-bottom:15px;border-bottom:3px solid #9333EA;">🎨 디자인 항목 (5개)</h3>';
    designItemsList.forEach((item, itemIndex) => {
        const scoreColor = item.score >= 4.5 ? '#00C9A7' : item.score >= 3.5 ? '#0066FF' : item.score >= 2.5 ? '#f59e0b' : '#ef4444';
        const itemId = `item-design-${itemIndex}`;
        designHTML += `
            <div id="${itemId}" style="border-left:4px solid ${scoreColor};background:rgba(255,255,255,0.05);border-radius:16px;padding:24px;margin-bottom:20px;border:1px solid rgba(255,255,255,0.1);backdrop-filter:blur(10px);transition:all 0.3s;">
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:15px;gap:20px;">
                    <div style="flex:1;">
                        <div style="font-weight:700;color:#E5E7EB;font-size:18px;margin-bottom:8px;line-height:1.4;">
                            ${item.item}
                        </div>
                        <div style="font-size:13px;color:#9333EA;font-weight:600;background:rgba(147,51,234,0.1);padding:4px 10px;border-radius:6px;display:inline-block;">${item.principle || ''}</div>
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
                            data-description="${(item.description || '').replace(/"/g, '&quot;')}"
                            data-recommendation="${(item.recommendation || '').replace(/"/g, '&quot;')}"
                            style="background:#9333EA;color:white;border:none;border-radius:10px;padding:10px 16px;cursor:pointer;font-size:14px;font-weight:600;transition:all 0.3s;box-shadow:0 4px 12px rgba(147,51,234,0.3);position:relative;z-index:100;"
                        >
                            ✏️ 수정
                        </button>
                    </div>
                </div>
                
                <div style="background:rgba(147,51,234,0.05);padding:16px;border-radius:12px;margin-bottom:12px;border:1px solid rgba(147,51,234,0.1);">
                    <div style="font-size:15px;color:#E5E7EB;line-height:1.8;font-weight:500;">
                        📝 <strong style="color:#9333EA;">항목 설명:</strong> ${item.description || '설명 없음'}
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
                
                <div id="${itemId}-diagnosis" data-original="${(item.description || '').replace(/"/g, '&quot;')}" style="background:${item.score >= 4.0 ? 'rgba(0,201,167,0.1)' : item.score >= 3.0 ? 'rgba(0,102,255,0.1)' : 'rgba(239,68,68,0.1)'};padding:16px;border-radius:12px;margin-bottom:12px;border:2px solid ${item.score >= 4.0 ? '#00C9A7' : item.score >= 3.0 ? '#0066FF' : '#ef4444'};">
                    <div style="font-size:15px;color:#E5E7EB;line-height:1.8;font-weight:500;">
                        📊 <strong style="color:${scoreColor};">진단 결과:</strong> ${item.description || '진단 정보 없음'}
                    </div>
                </div>
                
                ${item.recommendation ? `
                <div id="${itemId}-recommendation" style="background:rgba(0,102,255,0.05);padding:16px;border-radius:12px;margin-bottom:12px;border:1px solid rgba(0,102,255,0.2);">
                    <div style="font-size:15px;color:#E5E7EB;line-height:1.8;font-weight:500;">
                        💡 <strong style="color:#0066FF;">권장사항:</strong> ${item.recommendation}
                    </div>
                </div>
                ` : ''}
                
                <div style="font-size:13px;color:#9CA3AF;margin-bottom:10px;font-weight:500;">
                    🔗 <strong>평가 페이지 (${item.affected_pages ? item.affected_pages.length : 0}개):</strong><br>
                    ${item.affected_pages && item.affected_pages.length > 0 ? 
                        item.affected_pages.slice(0, 3).map((page, idx) => 
                            `${idx + 1}. <a href="${page}" target="_blank" style="color:#2563eb;text-decoration:none;word-break:break-all;">${page.length > 60 ? page.substring(0, 60) + '...' : page}</a>`
                        ).join('<br>') + (item.affected_pages.length > 3 ? `<br><span style="color:#6B7280;">외 ${item.affected_pages.length - 3}개</span>` : '')
                        : `<span style="color:#6B7280;">전체 페이지</span>`
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
    const editButtons = document.querySelectorAll('.edit-score-btn');
    console.log(`🔍 Found ${editButtons.length} edit buttons`);
    
    editButtons.forEach((btn, index) => {
        console.log(`🔘 Button ${index + 1}:`, {
            itemId: btn.getAttribute('data-item-id'),
            itemName: btn.getAttribute('data-item-name')
        });
        
        btn.addEventListener('click', function(e) {
            console.log('✅ Edit button clicked!', this.getAttribute('data-item-name'));
            e.preventDefault();
            e.stopPropagation();
            
            const itemId = this.getAttribute('data-item-id');
            const itemIdValue = this.getAttribute('data-item-id-value');
            const itemName = this.getAttribute('data-item-name');
            const originalScore = parseFloat(this.getAttribute('data-original-score'));
            const url = this.getAttribute('data-url');
            const description = this.getAttribute('data-description')?.replace(/&quot;/g, '"') || '';
            const recommendation = this.getAttribute('data-recommendation')?.replace(/&quot;/g, '"') || '';
            
            editScore(itemId, itemIdValue, itemName, originalScore, url, description, recommendation);
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
 * 점수 및 진단 내용 수정 함수 (개선된 인라인 편집)
 */
window.editScore = async function(itemId, itemIdValue, itemName, originalScore, url, originalDescription, originalRecommendation) {
    console.log('🔍 editScore called with itemId:', itemId);
    console.log('🔍 itemIdValue:', itemIdValue);
    console.log('🔍 itemName:', itemName);
    
    const scoreElementId = `${itemId}-score`;
    const scoreElement = document.getElementById(scoreElementId);
    const diagnosisElement = document.getElementById(`${itemId}-diagnosis`);
    const recommendationElement = document.getElementById(`${itemId}-recommendation`);
    
    console.log('🔍 Looking for scoreElement with ID:', scoreElementId);
    console.log('📍 scoreElement:', scoreElement);
    console.log('📍 diagnosisElement:', diagnosisElement);
    console.log('📍 recommendationElement:', recommendationElement);
    
    if (!scoreElement) {
        console.error('❌ scoreElement is NULL!');
        console.error('❌ Tried to find ID:', scoreElementId);
        alert(`오류: 점수 요소를 찾을 수 없습니다.\nID: ${scoreElementId}\n\n페이지를 새로고침 후 다시 시도해주세요.`);
        return;
    }
    
    // 현재 점수 및 진단
    const currentScore = parseFloat(scoreElement.textContent);
    const currentDescription = originalDescription || '';
    const currentRecommendation = originalRecommendation || '';
    
    // 모달 다이얼로그로 수정 UI 표시
    const modal = document.createElement('div');
    modal.id = 'editModal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(5px);
        display: flex; align-items: center; justify-content: center; 
        z-index: 10000; animation: fadeIn 0.2s;
    `;
    
    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #1a1f36 0%, #0d1117 100%);
            border: 2px solid rgba(0, 102, 255, 0.3);
            border-radius: 20px;
            padding: 35px;
            max-width: 600px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            animation: slideUp 0.3s;
        ">
            <h3 style="color: #0066FF; margin-bottom: 25px; font-size: 1.4rem; font-weight: 700;">
                <i class="fas fa-edit"></i> 평가 항목 수정
            </h3>
            
            <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 12px; margin-bottom: 25px;">
                <div style="color: var(--text); font-weight: 600; font-size: 1.05rem;">
                    ${itemName}
                </div>
            </div>
            
            <!-- 점수 입력 -->
            <div style="margin-bottom: 25px;">
                <label style="display: block; color: var(--text); margin-bottom: 10px; font-weight: 600;">
                    <i class="fas fa-star" style="color: #FFD700;"></i> 점수 (0.0 ~ 5.0)
                </label>
                <input 
                    type="number" 
                    id="newScoreInput" 
                    min="0" 
                    max="5" 
                    step="0.1" 
                    value="${currentScore.toFixed(1)}"
                    style="
                        width: 100%; 
                        padding: 12px 16px; 
                        background: rgba(255, 255, 255, 0.05); 
                        border: 2px solid var(--border); 
                        border-radius: 10px; 
                        color: var(--text); 
                        font-size: 1.1rem;
                        font-weight: 600;
                    "
                />
            </div>
            
            <!-- 진단 내용 입력 -->
            <div style="margin-bottom: 25px;">
                <label style="display: block; color: var(--text); margin-bottom: 10px; font-weight: 600;">
                    <i class="fas fa-stethoscope" style="color: #00C9A7;"></i> 진단 내용
                </label>
                <textarea 
                    id="newDescriptionInput"
                    rows="3"
                    style="
                        width: 100%; 
                        padding: 12px 16px; 
                        background: rgba(255, 255, 255, 0.05); 
                        border: 2px solid var(--border); 
                        border-radius: 10px; 
                        color: var(--text); 
                        font-size: 0.95rem;
                        resize: vertical;
                        font-family: inherit;
                        line-height: 1.6;
                    "
                    placeholder="진단 내용을 입력하세요..."
                >${currentDescription}</textarea>
            </div>
            
            <!-- 권장 사항 입력 -->
            <div style="margin-bottom: 30px;">
                <label style="display: block; color: var(--text); margin-bottom: 10px; font-weight: 600;">
                    <i class="fas fa-lightbulb" style="color: #F59E0B;"></i> 권장 사항
                </label>
                <textarea 
                    id="newRecommendationInput"
                    rows="3"
                    style="
                        width: 100%; 
                        padding: 12px 16px; 
                        background: rgba(255, 255, 255, 0.05); 
                        border: 2px solid var(--border); 
                        border-radius: 10px; 
                        color: var(--text); 
                        font-size: 0.95rem;
                        resize: vertical;
                        font-family: inherit;
                        line-height: 1.6;
                    "
                    placeholder="권장 사항을 입력하세요..."
                >${currentRecommendation}</textarea>
            </div>
            
            <!-- 버튼 -->
            <div style="display: flex; gap: 15px; justify-content: flex-end;">
                <button 
                    id="cancelEditBtn"
                    style="
                        padding: 12px 30px; 
                        background: rgba(255, 255, 255, 0.05); 
                        border: 2px solid var(--border); 
                        border-radius: 10px; 
                        color: var(--text); 
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s;
                    "
                >
                    <i class="fas fa-times"></i> 취소
                </button>
                <button 
                    id="saveEditBtn"
                    style="
                        padding: 12px 30px; 
                        background: linear-gradient(135deg, #0066FF, #00C9A7); 
                        border: none; 
                        border-radius: 10px; 
                        color: white; 
                        font-weight: 700;
                        cursor: pointer;
                        transition: all 0.3s;
                    "
                >
                    <i class="fas fa-save"></i> 저장
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 취소 버튼
    document.getElementById('cancelEditBtn').addEventListener('click', () => {
        modal.remove();
    });
    
    // 모달 외부 클릭 시 닫기
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // 저장 버튼
    document.getElementById('saveEditBtn').addEventListener('click', () => {
        const newScoreValue = parseFloat(document.getElementById('newScoreInput').value);
        const newDescription = document.getElementById('newDescriptionInput').value.trim();
        const newRecommendation = document.getElementById('newRecommendationInput').value.trim();
        
        if (isNaN(newScoreValue) || newScoreValue < 0 || newScoreValue > 5) {
            alert('❌ 유효하지 않은 점수입니다.\n0.0 ~ 5.0 사이의 숫자를 입력해주세요.');
            return;
        }
        
        // 점수 업데이트
        scoreElement.textContent = newScoreValue.toFixed(1);
        
        // 진단 내용 업데이트
        if (diagnosisElement && newDescription) {
            const diagnosisContent = diagnosisElement.querySelector('div');
            if (diagnosisContent) {
                const scoreColor = newScoreValue >= 4.5 ? '#00C9A7' : newScoreValue >= 3.5 ? '#0066FF' : newScoreValue >= 2.5 ? '#f59e0b' : '#ef4444';
                diagnosisContent.innerHTML = `📊 <strong style="color:${scoreColor};">진단 결과:</strong> ${newDescription}`;
            }
        }
        
        // 권장 사항 업데이트
        if (recommendationElement && newRecommendation) {
            const recommendationContent = recommendationElement.querySelector('div');
            if (recommendationContent) {
                recommendationContent.innerHTML = `💡 <strong style="color:#0066FF;">권장사항:</strong> ${newRecommendation}`;
            }
        } else if (newRecommendation && !recommendationElement) {
            // 권장사항 요소가 없으면 새로 생성
            const newRecommendationDiv = document.createElement('div');
            newRecommendationDiv.id = `${itemId}-recommendation`;
            newRecommendationDiv.style.cssText = 'background:rgba(0,102,255,0.05);padding:16px;border-radius:12px;margin-bottom:12px;border:1px solid rgba(0,102,255,0.2);';
            newRecommendationDiv.innerHTML = `<div style="font-size:15px;color:#E5E7EB;line-height:1.8;font-weight:500;">💡 <strong style="color:#0066FF;">권장사항:</strong> ${newRecommendation}</div>`;
            diagnosisElement.parentElement.insertBefore(newRecommendationDiv, diagnosisElement.nextSibling);
        }
        
        // 상태 업데이트
        const statusElement = document.getElementById(`${itemId}-status`);
        if (statusElement) {
            let statusColor, statusBg, statusText;
            if (newScoreValue < 0) {
                // -1: 해당없음
                statusColor = '#6B7280';
                statusColor = '#6B7280';
                statusBg = 'rgba(107, 114, 128, 0.1)';
                statusText = '➖ 해당없음';
            } else if (newScoreValue >= 4.5) {
                statusColor = '#00C9A7';
                statusBg = 'rgba(0, 201, 167, 0.1)';
                statusText = '✅ 양호';
            } else if (newScoreValue >= 3.5) {
                statusColor = '#0066FF';
                statusBg = 'rgba(0, 102, 255, 0.1)';
                statusText = '⚠️ 보통';
            } else if (newScoreValue >= 2.5) {
                statusColor = '#FFA500';
                statusBg = 'rgba(255, 165, 0, 0.1)';
                statusText = '⚠️ 주의';
            } else {
                statusColor = '#FF5F57';
                statusBg = 'rgba(255, 95, 87, 0.1)';
                statusText = '❌ 개선필요';
            }
            
            statusElement.textContent = statusText;
            statusElement.style.background = statusBg;
            statusElement.style.color = statusColor;
        }
        
        // localStorage에 수정사항 저장
        try {
            const lastResult = JSON.parse(localStorage.getItem('lastAnalysisResult') || '{}');
            if (lastResult.krds && lastResult.krds.scores) {
                lastResult.krds.scores[itemId] = newScoreValue;
                localStorage.setItem('lastAnalysisResult', JSON.stringify(lastResult));
                console.log('💾 Saved to localStorage:', itemId, newScoreValue);
            }
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
        }
        
        // 백엔드에 피드백 데이터 전송 (AI 학습용)
        fetch('/api/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-ID': localStorage.getItem('session_id') || ''
            },
            body: JSON.stringify({
                url: url,
                item_id: itemIdValue,
                item_name: itemName,
                original_score: currentScore,
                new_score: newScoreValue,
                new_description: newDescription,
                new_recommendation: newRecommendation,
                category: itemId.includes('conv') ? 'convenience' : 'design'
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('✅ Feedback sent to backend for AI learning:', data.feedback);
            } else {
                console.warn('⚠️ Failed to send feedback:', data.error);
            }
        })
        .catch(error => {
            console.error('❌ Error sending feedback:', error);
            // 백엔드 저장 실패해도 UI 업데이트는 유지
        });
        
        modal.remove();
        alert(`✅ 저장 완료!\n\n${itemName}\n원래 점수: ${currentScore.toFixed(1)} → 수정 점수: ${newScoreValue.toFixed(1)}\n차이: ${(newScoreValue - currentScore).toFixed(1)}\n\n💡 이 수정 내용은 AI 평가 로직에 반영됩니다.`);
        
        console.log('✅ Score and diagnosis updated successfully');
    });
};

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
            const description = this.getAttribute('data-description')?.replace(/&quot;/g, '"') || '';
            const recommendation = this.getAttribute('data-recommendation')?.replace(/&quot;/g, '"') || '';
            
            editScore(itemId, itemIdValue, itemName, originalScore, url, description, recommendation);
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
    const { categories, compliance_level, convenience_score, compliant_count, total_count, not_applicable_count, compliance_rate, scores, issues } = krds;
    
    // 등급별 색상
    // S급: 95점 이상 (골드)
    // A급: 90~94점 (그린)
    // B급: 85~89점 (블루)
    // C급: 80~84점 (오렌지)
    // F급: 80점 미만 (레드)
    const levelColors = {
        'S': '#FFD700',  // 골드
        'A': '#00C9A7',  // 그린
        'B': '#0066FF',  // 블루
        'C': '#FFA500',  // 오렌지
        'F': '#FF5F57'   // 레드
    };
    
    const levelColor = levelColors[compliance_level] || '#999';
    
    // localStorage에 결과 저장
    try {
        localStorage.setItem('lastAnalysisResult', JSON.stringify(data));
        localStorage.setItem('lastAnalysisUrl', url);
        localStorage.setItem('lastAnalysisMode', 'public'); // KRDS 모드 표시
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
                        <div style="font-size: 3rem; font-weight: 900; line-height: 1; margin-bottom: 10px;">${convenience_score}<span style="font-size: 1.5rem; opacity: 0.8;">/100</span></div>
                        <div style="display: inline-block; padding: 8px 20px; background: ${levelColor}; border-radius: 20px; font-weight: 700; font-size: 1.1rem;">
                            ${compliance_level} 등급
                        </div>
                    </div>
                </div>
                <div style="font-size: 0.85rem; opacity: 0.8;">
                    <i class="fas fa-calendar"></i> ${new Date(analyzed_at).toLocaleString('ko-KR')} |
                    <i class="fas fa-file-alt"></i> ${total_pages}개 페이지 분석 |
                    <i class="fas fa-check-circle"></i> 준수율: ${compliance_rate.toFixed(1)}% (${compliant_count}/${total_count}) |
                    <i class="fas fa-question-circle"></i> 해당없음: ${not_applicable_count || 0}개 |
                    <i class="fas fa-ruler"></i> 디지털정부서비스 UI/UX 가이드라인
                </div>
            </div>
            
            <!-- 6대 카테고리 점수 -->
            <div class="principles-section" style="padding: 40px; background: rgba(255, 255, 255, 0.02);">
                <h4 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 30px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-chart-bar" style="color: #0066FF;"></i>
                    6대 카테고리 평가
                </h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px;">
                    <div class="principle-card" style="background: rgba(0, 102, 255, 0.05); border: 2px solid rgba(0, 102, 255, 0.2); border-radius: 15px; padding: 25px; text-align: center;">
                        <div style="font-size: 2rem; color: #0066FF; margin-bottom: 10px;">
                            <i class="fas fa-id-card"></i>
                        </div>
                        <div style="font-weight: 700; font-size: 1rem; margin-bottom: 5px;">아이덴티티</div>
                        <div style="font-size: 0.8rem; color: #9CA3AF; margin-bottom: 10px;">5개 항목</div>
                        <div style="font-size: 1.8rem; font-weight: 900; color: #0066FF;">${categories.identity.toFixed(1)}</div>
                    </div>
                    <div class="principle-card" style="background: rgba(0, 201, 167, 0.05); border: 2px solid rgba(0, 201, 167, 0.2); border-radius: 15px; padding: 25px; text-align: center;">
                        <div style="font-size: 2rem; color: #00C9A7; margin-bottom: 10px;">
                            <i class="fas fa-compass"></i>
                        </div>
                        <div style="font-weight: 700; font-size: 1rem; margin-bottom: 5px;">탐색</div>
                        <div style="font-size: 0.8rem; color: #9CA3AF; margin-bottom: 10px;">5개 항목</div>
                        <div style="font-size: 1.8rem; font-weight: 900; color: #00C9A7;">${categories.navigation.toFixed(1)}</div>
                    </div>
                    <div class="principle-card" style="background: rgba(255, 165, 0, 0.05); border: 2px solid rgba(255, 165, 0, 0.2); border-radius: 15px; padding: 25px; text-align: center;">
                        <div style="font-size: 2rem; color: #FFA500; margin-bottom: 10px;">
                            <i class="fas fa-home"></i>
                        </div>
                        <div style="font-weight: 700; font-size: 1rem; margin-bottom: 5px;">방문</div>
                        <div style="font-size: 0.8rem; color: #9CA3AF; margin-bottom: 10px;">1개 항목</div>
                        <div style="font-size: 1.8rem; font-weight: 900; color: #FFA500;">${categories.visit.toFixed(1)}</div>
                    </div>
                    <div class="principle-card" style="background: rgba(147, 51, 234, 0.05); border: 2px solid rgba(147, 51, 234, 0.2); border-radius: 15px; padding: 25px; text-align: center;">
                        <div style="font-size: 2rem; color: #9333EA; margin-bottom: 10px;">
                            <i class="fas fa-search"></i>
                        </div>
                        <div style="font-weight: 700; font-size: 1rem; margin-bottom: 5px;">검색</div>
                        <div style="font-size: 0.8rem; color: #9CA3AF; margin-bottom: 10px;">12개 항목</div>
                        <div style="font-size: 1.8rem; font-weight: 900; color: #9333EA;">${categories.search.toFixed(1)}</div>
                    </div>
                    <div class="principle-card" style="background: rgba(236, 72, 153, 0.05); border: 2px solid rgba(236, 72, 153, 0.2); border-radius: 15px; padding: 25px; text-align: center;">
                        <div style="font-size: 2rem; color: #EC4899; margin-bottom: 10px;">
                            <i class="fas fa-sign-in-alt"></i>
                        </div>
                        <div style="font-weight: 700; font-size: 1rem; margin-bottom: 5px;">로그인</div>
                        <div style="font-size: 0.8rem; color: #9CA3AF; margin-bottom: 10px;">7개 항목</div>
                        <div style="font-size: 1.8rem; font-weight: 900; color: #EC4899;">${categories.login.toFixed(1)}</div>
                    </div>
                    <div class="principle-card" style="background: rgba(34, 197, 94, 0.05); border: 2px solid rgba(34, 197, 94, 0.2); border-radius: 15px; padding: 25px; text-align: center;">
                        <div style="font-size: 2rem; color: #22C55E; margin-bottom: 10px;">
                            <i class="fas fa-file-contract"></i>
                        </div>
                        <div style="font-weight: 700; font-size: 1rem; margin-bottom: 5px;">신청</div>
                        <div style="font-size: 0.8rem; color: #9CA3AF; margin-bottom: 10px;">13개 항목</div>
                        <div style="font-size: 1.8rem; font-weight: 900; color: #22C55E;">${categories.application.toFixed(1)}</div>
                    </div>
                </div>
            </div>
            
            <!-- 전체 43개 항목 점수표 -->
            <div class="all-scores-section" style="padding: 40px; background: rgba(255, 255, 255, 0.02); border-top: 1px solid rgba(255, 255, 255, 0.1);">
                <h4 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-clipboard-list"></i>
                    전체 평가 항목 점수 (43개)
                </h4>
                <div style="margin-bottom: 20px; padding: 12px 20px; background: rgba(0, 102, 255, 0.1); border-left: 4px solid #0066FF; border-radius: 8px; font-size: 0.9rem; color: #D1D5DB;">
                    <strong style="color: #0066FF;">💡 점수 해석:</strong>
                    <div style="margin-top: 8px;">
                        <div>• <strong style="color: #00C9A7;">양호 (4.5~5.0점)</strong>: 기준을 충족하여 개선 불필요</div>
                        <div>• <strong style="color: #0066FF;">보통 (3.5~4.4점)</strong>: 부분적 개선 권장 → 이슈로 표시</div>
                        <div>• <strong style="color: #FFA500;">주의 (2.5~3.4점)</strong>: 개선 필요 → 이슈로 표시</div>
                        <div>• <strong style="color: #FF5F57;">개선필요 (2.0~2.4점)</strong>: 즉시 개선 필요 → 이슈로 표시</div>
                    </div>
                </div>
                <div style="background: rgba(0, 0, 0, 0.2); border-radius: 15px; padding: 20px; overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                        <thead>
                            <tr style="background: rgba(0, 102, 255, 0.1); border-bottom: 2px solid rgba(0, 102, 255, 0.3);">
                                <th style="padding: 12px; text-align: left; font-weight: 700;">항목</th>
                                <th style="padding: 12px; text-align: center; font-weight: 700; width: 100px;">점수</th>
                                <th style="padding: 12px; text-align: center; font-weight: 700; width: 120px;">상태</th>
                                <th style="padding: 12px; text-align: center; font-weight: 700; width: 120px;">수정</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(krds.scores).map(([key, score]) => {
                                // key 예시: P1_1_1_alt_text → "1.1.1 적절한 대체 텍스트 제공"
                                const itemNames = {
                                    'P1_1_1_alt_text': '1.1.1 적절한 대체 텍스트 제공',
                                    'P1_2_1_multimedia_caption': '1.2.1 자막 제공',
                                    'P1_3_1_table_structure': '1.3.1 표의 구성',
                                    'P1_3_2_linear_structure': '1.3.2 콘텐츠의 선형구조',
                                    'P1_3_3_clear_instructions': '1.3.3 명확한 지시사항 제공',
                                    'P1_4_1_color_independent': '1.4.1 색에 무관한 콘텐츠 인식',
                                    'P1_4_2_no_auto_play': '1.4.2 자동 재생 금지',
                                    'P1_4_3_contrast_ratio': '1.4.3 텍스트 콘텐츠의 명도 대비',
                                    'P1_4_4_content_distinction': '1.4.4 콘텐츠 간의 구분',
                                    'O2_1_1_keyboard_access': '2.1.1 키보드 사용 보장',
                                    'O2_1_2_focus_visible': '2.1.2 초점 이동과 표시',
                                    'O2_1_3_input_control': '2.1.3 조작 가능',
                                    'O2_1_4_shortcut_key': '2.1.4 문자 단축키',
                                    'O2_2_1_time_control': '2.2.1 응답시간 조절',
                                    'O2_2_2_pause_control': '2.2.2 정지 기능 제공',
                                    'O2_3_1_flash_limit': '2.3.1 깜빡임과 번쩍임 사용 제한',
                                    'O2_4_1_skip_navigation': '2.4.1 반복 영역 건너뛰기',
                                    'O2_4_2_page_title': '2.4.2 제목 제공',
                                    'O2_4_3_link_purpose': '2.4.3 적절한 링크 텍스트',
                                    'O2_4_4_page_reference': '2.4.4 고정된 참조 위치 정보',
                                    'O2_4_5_multiple_ways': '2.4.5 다양한 방법 제공',
                                    'O2_4_6_pointer_gestures': '2.4.6 포인터 제스처',
                                    'O2_4_7_dragging_movement': '2.4.7 끌기 동작',
                                    'O2_4_8_target_size': '2.4.8 타겟 크기',
                                    'O2_5_1_single_pointer': '2.5.1 단일 포인터 입력 지원',
                                    'U3_1_1_language_attr': '3.1.1 기본 언어 표시',
                                    'U3_2_1_user_control': '3.2.1 사용자 요구에 따른 실행',
                                    'U3_2_2_help_consistency': '3.2.2 도움말의 일관성',
                                    'U3_3_1_error_correction': '3.3.1 오류 정정',
                                    'U3_3_2_label_provision': '3.3.2 레이블 제공',
                                    'U3_3_3_accessible_auth': '3.3.3 접근 가능한 인증',
                                    'U3_3_4_auto_fill': '3.3.4 자동완성',
                                    'R4_1_1_markup_validity': '4.1.1 마크업 오류 방지',
                                    'R4_2_1_web_app_access': '4.2.1 웹 애플리케이션 접근성 준수'
                                };
                                
                                const itemName = itemNames[key] || key;
                                const scoreValue = typeof score === 'number' ? score : 0;
                                
                                // 점수에 따른 색상 및 상태
                                let statusColor, statusText, statusBg;
                                if (scoreValue < 0) {
                                    // -1: 해당없음
                                    statusColor = '#6B7280';
                                    statusBg = 'rgba(107, 114, 128, 0.1)';
                                    statusText = '➖ 해당없음';
                                } else if (scoreValue >= 4.5) {
                                    statusColor = '#00C9A7';
                                    statusBg = 'rgba(0, 201, 167, 0.1)';
                                    statusText = '✅ 양호';
                                } else if (scoreValue >= 3.5) {
                                    statusColor = '#0066FF';
                                    statusBg = 'rgba(0, 102, 255, 0.1)';
                                    statusText = '⚠️ 보통';
                                } else if (scoreValue >= 2.5) {
                                    statusColor = '#FFA500';
                                    statusBg = 'rgba(255, 165, 0, 0.1)';
                                    statusText = '⚠️ 주의';
                                } else {
                                    statusColor = '#FF5F57';
                                    statusBg = 'rgba(255, 95, 87, 0.1)';
                                    statusText = '❌ 개선필요';
                                }
                                
                                return `
                                    <tr id="krds-row-${key}" style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                                        <td style="padding: 12px; color: #D1D5DB;">${itemName}</td>
                                        <td style="padding: 12px; text-align: center; font-weight: 700; color: ${statusColor}; font-size: 1.1rem;">
                                            <span id="${key}-score">${scoreValue.toFixed(1)}</span>
                                        </td>
                                        <td style="padding: 12px; text-align: center;">
                                            <span id="${key}-status" style="display: inline-block; padding: 4px 12px; background: ${statusBg}; color: ${statusColor}; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">
                                                ${statusText}
                                            </span>
                                        </td>
                                        <td style="padding: 12px; text-align: center;">
                                            <button 
                                                class="edit-score-btn"
                                                data-item-id="${key}"
                                                data-item-id-value="${key}"
                                                data-item-name="${itemName}"
                                                data-original-score="${scoreValue}"
                                                data-url="${url}"
                                                data-diagnosis=""
                                                style="background:#0066FF;color:white;border:none;border-radius:8px;padding:8px 16px;cursor:pointer;font-size:14px;font-weight:600;transition:all 0.3s;box-shadow:0 4px 12px rgba(0,102,255,0.3);"
                                                
                                                
                                            >
                                                ✏️ 수정
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                <div style="margin-top: 20px; padding: 15px; background: rgba(0, 102, 255, 0.05); border-radius: 10px; font-size: 0.9rem; color: #9CA3AF;">
                    <strong style="color: #0066FF;">📊 점수 기준:</strong>
                    <span style="color: #00C9A7; margin-left: 10px;">✅ 4.5~5.0: 양호</span>
                    <span style="color: #0066FF; margin-left: 10px;">⚠️ 3.5~4.4: 보통</span>
                    <span style="color: #FFA500; margin-left: 10px;">⚠️ 2.5~3.4: 주의</span>
                    <span style="color: #FF5F57; margin-left: 10px;">❌ 2.0~2.4: 개선필요</span>
                </div>
            </div>
            
            <!-- 주요 이슈 -->
            ${issues.length > 0 ? `
            <div class="issues-section" style="padding: 40px; background: rgba(255, 87, 87, 0.03); border-top: 1px solid rgba(255, 255, 255, 0.1);">
                <h4 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-exclamation-triangle" style="color: #FF5F57;"></i>
                    발견된 편의성 이슈 (${issues.length}건)
                </h4>
                <div style="margin-bottom: 20px; padding: 12px 20px; background: rgba(255, 87, 87, 0.1); border-left: 4px solid #FF5F57; border-radius: 8px; font-size: 0.9rem; color: #D1D5DB;">
                    <strong style="color: #FF5F57;">📌 이슈 판정 기준:</strong> 
                    <span style="margin-left: 10px;">점수 4.5점 미만인 항목만 이슈로 표시됩니다.</span>
                    <span style="display: block; margin-top: 5px; color: #9CA3AF;">
                        (즉, 33개 항목 중 "양호(4.5~5.0)" 항목을 제외한 모든 항목이 개선 대상입니다)
                    </span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    ${issues.map((issue, idx) => {
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
                        
                        // affected_pages 표시
                        const affectedPagesHTML = issue.affected_pages && issue.affected_pages.length > 0
                            ? `<div style="margin-top: 10px; padding: 10px; background: rgba(0, 0, 0, 0.2); border-radius: 8px; font-size: 0.85rem;">
                                <strong style="color: #9CA3AF;">📍 문제 페이지:</strong><br>
                                <div style="margin-top: 5px; color: #D1D5DB;">
                                    ${issue.affected_pages.slice(0, 3).map(page => 
                                        `<div style="margin: 3px 0; word-break: break-all;">${page}</div>`
                                    ).join('')}
                                    ${issue.affected_pages.length > 3 ? `<div style="color: #9CA3AF; margin-top: 5px;">외 ${issue.affected_pages.length - 3}개 페이지</div>` : ''}
                                </div>
                            </div>`
                            : '';
                        
                        return `
                            <div id="krds-issue-${idx}" style="background: rgba(255, 255, 255, 0.02); border-left: 4px solid ${color}; border-radius: 10px; padding: 20px;">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                                    <div style="flex: 1;">
                                        <span style="display: inline-block; padding: 4px 12px; background: ${color}; color: white; border-radius: 12px; font-size: 0.75rem; font-weight: 700; margin-right: 10px;">${label}</span>
                                        <span style="font-weight: 700; font-size: 1.05rem;">${issue.item}</span>
                                    </div>
                                    <button onclick='editKRDSScore(${idx}, "${issue.item.replace(/"/g, "&quot;")}")' 
                                            style="padding: 8px 16px; background: rgba(0, 102, 255, 0.2); color: #0066FF; border: 1px solid rgba(0, 102, 255, 0.4); border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: all 0.3s;">
                                        <i class="fas fa-edit"></i> 수정
                                    </button>
                                </div>
                                <div style="color: #9CA3AF; font-size: 0.95rem; margin-bottom: 10px;">${issue.description}</div>
                                <div style="background: rgba(0, 102, 255, 0.1); border-radius: 8px; padding: 12px; font-size: 0.9rem;">
                                    <strong style="color: #0066FF;">💡 권장사항:</strong> ${issue.recommendation}
                                </div>
                                ${affectedPagesHTML}
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
    
    // 수정 버튼에 이벤트 리스너 추가
    setTimeout(() => {
        const editButtons = resultElement.querySelectorAll('.edit-score-btn');
        console.log('🔍 Found edit buttons:', editButtons.length);
        
        editButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = this.getAttribute('data-item-id');
                const itemIdValue = this.getAttribute('data-item-id-value');
                const itemName = this.getAttribute('data-item-name');
                const originalScore = parseFloat(this.getAttribute('data-original-score'));
                const url = this.getAttribute('data-url');
                const diagnosis = this.getAttribute('data-diagnosis');
                
                console.log('📝 Edit button clicked:', {
                    itemId, itemIdValue, itemName, originalScore, url
                });
                
                editScore(itemId, itemIdValue, itemName, originalScore, url, diagnosis);
            });
        });
    }, 100);
}

// ==========================================
// KRDS 점수 수정 함수
// ==========================================
window.editKRDSScore = async function(issueIndex, itemName) {
    const lastResult = JSON.parse(localStorage.getItem('lastAnalysisResult') || '{}');
    const krds = lastResult.krds;
    
    if (!krds || !krds.issues || !krds.issues[issueIndex]) {
        alert('이슈 데이터를 찾을 수 없습니다.');
        return;
    }
    
    const issue = krds.issues[issueIndex];
    
    // 이슈 항목명이 "최근 검색어" 같은 경우 (숫자 없음) → itemId 직접 찾기
    const itemCodeMatch = issue.item.match(/[\d.]+/);
    
    if (!itemCodeMatch) {
        // 숫자가 없는 이슈 (예: "최근 검색어", "자동완성")
        // 이런 항목은 KRDS 43개 항목에 없으므로 수정 불가
        alert(`${issue.item}\n\n이 항목은 KRDS 43개 평가 항목에 포함되지 않아 수정할 수 없습니다.\n\n"발견된 이슈"는 참고용입니다.`);
        return;
    }
    
    const itemCode = itemCodeMatch[0]; // "1.1.1"
    const itemId = Object.keys(krds.scores).find(key => {
        // key 예시: "P1_1_1_alt_text"
        const keyCode = key.match(/[A-Z](\d+_\d+_\d+)/)?.[1]?.replace(/_/g, '.'); // "1.1.1"
        return keyCode === itemCode;
    });
    
    if (!itemId) {
        alert('항목 ID를 찾을 수 없습니다.');
        return;
    }
    
    const originalScore = krds.scores[itemId];
    
    // 수정 다이얼로그 표시
    const newScore = prompt(
        `${itemName}\n\n현재 점수: ${originalScore.toFixed(1)}\n\n새로운 점수를 입력하세요 (2.0 ~ 5.0):`,
        originalScore.toFixed(1)
    );
    
    if (newScore === null) return; // 취소
    
    const correctedScore = parseFloat(newScore);
    
    // 유효성 검사
    if (isNaN(correctedScore) || correctedScore < 2.0 || correctedScore > 5.0) {
        alert('점수는 2.0에서 5.0 사이여야 합니다.');
        return;
    }
    
    // 서버에 저장
    try {
        const sessionId = localStorage.getItem('session_id');
        const response = await fetch('/api/krds/corrections', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-ID': sessionId
            },
            body: JSON.stringify({
                url: lastResult.url,
                evaluated_at: lastResult.analyzed_at,
                item_id: itemId,
                item_name: itemName,
                original_score: originalScore,
                corrected_score: correctedScore,
                html_structure: JSON.stringify(lastResult.structure),
                affected_pages: issue.affected_pages,
                correction_reason: '관리자 수정',
                admin_comment: '',
                corrected_by: 'admin'
            })
        });
        
        if (!response.ok) {
            throw new Error('저장 실패');
        }
        
        const result = await response.json();
        
        // 로컬 데이터 업데이트
        krds.scores[itemId] = correctedScore;
        localStorage.setItem('lastAnalysisResult', JSON.stringify(lastResult));
        
        alert(`✅ 수정 완료!\n\n${itemName}\n원본: ${originalScore.toFixed(1)} → 수정: ${correctedScore.toFixed(1)}\n\n이 데이터는 향후 평가 로직 개선에 활용됩니다.`);
        
        // 결과 다시 표시
        const resultElement = document.getElementById('analyzeResult');
        if (resultElement) {
            displayKRDSResults(lastResult, resultElement);
        }
        
    } catch (error) {
        console.error('KRDS correction error:', error);
        alert('❌ 저장 실패: ' + error.message);
    }
};
