<?php
/**
 * AutoAnalyzer API - Get Rankings
 * 상위/하위 5개 기관 데이터 반환
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

try {
    $dataFile = '../data/rankings.json';
    
    if (!file_exists($dataFile)) {
        throw new Exception('데이터 파일을 찾을 수 없습니다');
    }
    
    $data = file_get_contents($dataFile);
    $json = json_decode($data, true);
    
    if ($json === null) {
        throw new Exception('JSON 파싱 오류');
    }
    
    echo json_encode([
        'success' => true,
        'data' => $json
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>
