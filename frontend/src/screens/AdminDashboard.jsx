import { useState, useEffect } from 'react'
import { BASE, BASE_LIGHT, BASE_DARK, SHADOW_D, neu, MOODS, getLevel } from '../design.js'
import { NeuCard, NeuBtn, BackBtn } from '../components/UI.jsx'
import { getAdminStats } from '../lib/supabase.js'

export default function AdminDashboard({ onBack, accentColor }) {
  const [stats, setStats]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('overview')
  const [refreshing, setRef]    = useState(false)

  const load = async () => {
    setRef(true)
    const data = await getAdminStats()
    setStats(data)
    setLoading(false)
    setRef(false)
  }

  useEffect(() => { load() }, [])
  useEffect(() => { const t = setInterval(load, 30000); return () => clearInterval(t) }, [])

  if (loading) return (
    <div style={{ minHeight:'100vh', background:BASE, display:'flex', alignItems:'center', justifyContent:'center', color:accentColor, fontFamily:"'Orbitron',monospace" }}>
      LOADING ADMIN DATA...
    </div>
  )

  const { users=[], beats=[], events=[] } = stats || {}

  const now  = Date.now()
  const dau  = users.filter(u => u.last_seen && now - new Date(u.last_seen).getTime() < 86400000).length
  const mau  = users.filter(u => u.last_seen && now - new Date(u.last_seen).getTime() < 2592000000).length
  const totalXP = users.reduce((a,u) => a + (u.xp||0), 0)
  const avgXP   = users.length ? Math.round(totalXP/users.length) : 0

  const screenCounts = events.reduce((acc, e) => { acc[e.screen] = (acc[e.screen]||0)+1; return acc }, {})
  const moodCounts   = users.reduce((acc, u) => { if(u.mood) acc[u.mood] = (acc[u.mood]||0)+1; return acc }, {})
  const genreCounts  = beats.reduce((acc, b) => { if(b.genre) acc[b.genre] = (acc[b.genre]||0)+1; return acc }, {})

  const TABS = [['overview','📊 OVERVIEW'],['users','👥 USERS'],['activity','⚡ ACTIVITY'],['beats','🥁 BEATS']]

  const s = {
    label: { color:'#ffffff33', fontFamily:"'Orbitron',monospace", fontSize:8, letterSpacing:'0.2em', marginBottom:8 },
    val:   { fontFamily:"'Orbitron',monospace", fontWeight:900 },
  }

  return (
    <div style={{ minHeight:'100vh', overflowY:'auto', paddingBottom:60, background:BASE, fontFamily:"'Exo 2',sans-serif" }}>
      <div style={{ maxWidth:800, margin:'0 auto', padding:'24px 16px 0' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <BackBtn onBack={onBack} color={accentColor}/>
          <div style={{ textAlign:'center' }}>
            <span style={{ color:accentColor, fontFamily:"'Orbitron',monospace", fontSize:13, fontWeight:700, letterSpacing:'0.15em' }}>VYBE COMMAND</span>
            <div style={{ color:'#ffffff33', fontFamily:"'Orbitron',monospace", fontSize:8, marginTop:2 }}>ADMIN ONLY</div>
          </div>
          <NeuBtn small color={accentColor} onClick={load} disabled={refreshing}>{refreshing?'...':'↻ REFRESH'}</NeuBtn>
        </div>

        {/* Tab Bar */}
        <div style={{ display:'flex', gap:8, padding:4, borderRadius:12, background:BASE_DARK, marginBottom:20 }}>
          {TABS.map(([id,lb]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ flex:1, padding:'10px 0', borderRadius:10, cursor:'pointer', fontFamily:"'Orbitron',monospace", fontSize:8, letterSpacing:'0.08em', background:tab===id?BASE_LIGHT:'transparent', boxShadow:tab===id?neu(false,accentColor):'none', color:tab===id?accentColor:'#ffffff33', border:tab===id?`1px solid ${accentColor}33`:'1px solid transparent', transition:'all 0.2s' }}>
              {lb}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Key metrics */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
              {[
                { label:'TOTAL USERS',  value:users.length,  color:accentColor, icon:'👥' },
                { label:'ACTIVE TODAY', value:dau,           color:'#34D399',   icon:'🟢' },
                { label:'MONTHLY ACTIVE', value:mau,         color:'#00D4FF',   icon:'📅' },
                { label:'TOTAL BEATS',  value:beats.length,  color:'#F472B6',   icon:'🥁' },
                { label:'AVG USER XP',  value:avgXP,         color:'#FFD700',   icon:'⭐' },
                { label:'TOTAL XP EARNED', value:totalXP,    color:'#A78BFA',   icon:'🏆' },
              ].map(m => (
                <NeuCard key={m.label} color={m.color} style={{ padding:16, textAlign:'center' }}>
                  <div style={{ fontSize:24, marginBottom:6 }}>{m.icon}</div>
                  <p style={{ ...s.val, fontSize:28, color:m.color }}>{m.value.toLocaleString()}</p>
                  <p style={{ ...s.label, marginBottom:0, marginTop:4 }}>{m.label}</p>
                </NeuCard>
              ))}
            </div>

            {/* Feature usage */}
            <NeuCard color={accentColor} style={{ padding:20 }}>
              <p style={s.label}>FEATURE USAGE (LAST 100 EVENTS)</p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {Object.entries(screenCounts).sort((a,b)=>b[1]-a[1]).map(([screen, count]) => (
                  <div key={screen}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ color:'#ffffffcc', fontSize:12, textTransform:'capitalize' }}>{screen}</span>
                      <span style={{ color:accentColor, fontFamily:"'Orbitron',monospace", fontSize:11 }}>{count}</span>
                    </div>
                    <div style={{ height:6, borderRadius:3, background:BASE_DARK }}>
                      <div style={{ height:'100%', borderRadius:3, background:accentColor, width:`${(count/Math.max(...Object.values(screenCounts)))*100}%`, transition:'width 0.5s' }}/>
                    </div>
                  </div>
                ))}
              </div>
            </NeuCard>

            {/* Mood distribution */}
            <NeuCard color="#A78BFA" style={{ padding:20 }}>
              <p style={s.label}>USER MOOD DISTRIBUTION</p>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {MOODS.map(m => {
                  const count = moodCounts[m.id] || 0
                  const pct   = users.length ? Math.round((count/users.length)*100) : 0
                  return (
                    <div key={m.id} style={{ flex:'1 0 80px', textAlign:'center', padding:'12px 8px', borderRadius:12, background:BASE_DARK, boxShadow:neu(true) }}>
                      <div style={{ fontSize:20 }}>{m.emoji}</div>
                      <p style={{ color:m.color, fontFamily:"'Orbitron',monospace", fontSize:14, fontWeight:900 }}>{pct}%</p>
                      <p style={{ color:'#ffffff33', fontSize:9 }}>{count} users</p>
                    </div>
                  )
                })}
              </div>
            </NeuCard>
          </div>
        )}

        {/* ── USERS ── */}
        {tab === 'users' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {users.sort((a,b) => b.xp - a.xp).map(user => {
              const lv = getLevel(user.xp || 0)
              const lastSeen = user.last_seen ? new Date(user.last_seen) : null
              const isOnline = lastSeen && (Date.now() - lastSeen.getTime() < 300000)
              const isAdmin  = user.is_admin

              return (
                <NeuCard key={user.id} color={isAdmin?'#FFD700':accentColor} style={{ padding:16 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    {/* Avatar */}
                    <div style={{ width:44, height:44, borderRadius:'50%', background:BASE_DARK, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, boxShadow:neu(false, isAdmin?'#FFD700':lv.color), position:'relative', flexShrink:0 }}>
                      {lv.icon}
                      {isOnline && <div style={{ position:'absolute', bottom:0, right:0, width:10, height:10, borderRadius:'50%', background:'#34D399', border:`2px solid ${BASE_LIGHT}` }}/>}
                    </div>

                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ color: isAdmin?'#FFD700':accentColor, fontFamily:"'Orbitron',monospace", fontSize:12, fontWeight:700 }}>
                          {user.username || 'Unknown'}
                        </span>
                        {isAdmin && <span style={{ background:'#FFD70022', border:'1px solid #FFD70055', color:'#FFD700', fontFamily:"'Orbitron',monospace", fontSize:7, padding:'2px 6px', borderRadius:4 }}>ADMIN</span>}
                      </div>
                      <div style={{ display:'flex', gap:12, marginTop:4 }}>
                        <span style={{ color:lv.color, fontSize:11 }}>{lv.name}</span>
                        <span style={{ color:'#FFD700', fontSize:11, fontFamily:"'Orbitron',monospace" }}>{(user.xp||0).toLocaleString()} XP</span>
                        <span style={{ color:'#ffffff44', fontSize:11 }}>{(user.badges||[]).length} badges</span>
                      </div>
                    </div>

                    <div style={{ textAlign:'right' }}>
                      {lastSeen
                        ? <span style={{ color:isOnline?'#34D399':'#ffffff33', fontSize:10 }}>{isOnline?'Online now':lastSeen.toLocaleDateString()}</span>
                        : <span style={{ color:'#ffffff22', fontSize:10 }}>Never</span>
                      }
                      <div style={{ marginTop:4 }}>
                        {MOODS.find(m => m.id === user.mood) && (
                          <span style={{ fontSize:16 }}>{MOODS.find(m => m.id === user.mood).emoji}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </NeuCard>
              )
            })}
          </div>
        )}

        {/* ── ACTIVITY ── */}
        {tab === 'activity' && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <NeuCard color={accentColor} style={{ padding:16 }}>
              <p style={s.label}>LIVE ACTIVITY FEED (LAST 100)</p>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {events.length === 0 && <p style={{ color:'#ffffff33', fontSize:12, textAlign:'center', padding:20 }}>No events yet</p>}
                {events.map(ev => {
                  const user = users.find(u => u.id === ev.user_id)
                  const time = new Date(ev.created_at)
                  const mins = Math.round((Date.now() - time.getTime()) / 60000)
                  const timeStr = mins < 1 ? 'just now' : mins < 60 ? `${mins}m ago` : `${Math.round(mins/60)}h ago`

                  return (
                    <div key={ev.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:10, background:BASE_DARK }}>
                      <div style={{ width:28, height:28, borderRadius:'50%', background:BASE_LIGHT, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, flexShrink:0 }}>
                        {ev.screen==='create'?'🎵':ev.screen==='mix'?'🎛️':ev.screen==='discover'?'🔍':'👤'}
                      </div>
                      <div style={{ flex:1 }}>
                        <span style={{ color:accentColor, fontSize:11, fontFamily:"'Orbitron',monospace" }}>{user?.username||'User'}</span>
                        <span style={{ color:'#ffffff55', fontSize:11 }}> · {ev.screen} · {ev.action}</span>
                      </div>
                      <span style={{ color:'#ffffff33', fontSize:10, flexShrink:0 }}>{timeStr}</span>
                    </div>
                  )
                })}
              </div>
            </NeuCard>
          </div>
        )}

        {/* ── BEATS ── */}
        {tab === 'beats' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {/* Genre stats */}
            <NeuCard color="#F472B6" style={{ padding:20 }}>
              <p style={s.label}>TOP GENRES</p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {Object.entries(genreCounts).sort((a,b)=>b[1]-a[1]).map(([g,c]) => (
                  <div key={g}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ color:'#ffffffcc', fontSize:12 }}>{g}</span>
                      <span style={{ color:'#F472B6', fontFamily:"'Orbitron',monospace", fontSize:11 }}>{c} beats</span>
                    </div>
                    <div style={{ height:6, borderRadius:3, background:BASE_DARK }}>
                      <div style={{ height:'100%', borderRadius:3, background:'#F472B6', width:`${(c/Math.max(...Object.values(genreCounts)))*100}%` }}/>
                    </div>
                  </div>
                ))}
              </div>
            </NeuCard>

            {/* Recent beats */}
            <NeuCard color={accentColor} style={{ padding:16 }}>
              <p style={s.label}>RECENT BEATS</p>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {beats.slice(0,20).map(beat => {
                  const user = users.find(u => u.id === beat.user_id)
                  return (
                    <div key={beat.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderRadius:10, background:BASE_DARK }}>
                      <span style={{ fontSize:16 }}>🥁</span>
                      <div style={{ flex:1 }}>
                        <span style={{ color:'#ffffffcc', fontSize:12 }}>{beat.name || 'Untitled Beat'}</span>
                        <span style={{ color:'#ffffff44', fontSize:11 }}> by {user?.username||'Unknown'}</span>
                      </div>
                      <div style={{ display:'flex', gap:8 }}>
                        {beat.bpm && <span style={{ color:accentColor, fontFamily:"'Orbitron',monospace", fontSize:10 }}>{beat.bpm} BPM</span>}
                        {beat.genre && <span style={{ color:'#ffffff44', fontSize:10 }}>{beat.genre}</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </NeuCard>
          </div>
        )}

      </div>
    </div>
  )
}
