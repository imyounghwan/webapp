# FTP 업로드 가이드

## 준비사항

1. **FTP 접속 정보**
   - 호스트 주소: `ftp.your-server.com`
   - 사용자명: `your-username`
   - 비밀번호: `your-password`
   - 포트: `21` (기본값) 또는 호스팅 제공 포트

2. **FTP 클라이언트 설치**
   - FileZilla (추천): https://filezilla-project.org/
   - WinSCP (Windows): https://winscp.net/
   - Cyberduck (Mac): https://cyberduck.io/

---

## FileZilla 사용법

### 1. FileZilla 설치 및 실행
1. FileZilla 다운로드 및 설치
2. 프로그램 실행

### 2. 서버 연결
1. 상단 입력 필드에 정보 입력:
   - **호스트**: `ftp.your-server.com`
   - **사용자명**: `your-username`
   - **비밀번호**: `your-password`
   - **포트**: `21`

2. **빠른 연결** 버튼 클릭

3. 연결 성공 시:
   - 왼쪽: 로컬 컴퓨터 파일
   - 오른쪽: 서버 파일

### 3. 업로드할 폴더 찾기
1. **로컬 사이트** (왼쪽)에서 `webapp/web/` 폴더로 이동
2. **리모트 사이트** (오른쪽)에서 업로드 대상 폴더로 이동
   - 일반적으로 `public_html/` 또는 `www/` 또는 `htdocs/`

### 4. 파일 업로드
#### 방법 1: 드래그 앤 드롭
- 왼쪽 `web/` 폴더의 모든 파일을 선택
- 오른쪽 서버 폴더로 드래그

#### 방법 2: 우클릭 업로드
- 왼쪽에서 파일/폴더 선택
- 우클릭 → **업로드** 선택

### 5. 업로드 확인
다음 파일/폴더가 서버에 있어야 합니다:
```
public_html/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── api/
│   ├── get_sites.php
│   ├── get_rankings.php
│   └── get_age_groups.php
└── data/
    ├── site_averages.json
    ├── rankings.json
    ├── age_group_summary.json
    └── analysis_results.json
```

### 6. 권한 설정 (필요시)
PHP 파일의 실행 권한 확인:
1. 서버에서 `.php` 파일 우클릭
2. **파일 권한** 선택
3. 권한을 `644` 또는 `755`로 설정

---

## 명령줄 FTP 사용법 (고급)

### Windows 명령 프롬프트
```cmd
ftp ftp.your-server.com
# 사용자명 입력
# 비밀번호 입력

cd public_html
lcd C:\path\to\webapp\web
prompt
mput *
bye
```

### Linux / Mac 터미널
```bash
ftp ftp.your-server.com
# 사용자명 입력
# 비밀번호 입력

cd public_html
lcd /path/to/webapp/web
prompt
mput *
bye
```

---

## 자동 업로드 스크립트

### Windows Batch Script
`upload.bat` 파일 생성:
```batch
@echo off
echo FTP 업로드 시작...

ftp -s:ftp_commands.txt

echo 업로드 완료!
pause
```

`ftp_commands.txt` 파일 생성:
```
open ftp.your-server.com
your-username
your-password
cd public_html
lcd C:\path\to\webapp\web
prompt
mput *
bye
```

실행: `upload.bat` 더블클릭

### Linux / Mac Bash Script
`upload.sh` 파일 생성:
```bash
#!/bin/bash

HOST="ftp.your-server.com"
USER="your-username"
PASS="your-password"
LOCAL_DIR="/path/to/webapp/web"
REMOTE_DIR="/public_html"

echo "FTP 업로드 시작..."

ftp -n $HOST <<END_SCRIPT
quote USER $USER
quote PASS $PASS
cd $REMOTE_DIR
lcd $LOCAL_DIR
prompt
mput *
quit
END_SCRIPT

echo "업로드 완료!"
```

실행:
```bash
chmod +x upload.sh
./upload.sh
```

---

## SFTP 사용 (보안 강화)

SFTP는 FTP보다 안전합니다.

### FileZilla로 SFTP 연결
1. **호스트**: `sftp://your-server.com`
2. **포트**: `22`
3. 나머지는 FTP와 동일

### 명령줄 SFTP
```bash
sftp your-username@your-server.com
cd public_html
lcd /path/to/webapp/web
put -r *
bye
```

---

## 주의사항

### 1. 백업
업로드 전 서버의 기존 파일 백업:
1. FileZilla에서 서버 파일 선택
2. 로컬 컴퓨터로 다운로드하여 백업

### 2. 파일 권한
- **HTML, CSS, JS**: `644` (읽기 전용)
- **PHP**: `644` 또는 `755` (실행 권한)
- **폴더**: `755`

### 3. 대용량 파일
- JSON 파일이 큰 경우 압축 후 업로드
- 서버에서 압축 해제

### 4. 업로드 후 테스트
브라우저에서 확인:
```
http://your-domain.com/
http://your-domain.com/api/get_sites.php
http://your-domain.com/data/site_averages.json
```

---

## 문제 해결

### 연결 실패
- 호스트 주소 확인
- 포트 번호 확인 (21 또는 호스팅 제공 포트)
- 방화벽 설정 확인

### 업로드 실패
- 디스크 용량 확인
- 파일 권한 확인
- 파일명에 특수문자 있는지 확인

### 403 Forbidden 오류
- 폴더 권한을 `755`로 설정
- PHP 파일 권한을 `644` 또는 `755`로 설정

### 404 Not Found 오류
- 파일 경로 확인
- 대소문자 구분 확인 (Linux 서버)
- 파일명 오타 확인

---

## 추가 도구

### WinSCP (Windows)
1. 다운로드: https://winscp.net/
2. GUI + 명령줄 지원
3. 동기화 기능

### rsync (Linux/Mac)
서버가 SSH를 지원하는 경우:
```bash
rsync -avz --delete /path/to/webapp/web/ user@server.com:/path/to/public_html/
```

---

## 요약

1. ✅ FTP 클라이언트 설치 (FileZilla 추천)
2. ✅ 서버 접속 정보 입력
3. ✅ `webapp/web/` 폴더 전체 업로드
4. ✅ 권한 확인 (PHP 파일 644 또는 755)
5. ✅ 브라우저에서 테스트

---

문제가 있으면 호스팅 업체의 고객지원에 문의하세요.
