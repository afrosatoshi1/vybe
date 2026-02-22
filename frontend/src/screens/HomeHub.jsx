import { useState } from 'react'
import { BASE, BASE_LIGHT, BASE_DARK, SHADOW_D, neu, MOODS, BADGES_LIST } from '../design.js'
import { NeuCard, NeuBtn, XPBar } from '../components/UI.jsx'

export default function HomeHub({ profile, mood, xp, badges, setMood, onNavigate, accentColor, onSignOut }) {
  const moodObj = MOODS.find(m => m.id === mood) || MOODS[0]
  const [showMood, setShowMood] = useState(false)
  const isAdmin = profile?.is_admin

  const WORLDS = [
    { id:'create',   icon:'🎵', label:'CREATE',    sub:'Beat Lab + Artist DNA',      color: accentColor },
    { id:'mix',      icon:'🎛️', label:'PRODUCER',  sub:'DAW + Arrange + DJ Decks',   color: '#F472B6'   },
    { id:'discover', icon:'🔍', label:'DISCOVER',   sub:'Mood Music + Streaming',     color: '#60A5FA'   },
    { id:'profile',  icon:'👤', label:'PROFILE',    sub:'Stats + Badges',             color: '#A78BFA'   },
  ]

  return (
    <div style={{ minHeight:'100vh', overflowY:'auto', paddingBottom:80, background:BASE, fontFamily:"'Exo 2',sans-serif" }}>
      <div style={{ maxWidth:520, margin:'0 auto', padding:'40px 20px 0' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <div>
            <p style={{ color:'#ffffff33', fontFamily:"'Orbitron',monospace", fontSize:9, letterSpacing:'0.25em' }}>WELCOME BACK</p>
            <h2 style={{ color:accentColor, fontFamily:"'Orbitron',monospace", fontSize:20, fontWeight:900, letterSpacing:'0.1em', textShadow:`0 0 20px ${accentColor}66`, margin:0 }}>
              {(profile?.username||'PRODUCER').toUpperCase()}
            </h2>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
            <span style={{ fontFamily:"'Orbitron',monospace", fontSize:28, fontWeight:900, color:accentColor, textShadow:`0 0 30px ${accentColor}`, letterSpacing:'0.15em' }}>VYBE</span>
            {isAdmin && (
              <button onClick={() => onNavigate('admin')}
                style={{ padding:'4px 10px', borderRadius:6, background:'#FFD70022', border:'1px solid #FFD70055', color:'#FFD700', fontFamily:"'Orbitron',monospace", fontSize:8, cursor:'pointer', letterSpacing:'0.1em' }}>
                ⚡ ADMIN
              </button>
            )}
          </div>
        </div>

        {/* XP Card */}
        <NeuCard color={accentColor} style={{ padding:20, marginBottom:16 }}>
          <XPBar xp={xp} color={accentColor}/>
        </NeuCard>

        {/* Mood Card */}
        <NeuCard color={moodObj.color} style={{ padding:20, marginBottom:16, cursor:'pointer' }} onClick={() => setShowMood(!showMood)}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:BASE, boxShadow:neu(false,moodObj.color), display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>
                {moodObj.emoji}
              </div>
              <div>
                <p style={{ color:'#ffffff33', fontFamily:"'Orbitron',monospace", fontSize:8, letterSpacing:'0.2em', margin:0 }}>CURRENT MOOD</p>
                <p style={{ color:moodObj.color, fontFamily:"'Orbitron',monospace", fontSize:14, fontWeight:700, letterSpacing:'0.1em', margin:'4px 0 0' }}>{moodObj.label}</p>
              </div>
            </div>
            <span style={{ color:moodObj.color, fontFamily:"'Orbitron',monospace", fontSize:8, opacity:0.7 }}>{showMood?'▲':'▼'} CHANGE</span>
          </div>
          {showMood && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:8, marginTop:16 }}>
              {MOODS.map(m => (
                <button key={m.id} onClick={e => { e.stopPropagation(); setMood(m.id); setShowMood(false) }}
                  style={{ padding:'8px 4px', borderRadius:10, cursor:'pointer', background:BASE, boxShadow:mood===m.id?`0 0 12px ${m.color}`:neu(), border:`1px solid ${mood===m.id?m.color+'66':'transparent'}`, display:'flex', flexDirection:'column', alignItems:'center', gap:4, transition:'all 0.2s' }}>
                  <span style={{ fontSize:16 }}>{m.emoji}</span>
                  <span style={{ color:m.color, fontFamily:"'Orbitron',monospace", fontSize:6 }}>{m.label}</span>
                </button>
              ))}
            </div>
          )}
        </NeuCard>

        {/* Worlds */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
          {WORLDS.map(w => (
            <button key={w.id} onClick={() => onNavigate(w.id)}
              style={{ padding:20, borderRadius:16, textAlign:'left', cursor:'pointer', transition:'all 0.2s', background:BASE_LIGHT, boxShadow:neu(false,w.color), border:`1px solid ${w.color}22` }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:BASE, boxShadow:neu(false,w.color), fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
                {w.icon}
              </div>
              <p style={{ color:w.color, fontFamily:"'Orbitron',monospace", fontSize:11, fontWeight:700, letterSpacing:'0.1em', margin:'0 0 4px' }}>{w.label}</p>
              <p style={{ color:'#ffffff33', fontSize:11, margin:0 }}>{w.sub}</p>
            </button>
          ))}
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <NeuCard color="#FFD700" style={{ padding:16, marginBottom:16 }}>
            <p style={{ color:'#ffffff33', fontFamily:"'Orbitron',monospace", fontSize:8, letterSpacing:'0.2em', marginBottom:10 }}>BADGES EARNED</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {badges.map(bid => {
                const b = BADGES_LIST.find(x => x.id === bid)
                return b ? (
                  <div key={bid} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 12px', borderRadius:12, background:BASE_DARK, boxShadow:neu() }}>
                    <span style={{ fontSize:14 }}>{b.icon}</span>
                    <span style={{ color:'#FFD700', fontFamily:"'Orbitron',monospace", fontSize:8 }}>{b.name}</span>
                  </div>
                ) : null
              })}
            </div>
          </NeuCard>
        )}

        {/* Sign out */}
        <div style={{ textAlign:'center', paddingBottom:20 }}>
          <button onClick={onSignOut} style={{ color:'#ffffff22', fontFamily:"'Orbitron',monospace", fontSize:9, background:'none', border:'none', cursor:'pointer', letterSpacing:'0.1em' }}>
            SIGN OUT
          </button>
        </div>
      </div>
    </div>
  )
}
