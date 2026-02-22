import { useState, useEffect, useCallback } from 'react'
import { MOODS, BADGES_LIST, getLevel } from './design.js'
import { supabase, getProfile, updateProfile, logEvent } from './lib/supabase.js'
import JarvisAI, { jarvisContext } from './components/JarvisAI.jsx'
import AuthScreen     from './screens/AuthScreen.jsx'
import HomeHub        from './screens/HomeHub.jsx'
import { CreateWorld, DiscoverWorld, ProfileScreen } from './screens/OtherScreens.jsx'
import MixWorld       from './screens/MixWorld.jsx'
import AdminDashboard from './screens/AdminDashboard.jsx'

export default function App() {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [screen, setScreen]   = useState('auth')
  const [loading, setLoading] = useState(true)

  const accentColor = MOODS.find(m => m.id === profile?.mood)?.color || '#00D4FF'

  // ── Auth listener ───────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { setUser(session.user); loadProfile(session.user.id) }
      else { setLoading(false) }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) { setUser(session.user); loadProfile(session.user.id) }
      else { setUser(null); setProfile(null); setScreen('auth') }
    })
    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId) => {
    const p = await getProfile(userId)
    if (p) {
      setProfile(p)
      setScreen('home')
      jarvisContext.update({ mood: p.mood, xp: p.xp, level: getLevel(p.xp||0).name })
    }
    setLoading(false)
  }

  // ── XP + badges ─────────────────────────────────────────────────
  const addXP = useCallback(async (amt) => {
    if (!user || !profile) return
    const newXP = (profile.xp || 0) + amt
    setProfile(prev => ({ ...prev, xp: newXP }))
    await updateProfile(user.id, { xp: newXP })
    jarvisContext.update({ xp: newXP, level: getLevel(newXP).name })
  }, [user, profile])

  const unlockBadge = useCallback(async (id) => {
    if (!user || !profile) return
    const existing = profile.badges || []
    if (existing.includes(id)) return
    const newBadges = [...existing, id]
    const badgeXP   = BADGES_LIST.find(b => b.id === id)?.xp || 0
    const newXP     = (profile.xp || 0) + badgeXP
    setProfile(prev => ({ ...prev, badges: newBadges, xp: newXP }))
    await updateProfile(user.id, { badges: newBadges, xp: newXP })
  }, [user, profile])

  // ── Navigation ───────────────────────────────────────────────────
  const navigate = useCallback(async (to) => {
    setScreen(to)
    jarvisContext.update({ screen: to, action: `nav_${to}` })
    if (user) await logEvent(user.id, to, 'navigate')
  }, [user])

  const setMood = useCallback(async (mood) => {
    setProfile(prev => ({ ...prev, mood }))
    if (user) await updateProfile(user.id, { mood })
    jarvisContext.update({ mood })
  }, [user])

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#1a1b2e', display:'flex', alignItems:'center', justifyContent:'center', color:'#00D4FF', fontFamily:"'Orbitron',monospace", fontSize:14, letterSpacing:'0.2em' }}>
      LOADING VYBE...
    </div>
  )

  const commonProps = { accentColor, onXP: addXP, onBadge: unlockBadge, userId: user?.id }

  return (
    <>
      {screen === 'auth'    && <AuthScreen onAuth={() => loadProfile(user?.id)}/>}
      {screen === 'home'    && <HomeHub profile={profile} mood={profile?.mood||'chill'} xp={profile?.xp||0} badges={profile?.badges||[]} setMood={setMood} onNavigate={navigate} accentColor={accentColor} onSignOut={() => supabase.auth.signOut()}/>}
      {screen === 'create'  && <CreateWorld onBack={() => navigate('home')} {...commonProps}/>}
      {screen === 'mix'     && <MixWorld    onBack={() => navigate('home')} {...commonProps}/>}
      {screen === 'discover'&& <DiscoverWorld mood={profile?.mood||'chill'} onBack={() => navigate('home')} {...commonProps}/>}
      {screen === 'profile' && <ProfileScreen profile={profile} onBack={() => navigate('home')} {...commonProps}/>}
      {screen === 'admin'   && profile?.is_admin && <AdminDashboard onBack={() => navigate('home')} accentColor={accentColor}/>}

      {/* JARVIS always floats on every screen except auth */}
      {screen !== 'auth' && profile && (
        <JarvisAI accentColor={accentColor} screen={screen} userName={profile.username}/>
      )}
    </>
  )
}
