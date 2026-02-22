import { useState, useEffect, useRef, useCallback } from 'react'
import { BASE, BASE_LIGHT, BASE_DARK, SHADOW_D, SHADOW_L, neu, TRACKS, GENRE_TRACKS, FX_LIST, SECTION_NAMES } from '../design.js'
import { NeuBtn, NeuCard, TabBar, VuMeter } from '../components/UI.jsx'
import { jarvisContext } from '../components/JarvisAI.jsx'
import AE from '../lib/audio.js'

const EMPTY_PATTERN = () => Array(8).fill(null).map(() => Array(32).fill(false))
const PRESETS = {
  'AFROBEATS': [[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],[0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0],[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0],[0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0],[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]],
  'TRAP':      [[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],[1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1],[0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0],[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],[0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],[0,1,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,1,0],[0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1]],
  'HOUSE':     [[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],[0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0],[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],[0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],[1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0],[0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0]],
  'AMAPIANO':  [[1,0,0,0,1,0,0,1,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,1,0,0,0,1,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,1,0],[1,0,1,1,0,1,0,1,1,0,1,1,0,1,0,1,1,0,1,1,0,1,0,1,1,0,1,1,0,1,0,1],[0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,1],[1,1,0,0,1,0,0,1,1,1,0,0,1,0,0,1,1,1,0,0,1,0,0,1,1,1,0,0,1,0,0,1],[0,0,1,0,1,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,1,0,1,0],[1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0],[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]],
  'DRILL':     [[1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0],[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],[1,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0],[0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],[0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0],[0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0]],
}

// Timeline: 64 bars, each bar = 32 steps (2 bars per slot visually)
const TOTAL_BARS   = 64
const BAR_WIDTH    = 80  // px per bar in arrangement view
const TRACK_HEIGHT = 44  // px per track

export default function MixWorld({ onBack, accentColor, onXP, onBadge, userId }) {
  const [tab, setTab] = useState('pattern')

  // ── Pattern Studio ─────────────────────────────────────────────
  const [patterns, setPatterns]         = useState({ A: EMPTY_PATTERN(), B: EMPTY_PATTERN(), C: EMPTY_PATTERN(), D: EMPTY_PATTERN() })
  const [activePattern, setActivePat]   = useState('A')
  const [playing, setPlaying]           = useState(false)
  const [activeStep, setActiveStep]     = useState(-1)
  const [bpm, setBpm]                   = useState(120)
  const [volumes, setVolumes]           = useState(Array(8).fill(80))
  const [muted, setMuted]               = useState(Array(8).fill(false))
  const [soloTrack, setSoloTrack]       = useState(null)
  const [patternLen, setPatternLen]     = useState(32)  // 16 or 32 steps
  const [aiMsg, setAiMsg]               = useState('')
  const [aiLoading, setAiLoading]       = useState(false)
  const [hasEntered, setHasEntered]     = useState(false)

  // ── Arrangement / Timeline ─────────────────────────────────────
  // arrangement[bar] = { patternId: 'A'|'B'|'C'|'D'|null, section: string|null }
  const [arrangement, setArrangement]   = useState(() => {
    const arr = Array(TOTAL_BARS).fill(null).map(() => ({ pattern: null, section: null }))
    return arr
  })
  const [sections, setSections]         = useState([]) // { bar, name, color }
  const [playheadBar, setPlayheadBar]   = useState(0)
  const [arrPlaying, setArrPlaying]     = useState(false)
  const [scrollX, setScrollX]           = useState(0)
  const [selectedSection, setSelSec]    = useState(null)
  const [dragPattern, setDragPattern]   = useState(null)
  const arrRef                          = useRef(null)

  // ── DJ Decks ───────────────────────────────────────────────────
  const [genre1, setGenre1]     = useState('Afrobeats')
  const [genre2, setGenre2]     = useState('House')
  const [crossfade, setCross]   = useState(50)
  const [d1play, setD1play]     = useState(false)
  const [d2play, setD2play]     = useState(false)
  const [pitch1, setPitch1]     = useState(0)
  const [pitch2, setPitch2]     = useState(0)
  const [vol1, setVol1]         = useState(80)
  const [vol2, setVol2]         = useState(80)
  const [masterVol, setMasterVol] = useState(90)
  const [eq1, setEq1]           = useState({ low:50, mid:50, high:50 })
  const [eq2, setEq2]           = useState({ low:50, mid:50, high:50 })
  const [effects, setEffects]   = useState([])
  const [track1, setTrack1]     = useState(GENRE_TRACKS['Afrobeats'][0])
  const [track2, setTrack2]     = useState(GENRE_TRACKS['House'][0])
  const [rotAngle, setRotAngle] = useState([0, 0])
  const [vu1, setVu1]           = useState(0)
  const [vu2, setVu2]           = useState(0)
  const d1R = useRef(d1play), d2R = useRef(d2play)
  d1R.current = d1play; d2R.current = d2play

  const gridRef = useRef(patterns)
  gridRef.current = patterns

  // ── Pattern Studio ─────────────────────────────────────────────
  useEffect(() => {
    if (!hasEntered) { setHasEntered(true); onXP(10); onBadge('dj_entered') }
  }, [])

  useEffect(() => {
    AE.volumes = volumes.map(v => v / 100)
    AE.muted   = muted.map((m, i) => soloTrack !== null ? i !== soloTrack : m)
  }, [volumes, muted, soloTrack])

  useEffect(() => {
    jarvisContext.update({ screen: 'mix', bpm, activePattern, genre: genre1 })
  }, [bpm, activePattern, genre1])

  const toggleCell = (ti, si) => {
    setPatterns(prev => {
      const next = { ...prev }
      const p    = next[activePattern].map(r => [...r])
      p[ti][si]  = !p[ti][si]
      next[activePattern] = p
      const steps = p.flat().filter(Boolean).length
      jarvisContext.update({ beatSteps: steps, action: 'toggle_cell' })
      return next
    })
  }

  const applyPreset = name => {
    const p = PRESETS[name]
    if (!p) return
    AE.stop(); setPlaying(false); setActiveStep(-1)
    setPatterns(prev => ({ ...prev, [activePattern]: p.map(r => [...r, ...r]) }))
  }

  const handlePlay = () => {
    AE.init(); AE.bpm = bpm
    if (playing) { AE.stop(); setPlaying(false); setActiveStep(-1) }
    else {
      AE.start(() => gridRef.current[activePattern], s => setActiveStep(s % patternLen))
      setPlaying(true)
      onXP(5); onBadge('first_beat')
    }
  }

  const getAIBeatTip = async () => {
    setAiLoading(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
      const pattern = patterns[activePattern]
      const active  = TRACKS.map((t, i) => ({ track: t.name, steps: pattern[i].map((v,j) => v ? j+1 : null).filter(Boolean) }))
      const res = await fetch(`${API_URL}/ai/beat-tip`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bpm, pattern: active, context: jarvisContext.getSummary() }),
      })
      const d = await res.json()
      setAiMsg(d.reply || '...')
    } catch { setAiMsg('AI connecting... try again') }
    setAiLoading(false)
  }

  // ── Arrangement ────────────────────────────────────────────────
  const placePattern = (bar, patId) => {
    setArrangement(prev => {
      const next = [...prev]
      next[bar] = { ...next[bar], pattern: next[bar].pattern === patId ? null : patId }
      return next
    })
  }

  const addSection = (bar, name) => {
    setSections(prev => {
      const filtered = prev.filter(s => s.bar !== bar)
      const colors = ['#FF6B35','#F472B6','#00D4FF','#A78BFA','#34D399','#FFD700','#FB923C','#60A5FA']
      return [...filtered, { bar, name, color: colors[prev.length % colors.length] }]
    })
  }

  const getAIArrangement = async () => {
    setAiLoading(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
      const placed  = arrangement.map((b, i) => b.pattern ? `Bar ${i+1}: Pattern ${b.pattern}` : null).filter(Boolean).join(', ')
      const res = await fetch(`${API_URL}/ai/arrange`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentArrangement: placed, bpm, patterns: Object.keys(patterns), context: jarvisContext.getSummary() }),
      })
      const d = await res.json()
      setAiMsg(d.reply || '...')
      // Auto-apply suggested arrangement
      if (d.arrangement) {
        const arr = Array(TOTAL_BARS).fill(null).map(() => ({ pattern: null, section: null }))
        d.arrangement.forEach(({ bar, pattern, section }) => {
          if (bar >= 0 && bar < TOTAL_BARS) {
            arr[bar] = { pattern, section: section || null }
          }
        })
        setArrangement(arr)
        onXP(150); onBadge('song_arranged')
      }
    } catch { setAiMsg('AI connecting...') }
    setAiLoading(false)
  }

  const clearArrangement = () => setArrangement(Array(TOTAL_BARS).fill(null).map(() => ({ pattern: null, section: null })))

  // ── DJ Decks animation ─────────────────────────────────────────
  useEffect(() => {
    let af
    const run = () => {
      setRotAngle(prev => [prev[0] + (d1R.current ? 1.8 : 0), prev[1] + (d2R.current ? 1.8 : 0)])
      setVu1(d1R.current ? 0.3 + Math.random() * 0.5 : 0)
      setVu2(d2R.current ? 0.3 + Math.random() * 0.5 : 0)
      af = requestAnimationFrame(run)
    }
    af = requestAnimationFrame(run)
    return () => cancelAnimationFrame(af)
  }, [])

  const toggleFx = id => setEffects(e => e.includes(id) ? e.filter(x => x !== id) : [...e, id])

  // ── Vinyl component ────────────────────────────────────────────
  const Vinyl = ({ angle, playing: p, color, sz = 110 }) => (
    <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center', width:sz, height:sz }}>
      <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:`conic-gradient(${color}15,${BASE_DARK},${color}08,${BASE_LIGHT},${color}15)`, border:`2px solid ${color}33`, transform:`rotate(${angle}deg)`, boxShadow:p?`0 0 30px ${color}55,0 0 60px ${color}22`:neu(), transition:p?'none':'box-shadow 0.3s' }}>
        {[0.25,0.35,0.45].map(r => <div key={r} style={{ position:'absolute', borderRadius:'50%', width:`${r*200}%`, height:`${r*200}%`, top:`${(0.5-r)*100}%`, left:`${(0.5-r)*100}%`, border:`1px solid ${color}15` }}/>)}
      </div>
      <div style={{ position:'absolute', width:sz*0.28, height:sz*0.28, borderRadius:'50%', background:BASE_LIGHT, boxShadow:neu(false,color), zIndex:2, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:sz*0.08, height:sz*0.08, borderRadius:'50%', background:p?color:'#ffffff22', boxShadow:p?`0 0 8px ${color}`:'' }}/>
      </div>
    </div>
  )

  // ── EQ Fader component ─────────────────────────────────────────
  const EQFader = ({ label, value, onChange, color }) => (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
      <div style={{ position:'relative', display:'flex', justifyContent:'center', height:80 }}>
        <div style={{ width:8, height:'100%', borderRadius:4, background:BASE_DARK, boxShadow:`inset 3px 3px 8px ${SHADOW_D}`, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', bottom:0, left:0, width:'100%', borderRadius:4, height:`${value}%`, background:`linear-gradient(180deg,${color}44,${color})`, boxShadow:`0 0 8px ${color}`, transition:'height 0.1s' }}/>
        </div>
        <input type="range" min={0} max={100} value={value} onChange={e => onChange(+e.target.value)}
          style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer', width:'100%', height:'100%', writingMode:'vertical-lr', direction:'rtl' }}/>
      </div>
      <span style={{ color, fontFamily:"'Orbitron',monospace", fontSize:7 }}>{label}</span>
      <span style={{ color:'#ffffff33', fontFamily:"'Orbitron',monospace", fontSize:7 }}>{value-50>0?'+':''}{value-50}</span>
    </div>
  )

  // ── PATTERN COLORS ─────────────────────────────────────────────
  const PAT_COLORS = { A: accentColor, B: '#F472B6', C: '#34D399', D: '#FFD700' }

  const s = { // shorthand styles
    label: { color:'#ffffff33', fontFamily:"'Orbitron',monospace", fontSize:8, letterSpacing:'0.2em', marginBottom:10 },
  }

  return (
    <div style={{ minHeight:'100vh', overflowY:'auto', paddingBottom:80, background:BASE, fontFamily:"'Exo 2',sans-serif" }}>
      <div style={{ maxWidth:800, margin:'0 auto', padding:'24px 16px 0' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <button onClick={() => { AE.stop(); onBack() }} style={{ color:accentColor, fontFamily:"'Orbitron',monospace", fontSize:9, letterSpacing:'0.15em', background:'none', border:'none', cursor:'pointer', opacity:0.7 }}>← BACK</button>
          <span style={{ color:accentColor, fontFamily:"'Orbitron',monospace", fontSize:13, fontWeight:700, letterSpacing:'0.15em' }}>PRODUCER STUDIO</span>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <span style={{ color:'#ffffff33', fontFamily:"'Orbitron',monospace", fontSize:9 }}>{bpm} BPM</span>
            <NeuBtn small color={playing?'#FF4444':accentColor} onClick={handlePlay}>{playing?'■':'▶'}</NeuBtn>
          </div>
        </div>

        <TabBar tabs={[['pattern','🥁 PATTERN'],['arrange','🎼 ARRANGE'],['dj','🎛️ DJ DECKS'],['mixer','🎚️ MIXER'],['fx','⚡ FX']]} active={tab} onSelect={setTab} color={accentColor}/>

        {/* ══ PATTERN STUDIO ══════════════════════════════════════ */}
        {tab === 'pattern' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Pattern selector + BPM + controls */}
            <NeuCard color={accentColor} style={{ padding:16 }}>
              <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>

                {/* Pattern selector */}
                <div>
                  <p style={s.label}>PATTERN</p>
                  <div style={{ display:'flex', gap:8 }}>
                    {['A','B','C','D'].map(p => (
                      <button key={p} onClick={() => { setActivePat(p); AE.stop(); setPlaying(false); setActiveStep(-1) }}
                        style={{ width:36, height:36, borderRadius:8, cursor:'pointer', fontFamily:"'Orbitron',monospace", fontSize:12, fontWeight:700, transition:'all 0.2s', background:activePattern===p?`${PAT_COLORS[p]}22`:BASE_DARK, boxShadow:activePattern===p?neu(false,PAT_COLORS[p]):neu(true), border:`1px solid ${activePattern===p?PAT_COLORS[p]+'66':'transparent'}`, color:PAT_COLORS[p] }}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* BPM */}
                <div>
                  <p style={s.label}>BPM</p>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <NeuBtn small round color={accentColor} onClick={() => setBpm(b => Math.max(60,b-1))}>−</NeuBtn>
                    <input type="number" value={bpm} onChange={e => setBpm(Math.max(60,Math.min(200,+e.target.value)))}
                      style={{ width:52, background:'transparent', border:'none', outline:'none', textAlign:'center', fontFamily:"'Orbitron',monospace", fontSize:20, fontWeight:900, color:accentColor }}/>
                    <NeuBtn small round color={accentColor} onClick={() => setBpm(b => Math.min(200,b+1))}>+</NeuBtn>
                  </div>
                </div>

                {/* Steps */}
                <div>
                  <p style={s.label}>STEPS</p>
                  <div style={{ display:'flex', gap:6 }}>
                    {[16,32].map(l => <NeuBtn key={l} small color={patternLen===l?accentColor:'#ffffff44'} onClick={()=>setPatternLen(l)} pressed={patternLen===l}>{l}</NeuBtn>)}
                  </div>
                </div>

                {/* Presets */}
                <div style={{ flex:1 }}>
                  <p style={s.label}>PRESETS</p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {Object.keys(PRESETS).map(p => <NeuBtn key={p} small color={accentColor} onClick={() => applyPreset(p)}>{p}</NeuBtn>)}
                  </div>
                </div>
              </div>
            </NeuCard>

            {/* Sequencer Grid */}
            <NeuCard color={accentColor} style={{ padding:16 }}>
              <div style={{ overflowX:'auto' }}>
                {/* Beat markers */}
                <div style={{ display:'flex', gap:2, marginBottom:8, marginLeft:68 }}>
                  {[...Array(patternLen)].map((_,i) => (
                    <div key={i} style={{ flex:1, textAlign:'center', color:activeStep===i?accentColor:'#ffffff22', fontFamily:"'Orbitron',monospace", fontSize:7, fontWeight:700, minWidth:14 }}>
                      {i%4===0 ? i/4+1 : i%2===0 ? '·' : ''}
                    </div>
                  ))}
                </div>

                {TRACKS.map((tk, ti) => (
                  <div key={tk.id} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    {/* Track controls */}
                    <div style={{ width:60, flexShrink:0, display:'flex', alignItems:'center', gap:6 }}>
                      {/* Mute */}
                      <button onClick={() => setMuted(m => { const n=[...m]; n[ti]=!n[ti]; return n })}
                        style={{ width:10, height:10, borderRadius:'50%', border:'none', cursor:'pointer', flexShrink:0, background:muted[ti]?BASE_DARK:tk.color, boxShadow:muted[ti]?'':neu(false,tk.color), transition:'all 0.2s' }}/>
                      {/* Solo */}
                      <button onClick={() => setSoloTrack(s => s === ti ? null : ti)}
                        style={{ width:10, height:10, borderRadius:'50%', border:'none', cursor:'pointer', flexShrink:0, background:soloTrack===ti?'#FFD700':BASE_DARK, boxShadow:soloTrack===ti?neu(false,'#FFD700'):'', fontSize:0 }}/>
                      <span style={{ color:(muted[ti]&&soloTrack===null)?'#ffffff22':tk.color, fontFamily:"'Orbitron',monospace", fontSize:7, letterSpacing:'0.03em' }}>{tk.name}</span>
                    </div>

                    {/* Step buttons */}
                    <div style={{ display:'flex', gap:2, flex:1, minWidth:0 }}>
                      {patterns[activePattern][ti].slice(0, patternLen).map((on, si) => {
                        const isA = activeStep === si && playing
                        const isB = si % 4 === 0
                        const isE = si % 8 === 0
                        return (
                          <button key={si} onClick={() => toggleCell(ti, si)}
                            style={{
                              flex:1, minWidth:14, height:24, borderRadius:3, cursor:'pointer', border:'none', transition:'all 0.07s',
                              background: on ? (isA ? tk.color : `${tk.color}99`) : isE ? '#ffffff0d' : isB ? '#ffffff08' : '#ffffff05',
                              boxShadow: on ? (isA ? `0 0 12px ${tk.color}` : '') : '',
                              transform: isA && on ? 'scale(1.1)' : 'scale(1)',
                              outline: isE ? `1px solid #ffffff12` : 'none',
                            }}/>
                        )
                      })}
                    </div>

                    {/* Volume */}
                    <div style={{ width:40, flexShrink:0 }}>
                      <input type="range" min={0} max={100} value={volumes[ti]}
                        onChange={e => setVolumes(v => { const n=[...v]; n[ti]=+e.target.value; return n })}
                        style={{ width:'100%', accentColor:tk.color }}/>
                    </div>
                  </div>
                ))}
              </div>
            </NeuCard>

            {/* AI Producer */}
            <NeuCard color={accentColor} style={{ padding:16 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <span style={{ color:accentColor, fontFamily:"'Orbitron',monospace", fontSize:9 }}>🤖 AI PRODUCER</span>
                <NeuBtn small color={accentColor} onClick={getAIBeatTip} disabled={aiLoading}>{aiLoading?'THINKING...':'ANALYZE BEAT'}</NeuBtn>
              </div>
              {aiMsg && <div style={{ padding:12, borderRadius:12, background:BASE_DARK, boxShadow:`inset 3px 3px 8px ${SHADOW_D}`, color:'#ffffffcc', fontSize:13, lineHeight:1.6 }}>{aiMsg}</div>}
            </NeuCard>
          </div>
        )}

        {/* ══ SONG ARRANGER ════════════════════════════════════════ */}
        {tab === 'arrange' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Controls */}
            <NeuCard color={accentColor} style={{ padding:16 }}>
              <div style={{ display:'flex', gap:12, alignItems:'flex-start', flexWrap:'wrap' }}>
                <div>
                  <p style={s.label}>DRAG PATTERN TO BARS</p>
                  <div style={{ display:'flex', gap:8 }}>
                    {['A','B','C','D'].map(p => (
                      <div key={p}
                        draggable onDragStart={() => setDragPattern(p)} onDragEnd={() => setDragPattern(null)}
                        style={{ width:48, height:48, borderRadius:10, cursor:'grab', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2, background:BASE_DARK, boxShadow:neu(false,PAT_COLORS[p]), border:`1px solid ${PAT_COLORS[p]}55`, color:PAT_COLORS[p], fontFamily:"'Orbitron',monospace", fontSize:16, fontWeight:900, userSelect:'none' }}>
                        {p}
                        <span style={{ fontSize:7, letterSpacing:'0.1em' }}>PATTERN</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ flex:1 }}>
                  <p style={s.label}>SONG SECTIONS</p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {SECTION_NAMES.map(n => (
                      <button key={n} onClick={() => setSelSec(s => s === n ? null : n)}
                        style={{ padding:'4px 10px', borderRadius:6, cursor:'pointer', fontFamily:"'Orbitron',monospace", fontSize:8, background:selectedSection===n?accentColor+'22':BASE_DARK, border:`1px solid ${selectedSection===n?accentColor+'66':'#ffffff15'}`, color:selectedSection===n?accentColor:'#ffffff55' }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <NeuBtn small color="#A78BFA" onClick={getAIArrangement} disabled={aiLoading}>{aiLoading?'...':'🤖 AI ARRANGE'}</NeuBtn>
                  <NeuBtn small color="#FF4444" onClick={clearArrangement}>CLEAR ALL</NeuBtn>
                </div>
              </div>
              {aiMsg && <div style={{ marginTop:12, padding:12, borderRadius:12, background:BASE_DARK, color:'#ffffffcc', fontSize:12, lineHeight:1.5 }}>🤖 {aiMsg}</div>}
            </NeuCard>

            {/* Timeline */}
            <NeuCard color={accentColor} style={{ padding:16 }}>
              <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:12 }}>
                <span style={{ color:accentColor, fontFamily:"'Orbitron',monospace", fontSize:9 }}>SONG TIMELINE — {TOTAL_BARS} BARS</span>
                <div style={{ flex:1 }}/>
                <span style={{ color:'#ffffff33', fontFamily:"'Orbitron',monospace", fontSize:9 }}>
                  {arrangement.filter(b=>b.pattern).length} / {TOTAL_BARS} bars filled
                </span>
              </div>

              <div ref={arrRef} style={{ overflowX:'auto', paddingBottom:8 }}>
                {/* Bar numbers */}
                <div style={{ display:'flex', marginBottom:4, minWidth:TOTAL_BARS*BAR_WIDTH/4 }}>
                  {[...Array(TOTAL_BARS)].map((_,i) => (
                    <div key={i} style={{ width:BAR_WIDTH/4, flexShrink:0, textAlign:'center', color:i%4===0?'#ffffff44':'#ffffff15', fontFamily:"'Orbitron',monospace", fontSize:7 }}>
                      {i%4===0 ? i+1 : ''}
                    </div>
                  ))}
                </div>

                {/* Section labels row */}
                <div style={{ position:'relative', height:20, minWidth:TOTAL_BARS*BAR_WIDTH/4, marginBottom:4 }}>
                  {sections.map(sec => (
                    <div key={`${sec.bar}-${sec.name}`}
                      style={{ position:'absolute', left:sec.bar*(BAR_WIDTH/4), height:'100%', padding:'2px 6px', borderRadius:4, background:`${sec.color}33`, border:`1px solid ${sec.color}55`, color:sec.color, fontFamily:"'Orbitron',monospace", fontSize:7, whiteSpace:'nowrap' }}>
                      {sec.name}
                    </div>
                  ))}
                </div>

                {/* Arrangement grid — one row per track, bars as columns */}
                <div style={{ display:'grid', gridTemplateRows:`repeat(8,${TRACK_HEIGHT}px)`, minWidth:TOTAL_BARS*BAR_WIDTH/4, border:`1px solid #ffffff10`, borderRadius:8, overflow:'hidden' }}>
                  {TRACKS.map((tk, ti) => (
                    <div key={tk.id} style={{ display:'flex', borderBottom:`1px solid #ffffff08`, background:ti%2===0?BASE_DARK:BASE_LIGHT+'88' }}>
                      {/* Track label */}
                      <div style={{ width:52, flexShrink:0, display:'flex', alignItems:'center', padding:'0 8px', borderRight:`1px solid #ffffff10`, background:BASE_DARK }}>
                        <span style={{ color:tk.color, fontFamily:"'Orbitron',monospace", fontSize:7 }}>{tk.name}</span>
                      </div>

                      {/* Bars */}
                      <div style={{ display:'flex', flex:1 }}>
                        {[...Array(TOTAL_BARS)].map((_,bar) => {
                          const cell = arrangement[bar]
                          const hasPat = cell?.pattern
                          const patColor = hasPat ? PAT_COLORS[cell.pattern] : null
                          const patData = hasPat ? patterns[cell.pattern][ti] : null
                          const miniH = TRACK_HEIGHT - 12

                          return (
                            <div key={bar}
                              onClick={() => {
                                if (dragPattern) { placePattern(bar, dragPattern) }
                                else if (selectedSection) { addSection(bar, selectedSection) }
                                else if (hasPat) { placePattern(bar, cell.pattern) }
                              }}
                              onDragOver={e => e.preventDefault()}
                              onDrop={() => { if(dragPattern) placePattern(bar, dragPattern) }}
                              style={{
                                width:BAR_WIDTH/4, flexShrink:0, height:TRACK_HEIGHT, borderRight:`1px solid #ffffff06`,
                                cursor:'pointer', position:'relative', background:hasPat?`${patColor}18`:'transparent',
                                transition:'background 0.15s',
                              }}>
                              {hasPat && ti === 0 && (
                                // Pattern label on first track row
                                <div style={{ position:'absolute', top:2, left:2, fontFamily:"'Orbitron',monospace", fontSize:7, color:patColor, fontWeight:700, zIndex:1 }}>{cell.pattern}</div>
                              )}
                              {hasPat && patData && (
                                // Mini pattern preview
                                <div style={{ position:'absolute', inset:'6px 2px 4px', display:'flex', gap:0.5, alignItems:'flex-end' }}>
                                  {patData.slice(0,16).map((on, si) => (
                                    <div key={si} style={{ flex:1, height:on?(6+Math.random()*6):2, background:on?patColor:`${patColor}22`, borderRadius:0.5, minWidth:2 }}/>
                                  ))}
                                </div>
                              )}
                              {!hasPat && bar%4===0 && <div style={{ position:'absolute', inset:0, borderLeft:`1px solid #ffffff12` }}/>}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p style={{ color:'#ffffff33', fontSize:11, marginTop:10 }}>💡 Drag patterns A-D onto bars, or click to place. Click a filled bar to remove. Select a section label then click a bar to mark it.</p>
            </NeuCard>
          </div>
        )}

        {/* ══ DJ DECKS ════════════════════════════════════════════ */}
        {tab === 'dj' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {[{g:genre1,setG:setGenre1,t:track1,setT:setTrack1,p:d1play,setP:setD1play,ang:rotAngle[0],color:accentColor,pt:pitch1,setPt:setPitch1,v:vol1,setV:setVol1,vu:vu1,idx:0},
                {g:genre2,setG:setGenre2,t:track2,setT:setTrack2,p:d2play,setP:setD2play,ang:rotAngle[1],color:'#F472B6',pt:pitch2,setPt:setPitch2,v:vol2,setV:setVol2,vu:vu2,idx:1}
              ].map(d => (
                <NeuCard key={d.idx} color={d.color} style={{ padding:16, display:'flex', flexDirection:'column', gap:12 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ color:d.color, fontFamily:"'Orbitron',monospace", fontSize:9, letterSpacing:'0.15em' }}>DECK {d.idx+1}</span>
                    <VuMeter level={d.vu} color={d.color}/>
                  </div>
                  <div style={{ display:'flex', justifyContent:'center' }}><Vinyl angle={d.ang} playing={d.p} color={d.color}/></div>
                  <div style={{ textAlign:'center', color:'#ffffffaa', fontSize:10, minHeight:24 }}>{d.t}</div>
                  <select value={d.g} onChange={e=>{d.setG(e.target.value);d.setT(GENRE_TRACKS[e.target.value][0])}}
                    style={{ width:'100%', background:BASE_DARK, borderRadius:8, padding:'6px 8px', color:d.color, fontFamily:"'Orbitron',monospace", fontSize:7, border:'none', boxShadow:`inset 3px 3px 8px ${SHADOW_D}`, cursor:'pointer' }}>
                    {Object.keys(GENRE_TRACKS).map(g=><option key={g} value={g} style={{background:BASE_DARK}}>{g}</option>)}
                  </select>
                  <NeuBtn color={d.p?'#FF4444':d.color} onClick={()=>d.setP(x=>!x)} style={{width:'100%',textAlign:'center'}}>{d.p?'■ STOP':'▶ PLAY'}</NeuBtn>
                  <div><p style={{...s.label,marginBottom:4}}>PITCH {d.pt>0?'+':''}{d.pt}%</p><input type="range" min={-8} max={8} step={0.5} value={d.pt} onChange={e=>d.setPt(+e.target.value)} style={{width:'100%',accentColor:d.color}}/></div>
                  <div><p style={{...s.label,marginBottom:4}}>VOL {d.v}%</p><input type="range" min={0} max={100} value={d.v} onChange={e=>d.setV(+e.target.value)} style={{width:'100%',accentColor:d.color}}/></div>
                </NeuCard>
              ))}
            </div>

            {/* Crossfader */}
            <NeuCard color={accentColor} style={{ padding:20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ color:accentColor, fontFamily:"'Orbitron',monospace", fontSize:9 }}>{genre1}</span>
                <span style={{ color:'#ffffff44', fontFamily:"'Orbitron',monospace", fontSize:9 }}>CROSSFADER</span>
                <span style={{ color:'#F472B6', fontFamily:"'Orbitron',monospace", fontSize:9 }}>{genre2}</span>
              </div>
              <div style={{ position:'relative', height:16 }}>
                <div style={{ position:'absolute', inset:0, borderRadius:8, background:BASE_DARK, boxShadow:`inset 3px 3px 8px ${SHADOW_D}` }}/>
                <div style={{ position:'absolute', top:0, left:0, height:'100%', borderRadius:'8px 0 0 8px', width:`${Math.min(crossfade,50)}%`, background:`linear-gradient(90deg,${accentColor}88,${accentColor}22)` }}/>
                <div style={{ position:'absolute', top:0, right:0, height:'100%', borderRadius:'0 8px 8px 0', width:`${Math.min(100-crossfade,50)}%`, background:`linear-gradient(270deg,#F472B688,#F472B622)` }}/>
                <input type="range" min={0} max={100} value={crossfade} onChange={e=>setCross(+e.target.value)} style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0, cursor:'pointer' }}/>
              </div>
              <div style={{ textAlign:'center', marginTop:8, color:'#ffffff33', fontFamily:"'Orbitron',monospace", fontSize:9 }}>
                {crossfade<40?'← DECK 1':crossfade>60?'DECK 2 →':'◆ CENTER'}
              </div>
            </NeuCard>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <NeuCard color={accentColor} style={{ padding:16 }}>
                <p style={s.label}>MASTER VOL {masterVol}%</p>
                <input type="range" min={0} max={100} value={masterVol} onChange={e=>setMasterVol(+e.target.value)} style={{width:'100%',accentColor}}/>
              </NeuCard>
              <NeuCard color="#A78BFA" style={{ padding:16, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <NeuBtn color="#A78BFA" onClick={getAIBeatTip} disabled={aiLoading} small>{aiLoading?'...':'🤖 AI DJ TIP'}</NeuBtn>
              </NeuCard>
            </div>
            {aiMsg && <NeuCard color="#A78BFA" style={{ padding:16 }}><p style={{ color:'#ffffffcc', fontSize:13, lineHeight:1.5 }}>🤖 {aiMsg}</p></NeuCard>}
          </div>
        )}

        {/* ══ MIXER / EQ ═════════════════════════════════════════ */}
        {tab === 'mixer' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {[{label:'DECK 1',eq:eq1,setEq:setEq1,color:accentColor,g:genre1,tracks:GENRE_TRACKS[genre1],current:track1,setT:setTrack1},
                {label:'DECK 2',eq:eq2,setEq:setEq2,color:'#F472B6',g:genre2,tracks:GENRE_TRACKS[genre2],current:track2,setT:setTrack2}].map(d=>(
                <NeuCard key={d.label} color={d.color} style={{ padding:20 }}>
                  <p style={{ color:d.color, fontFamily:"'Orbitron',monospace", fontSize:9, letterSpacing:'0.15em', marginBottom:16 }}>{d.label} EQ</p>
                  <div style={{ display:'flex', justifyContent:'space-around', marginBottom:16 }}>
                    {[['LOW','low'],['MID','mid'],['HIGH','high']].map(([l,k]) => (
                      <EQFader key={k} label={l} value={d.eq[k]} onChange={v=>d.setEq(e=>({...e,[k]:v}))} color={d.color}/>
                    ))}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {d.tracks.map(t => (
                      <button key={t} onClick={()=>d.setT(t)}
                        style={{ padding:'8px 12px', borderRadius:8, cursor:'pointer', textAlign:'left', fontFamily:"'Orbitron',monospace", fontSize:8, transition:'all 0.15s', background:d.current===t?`${d.color}20`:BASE_DARK, boxShadow:d.current===t?neu(false,d.color):neu(true), color:d.current===t?d.color:'#ffffff55', border:`1px solid ${d.current===t?d.color+'44':'transparent'}` }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </NeuCard>
              ))}
            </div>

            {/* EQ Visualizer */}
            <NeuCard color={accentColor} style={{ padding:20 }}>
              <p style={s.label}>EQ VISUALIZER</p>
              <div style={{ display:'flex', gap:2, alignItems:'flex-end', height:70 }}>
                {[...Array(32)].map((_,i) => {
                  const h = Math.abs(Math.sin(i*0.5+eq1.low/50))*40*(eq1.low/50)+Math.abs(Math.cos(i*0.35+eq1.mid/50))*20+4
                  return <div key={i} style={{ flex:1, borderRadius:'2px 2px 0 0', transition:'height 0.3s', height:Math.max(3,h), background:i<10?accentColor:i<22?'#A78BFA':'#F472B6', opacity:0.75 }}/>
                })}
              </div>
            </NeuCard>
          </div>
        )}

        {/* ══ FX BOARD ═══════════════════════════════════════════ */}
        {tab === 'fx' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <NeuCard color={accentColor} style={{ padding:20 }}>
              <p style={s.label}>FX BOARD</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
                {FX_LIST.map(fx => {
                  const on = effects.includes(fx.id)
                  return (
                    <button key={fx.id} onClick={() => toggleFx(fx.id)}
                      style={{ padding:16, borderRadius:12, cursor:'pointer', transition:'all 0.2s', display:'flex', flexDirection:'column', alignItems:'center', gap:10, background:on?`${fx.color}20`:BASE_DARK, boxShadow:on?neu(false,fx.color):neu(true), border:`1px solid ${on?fx.color+'55':'transparent'}`, transform:on?'scale(1.05)':'scale(1)' }}>
                      <div style={{ width:36, height:36, borderRadius:'50%', background:on?fx.color:BASE_LIGHT, boxShadow:on?`0 0 14px ${fx.color}`:neu(), transition:'all 0.2s' }}/>
                      <span style={{ color:on?fx.color:'#ffffff44', fontFamily:"'Orbitron',monospace", fontSize:7, textAlign:'center', letterSpacing:'0.08em' }}>{fx.name}</span>
                    </button>
                  )
                })}
              </div>
            </NeuCard>

            {effects.length > 0 && (
              <NeuCard color={accentColor} style={{ padding:16 }}>
                <p style={s.label}>SIGNAL CHAIN</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8, alignItems:'center' }}>
                  {effects.map((id, i) => {
                    const fx = FX_LIST.find(f => f.id === id)
                    return fx ? (
                      <div key={id} style={{ display:'flex', alignItems:'center', gap:6 }}>
                        {i > 0 && <span style={{ color:'#ffffff33', fontSize:14 }}>→</span>}
                        <div style={{ padding:'6px 12px', borderRadius:8, background:`${fx.color}20`, border:`1px solid ${fx.color}55`, color:fx.color, fontFamily:"'Orbitron',monospace", fontSize:9 }}>{fx.name}</div>
                      </div>
                    ) : null
                  })}
                </div>
              </NeuCard>
            )}

            <NeuCard color="#A78BFA" style={{ padding:16 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <span style={{ color:'#A78BFA', fontFamily:"'Orbitron',monospace", fontSize:9 }}>🤖 AI TRANSITION ADVISOR</span>
                <NeuBtn small color="#A78BFA" onClick={getAIBeatTip} disabled={aiLoading}>{aiLoading?'...':'GET TIP'}</NeuBtn>
              </div>
              {aiMsg
                ? <p style={{ color:'#ffffffcc', fontSize:13, lineHeight:1.5 }}>{aiMsg}</p>
                : <p style={{ color:'#ffffff33', fontSize:12 }}>Get AI advice on your mix, transitions, and FX chain.</p>}
            </NeuCard>
          </div>
        )}

      </div>
    </div>
  )
}
