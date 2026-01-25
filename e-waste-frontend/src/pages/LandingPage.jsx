import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        fontFamily:
          "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
        color: '#08331f',
        backgroundColor: '#f3fbf7',
      }}
    >
      {/* Inline styles + animations */}
      <style>{`
        :root{
          --bg:#f3fbf7;
          --deep:#022c22;
          --accent:#16a34a;
          --accent-2:#059669;
          --accent-3:#22c55e;
          --muted:#567368;
          --card-radius:16px;
        }

        html,body,#root{
          height:100%;
          margin:0;
          padding:0;
          background:var(--bg);
        }

        *{
          box-sizing:border-box;
        }

        .full-hero{
          min-height:100vh;
          display:flex;
          align-items:center;
          justify-content:center;
          background:
            radial-gradient(circle at 0% 0%, rgba(45,212,191,0.18) 0, transparent 55%),
            radial-gradient(circle at 100% 100%, rgba(34,197,94,0.14) 0, transparent 55%),
            linear-gradient(180deg,#e7f7ee,#f5fff9);
          position:relative;
          overflow:hidden;
        }

        .hero-inner{
          max-width:1200px;
          width:100%;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:48px;
          padding:84px 20px 48px 20px;
          z-index:1;
        }

        /* NAV BAR */
        .nav-glass{
          backdrop-filter:blur(16px);
          background:linear-gradient(
            90deg,
            rgba(236,253,245,0.9),
            rgba(220,252,231,0.9)
          );
          border-radius:999px;
          box-shadow:0 10px 30px rgba(15,118,110,0.18);
          padding:10px 16px;
        }

        /* Left: content */
        .hero-left{
          flex:1;
        }

        .eyebrow{
          display:inline-flex;
          align-items:center;
          gap:6px;
          background:rgba(22,163,74,0.13);
          color:var(--accent);
          padding:6px 14px;
          border-radius:999px;
          font-weight:700;
          font-size:13px;
          letter-spacing:0.03em;
          text-transform:uppercase;
        }

        .eyebrow-dot{
          width:8px;
          height:8px;
          border-radius:999px;
          background:linear-gradient(135deg,#22c55e,#a3e635);
          box-shadow:0 0 0 4px rgba(34,197,94,0.25);
        }

        .hero-title{
          font-size:3.1rem;
          line-height:1.02;
          margin-top:18px;
          margin-bottom:14px;
          color:var(--deep);
          font-weight:800;
          letter-spacing:-0.03em;
        }

        .hero-title span{
          background:linear-gradient(120deg,#16a34a,#22c55e,#0ea5e9);
          -webkit-background-clip:text;
          background-clip:text;
          color:transparent;
        }

        .hero-sub{
          color:var(--muted);
          font-size:1.06rem;
          margin-bottom:22px;
          max-width:520px;
        }

        .cta-row{
          display:flex;
          gap:12px;
          flex-wrap:wrap;
        }

        .btn-primary-green{
          appearance:none;
          border:none;
          outline:none;
          cursor:pointer;
          background:linear-gradient(135deg,var(--accent),var(--accent-2));
          color:white;
          padding:12px 22px;
          border-radius:14px;
          font-weight:700;
          font-size:0.98rem;
          display:inline-flex;
          align-items:center;
          gap:6px;
          box-shadow:0 14px 35px rgba(6,95,70,0.22);
          transition:transform 150ms ease, box-shadow 150ms ease, filter 150ms ease;
        }

        .btn-primary-green:hover{
          transform:translateY(-1px) scale(1.01);
          box-shadow:0 18px 40px rgba(6,95,70,0.28);
          filter:brightness(1.03);
        }

        .btn-outline-green{
          appearance:none;
          border-radius:14px;
          border:1px solid rgba(6,95,70,0.16);
          background:rgba(255,255,255,0.9);
          padding:11px 20px;
          color:var(--deep);
          font-weight:600;
          display:inline-flex;
          align-items:center;
          gap:6px;
          cursor:pointer;
          transition:background 150ms ease,border-color 150ms ease,transform 150ms ease;
        }

        .btn-outline-green:hover{
          background:#ecfdf5;
          border-color:rgba(5,150,105,0.45);
          transform:translateY(-1px);
        }

        .hero-metrics{
          margin-top:22px;
          display:flex;
          gap:26px;
          flex-wrap:wrap;
          font-size:0.9rem;
        }

        .metric-label{
          color:var(--muted);
        }

        /* Right: visual card */
        .hero-right{
          width:420px;
          flex:0 0 420px;
        }

        .visual-card{
          background:linear-gradient(145deg,rgba(255,255,255,0.95),rgba(236,253,245,0.98));
          border-radius:var(--card-radius);
          padding:22px;
          box-shadow:0 24px 70px rgba(6,58,40,0.16);
          border:1px solid rgba(22,163,74,0.15);
          position:relative;
          overflow:hidden;
        }

        .visual-card::before{
          content:"";
          position:absolute;
          inset:-30%;
          background:radial-gradient(circle at 0 0,rgba(22,163,74,0.12),transparent 55%);
          opacity:0.8;
          pointer-events:none;
        }

        .visual-graphic{
          height:220px;
          border-radius:14px;
          background:radial-gradient(circle at 0 0,#bbf7d0,#a5f3fc);
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:62px;
          color:var(--accent);
          position:relative;
          overflow:hidden;
        }

        .visual-ring{
          position:absolute;
          width:260px;
          height:260px;
          border-radius:999px;
          border:1px dashed rgba(22,163,74,0.35);
          animation:spin-slow 22s linear infinite;
        }

        .visual-chip{
          position:absolute;
          right:14px;
          bottom:14px;
          padding:6px 10px;
          border-radius:999px;
          background:rgba(255,255,255,0.9);
          font-size:11px;
          font-weight:600;
          color:var(--muted);
          display:flex;
          align-items:center;
          gap:4px;
        }

        .visual-chip-dot{
          width:8px;
          height:8px;
          border-radius:999px;
          background:#22c55e;
        }

        .visual-row-buttons{
          margin-top:16px;
          display:flex;
          gap:10px;
          flex-wrap:wrap;
        }

        .btn-ghost{
          border-radius:12px;
          border:1px dashed rgba(34,197,94,0.45);
          background:rgba(240,253,250,0.8);
          padding:8px 14px;
          font-size:0.8rem;
          font-weight:600;
          color:var(--deep);
          display:inline-flex;
          align-items:center;
          gap:6px;
          cursor:pointer;
        }

        .btn-ghost span{
          font-size:1.1rem;
        }

        .small-label{
          font-size:0.78rem;
          text-transform:uppercase;
          letter-spacing:0.12em;
          color:var(--muted);
        }

        /* subtle hero shapes / blobs */
        .blob-1,
        .blob-2{
          position:absolute;
          filter:blur(46px);
          mix-blend-mode:multiply;
          opacity:0.75;
        }

        .blob-1{
          right:-12%;
          top:-12%;
          width:52vmax;
          height:52vmax;
          background:radial-gradient(circle at 20% 20%, rgba(22,163,74,0.26), rgba(6,182,148,0.05));
          transform:rotate(16deg);
        }

        .blob-2{
          left:-10%;
          bottom:-12%;
          width:40vmax;
          height:40vmax;
          background:radial-gradient(circle at 50% 50%, rgba(5,150,105,0.19), rgba(22,163,74,0.05));
        }

        @keyframes spin-slow{
          from{transform:rotate(0deg);}
          to{transform:rotate(360deg);}
        }

        /* Sections */
        section{
          padding:40px 0;
          margin:0;
        }

        .container-max{
          max-width:1120px;
          margin:0 auto;
          padding:0 20px;
        }

        .section-head{
          display:flex;
          justify-content:space-between;
          align-items:flex-end;
          gap:12px;
        }

        .section-kicker{
          font-size:0.8rem;
          text-transform:uppercase;
          letter-spacing:0.18em;
          color:var(--accent-2);
          font-weight:700;
        }

        .grid-3{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:18px;
        }

        .card{
          background:white;
          padding:18px 18px 20px 18px;
          border-radius:var(--card-radius);
          box-shadow:0 18px 45px rgba(6,58,40,0.06);
          min-height:130px;
          border:1px solid rgba(148,163,184,0.18);
          position:relative;
          overflow:hidden;
        }

        .card::before{
          content:"";
          position:absolute;
          inset:0;
          background:linear-gradient(135deg,rgba(34,197,94,0.06),transparent 60%);
          opacity:0;
          transition:opacity 180ms ease;
          pointer-events:none;
        }

        .card:hover::before{
          opacity:1;
        }

        .card-icon{
          width:32px;
          height:32px;
          border-radius:999px;
          background:rgba(22,163,74,0.1);
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:1.2rem;
          margin-bottom:8px;
        }

        .card h5{
          margin:0 0 6px 0;
          color:var(--deep);
          font-size:1.02rem;
        }

        .card p{
          margin:0;
          color:var(--muted);
          font-size:0.93rem;
        }

        /* process */
        .process-row{
          display:flex;
          gap:12px;
          flex-wrap:wrap;
        }

        .proc{
          flex:1 1 calc(25% - 12px);
          background:linear-gradient(180deg,#f8fff8,#ffffff);
          padding:14px 12px;
          border-radius:12px;
          text-align:left;
          border:1px solid rgba(148,163,184,0.25);
          position:relative;
          overflow:hidden;
          font-size:0.9rem;
        }

        .proc-step{
          font-size:0.78rem;
          font-weight:700;
          text-transform:uppercase;
          letter-spacing:0.12em;
          color:var(--accent-2);
          margin-bottom:4px;
        }

        .proc small{
          color:var(--muted);
          font-size:0.8rem;
        }

        .proc::after{
          content:"";
          position:absolute;
          right:-12px;
          top:-12px;
          width:44px;
          height:44px;
          border-radius:999px;
          background:radial-gradient(circle at 50% 50%, rgba(22,163,74,0.16), transparent 60%);
        }

        /* testimonials */
        .tests{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:14px;
        }

        .test{
          background:linear-gradient(180deg,#ffffff,#f1fdf5);
          padding:14px 14px 16px 14px;
          border-radius:12px;
          border:1px solid rgba(22,163,74,0.15);
          font-size:0.9rem;
          position:relative;
          overflow:hidden;
        }

        .test::before{
          content:"“";
          position:absolute;
          font-size:3rem;
          color:rgba(22,163,74,0.12);
          top:-18px;
          left:8px;
        }

        /* FAQ */
        .faq-item{
          padding:10px 0;
          border-bottom:1px solid rgba(148,163,184,0.25);
        }

        .faq-item:last-child{
          border-bottom:none;
        }

        /* CTA final */
        .final-cta{
          background:linear-gradient(120deg,var(--accent-2),var(--accent),#22c55e);
          padding:32px 22px;
          border-radius:20px;
          color:white;
          text-align:center;
          position:relative;
          overflow:hidden;
          box-shadow:0 24px 60px rgba(5,122,85,0.4);
        }

        .final-cta::before{
          content:"";
          position:absolute;
          inset:-10%;
          background:
            radial-gradient(circle at 0 0,rgba(34,197,94,0.35),transparent 55%),
            radial-gradient(circle at 100% 100%,rgba(5,150,105,0.4),transparent 55%);
          mix-blend-mode:soft-light;
          opacity:0.9;
        }

        .final-cta-inner{
          position:relative;
          z-index:1;
        }

        .final-cta p{
          margin:8px 0 0 0;
          color:rgba(240,253,244,0.95);
        }

        footer{
          padding:20px 0 24px 0;
          text-align:center;
          color:var(--muted);
          font-size:0.85rem;
        }

        /* responsive */
        @media(max-width:1000px){
          .hero-inner{
            flex-direction:column;
            align-items:flex-start;
            padding-top:96px;
          }
          .hero-right{
            width:100%;
            flex:0 0 auto;
          }
          .grid-3{
            grid-template-columns:1fr;
          }
          .tests{
            grid-template-columns:1fr;
          }
          .proc{
            flex:1 1 100%;
          }
          .hero-title{
            font-size:2.2rem;
          }
        }

        @media(max-width:640px){
          .nav-glass{
            border-radius:14px;
          }
          .hero-metrics{
            flex-direction:column;
            gap:12px;
          }
        }
      `}</style>

      {/* NAV */}
      <header
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          top: 0,
          zIndex: 1200,
          padding: 16,
          pointerEvents: 'none',
        }}
      >
        <div className="container-max d-flex align-items-center justify-content-between">
          <div className="nav-glass w-100 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center" style={{ gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background:
                    'conic-gradient(from 160deg,#22c55e,#0ea5e9,#16a34a,#22c55e)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: 18,
                  boxShadow: '0 10px 25px rgba(6,95,70,0.45)',
                }}
              >
                EW
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>EcoWaste</div>
                <div style={{ fontSize: 12, color: '#4f6b63' }}>
                  Simple • Secure • Sustainable
                </div>
              </div>
            </div>

            <div
              className="d-flex align-items-center"
              style={{ gap: 8, pointerEvents: 'auto' }}
            >
              <button
                className="btn btn-sm btn-outline-success"
                style={{ borderRadius: 999 }}
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <button
                className="btn btn-sm btn-success"
                style={{ borderRadius: 999 }}
                onClick={() => navigate('/register')}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="full-hero" aria-label="Hero">
        <div className="blob-1" aria-hidden="true"></div>
        <div className="blob-2" aria-hidden="true"></div>

        <div className="hero-inner">
          <div className="hero-left">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              Live demo · E-waste platform
            </div>
            <h1 className="hero-title">
              Turn end‑of‑life electronics into{' '}
              <span>clean resources</span>.
            </h1>
            <p className="hero-sub">
              Collect, track, and recycle e‑waste with certified data erasure,
              real‑time status, and recovery reports designed for campuses,
              startups, and smart cities.
            </p>

            <div className="cta-row">
              <button
                className="btn-primary-green"
                onClick={() => navigate('/register')}
              >
                Schedule Pickup <span>→</span>
              </button>
              <button
                className="btn-outline-green"
                onClick={() => navigate('/contact')}
              >
                Talk to our team
              </button>
            </div>

            <div className="hero-metrics">
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 18,
                    color: 'var(--deep)',
                  }}
                >
                  4,200+
                </div>
                <div className="metric-label">Tons processed / year</div>
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 18,
                    color: 'var(--deep)',
                  }}
                >
                  1.2M
                </div>
                <div className="metric-label">Devices wiped securely</div>
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 18,
                    color: 'var(--deep)',
                  }}
                >
                  95%+
                </div>
                <div className="metric-label">Material recovery rate</div>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="visual-card">
              <div className="visual-graphic">
                <div className="visual-ring" />
                ♻️
                <div className="visual-chip">
                  <span className="visual-chip-dot" />
                  Real‑time tracking
                </div>
              </div>
              <div style={{ marginTop: 16, marginBottom: 4 }}>
                <div className="small-label">Compliance dashboard</div>
              </div>
              <h5 style={{ marginBottom: 6, marginTop: 2 }}>
                Certified & traceable e‑waste flows
              </h5>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                Export audit‑ready certificates, track chain‑of‑custody per
                batch, and share impact summaries with your stakeholders.
              </p>
              <div className="visual-row-buttons">
                <button
                  className="btn-ghost"
                  onClick={() => navigate('/contact')}
                >
                  <span>◎</span> Get a quote
                </button>
                <button
                  className="btn-primary-green"
                  style={{ padding: '9px 16px', fontSize: '0.88rem' }}
                  onClick={() => navigate('/register')}
                >
                  Start as organization
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section>
        <div className="container-max">
          <div className="section-head">
            <div>
              <div className="section-kicker">Why choose EcoWaste?</div>
              <h3 style={{ margin: 0, color: 'var(--deep)' }}>Core benefits</h3>
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              Secure · Compliant · Circular by design
            </div>
          </div>

          <div className="grid-3" style={{ marginTop: 18 }}>
            <div className="card">
              <div className="card-icon">🌱</div>
              <h5>Eliminate toxic hazards</h5>
              <p>
                Neutralize batteries, CRTs, and other hazardous components
                before they leak into soil, water, or air.
              </p>
            </div>
            <div className="card">
              <div className="card-icon">🔐</div>
              <h5>Secure data handling</h5>
              <p>
                Multi‑pass data wiping and physical destruction with complete
                logs for every device and batch.
              </p>
            </div>
            <div className="card">
              <div className="card-icon">♻️</div>
              <h5>Maximize recovery</h5>
              <p>
                Advanced separation recovers metals, plastics, and rare earths
                to bring them back into the circular economy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section style={{ background: '#eef8f3' }}>
        <div className="container-max">
          <div className="section-head" style={{ marginBottom: 10 }}>
            <div>
              <div className="section-kicker">How it works</div>
              <h3 style={{ margin: 0 }}>Our simple 4‑step flow</h3>
            </div>
          </div>

          <div className="process-row" style={{ marginTop: 12 }}>
            <div className="proc">
              <div className="proc-step">Step 1</div>
              <strong>Collection & pickup</strong>
              <br />
              <small>Campus drives, doorstep pickup or drop‑off centers.</small>
            </div>
            <div className="proc">
              <div className="proc-step">Step 2</div>
              <strong>Secure data erasure</strong>
              <br />
              <small>Certified wiping or shredding, mapped to device IDs.</small>
            </div>
            <div className="proc">
              <div className="proc-step">Step 3</div>
              <strong>Material recovery</strong>
              <br />
              <small>Sorting, dismantling, and recycling by partners.</small>
            </div>
            <div className="proc">
              <div className="proc-step">Step 4</div>
              <strong>Reporting & impact</strong>
              <br />
              <small>Compliance certificate plus CO₂ and recovery metrics.</small>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section>
        <div className="container-max">
          <div className="section-head" style={{ marginBottom: 10 }}>
            <div>
              <div className="section-kicker">Stories</div>
              <h3 style={{ margin: 0 }}>Trusted by early adopters</h3>
            </div>
          </div>

          <div className="tests" style={{ marginTop: 12 }}>
            <div className="test">
              “Fast pickup, live tracking, and the certificate made our green
              audit effortless.”
              <br />
              <strong>— DemoCorp Pvt. Ltd.</strong>
            </div>
            <div className="test">
              “We saw higher recovery rates and complete transparency for every
              batch we processed.”
              <br />
              <strong>— Recycler Partner</strong>
            </div>
            <div className="test">
              “As a housing society, we finally have a safe way to dispose old
              phones and laptops.”
              <br />
              <strong>— Community User</strong>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: '#f3fbf7' }}>
        <div className="container-max">
          <div className="section-head" style={{ marginBottom: 10 }}>
            <div>
              <div className="section-kicker">Questions</div>
              <h3 style={{ margin: 0 }}>FAQ</h3>
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <div className="faq-item">
              <strong>Is data erased fully?</strong>
              <div style={{ color: 'var(--muted)', marginTop: 6 }}>
                Yes. Devices go through multi‑pass wiping or physical
                destruction, and you receive a certificate with the method used.
              </div>
            </div>
            <div className="faq-item">
              <strong>What items do you accept?</strong>
              <div style={{ color: 'var(--muted)', marginTop: 6 }}>
                Phones, laptops, desktops, servers, monitors, batteries,
                printers, and common accessories.
              </div>
            </div>
            <div className="faq-item">
              <strong>Can this be used for college projects?</strong>
              <div style={{ color: 'var(--muted)', marginTop: 6 }}>
                Absolutely. You can customize the content, connect forms to a
                backend, and showcase it as a working e‑waste management
                prototype.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section>
        <div className="container-max">
          <div className="final-cta">
            <div className="final-cta-inner">
              <h4 style={{ margin: 0, fontSize: '1.35rem' }}>
                Ready to recycle smarter?
              </h4>
              <p>
                Launch your e‑waste drive in minutes, track every device, and
                download your impact report.
              </p>
              <div style={{ marginTop: 12 }}>
                <button
                  className="btn-primary-green"
                  onClick={() => navigate('/register')}
                >
                  Schedule your first pickup
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="container-max">
          <div style={{ fontWeight: 700 }}>EcoWaste</div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>
            Demo landing page · Replace text with real project details
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
