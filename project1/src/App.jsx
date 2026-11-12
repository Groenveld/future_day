import * as React from 'react';
import { verityies } from './verityies.js';

const App = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedID, setSelectedID] = React.useState(null);
  const [isScary, setIsScary] = React.useState(false);
  const [phase, setPhase] = React.useState(null); // null, 'secret' or 'dark'
  const clicks = React.useRef({ objectID: null, times: [] });
  const song = React.useRef(null);
  const [songState, setSongState] = React.useState('off'); // 'off' or 'playing'
  const [hint, setHint] = React.useState(0); // 0 = hidden, otherwise a counter that restarts the fade
  const hintTimer = React.useRef(null);

  // In scary mode, every ball uses its transformed form
  const balls = isScary
    ? verityies.map((ball) => ({ ...ball, ...ball.scary }))
    : verityies;

  // Secrets: click the same ball 5 times within 3 seconds
  //   Verity  (objectID 0) -> plays or stops the song
  //   Falsity (objectID 1) -> the scary transformation
  const countClick = (objectID) => {
    showHint();
    const now = Date.now();
    const sameBall = clicks.current.objectID === objectID;
    const times = sameBall ? clicks.current.times.filter((time) => now - time < 3000) : [];
    clicks.current = { objectID, times: [...times, now] };

    if (clicks.current.times.length >= 5) {
      clicks.current = { objectID: null, times: [] };
      if (objectID === 0) toggleSong();
      if (objectID === 1) startSecret();
    }
  };

  // A see-through tip that fades away after 3 seconds.
  // It only appears on 1 out of 5 clicks (20%), so it stays a surprise.
  const HINT_CHANCE = 0.2;
  const showHint = () => {
    if (Math.random() >= HINT_CHANCE) return;
    setHint((count) => count + 1);
    clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setHint(0), 3000);
  };

  // "It's me, it's Verity" by Horror Skunx. The file goes in public/its-me-its-verity.mp3
  const toggleSong = () => {
    if (!song.current) {
      song.current = new Audio(`${import.meta.env.BASE_URL}its-me-its-verity.mp3`);
      song.current.loop = true;
    }
    if (songState === 'playing') {
      song.current.pause();
      song.current.currentTime = 0;
      setSongState('off');
    } else {
      song.current
        .play()
        .then(() => setSongState('playing'))
        .catch(() => setSongState('off')); // no song file yet: just do nothing
    }
  };

  const startSecret = () => {
    setPhase('secret'); // 1. the secret animation
    setTimeout(() => {
      setPhase('dark'); // 2. the screen goes dark...
      setSelectedID(null);
      setIsScary(!isScary); // ...and while it is dark, everybody transforms
    }, 2200);
    setTimeout(() => setPhase(null), 2700); // 3. light again after 0.5 seconds
  };

  React.useEffect(() => {
    document.body.classList.toggle('scary', isScary);
  }, [isScary]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Clicking the logo: back to the starting screen with all the balls
  const goHome = () => {
    setSelectedID(null);
    setSearchTerm('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelect = (objectID) => {
    countClick(objectID);
    setSelectedID(objectID);
  };

  const searchedBalls = balls.filter((ball) =>
    ball.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedBall = balls.find((ball) => ball.objectID === selectedID);
  const falsity = balls.find((ball) => ball.objectID === 1);

  return (
    <main>
      <h1 className="title">
        <button type="button" className="title-link" onClick={goHome} title="Back to all Verity’ies">
          WikiVerity
        </button>
      </h1>

      {selectedBall ? (
        <Article
          {...selectedBall}
          isScary={isScary}
          others={balls.filter((ball) => ball.objectID !== selectedID)}
          onBallClick={() => countClick(selectedID)}
          onSelect={handleSelect}
          onBack={() => setSelectedID(null)}
        />
      ) : (
        <>
          <Search search={searchTerm} onSearch={handleSearch} />
          <List list={searchedBalls} isScary={isScary} onSelect={handleSelect} />
        </>
      )}

      {songState !== 'off' && (
        <NowPlaying
          onStop={() => {
            song.current?.pause();
            setSongState('off');
          }}
        />
      )}

      {hint > 0 && (
        <p key={hint} className="secret-tip" aria-hidden="true">
          click falsity 5 times..
        </p>
      )}

      {phase === 'secret' && <SecretAnimation ball={falsity} isScary={isScary} />}
      {phase === 'dark' && <div className="darkness" />}
    </main>
  );
};

// A little bar at the bottom while the song plays
const NowPlaying = ({ onStop }) => (
  <div className="now-playing" role="status">
    <span>
      <span className="note">♪</span> It’s me, it’s Verity – Horror Skunx
    </span>
    <button type="button" onClick={onStop} aria-label="Stop">
      ■
    </button>
  </div>
);

// Falsity spins and glitches in the middle of the screen
const SecretAnimation = ({ ball, isScary }) => (
  <div className="secret">
    <div className="secret-ball">
      <Ball color={ball.color} face={ball.face} horns={ball.horns} size={260} />
    </div>
    <p className="secret-text">
      {isScary ? '...or was it all just a lie?' : 'Falsity was lying all along...'}
    </p>
  </div>
);

const Search = ({ search, onSearch }) => (
  <div className="search">
    <label htmlFor="search">Find a ball: </label>
    <input id="search" type="text" value={search} onChange={onSearch} />
  </div>
);

const List = ({ list, isScary, onSelect }) => (
  <ul className="list">
    {list.map(({ objectID, ...ball }) => (
      <Item key={objectID} {...ball} isScary={isScary} onClick={() => onSelect(objectID)} />
    ))}
  </ul>
);

const Item = ({ name, color, face, horns, size, isScary, onClick }) => (
  <li>
    <button type="button" className="item" onClick={onClick}>
      <Ball color={color} face={face} horns={horns} size={size} />
      <h2>{name}</h2>
      <p className="hint">{isScary ? 'Click me... if you dare' : 'Click me!'}</p>
    </button>
  </li>
);

// A WikiVerity article about one ball. Clicking the ball in the box makes it wiggle.
const Article = ({
  name, color, face, horns, size, intro, infobox, sections,
  isScary, others, onBallClick, onSelect, onBack,
}) => {
  const anchor = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Go to the top of the page when a new article opens
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [name]);

  return (
    <article className="article">
      <button type="button" className="back back-top" onClick={onBack}>
        ← All Verity’ies
      </button>

      <h2 className="article-title">{name}</h2>
      <p className="tagline">
        From WikiVerity, the {isScary ? 'cursed' : 'free'} Verity’ie encyclopedia
      </p>

      <aside className="infobox">
        <div className="infobox-name">{name}</div>
        <button type="button" className="detail-ball" onClick={onBallClick} aria-label={name}>
          <Ball color={color} face={face} horns={horns} size={Math.min(size * 1.4, 220)} />
        </button>
        <table>
          <tbody>
            {Object.entries(infobox).map(([label, value]) => (
              <tr key={label}>
                <th>{label}</th>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </aside>

      {/* Like on Wikipedia, the name at the start of the intro is bold */}
      <p>
        {intro.startsWith(name) ? (
          <>
            <b>{name}</b>
            {intro.slice(name.length)}
          </>
        ) : (
          intro
        )}
      </p>

      <nav className="contents">
        <div className="contents-title">Contents</div>
        <ol>
          {sections.map((section) => (
            <li key={section.title}>
              <a href={`#${anchor(section.title)}`}>{section.title}</a>
            </li>
          ))}
          <li>
            <a href="#see-also">See also</a>
          </li>
        </ol>
      </nav>

      {sections.map((section) => (
        <section key={section.title}>
          <h3 id={anchor(section.title)}>{section.title}</h3>
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {section.list && (
            <ul>
              {section.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <section>
        <h3 id="see-also">See also</h3>
        <ul>
          {others.map((other) => (
            <li key={other.objectID}>
              <button type="button" className="link" onClick={() => onSelect(other.objectID)}>
                {other.name}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <button type="button" className="back" onClick={onBack}>
        ← Back to all Verity’ies{isScary ? ' (if you can)' : ''}
      </button>
    </article>
  );
};

const scaryFaces = ['monster', 'evilcool', 'heartbreak', 'fallen', 'manyeyes', 'hollow', 'imposter'];

// Gradients the normal faces share
const NiceDefs = () => (
  <>
    <filter id="nice-blur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="1.6" />
    </filter>
    <radialGradient id="nice-shine" cx="50%" cy="50%" r="50%">
      <stop offset="0" stopColor="#fff" stopOpacity="0.85" />
      <stop offset="1" stopColor="#fff" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="nice-eye" cx="40%" cy="35%" r="65%">
      <stop offset="0" stopColor="#5a4636" />
      <stop offset="1" stopColor="#120c08" />
    </radialGradient>
    <linearGradient id="nice-mouth" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#4a0a18" />
      <stop offset="1" stopColor="#a3243b" />
    </linearGradient>
    <linearGradient id="nice-gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#fff2b0" />
      <stop offset="0.45" stopColor="#ffc300" />
      <stop offset="1" stopColor="#a87400" />
    </linearGradient>
    <linearGradient id="nice-heart" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#ff5c7a" />
      <stop offset="1" stopColor="#c9002b" />
    </linearGradient>
    <linearGradient id="nice-hair" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#7a5432" />
      <stop offset="1" stopColor="#2e1d10" />
    </linearGradient>
    <linearGradient id="nice-glass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#4a4a5a" />
      <stop offset="0.5" stopColor="#0a0a12" />
      <stop offset="1" stopColor="#23233a" />
    </linearGradient>
    <radialGradient id="nice-white" cx="45%" cy="40%" r="60%">
      <stop offset="0" stopColor="#fff" />
      <stop offset="1" stopColor="#dfe6ee" />
    </radialGradient>
  </>
);

// Draws one ball with a face.
// Normal faces: happy, sly, angry, cool, love, laugh, angel, curious, serious, sus
// Scary faces: monster, evilcool, heartbreak, fallen, manyeyes, hollow, imposter
// Mixes a #rrggbb color with white (amount > 0) or black (amount < 0)
const shade = (hex, amount) => {
  const target = amount > 0 ? 255 : 0;
  const mix = (i) => {
    const c = parseInt(hex.slice(i, i + 2), 16);
    return Math.round(c + (target - c) * Math.abs(amount)).toString(16).padStart(2, '0');
  };
  return `#${mix(1)}${mix(3)}${mix(5)}`;
};

// Gradients and filters the evil faces share. Every ball gets its own copy,
// so they keep working when the other balls are hidden.
const EvilDefs = () => (
  <>
    <filter id="evil-blur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2.2" />
    </filter>
    <filter id="evil-aura" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3.5" />
    </filter>
    <radialGradient id="evil-eye-red" cx="50%" cy="45%" r="55%">
      <stop offset="0" stopColor="#fff6c8" />
      <stop offset="0.3" stopColor="#ffb21a" />
      <stop offset="0.65" stopColor="#ff1a1a" />
      <stop offset="1" stopColor="#5c0000" />
    </radialGradient>
    <radialGradient id="evil-eye-green" cx="50%" cy="45%" r="55%">
      <stop offset="0" stopColor="#f4ffd8" />
      <stop offset="0.3" stopColor="#b6ff5c" />
      <stop offset="0.65" stopColor="#39ff14" />
      <stop offset="1" stopColor="#0b4a00" />
    </radialGradient>
    <radialGradient id="evil-mouth" cx="50%" cy="30%" r="70%">
      <stop offset="0" stopColor="#6b0000" />
      <stop offset="1" stopColor="#0a0000" />
    </radialGradient>
    <linearGradient id="evil-tooth" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#fffdf2" />
      <stop offset="1" stopColor="#d9cda6" />
    </linearGradient>
    <linearGradient id="evil-horn" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stopColor="#120000" />
      <stop offset="0.6" stopColor="#4a0a0a" />
      <stop offset="1" stopColor="#8a2a1a" />
    </linearGradient>
    <linearGradient id="evil-gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#ffe08a" />
      <stop offset="0.5" stopColor="#a87b00" />
      <stop offset="1" stopColor="#4a3400" />
    </linearGradient>
    <linearGradient id="evil-heart" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#ff5c7a" />
      <stop offset="1" stopColor="#5c0014" />
    </linearGradient>
    <linearGradient id="evil-glass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#3a3a3a" />
      <stop offset="0.5" stopColor="#050505" />
      <stop offset="1" stopColor="#1a1a1a" />
    </linearGradient>
  </>
);

// Draws one ball with a face.
// Normal faces: happy, sly, angry, cool, love, laugh, angel, curious, serious, sus
// Scary faces: monster, evilcool, heartbreak, fallen, manyeyes, hollow, imposter
const Ball = ({ color, face, size, horns }) => {
  const id = React.useId().replace(/:/g, '');
  const scary = scaryFaces.includes(face);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {!scary && (
          <>
            <NiceDefs />
            <radialGradient id={`body-${id}`} cx="38%" cy="30%" r="72%">
              <stop offset="0" stopColor={shade(color, 0.35)} />
              <stop offset="0.6" stopColor={color} />
              <stop offset="1" stopColor={shade(color, -0.3)} />
            </radialGradient>
          </>
        )}
        {scary && (
          <>
            <EvilDefs />
            {/* light from the top left, deep shadow at the edges */}
            <radialGradient id={`body-${id}`} cx="38%" cy="32%" r="70%">
              <stop offset="0" stopColor={shade(color, 0.28)} />
              <stop offset="0.55" stopColor={color} />
              <stop offset="1" stopColor={shade(color, -0.7)} />
            </radialGradient>
          </>
        )}
      </defs>

      {scary && <circle cx="50" cy="52" r="47" fill="#ff0000" opacity="0.35" filter="url(#evil-aura)" />}
      {!scary && <ellipse cx="50" cy="99" rx="30" ry="3.5" fill="#000" opacity="0.18" filter="url(#nice-blur)" />}

      {horns && (
        <g stroke="#000" strokeWidth="1.5" strokeLinejoin="round">
          <path d="M19 32 C12 23 9 12 12 2 C18 11 27 15 37 17 Z" fill="url(#evil-horn)" />
          <path d="M81 32 C88 23 91 12 88 2 C82 11 73 15 63 17 Z" fill="url(#evil-horn)" />
        </g>
      )}

      <circle
        cx="50"
        cy="50"
        r="46"
        fill={`url(#body-${id})`}
        stroke={scary ? '#0a0000' : shade(color, -0.6)}
        strokeWidth="3"
      />
      {!['cool', 'sus'].includes(face) && !scary && (
        // a soft gloss, like on a shiny ball
        <>
          <ellipse cx="33" cy="25" rx="14" ry="7.5" transform="rotate(-32 33 25)" fill="url(#nice-shine)" />
          <circle cx="26" cy="21" r="2.2" fill="#fff" opacity="0.9" />
        </>
      )}
      {scary && (
        // a glowing crack, like embers inside the ball
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M90 34 L82 41 L86 46 L78 54 L81 60 M86 46 L93 48" stroke="#ff4d1a" strokeWidth="3.5" opacity="0.55" filter="url(#evil-blur)" />
          <path d="M90 34 L82 41 L86 46 L78 54 L81 60 M86 46 L93 48" stroke="#1a0000" strokeWidth="2" />
          <path d="M90 34 L82 41 L86 46 L78 54 L81 60 M86 46 L93 48" stroke="#ffb066" strokeWidth="0.7" />
        </g>
      )}
      <Face face={face} color={color} />
    </svg>
  );
};

// ---------- Parts of the normal faces ----------

// A glossy cartoon eye with two little lights in it
const CuteEye = ({ x, y, r = 5.5 }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="url(#nice-eye)" />
    <circle cx={x - r * 0.32} cy={y - r * 0.36} r={r * 0.38} fill="#fff" />
    <circle cx={x + r * 0.38} cy={y + r * 0.32} r={r * 0.17} fill="#fff" opacity="0.85" />
  </g>
);

// Rosy cheeks
const Blush = ({ y = 57 }) => (
  <g fill="#ff5c8a" opacity="0.38" filter="url(#nice-blur)">
    <ellipse cx="25" cy={y} rx="7" ry="4" />
    <ellipse cx="75" cy={y} rx="7" ry="4" />
  </g>
);

// ---------- Parts of the evil faces ----------

// A glowing demon eye with a slit pupil
const EvilEye = ({ x, y, r, green }) => (
  <g>
    <circle cx={x} cy={y} r={r * 1.9} fill={green ? '#39ff14' : '#ff1a1a'} opacity="0.45" filter="url(#evil-blur)" />
    <circle cx={x} cy={y} r={r} fill={`url(#evil-eye-${green ? 'green' : 'red'})`} />
    <ellipse cx={x} cy={y} rx={r * 0.24} ry={r * 0.82} fill="#0a0000" />
    <circle cx={x - r * 0.38} cy={y - r * 0.42} r={r * 0.2} fill="#fff" opacity="0.9" />
  </g>
);

// A tapered eyebrow: thin at (x1, y1), thick at (x2, y2)
const Brow = ({ x1, y1, x2, y2, width = 5 }) => {
  const length = Math.hypot(x2 - x1, y2 - y1);
  const nx = -(y2 - y1) / length;
  const ny = (x2 - x1) / length;
  const d = `M${x1 + nx * width * 0.2} ${y1 + ny * width * 0.2} L${x2 + nx * width * 0.5} ${y2 + ny * width * 0.5} L${x2 - nx * width * 0.5} ${y2 - ny * width * 0.5} L${x1 - nx * width * 0.2} ${y1 - ny * width * 0.2} Z`;
  return <path d={d} fill="#140000" stroke="#140000" strokeWidth="1" strokeLinejoin="round" />;
};

// A wide open grin with real teeth and fangs
const curve = (p0, p1, p2, t) => [
  (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t ** 2 * p2[0],
  (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t ** 2 * p2[1],
];
const LEFT = [27, 60];
const RIGHT = [73, 60];
const UPPER = [50, 66];
const LOWER = [50, 96];
const teethPath = (control, count, length, fangLength, direction) => {
  let d = '';
  for (let i = 0; i < count; i++) {
    const t1 = 0.05 + (0.9 * i) / count;
    const t2 = 0.05 + (0.9 * (i + 1)) / count;
    const a = curve(LEFT, control, RIGHT, t1);
    const b = curve(LEFT, control, RIGHT, t2);
    const mid = (t1 + t2) / 2;
    const opening = curve(LEFT, LOWER, RIGHT, mid)[1] - curve(LEFT, UPPER, RIGHT, mid)[1];
    const isFang = i === 1 || i === count - 2;
    const tooth = Math.min(isFang ? fangLength : length, opening * (isFang ? 0.75 : 0.5));
    const tip = curve(LEFT, control, RIGHT, mid);
    d += `M${a[0]} ${a[1]} L${tip[0]} ${tip[1] + direction * tooth} L${b[0]} ${b[1]} Z `;
  }
  return d;
};
const UPPER_TEETH = teethPath(UPPER, 8, 5.5, 10, 1);
const LOWER_TEETH = teethPath(LOWER, 7, 4.5, 7, -1);
const MOUTH = `M${LEFT} Q${UPPER} ${RIGHT} Q${LOWER} ${LEFT} Z`;

const EvilGrin = () => (
  <g>
    <path d={MOUTH} fill="url(#evil-mouth)" />
    <ellipse cx="50" cy="76" rx="9" ry="3.5" fill="#8a0a1a" opacity="0.8" />
    <g fill="url(#evil-tooth)" stroke="#2a0000" strokeWidth="0.6" strokeLinejoin="round">
      <path d={UPPER_TEETH} />
      <path d={LOWER_TEETH} />
    </g>
    <path d={MOUTH} fill="none" stroke="#0a0000" strokeWidth="2.2" strokeLinejoin="round" />
  </g>
);

const Face = ({ face, color = '#ffd23f' }) => {
  const line = { stroke: '#2a1a14', strokeWidth: 3.2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };

  const teeth = <EvilGrin />;

  if (face === 'monster') {
    return (
      <>
        <Brow x1={22} y1={30} x2={46} y2={40} />
        <Brow x1={78} y1={30} x2={54} y2={40} />
        <EvilEye x={37} y={46} r={6} />
        <EvilEye x={63} y={46} r={6} />
        {teeth}
      </>
    );
  }

  if (face === 'fallen') {
    return (
      <>
        {/* broken halo, glowing red, one piece falling off */}
        <g fill="none" strokeLinecap="round" filter="url(#glow)">
          <path d="M28 10 Q30 3 47 3" stroke="#b30000" strokeWidth="3.2" />
          <path d="M55 3 Q70 3 73 9 Q69 14 58 14" stroke="#b30000" strokeWidth="3.2" />
          <path d="M44 13 L49 15" stroke="#b30000" strokeWidth="2.5" />
        </g>
        <Brow x1={24} y1={33} x2={45} y2={41} />
        <Brow x1={76} y1={33} x2={55} y2={41} />
        <EvilEye x={37} y={47} r={5.5} />
        <EvilEye x={63} y={47} r={5.5} />
        {/* black tears */}
        <g fill="#000" stroke="#000" strokeLinecap="round" opacity="0.75">
          <path d="M36 53 L35.6 58" strokeWidth="1.8" />
          <circle cx="35.6" cy="58.6" r="1.4" />
          <path d="M64 53 L64.4 56" strokeWidth="1.8" />
          <circle cx="64.4" cy="56.6" r="1.2" />
        </g>
        {teeth}
      </>
    );
  }

  if (face === 'manyeyes') {
    const glowingEyes = [
      [36, 40, 6.5], [64, 40, 6.5], [50, 22, 4.5], [22, 52, 3.8], [78, 52, 3.8],
      [29, 24, 3.2], [71, 24, 3.2], [50, 47, 3],
    ];
    return (
      <>
        {glowingEyes.map(([x, y, r]) => (
          <EvilEye key={`${x}-${y}`} x={x} y={y} r={r} green />
        ))}
        {teeth}
      </>
    );
  }

  if (face === 'evilcool') {
    return (
      <>
        {/* spiky black hair with a little shine */}
        <path
          d="M18 34 L14 6 L30 18 L36 2 L46 16 L58 0 L62 16 L76 4 L74 20 L86 18 Q76 26 70 24 Q50 14 18 34 Z"
          fill="#0d0d0d"
          stroke="#000"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M30 22 L34 10 M46 18 L56 6" stroke="#555" strokeWidth="1.2" strokeLinecap="round" />
        {/* red eyes glowing through the sunglasses */}
        <EvilEye x={34} y={47} r={4} />
        <EvilEye x={66} y={47} r={4} />
        <g opacity="0.82">
          <path d="M21 40 H47 Q46 54 34 54 Q22 54 21 40 Z" fill="url(#evil-glass)" />
          <path d="M53 40 H79 Q78 54 66 54 Q54 54 53 40 Z" fill="url(#evil-glass)" />
        </g>
        <path d="M21 40 H47 Q46 54 34 54 Q22 54 21 40 Z M53 40 H79 Q78 54 66 54 Q54 54 53 40 Z" fill="none" stroke="#000" strokeWidth="1.8" />
        <path d="M25 43 L31 43 M57 43 L63 43" stroke="#fff" strokeWidth="1.2" opacity="0.35" strokeLinecap="round" />
        <path d="M47 42 Q50 39 53 42" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* cracked lens */}
        <path d="M58 40 L63 46 L60 49 L66 54" fill="none" stroke="#fff" strokeWidth="1" opacity="0.8" />
        {teeth}
      </>
    );
  }

  if (face === 'heartbreak') {
    const heart = 'M0 3 C0 -2 -7.5 -2.5 -7.5 3 C-7.5 7.5 0 12 0 12 C0 12 7.5 7.5 7.5 3 C7.5 -2.5 0 -2 0 3 Z';
    const crack = 'M0 1.5 L-2 5 L1 7.5 L-1 11.5';
    return (
      <>
        {[36, 64].map((x) => (
          <g key={x} transform={`translate(${x} 37)`}>
            <path d={heart} fill="#ff1a4a" opacity="0.5" filter="url(#evil-blur)" />
            <path d={heart} fill="url(#evil-heart)" stroke="#2a0008" strokeWidth="0.8" />
            <path d={crack} stroke="#1a0000" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
            <path d={crack} stroke="#ffb3c1" strokeWidth="0.5" fill="none" strokeLinejoin="round" />
            <circle cx="-3" cy="1.5" r="1.1" fill="#fff" opacity="0.7" />
          </g>
        ))}
        <Brow x1={27} y1={33} x2={44} y2={28} width={4} />
        <Brow x1={73} y1={33} x2={56} y2={28} width={4} />
        {teeth}
      </>
    );
  }

  if (face === 'serious') {
    return (
      <>
        {/* straight, serious brows */}
        <path d="M26 35 L46 37" {...line} strokeWidth="3.6" />
        <path d="M54 37 L74 35" {...line} strokeWidth="3.6" />
        {/* left eye narrowed, right eye behind the monocle */}
        <path d="M29 44 Q37 39.5 45 44 Q37 48 29 44 Z" fill="url(#nice-eye)" />
        <circle cx="34.5" cy="43" r="1.2" fill="#fff" />
        <CuteEye x={63} y={44} r={4.2} />
        {/* golden monocle with a glass lens and a chain */}
        <circle cx="63" cy="44" r="10.5" fill="#cfe8ff" fillOpacity="0.25" stroke="url(#nice-gold)" strokeWidth="3" />
        <path d="M57 39 Q60 36 64 36" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
        <path d="M72 50 Q81 62 77 78" fill="none" stroke="url(#nice-gold)" strokeWidth="1.6" strokeDasharray="2.4 1.2" />
        {/* perfectly straight mouth */}
        <path d="M38 66 L62 66" {...line} />
      </>
    );
  }

  if (face === 'hollow') {
    return (
      <>
        <Brow x1={22} y1={33} x2={46} y2={40} />
        <Brow x1={78} y1={33} x2={54} y2={40} />
        {/* deep empty eye holes with a tiny light far inside */}
        <ellipse cx="37" cy="48" rx="9" ry="11" fill="#000" opacity="0.5" filter="url(#evil-blur)" />
        <ellipse cx="63" cy="48" rx="9" ry="11" fill="#000" opacity="0.5" filter="url(#evil-blur)" />
        <ellipse cx="37" cy="47" rx="6.5" ry="8.5" fill="#000" />
        <ellipse cx="63" cy="47" rx="6.5" ry="8.5" fill="#000" />
        <circle cx="37" cy="49" r="1.4" fill="#fff" filter="url(#glow)" />
        <circle cx="63" cy="49" r="1.4" fill="#fff" filter="url(#glow)" />
        {/* cracked golden monocle with a broken chain */}
        <circle cx="63" cy="47" r="12" fill="none" stroke="url(#evil-gold)" strokeWidth="3" />
        <path d="M55 37 L62 45 L57 50 L66 59" fill="none" stroke="#dcdcdc" strokeWidth="0.9" />
        <path d="M73 54 Q80 62 78 70" fill="none" stroke="url(#evil-gold)" strokeWidth="1.5" strokeDasharray="2 1.5" />
        {teeth}
      </>
    );
  }

  if (face === 'curious') {
    return (
      <>
        {/* big wide eyes looking up */}
        <circle cx="36" cy="45" r="10.5" fill="url(#nice-white)" stroke="#2a1a14" strokeWidth="2.2" />
        <circle cx="64" cy="45" r="10.5" fill="url(#nice-white)" stroke="#2a1a14" strokeWidth="2.2" />
        <CuteEye x={38.5} y={41} r={5} />
        <CuteEye x={66.5} y={41} r={5} />
        <path d="M26 29 Q35 21 45 28" {...line} />
        <path d="M55 28 Q65 21 74 29" {...line} />
        {/* small "ooh" mouth */}
        <ellipse cx="50" cy="69" rx="4.5" ry="5.5" fill="url(#nice-mouth)" stroke="#2a1a14" strokeWidth="2.2" />
        {/* question mark */}
        <text x="77" y="21" fontSize="24" fontWeight="900" fill="#2a1a14" stroke="#fff" strokeWidth="3" paintOrder="stroke" fontFamily="system-ui, sans-serif">?</text>
      </>
    );
  }

  if (face === 'laugh') {
    return (
      <>
        {/* eyes squeezed shut from laughing */}
        <path d="M28 45 Q37 34 46 45" {...line} strokeWidth="3.6" />
        <path d="M54 45 Q63 34 72 45" {...line} strokeWidth="3.6" />
        <Blush y={56} />
        {/* big open laughing mouth with teeth and a tongue */}
        <path d="M27 56 Q50 60 73 56 Q66 88 50 88 Q34 88 27 56 Z" fill="url(#nice-mouth)" />
        <path d="M30 57 Q50 61 70 57 L69 62 Q50 66 31 62 Z" fill="#fff" />
        <path d="M38 80 Q50 70 62 80 Q56 87 50 87 Q44 87 38 80 Z" fill="#ff8fab" />
        <path d="M27 56 Q50 60 73 56 Q66 88 50 88 Q34 88 27 56 Z" fill="none" stroke="#2a1a14" strokeWidth="3" strokeLinejoin="round" />
      </>
    );
  }

  if (face === 'angel') {
    return (
      <>
        {/* glowing golden halo */}
        <ellipse cx="50" cy="9" rx="24" ry="6" fill="none" stroke="#ffe066" strokeWidth="6" opacity="0.6" filter="url(#nice-blur)" />
        <ellipse cx="50" cy="9" rx="24" ry="6" fill="none" stroke="url(#nice-gold)" strokeWidth="3.5" />
        {/* peaceful closed eyes with lashes */}
        <path d="M29 45 Q37 52 45 45" {...line} />
        <path d="M55 45 Q63 52 71 45" {...line} />
        <path d="M29 45 L26 43 M71 45 L74 43" {...line} strokeWidth="2" />
        <Blush y={57} />
        <path d="M38 62 Q50 73 62 62" {...line} />
      </>
    );
  }

  if (face === 'cool') {
    return (
      <>
        {/* perfect hair, with shine */}
        <path
          d="M18 34 Q16 10 46 8 Q72 6 80 22 Q70 14 58 20 Q50 12 40 22 Q30 16 18 34 Z"
          fill="url(#nice-hair)"
          stroke="#1f140b"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M28 20 Q38 12 50 12 M56 13 Q66 12 72 16" fill="none" stroke="#c49a6c" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
        {/* shiny sunglasses */}
        <path d="M21 40 H47 Q46 54 34 54 Q22 54 21 40 Z" fill="url(#nice-glass)" stroke="#000" strokeWidth="1.5" />
        <path d="M53 40 H79 Q78 54 66 54 Q54 54 53 40 Z" fill="url(#nice-glass)" stroke="#000" strokeWidth="1.5" />
        <path d="M47 42 Q50 39 53 42" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M25 43 L32 50 M29 42 L33 46" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
        <path d="M57 43 L64 50 M61 42 L65 46" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
        {/* confident smile */}
        <path d="M36 66 Q52 76 66 63" {...line} />
        <path d="M66 63 L69 61" {...line} />
        {/* golden sparkle */}
        <path
          d="M88 8 L90 14 L96 16 L90 18 L88 24 L86 18 L80 16 L86 14 Z"
          fill="url(#nice-gold)"
          stroke="#7a5600"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </>
    );
  }

  if (face === 'love') {
    const heart = 'M0 3 C0 -2 -7.5 -2.5 -7.5 3 C-7.5 7.5 0 12 0 12 C0 12 7.5 7.5 7.5 3 C7.5 -2.5 0 -2 0 3 Z';
    return (
      <>
        {[36, 64].map((x) => (
          <g key={x} transform={`translate(${x} 37)`}>
            <path d={heart} fill="url(#nice-heart)" stroke="#8a001e" strokeWidth="0.8" />
            <ellipse cx="-3.5" cy="1.5" rx="1.8" ry="1.2" fill="#fff" opacity="0.85" />
          </g>
        ))}
        <Blush y={57} />
        <path d="M35 61 Q50 64 65 61 Q60 75 50 75 Q40 75 35 61 Z" fill="url(#nice-mouth)" stroke="#2a1a14" strokeWidth="2.8" strokeLinejoin="round" />
        <path d="M43 71 Q50 66 57 71 Q54 74 50 74 Q46 74 43 71 Z" fill="#ff8fab" />
      </>
    );
  }

  const eyes = (
    <>
      <CuteEye x={37} y={43} />
      <CuteEye x={63} y={43} />
    </>
  );

  if (face === 'angry') {
    return (
      <>
        {eyes}
        {/* heavy angry brows that push down on the eyes */}
        <path d="M26 31 L45 39" {...line} strokeWidth="4.5" />
        <path d="M74 31 L55 39" {...line} strokeWidth="4.5" />
        <path d="M36 71 Q50 61 64 71" {...line} />
      </>
    );
  }

  if (face === 'sus') {
    return (
      <>
        {/* one eyebrow way up, one flat */}
        <path d="M27 30 Q36 22 45 29" {...line} />
        <path d="M55 36 L73 34" {...line} />
        {/* side-eye: half-closed lids, pupils looking to the side */}
        <path d="M28 42 Q37 36 46 42 Q37 48 28 42 Z" fill="url(#nice-white)" stroke="#2a1a14" strokeWidth="2" />
        <path d="M54 42 Q63 37 72 42 Q63 47 54 42 Z" fill="url(#nice-white)" stroke="#2a1a14" strokeWidth="2" />
        <CuteEye x={42} y={42} r={3.6} />
        <CuteEye x={68} y={42} r={3.6} />
        <path d="M54 40 L72 40" stroke={shade(color, -0.25)} strokeWidth="3" strokeLinecap="round" />
        <path d="M54 40.5 L72 40.5" stroke="#2a1a14" strokeWidth="1.6" strokeLinecap="round" />
        {/* crooked smirk with a dimple */}
        <path d="M38 66 Q52 70 64 60" {...line} />
        <path d="M64 60 Q67 60 67 63" {...line} strokeWidth="2" />
      </>
    );
  }

  if (face === 'imposter') {
    return (
      <>
        {/* one brow raised high, one flat and low */}
        <path d="M25 32 Q36 22 47 33" fill="none" stroke="#140000" strokeWidth="4.5" strokeLinecap="round" />
        <Brow x1={54} y1={37} x2={76} y2={32} />
        {/* almond side-eyes with glowing red irises looking to the side */}
        <path d="M27 45 Q37 37 47 45 Q37 52 27 45 Z" fill="#050000" stroke="#000" strokeWidth="1" />
        <path d="M53 45 Q63 38 73 45 Q63 51 53 45 Z" fill="#050000" stroke="#000" strokeWidth="1" />
        <EvilEye x={42} y={45} r={3.6} />
        <EvilEye x={68} y={45} r={3.6} />
        {teeth}
      </>
    );
  }

  if (face === 'sly') {
    return (
      <>
        {eyes}
        <path d="M28 32 Q37 25 46 31" {...line} />
        <path d="M55 35 L72 34" {...line} />
        {/* sly half smile with a dimple */}
        <path d="M36 64 Q56 72 68 58" {...line} />
        <path d="M68 58 Q71 58 71 61" {...line} strokeWidth="2" />
      </>
    );
  }

  // happy (the default): a big friendly open smile
  return (
    <>
      {eyes}
      <Blush y={56} />
      <path d="M31 58 Q50 63 69 58 Q64 80 50 80 Q36 80 31 58 Z" fill="url(#nice-mouth)" />
      <path d="M41 73 Q50 66 59 73 Q55 79 50 79 Q45 79 41 73 Z" fill="#ff8fab" />
      <path d="M31 58 Q50 63 69 58 Q64 80 50 80 Q36 80 31 58 Z" fill="none" stroke="#2a1a14" strokeWidth="3" strokeLinejoin="round" />
    </>
  );
};

export default App;
