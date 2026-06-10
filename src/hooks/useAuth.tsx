import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

import type { User, Session } from '@supabase/supabase-js'

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'

import {

  createDemoUser,

  DEMO_ADMIN_EMAIL,

  DEMO_ADMIN_PASSWORD,

  DEMO_SESSION_KEY,

} from '@/lib/demo-auth'



interface AuthContextType {

  user: User | null

  session: Session | null

  loading: boolean

  isDemoMode: boolean

  signIn: (email: string, password: string) => Promise<{ error: string | null }>

  signOut: () => Promise<void>

}



const AuthContext = createContext<AuthContextType | null>(null)



export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<User | null>(null)

  const [session, setSession] = useState<Session | null>(null)

  const [loading, setLoading] = useState(true)

  const [isDemoMode, setIsDemoMode] = useState(false)



  useEffect(() => {

    const supabase = getSupabase()

    if (!supabase) {

      if (sessionStorage.getItem(DEMO_SESSION_KEY) === DEMO_ADMIN_EMAIL) {

        setUser(createDemoUser())

        setIsDemoMode(true)

      }

      setLoading(false)

      return

    }



    supabase.auth.getSession().then(({ data: { session } }) => {

      setSession(session)

      setUser(session?.user ?? null)

      setLoading(false)

    })



    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {

      setSession(session)

      setUser(session?.user ?? null)

      setIsDemoMode(false)

      setLoading(false)

    })



    return () => subscription.unsubscribe()

  }, [])



  const signIn = async (email: string, password: string) => {

    if (!isSupabaseConfigured) {

      if (email === DEMO_ADMIN_EMAIL && password === DEMO_ADMIN_PASSWORD) {

        sessionStorage.setItem(DEMO_SESSION_KEY, DEMO_ADMIN_EMAIL)

        setUser(createDemoUser())

        setIsDemoMode(true)

        return { error: null }

      }

      return {

        error: `Demo giriş bilgileri: ${DEMO_ADMIN_EMAIL} / ${DEMO_ADMIN_PASSWORD}`,

      }

    }

    const supabase = getSupabase()!

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error?.message?.toLowerCase().includes('failed to fetch')) {
      return {
        error:
          'Supabase sunucusuna bağlanılamadı. Yerel geliştirmede dev sunucusunu yeniden başlatın; canlı sitede CORS ayarı gerekebilir.',
      }
    }

    return { error: error?.message ?? null }

  }



  const signOut = async () => {

    if (isDemoMode || !isSupabaseConfigured) {

      sessionStorage.removeItem(DEMO_SESSION_KEY)

      setUser(null)

      setSession(null)

      setIsDemoMode(false)

      return

    }

    const supabase = getSupabase()

    if (supabase) await supabase.auth.signOut()

  }



  return (

    <AuthContext.Provider value={{ user, session, loading, isDemoMode, signIn, signOut }}>

      {children}

    </AuthContext.Provider>

  )

}



export function useAuth() {

  const ctx = useContext(AuthContext)

  if (!ctx) throw new Error('useAuth must be used within AuthProvider')

  return ctx

}


