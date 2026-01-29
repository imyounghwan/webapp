console.log('AutoAnalyzer loaded');

document.getElementById('analyze')?.addEventListener('click', () => {
    const url = document.getElementById('url').value;
    const result = document.getElementById('result');
    
    if (!url) {
        alert('URL을 입력하세요');
        return;
    }
    
    result.innerHTML = '<div class="text-center"><div class="text-gray-600">분석 중...</div></div>';
    result.classList.remove('hidden');
    
    setTimeout(() => {
        result.innerHTML = `
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="text-lg font-bold mb-2">분석 완료</div>
                <div class="text-sm text-gray-600">URL: ${url}</div>
                <div class="mt-4">
                    <div class="text-3xl font-bold text-center text-blue-600">4.2</div>
                    <div class="text-center text-gray-600">종합 점수 (데모)</div>
                </div>
            </div>
        `;
    }, 1000);
});
