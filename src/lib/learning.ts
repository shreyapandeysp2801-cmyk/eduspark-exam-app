export const languages = {
  en: 'English',
  hi: 'हिन्दी',
  kn: 'ಕನ್ನಡ',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  ml: 'മലയാളം',
  mr: 'मराठी',
  bn: 'বাংলা',
  gu: 'ગુજરાતી',
  pa: 'ਪੰਜਾਬੀ',
  ur: 'اردو',
  ja: '日本語',
  ko: '한국어',
  zh: '中文',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ar: 'العربية',
}
export const navigation = [
  'Dashboard',
  'AI Tutor',
  'Doubt Solver',
  'Notes',
  'Study Materials',
  'Practice & Mock Tests',
  'Study Tracker',
  'Timetable',
  'Revision',
  'Friends',
  'Bookmarks',
  'Settings',
]
const hi = [
  'डैशबोर्ड',
  'एआई शिक्षक',
  'शंका समाधान',
  'नोट्स',
  'अध्ययन सामग्री',
  'अभ्यास और मॉक टेस्ट',
  'अध्ययन प्रगति',
  'समय सारणी',
  'पुनरावृत्ति',
  'मित्र',
  'बुकमार्क',
  'सेटिंग्स',
]
export function translate(key: string, lang: string) {
  return lang === 'hi' ? hi[navigation.indexOf(key)] || key : key
}
export { exams } from './exams'
export const topics = [
  {
    subject: 'Physics',
    title: 'Laws of Motion',
    chapter: 'Mechanics',
    hindi: 'गति के नियम',
  },
  {
    subject: 'Physics',
    title: 'Current Electricity',
    chapter: 'Electricity',
    hindi: 'विद्युत धारा',
  },
  {
    subject: 'Chemistry',
    title: 'Chemical Bonding',
    chapter: 'Physical Chemistry',
    hindi: 'रासायनिक आबंधन',
  },
  {
    subject: 'Chemistry',
    title: 'Organic Chemistry',
    chapter: 'Organic Chemistry',
    hindi: 'कार्बनिक रसायन',
  },
  {
    subject: 'Mathematics',
    title: 'Limits & Derivatives',
    chapter: 'Calculus',
    hindi: 'सीमा और अवकलज',
  },
  {
    subject: 'Mathematics',
    title: 'Quadratic Equations',
    chapter: 'Algebra',
    hindi: 'द्विघात समीकरण',
  },
  {
    subject: 'Biology',
    title: 'Cell Structure',
    chapter: 'Cell Biology',
    hindi: 'कोशिका संरचना',
  },
  {
    subject: 'Biology',
    title: 'Human Physiology',
    chapter: 'Physiology',
    hindi: 'मानव शरीर क्रिया विज्ञान',
  },
]
export type LearningRecord = {
  id: string
  kind: string
  title: string
  data: Record<string, any>
  createdAt?: string
}
export async function api(path: string, body?: unknown, method?: string) {
  const r = await fetch('/api/' + path, {
    method: method || (body ? 'POST' : 'GET'),
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const d = await r.json()
  if (!r.ok) throw new Error(d.error || 'Request failed. Please retry.')
  return d
}
export function download(title: string, text: string) {
  const url = URL.createObjectURL(
    new Blob([text], { type: 'text/plain;charset=utf-8' }),
  )
  const a = document.createElement('a')
  a.href = url
  a.download = title + '.txt'
  a.click()
  URL.revokeObjectURL(url)
}
