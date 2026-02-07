import type { Context } from 'hono'
import type { Env, User } from './types'

/**
 * 간단한 비밀번호 해시 (실제로는 bcrypt 사용 권장)
 * Cloudflare Workers에서는 Web Crypto API 사용
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * 비밀번호 검증
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

/**
 * 랜덤 세션 ID 생성
 */
export function generateSessionId(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * 세션 검증 미들웨어
 */
export async function authMiddleware(c: Context<{ Bindings: Env }>, next: () => Promise<void>) {
  // 세션 ID를 여러 방법으로 확인: 헤더, 쿼리, 쿠키
  let sessionId = c.req.header('X-Session-ID') || c.req.query('session_id')
  
  // 쿠키에서 세션 ID 확인
  if (!sessionId) {
    const cookie = c.req.header('Cookie')
    if (cookie) {
      const match = cookie.match(/session_id=([^;]+)/)
      if (match) {
        sessionId = match[1]
      }
    }
  }
  
  if (!sessionId) {
    return c.json({ success: false, error: '인증이 필요합니다.' }, 401)
  }

  const { DB } = c.env
  const session = await DB.prepare(
    'SELECT s.*, u.id as user_id, u.email, u.name, u.role FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.expires_at > datetime("now")'
  ).bind(sessionId).first()

  if (!session) {
    return c.json({ success: false, error: '유효하지 않은 세션입니다.' }, 401)
  }

  // 세션 정보를 컨텍스트에 저장
  c.set('user', {
    id: session.user_id,
    email: session.email,
    name: session.name,
    role: session.role
  })

  await next()
}

/**
 * 관리자 권한 체크 미들웨어 (인증 포함)
 */
export async function adminMiddleware(c: Context<{ Bindings: Env }>, next: () => Promise<void>) {
  // 먼저 인증 체크
  let sessionId = c.req.header('X-Session-ID') || c.req.query('session_id')
  
  // 쿠키에서 세션 ID 확인
  if (!sessionId) {
    const cookie = c.req.header('Cookie')
    if (cookie) {
      const match = cookie.match(/session_id=([^;]+)/)
      if (match) {
        sessionId = match[1]
      }
    }
  }
  
  if (!sessionId) {
    return c.json({ success: false, error: '인증이 필요합니다.' }, 401)
  }

  const { DB } = c.env
  const session = await DB.prepare(
    'SELECT s.*, u.id as user_id, u.email, u.name, u.role FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.expires_at > datetime("now")'
  ).bind(sessionId).first()

  if (!session) {
    return c.json({ success: false, error: '유효하지 않은 세션입니다.' }, 401)
  }

  // 세션 정보를 컨텍스트에 저장
  const user = {
    id: session.user_id,
    email: session.email,
    name: session.name,
    role: session.role
  }
  c.set('user', user)
  
  // 관리자 권한 체크
  if (user.role !== 'admin') {
    return c.json({ success: false, error: '관리자 권한이 필요합니다.' }, 403)
  }

  await next()
}

/**
 * 이메일 검증
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 비밀번호 강도 검증
 */
export function validatePassword(password: string): boolean {
  if (password.length < 8) {
    return false
  }
  if (!/[A-Z]/.test(password)) {
    return false
  }
  if (!/[a-z]/.test(password)) {
    return false
  }
  if (!/[0-9]/.test(password)) {
    return false
  }
  return true
}
