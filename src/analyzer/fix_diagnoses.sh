#!/bin/bash

# 백업
cp nielsenImproved.ts nielsenImproved.ts.backup

# 반환 타입 수정
sed -i 's/Record<string, string>/Record<string, { description: string; recommendation: string }>/g' nielsenImproved.ts

echo "✅ 타입 정의 수정 완료"
