import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnon)

// ── Auth helpers ─────────────────────────────────────────────────
export async function signUp(email, password, username) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  // Create profile row
  await supabase.from('profiles').insert({
    id: data.user.id,
    username,
    email,
    xp: 0,
    mood: 'chill',
    badges: [],
    preferences: {},
    is_admin: email === import.meta.env.VITE_ADMIN_EMAIL,
  })
  return data.user
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.user
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getProfile(userId) {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
  return data
}

export async function updateProfile(userId, updates) {
  const { error } = await supabase.from('profiles').update({ ...updates, last_seen: new Date().toISOString() }).eq('id', userId)
  if (error) console.error('Profile update error:', error)
}

// ── Beat helpers ─────────────────────────────────────────────────
export async function saveBeat(userId, beat) {
  const { data, error } = await supabase.from('beats').upsert({ user_id: userId, ...beat, updated_at: new Date().toISOString() }).select().single()
  if (error) throw error
  return data
}

export async function getBeats(userId) {
  const { data } = await supabase.from('beats').select('*').eq('user_id', userId).order('updated_at', { ascending: false })
  return data || []
}

export async function deleteBeat(beatId) {
  await supabase.from('beats').delete().eq('id', beatId)
}

// ── Analytics helpers ────────────────────────────────────────────
export async function logEvent(userId, screen, action, metadata = {}) {
  await supabase.from('events').insert({ user_id: userId, screen, action, metadata })
}

// ── Admin helpers ─────────────────────────────────────────────────
export async function getAdminStats() {
  const [users, beats, events] = await Promise.all([
    supabase.from('profiles').select('id,username,xp,mood,badges,is_admin,created_at,last_seen'),
    supabase.from('beats').select('id,user_id,name,genre,bpm,created_at'),
    supabase.from('events').select('id,user_id,screen,action,created_at').order('created_at', { ascending: false }).limit(100),
  ])
  return {
    users:  users.data  || [],
    beats:  beats.data  || [],
    events: events.data || [],
  }
}
