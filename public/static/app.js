console.log('🚀 AutoAnalyzer v2.1 - Fixed Version');
console.log('Element IDs: analyzeBtn, analyzeUrl, analyzeResult');

document.getElementById('analyzeBtn')?.addEventListener('click', async () => {
    const url = document.getElementById('analyzeUrl').value;
    const result = document.getElementById('analyzeResult');
    
    if (!result) {
        console.error('analyzeResult element not found!');
        alert('오류: 결과 표시 영역을 찾을 수 없습니다.');
        return;
    }
    
    if (!url) {
        alert('URL을 입력하세요');
        return;
    }
    
    result.innerHTML = '<div style="text-align: center; padding: 20px;"><div style="color: #666;">🔍 URL 분석 중...</div></div>';
    result.style.display = 'block';
    
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });
        
        if (!response.ok) {
            throw new Error('분석 실패');
        }
        
        const data = await response.json();
        displayResults(data);
    } catch (error) {
        result.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="text-red-600 font-bold">❌ 분석 실패</div>
                <div class="text-sm text-gray-600 mt-2">${error.message}</div>
            </div>
        `;
    }
});

function displayResults(data) {
    const result = document.getElementById('result');
    const { url, predicted_score } = data;
    
    // 편의성 항목 HTML 생성
    const convenienceItemsHTML = Object.entries(predicted_score.convenience_items)
        .map(([key, item]) => {
            const color = getScoreColor(item.score);
            const icon = getScoreIcon(item.score);
            const itemName = key.replace(/_/g, ' ');
            return `
                <div class="border-l-4 ${color.border} bg-white rounded-lg p-4 mb-3 shadow-sm">
                    <div class="flex justify-between items-start mb-2">
                        <div class="font-semibold text-gray-800">
                            ${itemName} <span class="text-green-600 font-bold text-sm">(편의성 항목)</span>
                        </div>
                        <div class="text-2xl font-bold ${color.text}">${item.score.toFixed(2)}</div>
                    </div>
                    <div class="text-xs text-gray-500 mb-2">
                        📋 ${item.category.replace(/_/g, ' ')}
                    </div>
                    <div class="text-sm ${color.bg} p-2 rounded">
                        ${icon} ${item.diagnosis}
                    </div>
                    <div class="mt-2">
                        <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div class="${color.progress}" style="width: ${(item.score / 5) * 100}%"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    
    // 디자인 항목 HTML 생성
    const designItemsHTML = Object.entries(predicted_score.design_items)
        .map(([key, item]) => {
            const color = getScoreColor(item.score);
            const icon = getScoreIcon(item.score);
            const itemName = key.replace(/_/g, ' ');
            return `
                <div class="border-l-4 ${color.border} bg-white rounded-lg p-4 mb-3 shadow-sm">
                    <div class="flex justify-between items-start mb-2">
                        <div class="font-semibold text-gray-800">
                            ${itemName} <span class="text-purple-600 font-bold text-sm">(디자인 항목)</span>
                        </div>
                        <div class="text-2xl font-bold ${color.text}">${item.score.toFixed(2)}</div>
                    </div>
                    <div class="text-xs text-gray-500 mb-2">
                        📋 ${item.category.replace(/_/g, ' ')}
                    </div>
                    <div class="text-sm ${color.bg} p-2 rounded">
                        ${icon} ${item.diagnosis}
                    </div>
                    <div class="mt-2">
                        <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div class="${color.progress}" style="width: ${(item.score / 5) * 100}%"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    
    result.innerHTML = `
        <div class="space-y-6">
            <!-- 종합 점수 -->
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <div class="text-center mb-4">
                    <div class="text-4xl font-bold text-blue-600">${predicted_score.overall.toFixed(2)}</div>
                    <div class="text-gray-600 mt-1">종합 점수 (5점 만점)</div>
                </div>
                <div class="grid grid-cols-2 gap-4 mt-4">
                    <div class="bg-white rounded-lg p-4 text-center">
                        <div class="text-2xl font-bold text-green-600">${predicted_score.convenience.toFixed(2)}</div>
                        <div class="text-sm text-gray-600">편의성 (13개 항목)</div>
                    </div>
                    <div class="bg-white rounded-lg p-4 text-center">
                        <div class="text-2xl font-bold text-purple-600">${predicted_score.design.toFixed(2)}</div>
                        <div class="text-sm text-gray-600">디자인 (12개 항목)</div>
                    </div>
                </div>
            </div>
            
            <!-- 편의성 항목 -->
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-lg p-6 border-2 border-green-200">
                <div class="bg-green-600 text-white text-2xl font-bold mb-4 p-4 rounded-lg flex items-center shadow-md">
                    <i class="fas fa-hand-pointer mr-3"></i>
                    📊 편의성 항목 (13개)
                </div>
                <div class="text-sm text-gray-700 font-semibold mb-4 bg-white p-3 rounded-lg">
                    💡 사용자가 기능을 얼마나 쉽게 사용할 수 있는가?
                </div>
                ${convenienceItemsHTML}
            </div>
            
            <!-- 디자인 항목 -->
            <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-lg p-6 border-2 border-purple-200">
                <div class="bg-purple-600 text-white text-2xl font-bold mb-4 p-4 rounded-lg flex items-center shadow-md">
                    <i class="fas fa-palette mr-3"></i>
                    🎨 디자인 항목 (12개)
                </div>
                <div class="text-sm text-gray-700 font-semibold mb-4 bg-white p-3 rounded-lg">
                    💡 시각적 디자인과 정보 구조가 얼마나 좋은가?
                </div>
                ${designItemsHTML}
            </div>
        </div>
    `;
}

function getScoreColor(score) {
    if (score >= 4.5) {
        return {
            border: 'border-green-500',
            text: 'text-green-600',
            bg: 'bg-green-50',
            progress: 'h-full bg-green-500'
        };
    } else if (score >= 3.5) {
        return {
            border: 'border-blue-500',
            text: 'text-blue-600',
            bg: 'bg-blue-50',
            progress: 'h-full bg-blue-500'
        };
    } else if (score >= 2.5) {
        return {
            border: 'border-orange-500',
            text: 'text-orange-600',
            bg: 'bg-orange-50',
            progress: 'h-full bg-orange-500'
        };
    } else {
        return {
            border: 'border-red-500',
            text: 'text-red-600',
            bg: 'bg-red-50',
            progress: 'h-full bg-red-500'
        };
    }
}

function getScoreIcon(score) {
    if (score >= 4.5) return '✅';
    if (score >= 3.5) return '🔵';
    if (score >= 2.5) return '⚠️';
    return '❌';
}
