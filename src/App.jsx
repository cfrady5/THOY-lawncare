import { useState } from 'react'
import './App.css'

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function Logo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 3C13 3 5 12 5 24C5 35 13 44 24 45C35 44 43 35 43 24C43 12 35 3 24 3Z" fill="#1a5c2a" />
      <path d="M24 45V22" stroke="#2d7a3a" strokeWidth="1.5" strokeLinecap="round" />
      <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle"
        fontFamily="system-ui, Arial, sans-serif" fontWeight="800" fontSize="17" fill="white" letterSpacing="-1">
        TH
      </text>
    </svg>
  )
}

function PhoneIcon({ size = 18, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.06 2.2 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" />
    </svg>
  )
}

function MailIcon({ size = 18, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

function MapPinIcon({ size = 18, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function ArrowRightIcon({ size = 16, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <circle cx="11" cy="11" r="11" fill="#1a5c2a" />
      <path d="M6.5 11.5l3 3 6-6.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

// ─── Service Icons ─────────────────────────────────────────────────────────────

function ServiceIcon({ children }) {
  return (
    <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f0f7f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </div>
  )
}

function MowingIcon() {
  return (
    <ServiceIcon>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <g stroke="#1a5c2a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="17" width="18" height="10" rx="2" fill="none" />
          <path d="M22 17L26 10" />
          <circle cx="11" cy="29" r="3" fill="none" />
          <circle cx="23" cy="29" r="3" fill="none" />
          <path d="M6 31h22" />
          <path d="M4 34h28" />
        </g>
      </svg>
    </ServiceIcon>
  )
}

function CleanupIcon() {
  return (
    <ServiceIcon>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <g stroke="#1a5c2a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 28C10 22 11 15 15 12C18 16 17 23 14 28Z" fill="none" />
          <path d="M26 28C30 22 29 15 25 12C22 16 23 23 26 28Z" fill="none" />
          <path d="M20 12V32" />
          <path d="M12 32h16" />
        </g>
      </svg>
    </ServiceIcon>
  )
}

function MulchingIcon() {
  return (
    <ServiceIcon>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <g stroke="#1a5c2a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 32C8 26 13 20 20 20C27 20 32 26 32 32Z" fill="none" />
          <circle cx="17" cy="23" r="1.5" fill="#1a5c2a" stroke="none" />
          <circle cx="20" cy="21" r="1.5" fill="#1a5c2a" stroke="none" />
          <circle cx="23" cy="23" r="1.5" fill="#1a5c2a" stroke="none" />
          <path d="M8 32h24" />
        </g>
      </svg>
    </ServiceIcon>
  )
}

function EdgeIcon() {
  return (
    <ServiceIcon>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <g stroke="#1a5c2a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 32V24" />
          <path d="M13 32V19" />
          <path d="M18 32V22" />
          <path d="M23 32V17" />
          <path d="M28 32V22" />
          <path d="M33 32V24" />
          <path d="M6 32h28" strokeWidth="2.5" />
        </g>
      </svg>
    </ServiceIcon>
  )
}

// ─── Hero Illustration ─────────────────────────────────────────────────────────

function HeroIllustration() {
  return (
    <svg viewBox="0 0 520 460" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      {/* Background */}
      <rect width="520" height="460" fill="#eef5ee" rx="20" />

      {/* Clouds */}
      <ellipse cx="390" cy="58" rx="55" ry="20" fill="white" opacity="0.9" />
      <ellipse cx="430" cy="52" rx="40" ry="17" fill="white" opacity="0.9" />
      <ellipse cx="360" cy="63" rx="32" ry="14" fill="white" opacity="0.85" />
      <ellipse cx="115" cy="72" rx="44" ry="17" fill="white" opacity="0.8" />
      <ellipse cx="148" cy="66" rx="33" ry="15" fill="white" opacity="0.8" />

      {/* House */}
      <rect x="345" y="155" width="130" height="115" fill="#e0e0e0" />
      <polygon points="340,160 480,160 410,95" fill="#cecece" />
      {/* door */}
      <rect x="385" y="215" width="34" height="55" rx="2" fill="#b0bac4" />
      {/* windows */}
      <rect x="352" y="178" width="28" height="26" rx="2" fill="#b8d4e8" />
      <rect x="422" y="178" width="28" height="26" rx="2" fill="#b8d4e8" />
      <line x1="366" y1="178" x2="352" y2="192" stroke="white" strokeWidth="1.5" opacity="0.5" />
      <line x1="436" y1="178" x2="422" y2="192" stroke="white" strokeWidth="1.5" opacity="0.5" />

      {/* Big green tree left */}
      <ellipse cx="180" cy="195" rx="60" ry="75" fill="#2a7038" />
      <ellipse cx="180" cy="172" rx="46" ry="58" fill="#389048" />
      <rect x="172" y="268" width="16" height="32" fill="#7a5c30" />

      {/* Smaller gray tree bg */}
      <ellipse cx="295" cy="208" rx="32" ry="42" fill="#adadad" opacity="0.6" />
      <rect x="290" y="248" width="10" height="22" fill="#909090" opacity="0.6" />

      {/* Bushes right */}
      <ellipse cx="465" cy="272" rx="32" ry="19" fill="#2a7038" />
      <ellipse cx="449" cy="277" rx="24" ry="15" fill="#389048" />
      <ellipse cx="483" cy="278" rx="22" ry="14" fill="#247030" />

      {/* Ground / lawn */}
      <rect x="0" y="285" width="520" height="175" fill="#389048" />
      {/* mowing stripe pattern */}
      <rect x="0" y="285" width="520" height="35" fill="#2a7038" />
      <rect x="0" y="320" width="520" height="35" fill="#389048" />
      <rect x="0" y="355" width="520" height="35" fill="#2a7038" />
      <rect x="0" y="390" width="520" height="35" fill="#389048" />
      <rect x="0" y="425" width="520" height="35" fill="#2a7038" />

      {/* ── MOWER ── */}
      {/* mower deck red */}
      <rect x="75" y="325" width="130" height="48" rx="10" fill="#cc2200" />
      {/* mower top housing */}
      <rect x="88" y="315" width="106" height="18" rx="5" fill="#aa1a00" />
      {/* engine block */}
      <rect x="112" y="303" width="62" height="18" rx="4" fill="#333" />
      {/* handle bars */}
      <path d="M190 320 L212 278 L238 262" stroke="#222" strokeWidth="10" strokeLinecap="round" fill="none" />
      <line x1="218" y1="270" x2="244" y2="260" stroke="#2a2a2a" strokeWidth="8" strokeLinecap="round" />

      {/* Rear wheel */}
      <circle cx="185" cy="378" rx="24" ry="24" fill="#1a1a1a" />
      <circle cx="185" cy="378" r="12" fill="#3a3a3a" />
      <circle cx="185" cy="378" r="5" fill="#555" />
      {/* Front wheel */}
      <circle cx="102" cy="378" r="20" fill="#1a1a1a" />
      <circle cx="102" cy="378" r="10" fill="#3a3a3a" />
      <circle cx="102" cy="378" r="4" fill="#555" />

      {/* Grass clippings */}
      <circle cx="68" cy="338" r="4" fill="#389048" opacity="0.9" />
      <circle cx="57" cy="346" r="3" fill="#2a7038" opacity="0.8" />
      <circle cx="65" cy="354" r="3.5" fill="#50a050" opacity="0.9" />
      <circle cx="52" cy="338" r="2.5" fill="#389048" opacity="0.7" />

      {/* ── PERSON ── */}
      {/* shoes */}
      <ellipse cx="252" cy="404" rx="17" ry="7" fill="#f0f0f0" />
      <ellipse cx="290" cy="404" rx="17" ry="7" fill="#f0f0f0" />
      {/* legs */}
      <rect x="244" y="354" width="24" height="52" rx="8" fill="#111" />
      <rect x="276" y="354" width="24" height="52" rx="8" fill="#111" />
      {/* torso - gray cutoff shirt */}
      <rect x="234" y="268" width="78" height="94" rx="12" fill="#d0d0d0" />
      <path d="M260 268 Q271 257 282 268" fill="#bbb" />
      {/* bare arms skin */}
      <path d="M234 282 Q200 308 188 330" stroke="#e8b090" strokeWidth="22" strokeLinecap="round" fill="none" />
      <path d="M312 282 Q342 300 352 286" stroke="#e8b090" strokeWidth="22" strokeLinecap="round" fill="none" />
      {/* left hand on handle */}
      <circle cx="190" cy="330" r="11" fill="#e8b090" />
      {/* neck */}
      <rect x="259" y="250" width="24" height="22" rx="9" fill="#e8b090" />
      {/* head */}
      <ellipse cx="271" cy="225" rx="35" ry="36" fill="#e8b090" />
      {/* hair brown */}
      <path d="M238 218 Q240 188 271 186 Q302 188 304 218 Q298 202 271 200 Q244 202 238 218Z" fill="#6e3e20" />
      {/* beard */}
      <path d="M248 248 Q260 258 271 258 Q282 258 294 248 Q288 255 271 256 Q254 255 248 248Z" fill="#6e3e20" />
      {/* eyes */}
      <circle cx="259" cy="224" r="4" fill="#2a1a0a" />
      <circle cx="283" cy="224" r="4" fill="#2a1a0a" />
      <circle cx="260" cy="222.5" r="1.5" fill="white" opacity="0.7" />
      <circle cx="284" cy="222.5" r="1.5" fill="white" opacity="0.7" />
      {/* eyebrows */}
      <path d="M254 217 Q259 214 264 217" stroke="#4a2810" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M278 217 Q283 214 288 217" stroke="#4a2810" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* nose */}
      <path d="M269 233 Q271 238 273 233" stroke="#c09070" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* mouth / smile */}
      <path d="M262 244 Q271 250 280 244" stroke="#c09070" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Shadows */}
      <ellipse cx="140" cy="397" rx="68" ry="9" fill="#1a5c2a" opacity="0.2" />
      <ellipse cx="270" cy="406" rx="52" ry="7" fill="#1a5c2a" opacity="0.18" />
    </svg>
  )
}

// ─── Navbar ────────────────────────────────────────────────────────────────────

function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'white', borderBottom: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <a href="#home" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Logo size={40} />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontWeight: 900, fontSize: 15, letterSpacing: '0.18em', color: '#1a5c2a', textTransform: 'uppercase' }}>THOY</span>
            <span style={{ fontWeight: 600, fontSize: 10, letterSpacing: '0.22em', color: '#888', textTransform: 'uppercase' }}>Lawncare</span>
          </div>
        </a>

        {/* Desktop nav links */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          <a href="#home" style={{ fontSize: 14, fontWeight: 700, color: '#1a5c2a', textDecoration: 'none', borderBottom: '2px solid #1a5c2a', paddingBottom: 2 }}>Home</a>
          <a href="#services" style={{ fontSize: 14, fontWeight: 500, color: '#555', textDecoration: 'none' }}>Services</a>
          <a href="#about" style={{ fontSize: 14, fontWeight: 500, color: '#555', textDecoration: 'none' }}>About</a>
        </div>

        {/* CTA */}
        <div className="desktop-cta">
          <a href="#contact" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1a5c2a', color: 'white', fontSize: 14, fontWeight: 600, padding: '10px 22px', borderRadius: 999, textDecoration: 'none', boxShadow: '0 2px 8px rgba(26,92,42,0.3)' }}>
            <PhoneIcon size={15} />
            Contact
          </a>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="mobile-menu-btn" style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
          <svg width="24" height="24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round">
            {open
              ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
              : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
          </svg>
        </button>
      </div>

      {open && (
        <div className="mobile-menu" style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <a href="#home" style={{ fontSize: 15, fontWeight: 700, color: '#1a5c2a', textDecoration: 'none' }} onClick={() => setOpen(false)}>Home</a>
          <a href="#services" style={{ fontSize: 15, fontWeight: 500, color: '#555', textDecoration: 'none' }} onClick={() => setOpen(false)}>Services</a>
          <a href="#about" style={{ fontSize: 15, fontWeight: 500, color: '#555', textDecoration: 'none' }} onClick={() => setOpen(false)}>About</a>
          <a href="#contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#1a5c2a', color: 'white', fontSize: 14, fontWeight: 600, padding: '10px 22px', borderRadius: 999, textDecoration: 'none', width: 'fit-content' }} onClick={() => setOpen(false)}>
            <PhoneIcon size={15} />Contact
          </a>
        </div>
      )}
    </nav>
  )
}

// ─── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section id="home" style={{ background: 'white', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px', display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
        {/* Copy */}
        <div style={{ flex: '1 1 340px', maxWidth: 480, zIndex: 1 }}>
          <p style={{ color: '#1a5c2a', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>
            Reliable. Professional. Local.
          </p>
          <h1 style={{ fontSize: 'clamp(40px,5.5vw,62px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', color: '#111', marginBottom: 20 }}>
            A lawn you'll<br />
            love coming<br />
            home to.
          </h1>
          <p style={{ fontSize: 15, color: '#666', lineHeight: 1.7, maxWidth: 340, marginBottom: 32 }}>
            THOY Lawncare delivers quality lawn care with attention to detail and service you can count on.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="#contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#1a5c2a', color: 'white', fontSize: 14, fontWeight: 600, padding: '12px 24px', borderRadius: 999, textDecoration: 'none', boxShadow: '0 4px 12px rgba(26,92,42,0.3)' }}>
              <PhoneIcon size={15} />
              Contact
            </a>
            <a href="#services" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '2px solid #ccc', color: '#333', fontSize: 14, fontWeight: 600, padding: '12px 24px', borderRadius: 999, textDecoration: 'none', background: 'white' }}>
              Our Services
              <ArrowRightIcon size={15} />
            </a>
          </div>
        </div>

        {/* Illustration */}
        <div style={{ flex: '1 1 380px', maxWidth: 560 }}>
          <HeroIllustration />
        </div>
      </div>
    </section>
  )
}

// ─── Services ──────────────────────────────────────────────────────────────────

const SERVICES = [
  { icon: <MowingIcon />, title: 'Mowing', desc: 'Consistent, high-quality mowing for a clean, healthy lawn.' },
  { icon: <CleanupIcon />, title: 'Cleanup', desc: 'We remove leaves, debris and clutter to keep your yard looking its best.' },
  { icon: <MulchingIcon />, title: 'Mulching', desc: 'Fresh mulch adds beauty and helps protect your landscape.' },
  { icon: <EdgeIcon />, title: 'Edging Trimming', desc: 'Crisp edges and precise trimming for a clean, polished finish.' },
]

function Services() {
  return (
    <section id="services" style={{ background: '#f8f9f8', padding: '80px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ color: '#1a5c2a', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14 }}>
            Our Services
          </p>
          <h2 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 900, color: '#111', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Everything your lawn needs<br />to look its best.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40 }}>
          {SERVICES.map(({ icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14 }}>
              {icon}
              <h3 style={{ fontWeight: 700, fontSize: 15, color: '#111', margin: 0 }}>{title}</h3>
              <p style={{ fontSize: 13.5, color: '#777', lineHeight: 1.65, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <a href="#services" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1a5c2a', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
            View All Services <ArrowRightIcon size={15} />
          </a>
        </div>
      </div>
    </section>
  )
}

// ─── Why Choose + Contact ──────────────────────────────────────────────────────

const BULLETS = ['Dependable & on time', 'Attention to detail', 'Clear communication', 'Satisfaction guaranteed']

function GrassBottom() {
  return (
    <svg viewBox="0 0 600 90" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', display: 'block' }}>
      <path d="M0 90 L0 60 Q15 35 30 60 Q45 35 60 60 Q75 32 90 60 Q105 40 120 60 Q135 35 150 60 Q165 40 180 60 Q195 35 210 60 Q225 40 240 60 Q255 35 270 60 Q285 40 300 60 Q315 35 330 60 Q345 40 360 60 Q375 35 390 60 Q405 40 420 60 Q435 35 450 60 Q465 40 480 60 Q495 35 510 60 Q525 40 540 60 Q555 35 570 60 Q585 40 600 60 L600 90 Z"
        fill="#2d7a3a" opacity="0.35" />
    </svg>
  )
}

function WhyChoose() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', message: '' })

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 12,
    border: '1.5px solid #e0e0e0',
    fontSize: 14,
    color: '#111',
    outline: 'none',
    fontFamily: 'inherit',
    background: 'white',
  }

  return (
    <section id="about" style={{ background: '#f8f9f8', padding: '0 24px', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative top divider */}
      <div style={{ borderTop: '1px solid #ebebeb' }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 0 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 60, alignItems: 'start' }}>
          {/* Left */}
          <div>
            <p style={{ color: '#1a5c2a', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14 }}>
              Why Choose THOY Lawncare?
            </p>
            <h2 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 900, color: '#111', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 36 }}>
              Local. Reliable.<br />Dedicated to quality.
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {BULLETS.map((b) => (
                <li key={b} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckIcon />
                  <span style={{ fontSize: 15, fontWeight: 500, color: '#333' }}>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — contact card */}
          <div id="contact" style={{ background: 'white', borderRadius: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.09)', padding: '36px 32px', border: '1px solid #f0f0f0' }}>
            <p style={{ color: '#1a5c2a', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>
              Get In Touch
            </p>
            <h3 style={{ fontSize: 22, fontWeight: 900, color: '#111', lineHeight: 1.25, marginBottom: 24 }}>
              Let's make your lawn<br />the best on the block.
            </h3>

            <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input name="name" value={form.name} onChange={handle} placeholder="Your Name" style={inputStyle} />
                <input name="phone" value={form.phone} onChange={handle} placeholder="Phone" style={inputStyle} />
              </div>
              <input name="email" value={form.email} onChange={handle} placeholder="Email" type="email" style={inputStyle} />
              <input name="address" value={form.address} onChange={handle} placeholder="Address" style={inputStyle} />
              <textarea name="message" value={form.message} onChange={handle} placeholder="How can we help?" rows={3}
                style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }} />
              <button type="submit" style={{ marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#1a5c2a', color: 'white', fontWeight: 700, fontSize: 15, padding: '14px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(26,92,42,0.3)' }}>
                <PhoneIcon size={16} />
                Contact
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Grass silhouette */}
      <div style={{ marginTop: 48 }}>
        <GrassBottom />
      </div>
    </section>
  )
}

// ─── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ background: 'white', borderTop: '1px solid #efefef', padding: '52px 24px 28px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40, marginBottom: 36 }}>
        {/* Brand */}
        <div>
          <a href="#home" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 14 }}>
            <Logo size={38} />
            <div style={{ lineHeight: 1 }}>
              <div style={{ fontWeight: 900, fontSize: 14, letterSpacing: '0.18em', color: '#1a5c2a', textTransform: 'uppercase' }}>THOY</div>
              <div style={{ fontWeight: 600, fontSize: 10, letterSpacing: '0.2em', color: '#888', textTransform: 'uppercase' }}>Lawncare</div>
            </div>
          </a>
        </div>

        {/* Quick links */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: '#aaa', textTransform: 'uppercase', marginBottom: 16 }}>Quick Links</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['Home', 'Services', 'About'].map((l) => (
              <li key={l}>
                <a href={`#${l.toLowerCase()}`} style={{ fontSize: 14, fontWeight: 500, color: '#555', textDecoration: 'none' }}>{l}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: '#aaa', textTransform: 'uppercase', marginBottom: 16 }}>Let's Connect</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#555' }}>
              <PhoneIcon size={16} className="text-green" style={{ color: '#1a5c2a' }} />
              (555) 123-4567
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#555' }}>
              <MailIcon size={16} />
              hello@thoylawncare.com
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#555' }}>
              <MapPinIcon size={16} />
              Serving your neighborhood
            </li>
          </ul>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', borderTop: '1px solid #f0f0f0', paddingTop: 20, textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#bbb' }}>© 2024 THOY Lawncare. All rights reserved.</p>
      </div>
    </footer>
  )
}

// ─── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <Navbar />
      <Hero />
      <Services />
      <WhyChoose />
      <Footer />
    </div>
  )
}
