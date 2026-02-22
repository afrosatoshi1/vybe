import { useState } from 'react'
import { BASE, BASE_LIGHT, BASE_DARK, SHADOW_D, neu, MOODS } from '../design.js'
import { NeuBtn, NeuCard } from '../components/UI.jsx'
import { signUp, signIn } from '../lib/supabase.js'

export default function AuthScreen({ onAuth }) {
  const [mode, setMode]       = useState('login') // login | signup
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [username, setUser]   = useState('')
  const [mood, setMood]       = useState('chill')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const ac = MOODS.find(m => m.id === mood)?.color || '#00D4FF'

  const handle = async () => {
    if (!email || !password) return setError('Please fill all fields')
    if (mode === 'signup' && !username.trim()) return setError('Username required')
    setLoading(true); setError('')
    try {
      if (mode === 'signup') {
        await signUp(email, password, username.trim())
        setMode('login'); setError('Account created! Please sign in.')
      } else {
        await signIn(email, password)
        onAuth()
      }
    } catch (e) {
      setError(e.message || 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:BASE, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:20, fontFamily:"'Exo 2',sans-serif", position:'relative', overflow:'hidden' }}>
      {/* Background orbs */}
      {[[ac,'20%','15%',350],['#A78BFA44','75%','65%',250],['#F472B633','5%','75%',200]].map(([c,l,t,sz],i) => (
        <div key={i} style={{ position:'absolute', borderRadius:'50%', width:sz, height:sz, left:l, top:t, background:`radial-gradient(circle,${c} 0%,transparent 70%)`, filter:'blur(50px)', pointerEvents:'none' }}/>
      ))}

      <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:400 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:80, height:80, borderRadius:'50%', background:BASE_LIGHT, boxShadow:neu(false,ac), marginBottom:16 }}>
            <span style={{ fontFamily:"'Orbitron',monospace", fontWeight:900, fontSize:26, color:ac, textShadow:`0 0 20px ${ac}` }}>V</span>
          </div>
          <h1 style={{ fontFamily:"'Orbitron',monospace", fontWeight:900, fontSize:48, color:ac, textShadow:`0 0 40px ${ac}`, letterSpacing:'0.2em', lineHeight:1 }}>VYBE</h1>
          <p style={{ color:'#ffffff44', fontFamily:"'Orbitron',monospace", fontSize:9, letterSpacing:'0.3em', marginTop:6 }}>FEEL IT · CREATE IT · OWN IT</p>
        </div>

        <NeuCard color={ac} style={{ padding:28 }}>
          {/* Mode toggle */}
          <div style={{ display:'flex', gap:8, marginBottom:24, background:BASE_DARK, borderRadius:10, padding:4 }}>
            {[['login','SIGN IN'],['signup','CREATE ACCOUNT']].map(([id,lb]) => (
              <button key={id} onClick={() => { setMode(id); setError('') }}
                style={{ flex:1, padding:'10px 0', borderRadius:8, cursor:'pointer', transition:'all 0.2s', fontFamily:"'Orbitron',monospace", fontSize:9, letterSpacing:'0.1em', background:mode===id?BASE_LIGHT:'transparent', boxShadow:mode===id?neu(false,ac):'none', color:mode===id?ac:'#ffffff33', border:mode===id?`1px solid ${ac}33`:'1px solid transparent' }}>
                {lb}
              </button>
            ))}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {mode === 'signup' && (
              <div style={{ background:BASE_DARK, borderRadius:10, boxShadow:`inset 3px 3px 8px ${SHADOW_D}` }}>
                <input value={username} onChange={e => setUser(e.target.value)} placeholder="USERNAME / ALIAS" maxLength={20}
                  style={{ width:'100%', background:'transparent', border:'none', outline:'none', padding:'12px 16px', color:'#fff', caretColor:ac, fontFamily:"'Orbitron',monospace", fontSize:12, letterSpacing:'0.1em' }}/>
              </div>
            )}

            <div style={{ background:BASE_DARK, borderRadius:10, boxShadow:`inset 3px 3px 8px ${SHADOW_D}` }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="EMAIL ADDRESS"
                style={{ width:'100%', background:'transparent', border:'none', outline:'none', padding:'12px 16px', color:'#fff', caretColor:ac, fontFamily:"'Orbitron',monospace", fontSize:12, letterSpacing:'0.08em' }}/>
            </div>

            <div style={{ background:BASE_DARK, borderRadius:10, boxShadow:`inset 3px 3px 8px ${SHADOW_D}` }}>
              <input type="password" value={password} onChange={e => setPass(e.target.value)} placeholder="PASSWORD"
                onKeyDown={e => e.key === 'Enter' && handle()}
                style={{ width:'100%', background:'transparent', border:'none', outline:'none', padding:'12px 16px', color:'#fff', caretColor:ac, fontFamily:"'Orbitron',monospace", fontSize:12, letterSpacing:'0.08em' }}/>
            </div>

            {mode === 'signup' && (
              <div>
                <p style={{ color:'#ffffff44', fontFamily:"'Orbitron',monospace", fontSize:8, letterSpacing:'0.2em', marginBottom:10 }}>STARTING MOOD</p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:8 }}>
                  {MOODS.map(m => (
                    <button key={m.id} onClick={() => setMood(m.id)}
                      style={{ padding:'8px 4px', borderRadius:10, cursor:'pointer', transition:'all 0.2s', background:BASE_DARK, boxShadow:mood===m.id?`0 0 14px ${m.color}`:neu(), border:`1px solid ${mood===m.id?m.color+'66':'transparent'}`, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                      <span style={{ fontSize:18 }}>{m.emoji}</span>
                      <span style={{ color:m.color, fontFamily:"'Orbitron',monospace", fontSize:6 }}>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && <p style={{ color: error.includes('created') ? '#34D399' : '#FF4444', fontFamily:"'Orbitron',monospace", fontSize:9, textAlign:'center' }}>{error}</p>}

            <NeuBtn color={ac} onClick={handle} disabled={loading} style={{ width:'100%', textAlign:'center' }}>
              {loading ? '...' : mode === 'login' ? 'SIGN IN →' : 'CREATE ACCOUNT →'}
            </NeuBtn>
          </div>
        </NeuCard>
      </div>
    </div>
  )
}
