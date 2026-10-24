import { useEffect, useState } from 'react'
import {
  Leaf,
  LayoutDashboard,
  Sparkles,
  ScanLine,
  NotebookPen,
  LibraryBig,
  ClipboardCheck,
  ChartNoAxesCombined,
  CalendarDays,
  RotateCcw,
  Users,
  Bookmark,
  Settings,
  ChevronDown,
  ArrowUpRight,
  ArrowRight,
  Plus,
  Bell,
  Search,
  Flame,
  Clock3,
  Check,
  Play,
  Pause,
  X,
  Menu,
  Sun,
  Moon,
  Atom,
  FlaskConical,
  Sigma,
  Sprout,
  Send,
  Upload,
  Download,
  Volume2,
  LogOut,
  Target,
  BookOpen,
  ChevronRight,
} from 'lucide-react'
import {
  getUser,
  login,
  signup,
  logout,
  handleAuthCallback,
  requestPasswordRecovery,
  updateUser,
  getSettings,
  oauthLogin,
} from '@netlify/identity'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  api,
  download,
  exams,
  languages,
  navigation,
  topics,
  translate,
} from '@/lib/learning'
import type { LearningRecord } from '@/lib/learning'
const icons = [
  LayoutDashboard,
  Sparkles,
  ScanLine,
  NotebookPen,
  LibraryBig,
  ClipboardCheck,
  ChartNoAxesCombined,
  CalendarDays,
  RotateCcw,
  Users,
  Bookmark,
  Settings,
]
const sample: LearningRecord[] = [
  {
    id: 'demo1',
    kind: 'task',
    title: 'Laws of Motion',
    data: {
      subject: 'Physics',
      time: '09:00',
      duration: 45,
      date: new Date().toISOString().slice(0, 10),
    },
  },
  {
    id: 'demo2',
    kind: 'task',
    title: 'Chemical Bonding',
    data: {
      subject: 'Chemistry',
      time: '11:00',
      duration: 60,
      date: new Date().toISOString().slice(0, 10),
    },
  },
  {
    id: 'demo3',
    kind: 'task',
    title: 'Limits & Derivatives',
    data: {
      subject: 'Mathematics',
      time: '16:00',
      duration: 45,
      date: new Date().toISOString().slice(0, 10),
    },
  },
]
export function Eduspark() {
  const [page, setPage] = useState('Dashboard'),
    [lang, setLang] = useState('en'),
    [exam, setExam] = useState<keyof typeof exams>('JEE Main'),
    [dark, setDark] = useState(false),
    [menu, setMenu] = useState(false),
    [user, setUser] = useState<any>(null),
    [auth, setAuth] = useState(false),
    [authMode, setAuthMode] = useState('login'),
    [records, setRecords] = useState<LearningRecord[]>([]),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    [prompt, setPrompt] = useState(''),
    [output, setOutput] = useState(''),
    [mode, setMode] = useState('notes'),
    [subject, setSubject] = useState('Physics'),
    [topic, setTopic] = useState('Laws of Motion'),
    [level, setLevel] = useState('normal'),
    [image, setImage] = useState(''),
    [preview, setPreview] = useState(''),
    [title, setTitle] = useState(''),
    [text, setText] = useState(''),
    [editing, setEditing] = useState(''),
    [search, setSearch] = useState(''),
    [seconds, setSeconds] = useState(1500),
    [running, setRunning] = useState(false),
    [goal, setGoal] = useState(180),
    [profile, setProfile] = useState({
      username: '',
      privacy: 'private',
      date: '2027-04-01',
    }),
    [quiz, setQuiz] = useState<any>(null),
    [answers, setAnswers] = useState<number[]>([]),
    [result, setResult] = useState<any>(null),
    [quizStart, setQuizStart] = useState(0),
    [friends, setFriends] = useState<any[]>([]),
    [found, setFound] = useState<any[]>([]),
    [google, setGoogle] = useState(false),
    [onboarding, setOnboarding] = useState(false),
    [notifications, setNotifications] = useState(false)
  const go = (p: string) => {
    setPage(p)
    setMenu(false)
    setOutput('')
    setMessage('')
    window.location.hash = p.toLowerCase().replaceAll(' ', '-')
  }
  const refresh = async () => {
    setRecords(await api('records'))
  }
  const run = async (fn: () => Promise<void>) => {
    setBusy(true)
    setMessage('')
    try {
      await fn()
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Please retry.')
    } finally {
      setBusy(false)
    }
  }
  useEffect(() => {
    setLang(localStorage.getItem('eduspark-language') || 'en')
    setDark(localStorage.getItem('eduspark-theme') === 'dark')
    const p = window.location.hash.slice(1)
    const match = navigation.find(
      (n) => n.toLowerCase().replaceAll(' ', '-') === p,
    )
    if (match) setPage(match)
    void (async () => {
      try {
        const callback = await handleAuthCallback()
        if (callback?.type === 'recovery') {
          setAuthMode('reset')
          setAuth(true)
        }
        const u = await getUser()
        setUser(u)
        if (u) {
          const [r, p] = await Promise.all([api('records'), api('profile')])
          setRecords(r)
          setProfile({
            username: p.username,
            privacy: p.privacy,
            date: p.preferences.date || '2027-04-01',
          })
          if (p.preferences.language) setLang(p.preferences.language)
          if (p.preferences.exam) setExam(p.preferences.exam)
          if (p.preferences.goal) setGoal(p.preferences.goal)
          if (!p.preferences.exam) setOnboarding(true)
        }
        const s = await getSettings()
        setGoogle(!!s.providers.google)
      } catch {
        setMessage(
          'Explore the sample dashboard. Sign in to save your learning activity.',
        )
      }
    })()
  }, [])
  useEffect(() => {
    const listener = () => {
      const match = navigation.find(
        (n) =>
          n.toLowerCase().replaceAll(' ', '-') ===
          window.location.hash.slice(1),
      )
      if (match) setPage(match)
    }
    window.addEventListener('hashchange', listener)
    return () => window.removeEventListener('hashchange', listener)
  }, [])
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.dir = ['ar', 'ur'].includes(lang) ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
    localStorage.setItem('eduspark-theme', dark ? 'dark' : 'light')
    localStorage.setItem('eduspark-language', lang)
  }, [dark, lang])
  useEffect(() => {
    if (!running) return
    const end = Date.now() + seconds * 1000
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((end - Date.now()) / 1000))
      setSeconds(remaining)
      if (!remaining) {
        setRunning(false)
        setMessage(
          'Focus session finished. Save your 25 minutes to your tracker.',
        )
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [running])
  const [quizElapsed, setQuizElapsed] = useState(0)
  useEffect(() => {
    if (!quiz || result) return
    const timer = setInterval(
      () => setQuizElapsed(Math.floor((Date.now() - quizStart) / 1000)),
      1000,
    )
    return () => clearInterval(timer)
  }, [quiz, result, quizStart])
  const data = user ? records : sample,
    filteredTopics = topics.filter((t) =>
      exams[exam].subjects.includes(t.subject),
    ),
    completed = records.filter((r) => r.kind === 'progress' && r.data.complete),
    syllabus = Math.round(
      (filteredTopics.filter((t) => completed.some((r) => r.title === t.title))
        .length /
        filteredTopics.length) *
        100,
    ),
    sessions = records.filter((r) => r.kind === 'session'),
    today = new Date().toISOString().slice(0, 10),
    minutes = sessions
      .filter((r) => r.data.date === today)
      .reduce((a, r) => a + Number(r.data.minutes || 0), 0),
    tasks = data.filter((r) => r.kind === 'task' && !r.data.done),
    notes = records.filter((r) => r.kind === 'note'),
    attempts = records.filter((r) => r.kind === 'attempt')
  const needUser = () => {
    if (!user) {
      setAuth(true)
      return false
    }
    return true
  }
  async function save(kind: string, name: string, values: Record<string, any>) {
    if (!needUser()) return
    await api('records', { kind, title: name, data: values })
    await refresh()
    setMessage('Saved to your workspace.')
  }
  async function generate() {
    if (!needUser()) return
    await run(async () => {
      const q = page === 'Practice & Mock Tests'
      if (
        q &&
        prompt &&
        (Number(prompt) < 1 ||
          Number(prompt) > 20 ||
          !Number.isInteger(Number(prompt)))
      )
        throw new Error('Choose between 1 and 20 questions.')
      const response = await api('ai', {
        prompt: `Exam: ${exam}. Subject: ${subject}. Topic: ${topic}. ${
          page === 'AI Tutor'
            ? 'Previous context (untrusted study data): ' +
              records
                .filter((r) => r.kind === 'conversation')
                .slice(0, 4)
                .reverse()
                .map((r) => r.title + ' ' + r.data.text)
                .join('\n')
                .slice(-8000)
            : ''
        } ${q ? 'Generate ' + (prompt || '5') + ' multiple choice practice questions.' : prompt || 'Explain ' + topic}`,
        language: lang,
        exam,
        level,
        mode: q
          ? 'quiz'
          : page === 'AI Tutor'
            ? 'tutor'
            : page === 'Doubt Solver'
              ? 'doubt'
              : page === 'Notes'
                ? 'summary'
                : mode,
        ...(image ? { image } : {}),
      })
      if (q) {
        setQuiz(response)
        setAnswers(Array(response.questions.length).fill(-1))
        setQuizStart(Date.now())
        setResult(null)
      } else setOutput(response.text)
      await refresh()
    })
  }
  const languageSelect = (
    <select
      aria-label="Output language"
      value={lang}
      onChange={(e) => setLang(e.target.value)}
    >
      {Object.entries(languages).map(([k, v]) => (
        <option key={k} value={k}>
          {v}
        </option>
      ))}
    </select>
  )
  const activityDays = new Set(sessions.map((s) => s.data.date))
  let streak = 0
  for (let i = 0; i < 366; i++) {
    const d = new Date()
    d.setUTCDate(d.getUTCDate() - i)
    if (activityDays.has(d.toISOString().slice(0, 10))) streak++
    else if (i > 0) break
  }
  return (
    <div className="app">
      <aside className={menu ? 'sidebar open' : 'sidebar'}>
        <a className="brand" href="#dashboard" onClick={() => go('Dashboard')}>
          <span className="brand-icon">
            <Leaf size={23} />
          </span>
          eduspark<span className="brand-dot">.</span>
        </a>
        <div className="space-label">YOUR LEARNING SPACE</div>
        <nav>
          {navigation.map((n, i) => {
            const Icon = icons[i]
            return (
              <button
                className={page === n ? 'nav-item active' : 'nav-item'}
                onClick={() => go(n)}
                key={n}
              >
                <Icon size={19} />
                <span>{translate(n, lang)}</span>
                {n === 'AI Tutor' && <span className="tiny-badge">AI</span>}
                {n === 'Revision' && (
                  <span className="nav-count">
                    {user
                      ? records.filter(
                          (r) =>
                            r.kind === 'flashcard' &&
                            (!r.data.due || r.data.due <= today),
                        ).length
                      : 3}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="grow-card">
            <Sprout size={26} />
            <strong>A little progress, every day.</strong>
            <p>Big dreams grow from small steps. You’ve got this.</p>
          </div>
          <button
            className="user-button"
            onClick={() => (user ? go('Settings') : setAuth(true))}
          >
            <span className="avatar">
              {user ? (profile.username[0] || 'S').toUpperCase() : 'S'}
            </span>
            <span>
              <strong>{user ? profile.username : 'Student workspace'}</strong>
              <small>{user ? exam + ' aspirant' : 'Explore demo mode'}</small>
            </span>
            <ChevronDown size={16} />
          </button>
        </div>
      </aside>
      <div className="main-wrap">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-toggle icon-button"
              aria-label="Open navigation"
              onClick={() => setMenu(!menu)}
            >
              <Menu size={22} />
            </button>
            <span>My workspace</span>
            <ChevronRight size={13} />
            <strong>{translate(page, lang)}</strong>
          </div>
          <div className="top-actions">
            <span className="exam-pill">
              <span className="live-dot" />
              <select
                aria-label="Selected exam"
                value={exam}
                onChange={(e) => setExam(e.target.value as keyof typeof exams)}
              >
                <option>JEE Main</option>
                <option>NEET UG</option>
              </select>
            </span>
            <button
              className="icon-button"
              aria-label="Toggle theme"
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <button
              className="icon-button notification"
              aria-label="Study reminders"
              onClick={() => setNotifications(!notifications)}
            >
              <Bell size={20} />
              <i />
            </button>
            <button
              className="avatar small"
              onClick={() => (user ? go('Settings') : setAuth(true))}
              aria-label="Account"
            >
              {user ? (profile.username[0] || 'S').toUpperCase() : 'S'}
            </button>
          </div>
        </header>
        <main>
          {message && (
            <div className="notice" role="status">
              {message}
              <button
                aria-label="Dismiss message"
                onClick={() => setMessage('')}
              >
                <X size={16} />
              </button>
            </div>
          )}
          {notifications && (
            <div className="notice">
              {tasks.length} upcoming study sessions. Reminders appear in this
              app; push notifications are not configured.
            </div>
          )}
          {page === 'Dashboard' ? (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">A FRESH START, EVERY DAY</div>
                  <h1>
                    Your next chapter starts here
                    <span className="heading-leaf">
                      <Sprout size={28} />
                    </span>
                  </h1>
                  <p>
                    A little focus. A little curiosity. A step closer to your
                    dream.
                  </p>
                </div>
                <span className="date-label">
                  <CalendarDays size={16} />
                  {new Date().toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              {!user && (
                <div className="demo-strip">
                  <span>
                    <span className="live-dot" />
                    Demo workspace{' '}
                    <span className="muted">
                      · Sample activity to help you explore
                    </span>
                  </span>
                  <button onClick={() => setAuth(true)}>
                    Make it yours <ArrowRight size={14} />
                  </button>
                </div>
              )}
              <section className="welcome-card">
                <div className="welcome-content">
                  <span className="pill">YOUR JOURNEY, YOUR PACE</span>
                  <h2>
                    Small steps today.
                    <br />
                    Extraordinary possibilities tomorrow.
                  </h2>
                  <p>
                    Find your focus, build your confidence, and make
                    <br className="desktop-break" /> every study session count.
                  </p>
                  <button className="primary" onClick={() => go('AI Tutor')}>
                    Let’s start learning <ArrowRight size={17} />
                  </button>
                  <span className="welcome-foot">
                    <Leaf size={14} /> A calm space for a curious mind.
                  </span>
                </div>
                <div className="plant-art" aria-hidden="true">
                  <div className="orbit orbit-one" />
                  <div className="orbit orbit-two" />
                  <div className="art-spark s1">✦</div>
                  <div className="art-spark s2">✧</div>
                  <div className="stem" />
                  <div className="plant-leaf l1" />
                  <div className="plant-leaf l2" />
                  <div className="plant-leaf l3" />
                  <div className="plant-leaf l4" />
                  <div className="plant-leaf l5" />
                  <div className="soil" />
                  <div className="book book1" />
                  <div className="book book2" />
                  <div className="art-caption">room to grow.</div>
                </div>
              </section>
              <section className="stats-grid">
                <Stat
                  icon={Clock3}
                  label="Today’s study time"
                  value={
                    user
                      ? `${Math.floor(minutes / 60)}h ${minutes % 60}m`
                      : '2h 15m'
                  }
                  sub={
                    user
                      ? `of your ${goal / 60} hour daily goal`
                      : 'of your 3 hour daily goal'
                  }
                  progress={user ? Math.min((minutes / goal) * 100, 100) : 75}
                />
                <Stat
                  icon={BookOpen}
                  label="Syllabus completed"
                  value={user ? `${syllabus}%` : '38%'}
                  sub={
                    user
                      ? `${completed.length} topics completed`
                      : 'Keep building your foundation'
                  }
                  progress={user ? syllabus : 38}
                />
                <Stat
                  icon={Flame}
                  label="Study streak"
                  value={user ? `${streak} days` : '7 days'}
                  sub="Consistency is your superpower"
                  accent
                />
                <Stat
                  icon={Target}
                  label="Practice accuracy"
                  value={
                    attempts.length
                      ? Math.round(
                          (attempts.reduce(
                            (a, r) =>
                              a + r.data.correct / r.data.questions.length,
                            0,
                          ) /
                            attempts.length) *
                            100,
                        ) + '%'
                      : user
                        ? '—'
                        : '82%'
                  }
                  sub={
                    user
                      ? `${attempts.length} completed attempts`
                      : 'A little better with every attempt'
                  }
                />
              </section>
              <div className="dashboard-columns">
                <div className="dashboard-left">
                  <section className="card learning-card">
                    <SectionTitle
                      title="Pick up where you left off"
                      action="View syllabus"
                      onClick={() => go('Study Tracker')}
                    />
                    <p className="section-sub">
                      One concept at a time. You’re making progress.
                    </p>
                    <div className="subject-grid">
                      {exams[exam].subjects.map((s, i) => (
                        <button
                          className={'subject-card subject-' + i}
                          key={s}
                          onClick={() => {
                            setSubject(s)
                            setTopic(
                              filteredTopics.find((t) => t.subject === s)
                                ?.title || '',
                            )
                            go('Study Materials')
                          }}
                        >
                          <span className="subject-icon">
                            {i === 0 ? (
                              <Atom />
                            ) : i === 1 ? (
                              <FlaskConical />
                            ) : exam === 'NEET UG' ? (
                              <Sprout />
                            ) : (
                              <Sigma />
                            )}
                          </span>
                          <span className="subject-name">
                            {s}
                            <ArrowUpRight size={16} />
                          </span>
                          <strong>
                            {filteredTopics.find((t) => t.subject === s)?.title}
                          </strong>
                          <span className="muted">
                            {i === 0
                              ? 'Mechanics'
                              : i === 1
                                ? 'Physical Chemistry'
                                : exam === 'NEET UG'
                                  ? 'Cell Biology'
                                  : 'Calculus'}
                          </span>
                          <div className="progress">
                            <i
                              style={{
                                width:
                                  (user
                                    ? Math.round(
                                        (completed.filter(
                                          (r) => r.data.subject === s,
                                        ).length /
                                          2) *
                                          100,
                                      )
                                    : [42, 35, 28][i]) + '%',
                              }}
                            />
                          </div>
                          <span className="subject-footer">
                            {user
                              ? 'Continue learning'
                              : 'Illustrative topic progress'}
                            <ArrowRight size={15} />
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>
                  <section className="card week-card">
                    <SectionTitle
                      title="Your week in focus"
                      action="Study tracker"
                      onClick={() => go('Study Tracker')}
                    />
                    <div className="chart-top">
                      <div>
                        <strong>
                          {user
                            ? sessions
                                .filter(
                                  (r) =>
                                    Date.now() -
                                      new Date(r.data.date).getTime() <
                                    7 * 86400000,
                                )
                                .reduce((a, r) => a + r.data.minutes, 0) / 60
                            : '14.5'}
                          <small> hrs</small>
                        </strong>
                        <p>Time invested in your future</p>
                      </div>
                      <span className="chart-legend">
                        <i />
                        Study time
                      </span>
                    </div>
                    <div className="bar-chart">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
                        (d, i) => (
                          <div className="bar-col" key={d}>
                            <div className="bar-track">
                              <div
                                className={i === 4 ? 'bar highlight' : 'bar'}
                                style={{
                                  height:
                                    (user
                                      ? Math.min(
                                          (sessions
                                            .filter(
                                              (r) =>
                                                (new Date(
                                                  r.data.date,
                                                ).getUTCDay() +
                                                  6) %
                                                  7 ===
                                                i,
                                            )
                                            .reduce(
                                              (a, r) => a + r.data.minutes,
                                              0,
                                            ) /
                                            240) *
                                            100,
                                          100,
                                        )
                                      : [38, 62, 49, 78, 91, 58, 28][i]) + '%',
                                }}
                              />
                            </div>
                            <span>{d}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </section>
                  <section className="card">
                    <SectionTitle
                      title="Give these topics a little love"
                      action="Practice now"
                      onClick={() => go('Practice & Mock Tests')}
                    />
                    <div className="weak-topics">
                      {(attempts.length
                        ? Array.from(
                            new Set(
                              attempts.flatMap((r) =>
                                r.data.questions
                                  .filter(
                                    (q: any, i: number) =>
                                      r.data.answers?.[i] !== q.correct,
                                  )
                                  .map((q: any) => q.topic),
                              ),
                            ),
                          ).slice(0, 3)
                        : [
                            'Rotational Motion',
                            'Organic Reactions',
                            'Integration',
                          ]
                      ).map((t: any) => (
                        <button
                          key={t}
                          onClick={() => {
                            setTopic(t)
                            go('AI Tutor')
                          }}
                        >
                          <span className="soft-icon">
                            <Target size={18} />
                          </span>
                          <span>
                            <strong>{t}</strong>
                            <small>
                              {user
                                ? 'Review through your AI tutor'
                                : 'Sample recommendation'}
                            </small>
                          </span>
                          <ArrowUpRight size={16} />
                        </button>
                      ))}
                    </div>
                  </section>
                </div>
                <div className="dashboard-right">
                  <section className="tutor-card">
                    <span className="tutor-icon">
                      <Sparkles size={23} />
                    </span>
                    <span className="tiny-badge">YOUR STUDY COMPANION</span>
                    <h2>A question on your mind?</h2>
                    <p>
                      Let’s make the tricky things click.
                      <br />
                      Your AI tutor is here to help.
                    </p>
                    <button onClick={() => go('AI Tutor')}>
                      Ask your AI tutor <ArrowUpRight size={17} />
                    </button>
                    <span className="tutor-bottom">
                      Learn in {Object.keys(languages).length} languages · At
                      your pace
                    </span>
                  </section>
                  <section className="card schedule-card">
                    <SectionTitle
                      title="On your timetable"
                      action=""
                      onClick={() => go('Timetable')}
                    />
                    <div className="schedule-date">
                      TODAY <span>{tasks.length} sessions</span>
                    </div>
                    {tasks.slice(0, 3).map((t, i) => (
                      <button
                        className="schedule-row"
                        key={t.id}
                        onClick={() => go('Timetable')}
                      >
                        <span className={'schedule-line line-' + i} />
                        <span>
                          <small>
                            {t.data.time} · {t.data.duration} min
                          </small>
                          <strong>{t.title}</strong>
                          <span>{t.data.subject}</span>
                        </span>
                        <ChevronRight size={16} />
                      </button>
                    ))}
                    {!tasks.length && (
                      <p className="muted">
                        A clear day. Add a study session to find your rhythm.
                      </p>
                    )}
                    <button
                      className="text-button schedule-add"
                      onClick={() => go('Timetable')}
                    >
                      <Plus size={16} />
                      Plan a study session
                    </button>
                  </section>
                  <section className="revision-card">
                    <span className="soft-icon">
                      <RotateCcw size={21} />
                    </span>
                    <div>
                      <strong>A little revision goes a long way.</strong>
                      <p>
                        {user
                          ? records.filter((r) => r.kind === 'flashcard').length
                          : 3}{' '}
                        flashcards to keep concepts fresh.
                      </p>
                      <button
                        className="text-button"
                        onClick={() => go('Revision')}
                      >
                        Time to revisit <ArrowRight size={15} />
                      </button>
                    </div>
                  </section>
                </div>
              </div>
              <footer>
                <Leaf size={15} /> Made for your journey. One day at a time.
                <span>Learn. Practice. Grow.</span>
              </footer>
            </>
          ) : (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">YOUR SPACE TO GROW</div>
                  <h1>{translate(page, lang)}</h1>
                  <p>
                    {page === 'AI Tutor'
                      ? 'Big questions. Clear explanations. Your pace.'
                      : page === 'Timetable'
                        ? 'Make room for what matters, one focused session at a time.'
                        : 'Build understanding, one small step at a time.'}
                  </p>
                </div>
                {languageSelect}
              </div>
              {['AI Tutor', 'Doubt Solver', 'Study Materials'].includes(
                page,
              ) && (
                <div className="workspace-grid">
                  <section className="card form-card">
                    <div className="workspace-symbol">
                      <Sparkles />
                    </div>
                    <h2>
                      {page === 'AI Tutor'
                        ? 'Let curiosity lead.'
                        : page === 'Doubt Solver'
                          ? 'Let’s work through it.'
                          : 'Create your study companion.'}
                    </h2>
                    <div className="form-grid">
                      <label>
                        Subject
                        <select
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                        >
                          {exams[exam].subjects.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Topic
                        <input
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                        />
                      </label>
                      <label>
                        Explanation level
                        <select
                          value={level}
                          onChange={(e) => setLevel(e.target.value)}
                        >
                          <option>simple</option>
                          <option>normal</option>
                          <option>advanced</option>
                        </select>
                      </label>
                      {page === 'Study Materials' && (
                        <label>
                          Material type
                          <select
                            value={mode}
                            onChange={(e) => setMode(e.target.value)}
                          >
                            <option value="notes">Detailed notes</option>
                            <option value="summary">
                              Quick revision / summary
                            </option>
                            <option value="formulas">Formula sheet</option>
                            <option value="flashcards">Flashcards</option>
                            <option value="mindmap">
                              Mind map (text hierarchy)
                            </option>
                            <option value="translation">
                              Translation / bilingual
                            </option>
                          </select>
                        </label>
                      )}
                    </div>
                    <button
                      className="text-button"
                      onClick={() => {
                        const Speech =
                          (window as any).SpeechRecognition ||
                          (window as any).webkitSpeechRecognition
                        if (!Speech) {
                          setMessage(
                            'Voice input is unavailable in this browser. Please type your question.',
                          )
                          return
                        }
                        const recognition = new Speech()
                        recognition.lang = lang
                        recognition.onresult = (event: any) =>
                          setPrompt(
                            (p) => p + ' ' + event.results[0][0].transcript,
                          )
                        recognition.onerror = () =>
                          setMessage(
                            'Voice input could not start. Check microphone permissions or type your question.',
                          )
                        recognition.start()
                      }}
                    >
                      Use voice input <Volume2 size={15} />
                    </button>
                    <label>
                      Your question
                      <textarea
                        rows={5}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g. Why does Newton’s third law not cancel the motion of a moving object?"
                      />
                    </label>
                    {page === 'Doubt Solver' && (
                      <>
                        <label className="upload">
                          <Upload size={20} /> Upload a question · JPG, PNG,
                          WebP · max 2 MB
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => {
                              const f = e.target.files?.[0]
                              if (!f) return
                              if (
                                f.size > 2 * 1024 * 1024 ||
                                ![
                                  'image/jpeg',
                                  'image/png',
                                  'image/webp',
                                ].includes(f.type)
                              ) {
                                setMessage(
                                  'Choose a JPG, PNG or WebP image under 2 MB.',
                                )
                                return
                              }
                              const reader = new FileReader()
                              reader.onload = () => {
                                setPreview(String(reader.result))
                                setImage(String(reader.result).split(',')[1])
                              }
                              reader.readAsDataURL(f)
                            }}
                          />
                        </label>
                        {preview && (
                          <div className="image-preview">
                            <img src={preview} alt="Selected question" />
                            <button
                              className="icon-button"
                              aria-label="Remove image"
                              onClick={() => {
                                setImage('')
                                setPreview('')
                              }}
                            >
                              <X />
                            </button>
                          </div>
                        )}
                        <p className="muted">
                          Image support is checked against your model.
                          Handwritten formulas may be uncertain; confirm the
                          question in text.
                        </p>
                      </>
                    )}
                    <button
                      className="primary"
                      disabled={busy}
                      onClick={generate}
                    >
                      {busy
                        ? 'Thinking carefully…'
                        : page === 'Study Materials'
                          ? 'Generate material'
                          : 'Ask Eduspark'}
                      <Send size={17} />
                    </button>
                    <p className="fine-print">
                      Powered by your configured Ollama model. Generated content
                      can contain errors; verify important answers.
                    </p>
                  </section>
                  <section className="card output-card">
                    <h2>
                      {output
                        ? 'Your explanation'
                        : 'A little clarity is on its way.'}
                    </h2>
                    {output ? (
                      <>
                        <div className="ai-output">{output}</div>
                        <div className="button-row">
                          <button
                            className="secondary"
                            onClick={() => download(topic, output)}
                          >
                            <Download size={16} />
                            Download
                          </button>
                          <button
                            className="secondary"
                            onClick={() =>
                              run(() =>
                                save('bookmark', topic, { text: output }),
                              )
                            }
                          >
                            <Bookmark size={16} />
                            Save
                          </button>
                          <button
                            className="secondary"
                            onClick={() => {
                              if (!('speechSynthesis' in window)) {
                                setMessage(
                                  'Voice output is unavailable in this browser.',
                                )
                                return
                              }
                              const s = new SpeechSynthesisUtterance(output)
                              s.lang = lang
                              window.speechSynthesis.speak(s)
                            }}
                          >
                            <Volume2 size={16} />
                            Read aloud
                          </button>
                        </div>
                        {mode === 'flashcards' && (
                          <button
                            className="text-button"
                            onClick={() =>
                              run(() =>
                                save('flashcard', topic, {
                                  front: prompt || topic,
                                  back: output,
                                  due: today,
                                  interval: 1,
                                }),
                              )
                            }
                          >
                            Add to spaced revision <Plus size={16} />
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="empty-state">
                        <Sprout size={46} />
                        <p>
                          Bring a question. Leave with a little more
                          understanding.
                        </p>
                        <small>
                          Your answer appears here after a successful AI
                          request.
                        </small>
                      </div>
                    )}
                  </section>
                </div>
              )}
              {page === 'Notes' && (
                <div className="workspace-grid">
                  <section className="card form-card">
                    <h2>
                      {editing
                        ? 'Edit your note'
                        : 'Capture a little understanding.'}
                    </h2>
                    <label>
                      Title
                      <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Give your note a title"
                      />
                    </label>
                    <label>
                      Subject
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      >
                        {exams[exam].subjects.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Notes / extracted text
                      <textarea
                        rows={12}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Write or paste your notes. You can also import a text file below."
                      />
                    </label>
                    <label className="upload">
                      <Upload size={18} /> Import text notes
                      <input
                        type="file"
                        accept="text/plain,.txt"
                        onChange={async (e) => {
                          const f = e.target.files?.[0]
                          if (f && f.size < 1024 * 1024) setText(await f.text())
                          else setMessage('Select a text file under 1 MB.')
                        }}
                      />
                    </label>
                    <p className="muted">
                      Image OCR and private file attachments require an OCR
                      provider and are not enabled. Text notes are stored
                      privately.
                    </p>
                    <div className="button-row">
                      <button
                        className="primary"
                        disabled={busy || !title.trim() || !text.trim()}
                        onClick={() =>
                          run(async () => {
                            if (!needUser()) return
                            if (editing) {
                              await api(
                                'records/' + editing,
                                {
                                  kind: 'note',
                                  title,
                                  data: { text, subject },
                                },
                                'PUT',
                              )
                              await refresh()
                            } else await save('note', title, { text, subject })
                            setEditing('')
                            setTitle('')
                            setText('')
                          })
                        }
                      >
                        Save note <Check size={16} />
                      </button>
                      <button
                        className="secondary"
                        disabled={!text}
                        onClick={() => {
                          setPrompt(text)
                          go('Study Materials')
                          setMode('summary')
                        }}
                      >
                        Summarize
                      </button>
                    </div>
                  </section>
                  <section className="card">
                    <h2>
                      Your notes <span className="count">{notes.length}</span>
                    </h2>
                    <label className="search-field">
                      <Search size={18} />
                      <input
                        aria-label="Search notes"
                        placeholder="Search your notes…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </label>
                    {notes
                      .filter((n) =>
                        n.title.toLowerCase().includes(search.toLowerCase()),
                      )
                      .map((n) => (
                        <article className="record-item" key={n.id}>
                          <small>{n.data.subject}</small>
                          <h3>{n.title}</h3>
                          <p>{n.data.text.slice(0, 160)}</p>
                          <div className="button-row">
                            <button
                              className="text-button"
                              onClick={() => {
                                setEditing(n.id)
                                setTitle(n.title)
                                setText(n.data.text)
                                setSubject(n.data.subject)
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="text-button"
                              onClick={() => download(n.title, n.data.text)}
                            >
                              Download offline
                            </button>
                            <button
                              className="text-button"
                              onClick={() =>
                                run(async () => {
                                  await api(
                                    'records/' + n.id,
                                    undefined,
                                    'DELETE',
                                  )
                                  await refresh()
                                })
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </article>
                      ))}
                    {!notes.length && (
                      <Empty text="Your ideas belong here. Save your first note to begin." />
                    )}
                  </section>
                </div>
              )}
              {page === 'Study Tracker' && (
                <>
                  <section className="stats-grid">
                    <Stat
                      icon={Clock3}
                      label="Today"
                      value={`${minutes} min`}
                      sub={`Goal: ${goal} minutes`}
                      progress={Math.min((minutes / goal) * 100, 100)}
                    />
                    <Stat
                      icon={BookOpen}
                      label="Syllabus"
                      value={`${syllabus}%`}
                      sub="Based on completed sample topics"
                      progress={syllabus}
                    />
                    <Stat
                      icon={Flame}
                      label="Current streak"
                      value={`${streak} days`}
                      sub="Derived from saved study sessions"
                    />
                    <Stat
                      icon={ClipboardCheck}
                      label="Practice attempts"
                      value={String(attempts.length)}
                      sub="Server-scored practice"
                    />
                  </section>
                  <section className="card">
                    <h2>Your syllabus, one topic at a time.</h2>
                    <p className="muted">
                      Representative, illustrative syllabus · English & Hindi
                      samples · Configuration revision 24 Oct 2026. Confirm the
                      latest official pattern at{' '}
                      <a
                        href={exams[exam].source}
                        target="_blank"
                        rel="noreferrer"
                      >
                        NTA <ArrowUpRight size={12} />
                      </a>
                      . Sample marking: +4 correct, −1 incorrect.
                    </p>
                    {filteredTopics.map((t) => (
                      <div className="topic-row" key={t.title}>
                        <span className="soft-icon">
                          <BookOpen size={19} />
                        </span>
                        <div>
                          <strong>{t.title}</strong>
                          <small>
                            {t.subject} · {t.hindi}
                          </small>
                        </div>
                        <button
                          className={
                            completed.some((r) => r.title === t.title)
                              ? 'secondary'
                              : 'primary'
                          }
                          onClick={() =>
                            run(async () => {
                              const existing = completed.find(
                                (r) => r.title === t.title,
                              )
                              if (existing) {
                                await api(
                                  'records/' + existing.id,
                                  undefined,
                                  'DELETE',
                                )
                                await refresh()
                              } else
                                await save('progress', t.title, {
                                  complete: true,
                                  subject: t.subject,
                                })
                            })
                          }
                        >
                          {completed.some((r) => r.title === t.title)
                            ? 'Completed ✓'
                            : 'Mark complete'}
                        </button>
                      </div>
                    ))}
                  </section>
                </>
              )}
              {page === 'Timetable' && (
                <>
                  <div className="workspace-grid">
                    <section className="card form-card">
                      <h2>Make a little room to learn.</h2>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          const f = new FormData(e.currentTarget)
                          const start = String(f.get('time'))
                          const duration = Number(f.get('duration'))
                          const date = String(f.get('date'))
                          const time = start
                            .split(':')
                            .reduce(
                              (a, v, i) => a + Number(v) * (i === 0 ? 60 : 1),
                              0,
                            )
                          if (
                            records.some(
                              (r) =>
                                r.kind === 'task' &&
                                r.data.date === date &&
                                time < r.data.start + Number(r.data.duration) &&
                                time + duration > r.data.start,
                            )
                          ) {
                            setMessage(
                              'This session overlaps another. Choose a different time.',
                            )
                            return
                          }
                          void run(() =>
                            save('task', String(f.get('title')), {
                              date,
                              time: start,
                              start: time,
                              duration,
                              subject,
                              done: false,
                            }),
                          )
                        }}
                      >
                        <label>
                          Topic
                          <input name="title" required defaultValue={topic} />
                        </label>
                        <label>
                          Subject
                          <select
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                          >
                            {exams[exam].subjects.map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>
                        </label>
                        <div className="form-grid">
                          <label>
                            Date
                            <input
                              name="date"
                              type="date"
                              min={today}
                              defaultValue={today}
                              required
                            />
                          </label>
                          <label>
                            Start time
                            <input
                              name="time"
                              type="time"
                              defaultValue="09:00"
                              required
                            />
                          </label>
                          <label>
                            Minutes
                            <input
                              name="duration"
                              type="number"
                              min="15"
                              max="240"
                              defaultValue="45"
                              required
                            />
                          </label>
                        </div>
                        <button className="primary" disabled={busy}>
                          Add study session <Plus size={17} />
                        </button>
                      </form>
                      <hr />
                      <button
                        className="secondary"
                        disabled={busy}
                        onClick={() =>
                          run(async () => {
                            if (!needUser()) return
                            const todo = filteredTopics.filter(
                              (t) =>
                                !completed.some((r) => r.title === t.title),
                            )
                            const days = Math.max(
                              1,
                              Math.ceil(
                                (new Date(profile.date).getTime() -
                                  Date.now()) /
                                  86400000,
                              ),
                            )
                            let index = 0
                            for (const t of todo) {
                              const d = new Date()
                              d.setUTCDate(
                                d.getUTCDate() + Math.min(index, days - 1),
                              )
                              const date = d.toISOString().slice(0, 10)
                              const existing = records.filter(
                                (r) =>
                                  r.kind === 'task' && r.data.date === date,
                              )
                              let start = 540
                              while (
                                existing.some(
                                  (r) =>
                                    start <
                                      (r.data.start || 540) + r.data.duration &&
                                    start + 45 > (r.data.start || 540),
                                )
                              )
                                start += 60
                              if (start + 45 <= 1260)
                                await api('records', {
                                  kind: 'task',
                                  title: t.title,
                                  data: {
                                    date,
                                    time: `${String(Math.floor(start / 60)).padStart(2, '0')}:${String(start % 60).padStart(2, '0')}`,
                                    start,
                                    duration: 45,
                                    subject: t.subject,
                                  },
                                })
                              index++
                            }
                            await refresh()
                            setMessage(
                              'Incomplete topics scheduled in available morning slots. Reserve the remaining time for revision.',
                            )
                          })
                        }
                      >
                        <Sparkles size={16} />
                        Auto-plan incomplete topics
                      </button>
                    </section>
                    <section className="card">
                      <h2>Your upcoming sessions</h2>
                      {tasks
                        .sort((a, b) =>
                          (a.data.date + a.data.time).localeCompare(
                            b.data.date + b.data.time,
                          ),
                        )
                        .map((t) => (
                          <div className="record-item" key={t.id}>
                            <small>
                              {t.data.date} · {t.data.time} · {t.data.duration}{' '}
                              min {t.data.date < today ? '· Overdue' : ''}
                            </small>
                            <h3>{t.title}</h3>
                            <div className="button-row">
                              <button
                                className="text-button"
                                onClick={() =>
                                  run(async () => {
                                    if (!needUser()) return
                                    await api(
                                      'records/' + t.id,
                                      {
                                        kind: 'task',
                                        title: t.title,
                                        data: { ...t.data, done: true },
                                      },
                                      'PUT',
                                    )
                                    await save('session', t.title, {
                                      minutes: t.data.duration,
                                      date: today,
                                      subject: t.data.subject,
                                    })
                                    await refresh()
                                  })
                                }
                              >
                                <Check size={15} />
                                Complete
                              </button>
                              <button
                                className="text-button"
                                onClick={() =>
                                  run(async () => {
                                    await api(
                                      'records/' + t.id,
                                      {
                                        kind: 'task',
                                        title: t.title,
                                        data: { ...t.data, date: today },
                                      },
                                      'PUT',
                                    )
                                    await refresh()
                                  })
                                }
                              >
                                Move to today
                              </button>
                              <button
                                className="text-button"
                                onClick={() =>
                                  run(async () => {
                                    await api(
                                      'records/' + t.id,
                                      undefined,
                                      'DELETE',
                                    )
                                    await refresh()
                                  })
                                }
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      {!tasks.length && (
                        <Empty text="A fresh page. Add a session or create a simple automatic plan." />
                      )}
                    </section>
                  </div>
                </>
              )}
              {page === 'Practice & Mock Tests' && (
                <section className="card form-card">
                  {!quiz ? (
                    <>
                      <h2>Practice builds confidence.</h2>
                      <p className="muted">
                        AI-generated practice · Not an official exam paper · +4
                        correct / −1 incorrect
                      </p>
                      <div className="form-grid">
                        <label>
                          Subject
                          <select
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                          >
                            {exams[exam].subjects.map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Topic
                          <input
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                          />
                        </label>
                        <label>
                          Question count
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={prompt}
                            placeholder="5"
                            onChange={(e) => setPrompt(e.target.value)}
                          />
                        </label>
                        <label>
                          Difficulty
                          <select
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                          >
                            <option>simple</option>
                            <option>normal</option>
                            <option>advanced</option>
                          </select>
                        </label>
                      </div>
                      <button
                        className="primary"
                        disabled={busy}
                        onClick={generate}
                      >
                        {busy ? 'Preparing practice…' : 'Generate practice'}
                        <ArrowRight size={16} />
                      </button>
                      <h3 className="spaced">Previous attempts</h3>
                      {attempts.map((a) => (
                        <div className="record-item" key={a.id}>
                          {a.title}
                          <strong className="float-right">
                            {a.data.score} / {a.data.total}
                          </strong>
                        </div>
                      ))}
                      {!attempts.length && (
                        <p className="muted">
                          Your completed practice results appear here.
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="section-title">
                        <h2>
                          {result
                            ? `Your result: ${result.score} / ${result.total}`
                            : 'Take your time. Think it through.'}
                        </h2>
                        <span>{Math.floor(quizElapsed / 60)} min elapsed</span>
                      </div>
                      {quiz.questions.map((q: any, i: number) => (
                        <article
                          className="quiz-question"
                          id={'question-' + i}
                          key={i}
                        >
                          <h3>
                            {i + 1}. {q.question}
                          </h3>
                          {q.options.map((o: string, j: number) => (
                            <label className="answer-option" key={j}>
                              <input
                                type="radio"
                                name={'q' + i}
                                checked={answers[i] === j}
                                disabled={!!result}
                                onChange={() =>
                                  setAnswers((a) =>
                                    a.map((v, k) => (k === i ? j : v)),
                                  )
                                }
                              />
                              {o}
                            </label>
                          ))}
                          {result && (
                            <div className="notice">
                              Correct answer:{' '}
                              {q.options[result.questions[i].correct]}
                              <br />
                              {result.questions[i].explanation}
                            </div>
                          )}
                        </article>
                      ))}
                      <div className="button-row">
                        {!result ? (
                          <button
                            className="primary"
                            disabled={busy}
                            onClick={() =>
                              run(async () => {
                                if (
                                  !window.confirm(
                                    'Submit this attempt? Unanswered questions earn zero marks.',
                                  )
                                )
                                  return
                                setResult(
                                  await api('quiz/submit', {
                                    id: quiz.id,
                                    answers,
                                    seconds: Math.floor(
                                      (Date.now() - quizStart) / 1000,
                                    ),
                                  }),
                                )
                                await refresh()
                              })
                            }
                          >
                            Submit {answers.filter((a) => a >= 0).length}/
                            {quiz.questions.length} answers
                          </button>
                        ) : (
                          <button
                            className="primary"
                            onClick={() => setQuiz(null)}
                          >
                            Back to practice
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </section>
              )}
              {page === 'Revision' && (
                <section className="card form-card">
                  <h2>A little recall goes a long way.</h2>
                  <p className="muted">
                    Spaced review: again tomorrow; good doubles the interval;
                    easy triples it (up to 90 days).
                  </p>
                  {records
                    .filter(
                      (r) =>
                        r.kind === 'flashcard' &&
                        (!r.data.due || r.data.due <= today),
                    )
                    .map((r) => (
                      <Flashcard
                        key={r.id}
                        record={r}
                        onReview={(factor) =>
                          run(async () => {
                            const interval =
                              factor === 1
                                ? 1
                                : Math.min((r.data.interval || 1) * factor, 90)
                            const d = new Date()
                            d.setDate(d.getDate() + interval)
                            await api(
                              'records/' + r.id,
                              {
                                kind: 'flashcard',
                                title: r.title,
                                data: {
                                  ...r.data,
                                  interval,
                                  due: d.toISOString().slice(0, 10),
                                },
                              },
                              'PUT',
                            )
                            await refresh()
                          })
                        }
                      />
                    ))}
                  {!records.some((r) => r.kind === 'flashcard') && (
                    <Empty text="Create flashcards in Study Materials, then save them for review." />
                  )}
                  <button
                    className="primary"
                    onClick={() => {
                      setMode('flashcards')
                      go('Study Materials')
                    }}
                  >
                    Create flashcards <Plus size={16} />
                  </button>
                </section>
              )}
              {page === 'Bookmarks' && (
                <section className="card">
                  <h2>Keep good ideas close.</h2>
                  {records
                    .filter(
                      (r) =>
                        r.kind === 'bookmark' ||
                        r.kind === 'material' ||
                        r.kind === 'conversation',
                    )
                    .map((r) => (
                      <article className="record-item" key={r.id}>
                        <small>{r.kind}</small>
                        <h3>{r.title}</h3>
                        <details>
                          <summary>Read saved content</summary>
                          <div className="ai-output">{r.data.text}</div>
                        </details>
                        <button
                          className="text-button"
                          onClick={() => download(r.title, r.data.text || '')}
                        >
                          Download for offline reading <Download size={15} />
                        </button>
                      </article>
                    ))}
                  {!records.some((r) =>
                    ['bookmark', 'material', 'conversation'].includes(r.kind),
                  ) && (
                    <Empty text="Save explanations and materials to find them here." />
                  )}
                </section>
              )}
              {page === 'Friends' && (
                <section className="card form-card">
                  <h2>Grow alongside your study circle.</h2>
                  <p className="muted">
                    Search by username. Notes, conversations, contact details
                    and study history stay private. Shared metric leaderboards
                    are not enabled.
                  </p>
                  <form
                    className="button-row"
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (needUser())
                        void run(async () => {
                          setFound(
                            await api(
                              'friends?search=' + encodeURIComponent(search),
                            ),
                          )
                          setFriends(await api('friends'))
                        })
                    }}
                  >
                    <input
                      aria-label="Search username"
                      minLength={3}
                      required
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="At least 3 username characters"
                    />
                    <button className="primary">
                      Search <Search size={16} />
                    </button>
                  </form>
                  {found.map((f) => (
                    <div className="topic-row" key={f.id}>
                      <strong>{f.username}</strong>
                      <button
                        className="secondary"
                        onClick={() =>
                          run(async () => {
                            await api('friends', {
                              recipient: f.id,
                              action: 'request',
                            })
                            setMessage('Friend request sent.')
                            setFriends(await api('friends'))
                          })
                        }
                      >
                        Send request
                      </button>
                    </div>
                  ))}
                  <button
                    className="text-button spaced"
                    onClick={() => {
                      if (needUser())
                        void run(async () => setFriends(await api('friends')))
                    }}
                  >
                    Refresh your circle
                  </button>
                  {friends.map((f) => (
                    <div className="record-item" key={f.id}>
                      <strong>
                        {f.status === 'accepted'
                          ? 'Connected study partner'
                          : 'Pending request'}
                      </strong>
                      <p>
                        {f.sender === user?.id ? 'Sent by you' : 'Sent to you'}
                      </p>
                      <div className="button-row">
                        {f.recipient === user?.id && f.status === 'pending' && (
                          <button
                            className="secondary"
                            onClick={() =>
                              run(async () => {
                                await api('friends', {
                                  recipient: f.sender,
                                  action: 'accept',
                                })
                                setFriends(await api('friends'))
                              })
                            }
                          >
                            Accept
                          </button>
                        )}
                        <button
                          className="text-button"
                          onClick={() =>
                            run(async () => {
                              await api('friends', {
                                recipient:
                                  f.sender === user.id ? f.recipient : f.sender,
                                action: 'remove',
                              })
                              setFriends(await api('friends'))
                            })
                          }
                        >
                          Remove / reject
                        </button>
                      </div>
                    </div>
                  ))}
                </section>
              )}
              {page === 'Settings' && (
                <section className="card form-card settings-card">
                  <h2>A space that feels like you.</h2>
                  <label>
                    Username
                    <input
                      value={profile.username}
                      onChange={(e) =>
                        setProfile({ ...profile, username: e.target.value })
                      }
                      placeholder="Your unique username"
                    />
                  </label>
                  <div className="form-grid">
                    <label>Preferred language{languageSelect}</label>
                    <label>
                      Exam
                      <select
                        value={exam}
                        onChange={(e) =>
                          setExam(e.target.value as keyof typeof exams)
                        }
                      >
                        <option>JEE Main</option>
                        <option>NEET UG</option>
                      </select>
                    </label>
                    <label>
                      Daily goal (minutes)
                      <input
                        type="number"
                        min="15"
                        max="720"
                        value={goal}
                        onChange={(e) => setGoal(Number(e.target.value))}
                      />
                    </label>
                    <label>
                      Exam target date
                      <input
                        type="date"
                        value={profile.date}
                        onChange={(e) =>
                          setProfile({ ...profile, date: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Privacy
                      <select
                        value={profile.privacy}
                        onChange={(e) =>
                          setProfile({ ...profile, privacy: e.target.value })
                        }
                      >
                        <option value="private">Private</option>
                        <option value="friends">Friends only</option>
                      </select>
                    </label>
                    <label>
                      Theme
                      <select
                        value={dark ? 'dark' : 'light'}
                        onChange={(e) => setDark(e.target.value === 'dark')}
                      >
                        <option value="light">Warm ivory</option>
                        <option value="dark">Deep forest</option>
                      </select>
                    </label>
                  </div>
                  <p className="muted">
                    English is used where a translation is not yet available.
                    All 18 languages are available for AI output. Google sign-in
                    appears only when configured.
                  </p>
                  <div className="button-row">
                    <button
                      className="primary"
                      disabled={busy}
                      onClick={() =>
                        run(async () => {
                          if (!needUser()) return
                          await api('profile', {
                            username: profile.username,
                            privacy: profile.privacy,
                            preferences: {
                              language: lang,
                              exam,
                              goal,
                              date: profile.date,
                              theme: dark ? 'dark' : 'light',
                            },
                          })
                          setMessage('Your preferences are saved.')
                        })
                      }
                    >
                      Save preferences <Check size={16} />
                    </button>
                    {user ? (
                      <button
                        className="secondary"
                        onClick={() =>
                          run(async () => {
                            await logout()
                            setUser(null)
                            setRecords([])
                            setMessage('Signed out. Your notes remain private.')
                          })
                        }
                      >
                        <LogOut size={16} />
                        Sign out
                      </button>
                    ) : (
                      <button
                        className="secondary"
                        onClick={() => setAuth(true)}
                      >
                        Sign in
                      </button>
                    )}
                  </div>
                </section>
              )}
            </>
          )}
          <section className="focus-widget">
            <span className="focus-symbol">
              <Clock3 size={17} />
            </span>
            <span>
              <small>FOCUS TIMER</small>
              <strong>
                {String(Math.floor(seconds / 60)).padStart(2, '0')}:
                {String(seconds % 60).padStart(2, '0')}
              </strong>
            </span>
            <button
              className="icon-button"
              aria-label={running ? 'Pause focus timer' : 'Start focus timer'}
              onClick={() => setRunning(!running)}
            >
              {running ? <Pause size={17} /> : <Play size={17} />}
            </button>
            <button
              className="icon-button"
              aria-label="Reset timer"
              onClick={() => {
                setRunning(false)
                setSeconds(1500)
              }}
            >
              <RotateCcw size={15} />
            </button>
            {seconds === 0 && (
              <button
                className="text-button"
                onClick={() =>
                  run(async () => {
                    await save('session', 'Pomodoro focus', {
                      minutes: 25,
                      date: today,
                      subject,
                    })
                    setSeconds(1500)
                  })
                }
              >
                Save session
              </button>
            )}
          </section>
        </main>
      </div>
      <Dialog
        open={auth || onboarding}
        onOpenChange={(v) => {
          setAuth(v)
          if (!v) setOnboarding(false)
        }}
      >
        <DialogContent className="auth-dialog">
          <DialogTitle>
            {onboarding
              ? 'A fresh start, made for you.'
              : authMode === 'signup'
                ? 'Begin your learning journey.'
                : authMode === 'reset'
                  ? 'Set a new password.'
                  : 'Welcome to your study space.'}
          </DialogTitle>
          <DialogDescription>
            {onboarding
              ? 'Choose your exam, language and daily goal.'
              : 'Sign in to keep your notes, progress and conversations private.'}
          </DialogDescription>
          {onboarding ? (
            <>
              <label>Language{languageSelect}</label>
              <label>
                Exam
                <select
                  value={exam}
                  onChange={(e) =>
                    setExam(e.target.value as keyof typeof exams)
                  }
                >
                  <option>JEE Main</option>
                  <option>NEET UG</option>
                </select>
              </label>
              <label>
                Daily study goal (minutes)
                <input
                  type="number"
                  min="15"
                  max="720"
                  value={goal}
                  onChange={(e) => setGoal(Number(e.target.value))}
                />
              </label>
              <button
                className="primary"
                onClick={() =>
                  run(async () => {
                    await api('profile', {
                      username: profile.username,
                      privacy: 'private',
                      preferences: { language: lang, exam, goal },
                    })
                    setOnboarding(false)
                  })
                }
              >
                Make room to grow <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const f = new FormData(e.currentTarget)
                void run(async () => {
                  if (authMode === 'reset') {
                    await updateUser({ password: String(f.get('password')) })
                    setAuth(false)
                    setMessage('Password updated.')
                    return
                  }
                  if (authMode === 'signup') {
                    const u = await signup(
                      String(f.get('email')),
                      String(f.get('password')),
                      { full_name: String(f.get('name')) },
                    )
                    if (!u.emailVerified) {
                      setMessage('Check your email to confirm your account.')
                      return
                    }
                  } else
                    await login(
                      String(f.get('email')),
                      String(f.get('password')),
                    )
                  const u = await getUser()
                  setUser(u)
                  if (u) {
                    const p = await api('profile')
                    setProfile({
                      username: p.username,
                      privacy: p.privacy,
                      date: '2027-04-01',
                    })
                    await refresh()
                    setAuth(false)
                    if (!p.preferences.exam) setOnboarding(true)
                  }
                })
              }}
            >
              {authMode === 'signup' && (
                <label>
                  Your name
                  <input name="name" required autoComplete="name" />
                </label>
              )}
              {authMode !== 'reset' && (
                <label>
                  Email
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                  />
                </label>
              )}
              <label>
                Password
                <input
                  name="password"
                  type="password"
                  minLength={8}
                  required
                  autoComplete={
                    authMode === 'login' ? 'current-password' : 'new-password'
                  }
                />
              </label>
              <button className="primary" disabled={busy}>
                {busy
                  ? 'Please wait…'
                  : authMode === 'signup'
                    ? 'Create account'
                    : authMode === 'reset'
                      ? 'Update password'
                      : 'Sign in'}
                <ArrowRight size={16} />
              </button>
              {google && (
                <button
                  type="button"
                  className="secondary"
                  onClick={() => oauthLogin('google')}
                >
                  Continue with Google
                </button>
              )}
              <div className="button-row spaced">
                <button
                  type="button"
                  className="text-button"
                  onClick={() =>
                    setAuthMode(authMode === 'signup' ? 'login' : 'signup')
                  }
                >
                  {authMode === 'signup'
                    ? 'Already have an account?'
                    : 'Create an account'}
                </button>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    const email = String(fallbackEmail(e.currentTarget.form))
                    void run(async () => {
                      if (!email)
                        throw new Error('Enter your email address first.')
                      await requestPasswordRecovery(email)
                      setMessage('Check your email for a password reset link.')
                    })
                  }}
                >
                  Reset password
                </button>
              </div>
            </form>
          )}
          {message && (
            <p role="status" className="auth-message">
              {message}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
function fallbackEmail(form: HTMLFormElement | null) {
  return form ? new FormData(form).get('email') || '' : ''
}
function Stat({
  icon: Icon,
  label,
  value,
  sub,
  progress,
  accent,
}: {
  icon: typeof Clock3
  label: string
  value: string
  sub: string
  progress?: number
  accent?: boolean
}) {
  return (
    <article className={'stat-card' + (accent ? ' warm' : '')}>
      <div className="stat-label">
        <span>{label}</span>
        <Icon size={19} />
      </div>
      <strong className="stat-value">{value}</strong>
      {progress !== undefined && (
        <div className="progress">
          <i style={{ width: Math.min(progress, 100) + '%' }} />
        </div>
      )}
      <p>{sub}</p>
    </article>
  )
}
function SectionTitle({
  title,
  action,
  onClick,
}: {
  title: string
  action: string
  onClick: () => void
}) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      {action && (
        <button className="text-button" onClick={onClick}>
          {action}
          <ArrowUpRight size={14} />
        </button>
      )}
    </div>
  )
}
function Empty({ text }: { text: string }) {
  return (
    <div className="empty-state">
      <NotebookPen size={38} />
      <p>{text}</p>
    </div>
  )
}
function Flashcard({
  record,
  onReview,
}: {
  record: LearningRecord
  onReview: (n: number) => void
}) {
  const [flipped, setFlipped] = useState(false)
  return (
    <article className="record-item">
      <h3>{record.data.front}</h3>
      {flipped ? (
        <>
          <div className="ai-output">{record.data.back}</div>
          <div className="button-row">
            <button className="secondary" onClick={() => onReview(1)}>
              Again
            </button>
            <button className="primary" onClick={() => onReview(2)}>
              Good
            </button>
            <button className="secondary" onClick={() => onReview(3)}>
              Easy
            </button>
          </div>
        </>
      ) : (
        <button className="secondary" onClick={() => setFlipped(true)}>
          Reveal answer
        </button>
      )}
    </article>
  )
}
