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

  // In scary mode, every ball uses its transformed form
  const balls = isScary
    ? verityies.map((ball) => ({ ...ball, ...ball.scary }))
    : verityies;

  // Secrets: click the same ball 5 times within 3 seconds
  //   Verity  (objectID 0) -> plays or stops the song
  //   Falsity (objectID 1) -> the scary transformation
  const countClick = (objectID) => {
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
      <h1 className="title">WikiVerity</h1>

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

const scaryFaces = ['monster', 'evilcool', 'heartbreak', 'fallen', 'manyeyes', 'hollow'];

// Draws one ball with a face.
// Normal faces: happy, sly, angry, cool, love, laugh, angel, curious, serious
// Scary faces: monster, evilcool, heartbreak, fallen, manyeyes, hollow
const Ball = ({ color, face, size, horns }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
    <defs>
      <filter id="glow">
        <feGaussianBlur stdDeviation="1.6" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    {horns && (
      <>
        <path d="M18 30 L10 0 L36 14 Z" fill="#2b0000" stroke="#000" strokeWidth="2" />
        <path d="M82 30 L90 0 L64 14 Z" fill="#2b0000" stroke="#000" strokeWidth="2" />
      </>
    )}
    <circle cx="50" cy="50" r="46" fill={color} stroke="#222" strokeWidth="3" />
    {face !== 'cool' && !scaryFaces.includes(face) && (
      <circle cx="35" cy="30" r="10" fill="#fff" opacity="0.35" />
    )}
    {scaryFaces.includes(face) && (
      <path d="M78 22 L70 34 L76 38 L66 50" fill="none" stroke="#000" strokeWidth="1.5" />
    )}
    <Face face={face} />
  </svg>
);

const Face = ({ face }) => {
  const line = { stroke: '#222', strokeWidth: 3, fill: 'none', strokeLinecap: 'round' };

  // Jagged mouth with sharp teeth, used by the scary faces
  const teeth = (
    <path
      d="M28 62 Q50 84 72 62 Z M30 63 L35 70 L40 64 L45 72 L50 65 L55 72 L60 64 L65 70 L70 63"
      fill="#000"
      stroke="#fff"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  );

  if (face === 'monster') {
    return (
      <>
        <path d="M24 30 L45 40" {...line} strokeWidth="4" />
        <path d="M76 30 L55 40" {...line} strokeWidth="4" />
        <circle cx="37" cy="45" r="6" fill="#ff1a1a" filter="url(#glow)" />
        <circle cx="63" cy="45" r="6" fill="#ff1a1a" filter="url(#glow)" />
        <circle cx="37" cy="45" r="2" fill="#fff" />
        <circle cx="63" cy="45" r="2" fill="#fff" />
        {teeth}
      </>
    );
  }

  if (face === 'fallen') {
    return (
      <>
        {/* broken red halo */}
        <path d="M24 12 Q30 4 48 4 L46 9 L50 12 Q36 12 28 15 Z" fill="none" stroke="#c00000" strokeWidth="3" filter="url(#glow)" />
        <path d="M56 4 Q72 4 76 12 Q70 16 58 13" fill="none" stroke="#c00000" strokeWidth="3" filter="url(#glow)" />
        <path d="M26 34 L44 40" {...line} strokeWidth="4" />
        <path d="M74 34 L56 40" {...line} strokeWidth="4" />
        <circle cx="37" cy="46" r="5" fill="#ff1a1a" filter="url(#glow)" />
        <circle cx="63" cy="46" r="5" fill="#ff1a1a" filter="url(#glow)" />
        <path d="M30 54 L32 66 M70 54 L68 66" stroke="#000" strokeWidth="2" strokeLinecap="round" />
        {teeth}
      </>
    );
  }

  if (face === 'manyeyes') {
    const glowingEyes = [
      [36, 40, 6], [64, 40, 6], [50, 24, 4], [24, 56, 3.5], [76, 56, 3.5],
      [30, 24, 3], [70, 24, 3], [50, 50, 3],
    ];
    return (
      <>
        {glowingEyes.map(([x, y, r]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r={r} fill="#39ff14" filter="url(#glow)" />
            <circle cx={x} cy={y} r={r / 2.5} fill="#000" />
          </g>
        ))}
        {teeth}
      </>
    );
  }

  if (face === 'evilcool') {
    return (
      <>
        <path
          d="M18 34 L14 6 L30 18 L36 2 L46 16 L58 0 L62 16 L76 4 L74 20 L86 18 Q76 26 70 24 Q50 14 18 34 Z"
          fill="#111"
          stroke="#000"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M21 40 H47 Q46 54 34 54 Q22 54 21 40 Z" fill="#111" />
        <path d="M53 40 H79 Q78 54 66 54 Q54 54 53 40 Z" fill="#111" />
        <path d="M47 42 Q50 39 53 42" {...line} strokeWidth="2.5" />
        <circle cx="34" cy="47" r="3.5" fill="#ff1a1a" filter="url(#glow)" />
        <circle cx="66" cy="47" r="3.5" fill="#ff1a1a" filter="url(#glow)" />
        <path d="M58 40 L63 46 L60 49 L66 54" fill="none" stroke="#fff" strokeWidth="1.2" />
        {teeth}
      </>
    );
  }

  if (face === 'heartbreak') {
    const heart = 'M0 3 C0 -2 -7 -2 -7 3 C-7 7 0 11 0 11 C0 11 7 7 7 3 C7 -2 0 -2 0 3 Z';
    const crack = 'M0 1 L-2 5 L1 7 L-1 11';
    return (
      <>
        <path d={heart} transform="translate(36 36)" fill="#3a0000" filter="url(#glow)" />
        <path d={heart} transform="translate(64 36)" fill="#3a0000" filter="url(#glow)" />
        <path d={crack} transform="translate(36 36)" stroke="#ff4d6d" strokeWidth="1.2" fill="none" />
        <path d={crack} transform="translate(64 36)" stroke="#ff4d6d" strokeWidth="1.2" fill="none" />
        <path d="M30 34 L42 30" {...line} />
        <path d="M70 34 L58 30" {...line} />
        {teeth}
      </>
    );
  }

  if (face === 'serious') {
    return (
      <>
        {/* narrowed, thinking eyes */}
        <path d="M26 36 L46 38" {...line} />
        <path d="M54 38 L74 36" {...line} />
        <path d="M30 44 Q37 40 44 44 Q37 47 30 44 Z" fill="#222" />
        <circle cx="63" cy="44" r="4" fill="#222" />
        {/* golden monocle with a chain */}
        <circle cx="63" cy="44" r="10" fill="#fff" fillOpacity="0.25" stroke="#d4a017" strokeWidth="3" />
        <path d="M71 50 Q80 62 76 78" fill="none" stroke="#d4a017" strokeWidth="1.5" />
        {/* perfectly straight mouth */}
        <path d="M38 66 L62 66" {...line} />
      </>
    );
  }

  if (face === 'hollow') {
    return (
      <>
        <path d="M24 34 L46 40" {...line} strokeWidth="4" />
        <path d="M76 34 L54 40" {...line} strokeWidth="4" />
        <ellipse cx="37" cy="47" rx="7" ry="9" fill="#000" />
        <ellipse cx="63" cy="47" rx="7" ry="9" fill="#000" />
        <circle cx="37" cy="49" r="1.5" fill="#fff" filter="url(#glow)" />
        <circle cx="63" cy="49" r="1.5" fill="#fff" filter="url(#glow)" />
        {/* cracked monocle */}
        <circle cx="63" cy="47" r="12" fill="none" stroke="#6b5200" strokeWidth="2.5" />
        <path d="M56 38 L62 46 L58 50 L66 58" fill="none" stroke="#bbb" strokeWidth="1" />
        {teeth}
      </>
    );
  }

  if (face === 'curious') {
    return (
      <>
        {/* big wide eyes looking up */}
        <circle cx="36" cy="44" r="10" fill="#fff" stroke="#222" strokeWidth="2.5" />
        <circle cx="64" cy="44" r="10" fill="#fff" stroke="#222" strokeWidth="2.5" />
        <circle cx="39" cy="40" r="4.5" fill="#222" />
        <circle cx="67" cy="40" r="4.5" fill="#222" />
        <path d="M28 28 Q36 22 44 28" {...line} />
        <circle cx="50" cy="68" r="5" fill="#222" />
        {/* question mark */}
        <text x="78" y="20" fontSize="22" fontWeight="bold" fill="#222">?</text>
      </>
    );
  }

  if (face === 'laugh') {
    return (
      <>
        <path d="M29 44 Q37 34 45 44" {...line} />
        <path d="M55 44 Q63 34 71 44" {...line} />
        <path d="M28 56 Q50 90 72 56 Z" fill="#7a1f2b" stroke="#222" strokeWidth="3" strokeLinejoin="round" />
        <path d="M40 74 Q50 68 60 74 Q50 80 40 74 Z" fill="#ff8fab" />
      </>
    );
  }

  if (face === 'angel') {
    return (
      <>
        {/* golden halo */}
        <ellipse cx="50" cy="9" rx="24" ry="6" fill="none" stroke="#ffc300" strokeWidth="4" />
        <path d="M30 44 Q37 50 44 44" {...line} />
        <path d="M56 44 Q63 50 70 44" {...line} />
        <circle cx="28" cy="56" r="6" fill="#ffb3c6" opacity="0.7" />
        <circle cx="72" cy="56" r="6" fill="#ffb3c6" opacity="0.7" />
        <path d="M38 62 Q50 72 62 62" {...line} />
      </>
    );
  }

  if (face === 'cool') {
    return (
      <>
        {/* perfect hair */}
        <path
          d="M18 34 Q16 10 46 8 Q72 6 80 22 Q70 14 58 20 Q50 12 40 22 Q30 16 18 34 Z"
          fill="#3b2a1a"
          stroke="#222"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* shiny sunglasses */}
        <path d="M21 40 H47 Q46 54 34 54 Q22 54 21 40 Z" fill="#111" />
        <path d="M53 40 H79 Q78 54 66 54 Q54 54 53 40 Z" fill="#111" />
        <path d="M47 42 Q50 39 53 42" {...line} strokeWidth="2.5" />
        <path d="M26 43 L31 48" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <path d="M58 43 L63 48" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        {/* confident smile */}
        <path d="M36 66 Q52 76 66 63" {...line} />
        <path d="M66 63 L69 61" {...line} />
        {/* sparkle */}
        <path
          d="M88 8 L90 14 L96 16 L90 18 L88 24 L86 18 L80 16 L86 14 Z"
          fill="#fff"
          stroke="#222"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </>
    );
  }

  if (face === 'love') {
    const heart = 'M0 3 C0 -2 -7 -2 -7 3 C-7 7 0 11 0 11 C0 11 7 7 7 3 C7 -2 0 -2 0 3 Z';
    return (
      <>
        <path d={heart} transform="translate(36 36)" fill="#d00000" />
        <path d={heart} transform="translate(64 36)" fill="#d00000" />
        <path d="M34 62 Q50 78 66 62" {...line} />
      </>
    );
  }

  const eyes = (
    <>
      <circle cx="37" cy="42" r="5" fill="#222" />
      <circle cx="63" cy="42" r="5" fill="#222" />
    </>
  );

  if (face === 'angry') {
    return (
      <>
        {eyes}
        <path d="M27 30 L44 36" {...line} />
        <path d="M73 30 L56 36" {...line} />
        <path d="M36 70 Q50 60 64 70" {...line} />
      </>
    );
  }

  if (face === 'sly') {
    return (
      <>
        {eyes}
        <path d="M28 32 Q37 26 45 32" {...line} />
        <path d="M56 35 L72 35" {...line} />
        <path d="M36 64 Q56 72 68 58" {...line} />
      </>
    );
  }

  return (
    <>
      {eyes}
      <path d="M32 60 Q50 78 68 60" {...line} />
    </>
  );
};

export default App;
