import { useState } from 'react'
import { BASE, BASE_LIGHT, BASE_DARK, SHADOW_D, SHADOW_L, neu, getLevel, getLvPct } from '../design.js'

export function NeuBtn({ children, onClick, color, pressed=false, small=false, disabled=false, round=false, className='', style={} }) {
  const [isP, setIsP] = useState(false)
  const ac = color || '#00D4FF'
  return (
    <button
      onMouseDown={() => setIsP(true)} onMouseUp={() => setIsP(false)} onMouseLeave={() => setIsP(false)}
      onClick={onClick} disabled={disabled}
      className={className}
      style={{
        fontFamily: "'Orbitron',monospace",
        fontSize: small ? 9 : 11,
        padding: round ? (small ? '10px' : '14px') : (small ? '6px 14px' : '10px 22px'),
        borderRadius: round ? '50%' : 8,
        background: BASE_LIGHT,
        boxShadow: (isP || pressed) ? neu(true) : neu(false, ac),
        border: `1px solid ${disabled ? '#ffffff10' : ac + '33'}`,
        color: disabled ? '#ffffff22' : ac,
        transform: (isP || pressed) ? 'scale(0.97)' : 'scale(1)',
        opacity: disabled ? 0.5 : 1,
        letterSpacing: '0.12em',
        fontWeight: 700,
        textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s',
        userSelect: 'none',
        ...style,
      }}>
      {children}
    </button>
  )
}

export function NeuCard({ children, color='#00D4FF', className='', style={}, onClick }) {
  return (
    <div className={className} onClick={onClick}
      style={{
        background: BASE_LIGHT,
        boxShadow: `8px 8px 20px ${SHADOW_D}, -4px -4px 14px ${SHADOW_L}`,
        border: `1px solid ${color}18`,
        borderRadius: 16,
        ...style,
      }}>
      {children}
    </div>
  )
}

export function XPBar({ xp, color }) {
  const lv = getLevel(xp), pct = getLvPct(xp)
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <span style={{ fontFamily:"'Orbitron',monospace", fontSize:10, color:lv.color }}>{lv.icon} {lv.name}</span>
        <span style={{ fontFamily:"'Orbitron',monospace", fontSize:10, color }}>{xp} XP</span>
      </div>
      <div style={{ background:SHADOW_D, boxShadow:`inset 3px 3px 8px ${SHADOW_D}`, height:8, borderRadius:4, overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, height:'100%', borderRadius:4, background:`linear-gradient(90deg,${color}88,${color})`, boxShadow:`0 0 10px ${color}`, transition:'width 0.7s ease' }}/>
      </div>
    </div>
  )
}

export function BackBtn({ onBack, color }) {
  return (
    <button onClick={onBack}
      style={{ color, fontFamily:"'Orbitron',monospace", fontSize:9, letterSpacing:'0.15em', background:'none', border:'none', opacity:0.6, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}
      onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0.6}>
      ← BACK
    </button>
  )
}

export function VuMeter({ level=0, color='#00D4FF', bars=12 }) {
  return (
    <div style={{ display:'flex', gap:2, alignItems:'flex-end', height:32 }}>
      {Array(bars).fill(0).map((_,i) => {
        const lit = i < Math.floor(level * bars)
        const c   = i > 9 ? '#FF4444' : i > 7 ? '#FFD700' : color
        return <div key={i} style={{ width:4, height:4+i*2.3, background:lit?c:`${c}22`, borderRadius:1, transition:'background 0.08s' }}/>
      })}
    </div>
  )
}

export function TabBar({ tabs, active, onSelect, color }) {
  return (
    <div style={{ display:'flex', gap:8, padding:4, borderRadius:12, background:BASE_DARK, marginBottom:20 }}>
      {tabs.map(([id, label]) => (
        <button key={id} onClick={() => onSelect(id)}
          style={{
            flex:1, padding:'10px 0', borderRadius:10, cursor:'pointer', transition:'all 0.2s',
            fontFamily:"'Orbitron',monospace", fontSize:9, letterSpacing:'0.08em',
            background: active === id ? BASE_LIGHT : 'transparent',
            boxShadow: active === id ? neu(false, color) : 'none',
            color: active === id ? color : '#ffffff33',
            border: active === id ? `1px solid ${color}33` : '1px solid transparent',
          }}>
          {label}
        </button>
      ))}
    </div>
  )
}

export function Spinner({ color='#00D4FF', size=32 }) {
  return (
    <div style={{ display:'inline-block', fontSize:size, animation:'spin 1.2s linear infinite' }}>🎵</div>
  )
}

export function Modal({ children, onClose, color='#00D4FF' }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'#00000088', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{ background:BASE_LIGHT, borderRadius:20, padding:24, maxWidth:480, width:'90%', boxShadow:neu(false,color), border:`1px solid ${color}33`, animation:'fadeUp 0.3s ease' }}>
        {children}
      </div>
    </div>
  )
}

export function Toast({ message, color='#00D4FF', onDone }) {
  useState(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t) })
  return (
    <div style={{
      position:'fixed', bottom:24, right:24, zIndex:2000,
      background:BASE_LIGHT, border:`1px solid ${color}55`,
      boxShadow:neu(false,color), borderRadius:12, padding:'12px 20px',
      color, fontFamily:"'Orbitron',monospace", fontSize:11,
      animation:'slideIn 0.4s ease',
    }}>
      {message}
    </div>
  )
}
