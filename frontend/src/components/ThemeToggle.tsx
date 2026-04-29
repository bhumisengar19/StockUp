import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'Day' : 'Night'} mode`}
      className="theme-toggle-btn"
      style={{
        '--toggle-width': '64px',
        '--toggle-height': '32px',
        '--knob-size': '24px',
        '--knob-margin': '4px',
        position: 'relative',
        width: 'var(--toggle-width)',
        height: 'var(--toggle-height)',
        borderRadius: '999px',
        border: 'none',
        padding: 0,
        margin: '0 8px', /* Ensure proper spacing in navbar */
        cursor: 'pointer',
        background: 'none',
        WebkitTapHighlightColor: 'transparent',
        outline: 'none',
        flexShrink: 0,
        verticalAlign: 'middle',
        transition: 'transform 200ms ease',
      } as React.CSSProperties}
    >
      {/* ── Track ── */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '999px',
          position: 'relative',
          overflow: 'hidden',
          transition: 'background 500ms ease, box-shadow 500ms ease',
          background: isDark
            ? 'linear-gradient(135deg,#020617 0%,#0a1628 50%,#0d1f3c 100%)'
            : 'linear-gradient(135deg,#7dd3fc 0%,#38bdf8 50%,#0ea5e9 100%)',
          boxShadow: isDark
            ? '0 2px 12px rgba(2,6,23,.8), 0 0 0 1px rgba(59,130,246,.2), inset 0 1px 0 rgba(255,255,255,.05)'
            : '0 2px 12px rgba(14,165,233,.5), inset 0 1px 0 rgba(255,255,255,.4), inset 0 -1px 0 rgba(0,0,0,.12)',
        }}
      >
        {/* Inner depth ring */}
        <div style={{
          position: 'absolute', inset: 1.5, borderRadius: '999px',
          border: `1px solid ${isDark ? 'rgba(59,130,246,.15)' : 'rgba(255,255,255,.25)'}`,
          pointerEvents: 'none',
          transition: 'border-color 500ms',
        }} />

        {/* Track stars (night) */}
        {[
          { w:1.5, h:1.5, top:7,  left:38, dur:'2.1s' },
          { w:1,   h:1,   top:14, left:44, dur:'1.7s', delay:'.4s' },
          { w:1,   h:1,   top:9,  left:48, dur:'2.5s', delay:'.8s' },
          { w:1.5, h:1.5, top:19, left:40, dur:'1.9s', delay:'.2s' },
        ].map((s, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: s.w, height: s.h,
            top: s.top, left: s.left,
            borderRadius: '50%',
            background: '#fff',
            opacity: isDark ? 1 : 0,
            transition: 'opacity 400ms ease',
            animation: `twinkle ${s.dur} ${s.delay ?? '0s'} ease-in-out infinite`,
          }} />
        ))}

        {/* Track clouds (day) */}
        {[
          { w:14, h:6, top:9,  left:5, dur:'8s' },
          { w:10, h:4, top:16, left:9, dur:'6s', delay:'-3s' },
        ].map((c, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: c.w, height: c.h,
            top: c.top, left: c.left,
            borderRadius: '50%',
            background: 'rgba(255,255,255,.75)',
            filter: 'blur(1.5px)',
            opacity: isDark ? 0 : 1,
            transition: 'opacity 400ms ease',
            animation: `trackCloudFloat ${c.dur} ${c.delay ?? '0s'} ease-in-out infinite`,
          }} />
        ))}

        {/* ── Knob ── */}
        <div
          style={{
            position: 'absolute',
            top: 'var(--knob-margin)',
            left: isDark ? 'calc(var(--toggle-width) - var(--knob-size) - var(--knob-margin))' : 'var(--knob-margin)',
            width: 'var(--knob-size)',
            height: 'var(--knob-size)',
            borderRadius: '50%',
            transition: 'left 320ms cubic-bezier(.4,0,.2,1), background 500ms ease, box-shadow 500ms ease',
            willChange: 'left',
            background: isDark
              ? 'radial-gradient(circle at 38% 38%,#f8fafc 0%,#e2e8f0 40%,#cbd5e1 75%,#94a3b8 100%)'
              : 'radial-gradient(circle at 35% 35%,#fef9c3 0%,#fef08a 30%,#fde047 65%,#facc15 100%)',
            boxShadow: isDark
              ? '0 0 0 1px rgba(226,232,240,.5), 0 0 10px 4px rgba(148,163,184,.45), 0 0 20px 7px rgba(148,163,184,.18), 0 2px 6px rgba(0,0,0,.4)'
              : '0 0 0 1px rgba(253,224,71,.6), 0 0 10px 4px rgba(253,224,71,.55), 0 0 20px 8px rgba(253,224,71,.25), 0 2px 6px rgba(0,0,0,.18)',
          }}
        >
          {/* Knob shine */}
          <div style={{
            position: 'absolute', top: 3.5, left: 4.5,
            width: 7, height: 4, borderRadius: '50%',
            background: 'rgba(255,255,255,.55)',
            filter: 'blur(1px)',
            opacity: isDark ? .3 : 1,
            transition: 'opacity 500ms',
          }} />
          {/* Moon craters */}
          {isDark && [
            { w:4.5, h:4.5, top:5,  left:11 },
            { w:3,   h:3,   top:12, left:7 },
            { w:2.5, h:2.5, top:8,  left:5 },
          ].map((cr, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: cr.w, height: cr.h,
              top: cr.top, left: cr.left,
              borderRadius: '50%',
              background: 'rgba(0,0,0,.1)',
            }} />
          ))}
        </div>
      </div>

      {/* Embedded keyframes & styles */}
      <style>{`
        .theme-toggle-btn:hover {
          transform: scale(1.03);
        }
        .theme-toggle-btn:active {
          transform: scale(0.97);
        }
        @keyframes twinkle {
          0%,100% { opacity:.2; transform:scale(.8); }
          50%      { opacity:1;  transform:scale(1.2); }
        }
        @keyframes trackCloudFloat {
          0%,100% { transform:translateX(0px); }
          50%      { transform:translateX(4px); }
        }
        @media (max-width: 768px) {
          .theme-toggle-btn {
            --toggle-width: 56px !important;
            --toggle-height: 28px !important;
            --knob-size: 20px !important;
            --knob-margin: 4px !important;
          }
        }
      `}</style>
    </button>
  );
}
