<?php
/**
 * AutoAnalyzer API - Get Site Averages
 * 기관별 평균 점수 데이터 반환
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

try {
    $dataFile = '../data/site_averages.json';
    
    if (!file_exists($dataFile)) {
        throw new Exception('데이터 파일을 찾을 수 없습니다');
    }
    
    $data = file_get_contents($dataFile);
    $json = json_decode($data, true);
    
    if ($json === null) {
        throw new Exception('JSON 파싱 오류');
    }
    
    // 쿼리 파라미터 처리
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : count($json);
    $sort = isset($_GET['sort']) ? $_GET['sort'] : 'total_desc';
    
    // 정렬
    switch($sort) {
        case 'total_asc':
            usort($json, function($a, $b) {
                return $a['total_avg'] <=> $b['total_avg'];
            });
            break;
        case 'total_desc':
        default:
            usort($json, function($a, $b) {
                return $b['total_avg'] <=> $a['total_avg'];
            });
            break;
        case 'convenience_desc':
            usort($json, function($a, $b) {
                return $b['convenience_avg'] <=> $a['convenience_avg'];
            });
            break;
        case 'design_desc':
            usort($json, function($a, $b) {
                return $b['design_avg'] <=> $a['design_avg'];
            });
            break;
        case 'name':
            usort($json, function($a, $b) {
                return strcmp($a['name'], $b['name']);
            });
            break;
    }
    
    // 제한
    $result = array_slice($json, 0, $limit);
    
    echo json_encode([
        'success' => true,
        'total_count' => count($json),
        'returned_count' => count($result),
        'data' => $result
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>
