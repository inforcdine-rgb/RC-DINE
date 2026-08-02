"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

const projects = [
  {
    index: "02",
    title: "Portfolio 2026",
    type: "Personal Brand / Creative Development",
    year: "2026",
    tone: "blue",
    eyebrow: "A cinematic digital identity built to make a memorable first impression.",
  },
  {
    index: "03",
    title: "Motion Lab",
    type: "Interaction Design / Experiments",
    year: "2026",
    tone: "violet",
    eyebrow: "An evolving collection of expressive interactions and visual experiments.",
  },
];

const experience = [
  ["CURRENT", "Independent Practice", "Frontend & Creative Development", "Amravati, MH"],
  ["FEATURED", "RC Dine", "Design, Development & Motion", "Case Study"],
  ["ONGOING", "Continuous Learning", "Modern Web Engineering", "Open to work"],
];

function Magnetic({ children, href, variant = "solid", label }: { children: ReactNode; href: string; variant?: "solid" | "outline"; label?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 180, damping: 14, mass: 0.15 });
  const springY = useSpring(y, { stiffness: 180, damping: 14, mass: 0.15 });

  const move = (event: MouseEvent<HTMLAnchorElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * 0.22);
    y.set((event.clientY - rect.top - rect.height / 2) * 0.22);
  };

  return (
    <motion.a
      href={href}
      aria-label={label}
      data-cursor="grow"
      className={`magnetic-button ${variant}`}
      onMouseMove={move}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.96 }}
    >
      <span>{children}</span>
      <span className="button-arrow" aria-hidden="true">↗</span>
    </motion.a>
  );
}

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 54 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.9, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

function SectionTitle({ number, label }: { number: string; label: string }) {
  return (
    <div className="section-kicker">
      <span>{number}</span>
      <span className="kicker-line" />
      <span>{label}</span>
    </div>
  );
}

function TiltCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const smoothX = useSpring(rotateX, { stiffness: 140, damping: 18 });
  const smoothY = useSpring(rotateY, { stiffness: 140, damping: 18 });

  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateX.set((0.5 - py) * 7);
    rotateY.set((px - 0.5) * 7);
  };

  return (
    <motion.div
      className={className}
      data-cursor="project"
      onMouseMove={onMove}
      onMouseLeave={() => { rotateX.set(0); rotateY.set(0); }}
      style={{ rotateX: smoothX, rotateY: smoothY, transformPerspective: 1200 }}
    >
      {children}
    </motion.div>
  );
}

function Cursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const x = useSpring(cursorX, { stiffness: 650, damping: 42 });
  const y = useSpring(cursorY, { stiffness: 650, damping: 42 });
  const [mode, setMode] = useState("default");

  useEffect(() => {
    const move = (event: globalThis.MouseEvent) => {
      cursorX.set(event.clientX - 10);
      cursorY.set(event.clientY - 10);
    };
    const over = (event: globalThis.MouseEvent) => {
      const target = (event.target as HTMLElement).closest("[data-cursor]") as HTMLElement | null;
      setMode(target?.dataset.cursor ?? "default");
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className={`custom-cursor ${mode}`}
      style={{ x, y }}
      animate={{ scale: mode === "default" ? 1 : mode === "project" ? 4.6 : 2.4 }}
      transition={{ duration: 0.2 }}
    >
      <span>{mode === "project" ? "VIEW" : ""}</span>
    </motion.div>
  );
}

function Loader({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const value = Math.min(100, Math.round(((now - start) / 1450) * 100));
      setCount(value);
      if (value < 100) frame = requestAnimationFrame(tick);
      else window.setTimeout(onDone, 220);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onDone]);

  return (
    <motion.div className="loader" exit={{ y: "-100%" }} transition={{ duration: 0.85, ease }}>
      <div className="loader-mark">C/K</div>
      <div className="loader-track"><motion.span animate={{ width: `${count}%` }} /></div>
      <div className="loader-count">{count.toString().padStart(3, "0")}</div>
      <div className="loader-copy">Crafting the experience</div>
    </motion.div>
  );
}

function Navigation() {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "About", href: "#about" },
    { label: "Skills", href: "#skills" },
    { label: "Experience", href: "#experience" },
  ];
  const mobileLinks = [
    ...links,
    { label: "My Portfolio", href: "#projects" },
    { label: "Contact", href: "#contact" },
  ];
  return (
    <>
      <motion.header className="nav" initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 1.9, ease }}>
        <a href="#top" className="logo" data-cursor="grow" aria-label="Back to top">C<span>/</span>K</a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map((link) => <a key={link.label} data-cursor="grow" href={link.href}>{link.label}</a>)}
        </nav>
        <div className="nav-actions">
          <a href="#projects" className="nav-portfolio" data-cursor="grow">My Portfolio</a>
          <a href="#contact" className="nav-cta" data-cursor="grow"><span />Contact</a>
        </div>
        <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle menu">
          <span className={open ? "open" : ""} /><span className={open ? "open" : ""} />
        </button>
      </motion.header>
      <AnimatePresence>
        {open && (
          <motion.div className="mobile-menu" initial={{ clipPath: "inset(0 0 100% 0)" }} animate={{ clipPath: "inset(0 0 0% 0)" }} exit={{ clipPath: "inset(0 0 100% 0)" }} transition={{ duration: 0.65, ease }}>
            <span className="menu-label">Navigation</span>
            {mobileLinks.map((link, i) => (
              <motion.a key={link.label} href={link.href} onClick={() => setOpen(false)} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.07 }}>{link.label}<span>0{i + 1}</span></motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function RcDineMockup() {
  return (
    <div className="rc-stage">
      <div className="grain" />
      <motion.div className="orange-orbit" animate={{ rotate: 360 }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }} />
      <motion.div className="rc-window" whileHover={{ y: -8 }} transition={{ duration: 0.35 }}>
        <div className="rc-topbar"><span>RC DINE</span><span>MENU&nbsp;&nbsp; RESERVE</span></div>
        <div className="rc-body">
          <p>CRAFTED IN<br />EVERY BITE.</p>
          <div className="plate">
            <div className="plate-ring"><span className="food food-one" /><span className="food food-two" /><span className="food food-three" /><span className="food food-four" /></div>
          </div>
          <span className="rc-caption">Seasonal plates · Honest ingredients</span>
        </div>
      </motion.div>
      <div className="rc-sticker">01<br /><small>FEATURED</small></div>
    </div>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 140]);

  return (
    <>
      <AnimatePresence>{loading && <Loader onDone={() => setLoading(false)} />}</AnimatePresence>
      <Cursor />
      <motion.div className="progress" style={{ scaleX }} />
      <Navigation />

      <main id="top">
        <section className="hero">
          <div className="hero-grid" aria-hidden="true" />
          <motion.div className="hero-orb" style={{ y: heroY }} aria-hidden="true">
            <span className="orb-core" /><span className="orb-ring one" /><span className="orb-ring two" />
          </motion.div>
          <motion.div className="availability" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.05 }}>
            <span /> Available for selected projects · Amravati, India
          </motion.div>
          <div className="hero-title" aria-label="Chetan C. Khade, creative frontend developer">
            {["CHETAN", "CREATIVE", "DEVELOPER."].map((line, i) => (
              <div className={i === 1 ? "title-row orange" : "title-row"} key={line}>
                <motion.span initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 1.05, delay: 1.7 + i * 0.1, ease }}>{line}</motion.span>
              </div>
            ))}
          </div>
          <motion.div className="hero-bottom" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.3, duration: 0.8 }}>
            <p><strong>Chetan C. Khade</strong> is a frontend developer crafting responsive, expressive digital experiences from Amravati, Maharashtra.</p>
            <Magnetic href="#projects">My Portfolio</Magnetic>
          </motion.div>
          <div className="scroll-note"><span>SCROLL TO DISCOVER</span><i /></div>
        </section>

        <section className="about section" id="about">
          <SectionTitle number="01" label="About" />
          <Reveal className="about-statement">
            I turn ideas into <em>clear, magnetic</em> digital experiences—pairing strong visual thinking with responsive, thoughtful code.
          </Reveal>
          <div className="about-lower">
            <Reveal className="portrait-block">
              <img src={`${import.meta.env.BASE_URL}chetan-khade-portrait.jpg`} alt="Chetan C. Khade" />
              <div className="portrait-noise" />
              <div className="portrait-monogram">CK</div>
              <span>AMRAVATI, MAHARASHTRA<br />OPEN TO OPPORTUNITIES</span>
            </Reveal>
            <Reveal className="about-copy" delay={0.12}>
              <p>I&apos;m Chetan C. Khade, a frontend developer from Amravati focused on modern interfaces, creative motion, and digital experiences with personality.</p>
              <p>I build with React, TypeScript, Vite, Tailwind CSS, and Framer Motion—balancing visual polish with clarity, performance, and responsive behavior.</p>
              <Magnetic href="mailto:chetankhade10@gmail.com" variant="outline">Contact me</Magnetic>
            </Reveal>
            <div className="stats">
              <Reveal><strong>01</strong><small>Featured project</small></Reveal>
              <Reveal delay={0.08}><strong>06</strong><small>Core tools</small></Reveal>
              <Reveal delay={0.16}><strong>100<span>%</span></strong><small>Responsive focus</small></Reveal>
            </div>
          </div>
        </section>

        <section className="skills section" id="skills">
          <SectionTitle number="02" label="Capabilities" />
          <div className="marquee" aria-label="Design, development, and direction">
            <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }}>
              <span>DESIGN</span><i>✦</i><span>DEVELOPMENT</span><i>✦</i><span>DIRECTION</span><i>✦</i><span>DESIGN</span><i>✦</i><span>DEVELOPMENT</span><i>✦</i><span>DIRECTION</span><i>✦</i>
            </motion.div>
          </div>
          <div className="skill-list">
            {[
              ["01", "Interface Strategy", "Structure, User Flows, Visual Direction"],
              ["02", "Responsive Design", "UI Systems, Prototyping, Mobile-first Layouts"],
              ["03", "Creative Development", "React, TypeScript, Tailwind, Motion"],
            ].map(([num, title, items], i) => (
              <Reveal className="skill-row" delay={i * 0.07} key={num}>
                <span className="skill-num">{num}</span><h3>{title}</h3><p>{items}</p><span className="skill-plus">+</span>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="projects section" id="projects">
          <SectionTitle number="03" label="My Portfolio" />
          <Reveal className="projects-heading"><h2>PROJECTS THAT<br /><span>MOVE PEOPLE.</span></h2><p>A small selection of product, identity, and interactive work built for ambitious teams.</p></Reveal>

          <TiltCard className="featured-card">
            <a href="#contact" aria-label="Start a project like RC Dine" className="project-link">
              <RcDineMockup />
              <div className="featured-meta">
                <div><span>01 / FEATURED CASE</span><h3>RC Dine</h3></div>
                <p>A vibrant digital home for a modern dining concept—designed to turn curiosity into reservations.</p>
                <div className="project-tags"><span>Strategy</span><span>Identity</span><span>Web Design</span></div>
                <span className="round-arrow">↗</span>
              </div>
            </a>
          </TiltCard>

          <div className="project-grid">
            {projects.map((project, i) => (
              <TiltCard className={`project-card ${project.tone}`} key={project.title}>
                <a href="#contact" aria-label={`Start a project inspired by ${project.title}`}>
                  <div className="project-art">
                    <span className="project-index">{project.index}</span>
                    <motion.div className="art-card" whileHover={{ rotate: i ? -6 : 6, scale: 1.04 }}>
                      {i === 0 ? <><span className="aether-logo">CK.</span><div className="chart-bars"><i /><i /><i /><i /><i /></div><b>PORTFOLIO</b></> : <><span className="noir-copy">IDEAS<br /><i>in</i> MOTION</span><span className="noir-dot" /></>}
                    </motion.div>
                  </div>
                  <div className="card-meta"><p>{project.eyebrow}</p><h3>{project.title}</h3><div><span>{project.type}</span><span>{project.year}</span></div></div>
                </a>
              </TiltCard>
            ))}
          </div>
        </section>

        <section className="experience section" id="experience">
          <SectionTitle number="04" label="Experience" />
          <Reveal className="experience-heading"><h2>BUILDING WITH<br /><em>INTENT &amp; CURIOSITY.</em></h2></Reveal>
          <div className="experience-list">
            {experience.map(([date, company, role, place], i) => (
              <Reveal className="experience-row" delay={i * 0.07} key={company}>
                <span>{date}</span><h3>{company}</h3><p>{role}</p><small>{place}</small>
              </Reveal>
            ))}
          </div>
          <Reveal className="toolbox">
            <span>SELECTED TOOLBOX</span>
            <div>{["Figma", "React", "TypeScript", "Tailwind CSS", "Framer Motion", "Vite"].map((tool) => <i key={tool}>{tool}</i>)}</div>
          </Reveal>
        </section>

        <section className="contact" id="contact">
          <div className="contact-glow" aria-hidden="true" />
          <div className="contact-top"><SectionTitle number="05" label="Contact" /><span>Have a project in mind?</span></div>
          <Reveal className="contact-title"><h2>LET&apos;S MAKE<br /><span>SOMETHING</span><br />UNFORGETTABLE.</h2></Reveal>
          <Reveal className="contact-action"><Magnetic href="mailto:chetankhade10@gmail.com?subject=Project%20enquiry">Start a project</Magnetic><p>Have an opportunity, collaboration, or idea in mind? Let&apos;s turn it into a memorable digital experience.</p></Reveal>
          <footer>
            <a href="mailto:chetankhade10@gmail.com" data-cursor="grow">chetankhade10@gmail.com</a>
            <div><a href="https://www.instagram.com/__mr.chetan_/" target="_blank" rel="noreferrer" data-cursor="grow">Instagram · @__MR.CHETAN_</a></div>
            <span>© 2026 Chetan C. Khade · Amravati</span>
          </footer>
        </section>
      </main>
    </>
  );
}
