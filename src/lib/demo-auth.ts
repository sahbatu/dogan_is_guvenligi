import type { User } from '@supabase/supabase-js'

export const DEMO_SESSION_KEY = 'dogan-demo-admin'
export const DEMO_ADMIN_EMAIL = 'admin@demo.com'
export const DEMO_ADMIN_PASSWORD = 'demo123'

export function createDemoUser(): User {
  return {
    id: 'demo-admin',
    email: DEMO_ADMIN_EMAIL,
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  } as User
}

export function isDemoSessionActive(): boolean {
  return sessionStorage.getItem(DEMO_SESSION_KEY) === DEMO_ADMIN_EMAIL
}
