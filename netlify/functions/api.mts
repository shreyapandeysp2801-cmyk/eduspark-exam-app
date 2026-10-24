import { getUser } from '@netlify/identity'
import { and, eq, or, sql, desc, ne, ilike } from 'drizzle-orm'
import { db } from '../../db/index'
import { profiles, records, friendships, usage } from '../../db/schema'
import { generate } from '../../server/ollama'
import { z } from 'zod'
import { exams } from '../../src/lib/exams'
const recordInput = z.object({
  kind: z.enum([
    'note',
    'material',
    'conversation',
    'flashcard',
    'session',
    'task',
    'progress',
    'bookmark',
    'attempt',
    'quiz',
  ]),
  title: z.string().min(1).max(200),
  data: z.record(z.string(), z.unknown()).default({}),
})
async function validateLearningRecord(
  userId: string,
  record: z.infer<typeof recordInput>,
  id?: string,
) {
  const d = record.data
  if (record.kind === 'session')
    z.object({
      minutes: z.number().int().min(1).max(720),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      subject: z.string().max(100),
    }).parse(d)
  if (record.kind === 'note')
    z.object({
      text: z.string().min(1).max(100000),
      subject: z.string().max(100),
    }).parse(d)
  if (record.kind === 'progress')
    z.object({ complete: z.boolean(), subject: z.string().max(100) }).parse(d)
  if (record.kind === 'flashcard')
    z.object({
      front: z.string().min(1).max(16000),
      back: z.string().min(1).max(50000),
      interval: z.number().int().min(1).max(90),
      due: z.string(),
    }).parse(d)
  if (record.kind === 'task') {
    const task = z
      .object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        time: z.string().regex(/^\d{2}:\d{2}$/),
        start: z.number().int().min(0).max(1439),
        duration: z.number().int().min(15).max(240),
        subject: z.string().max(100),
        done: z.boolean().optional(),
      })
      .parse(d)
    if (task.start + task.duration > 1440)
      throw new Error('Study sessions must finish before midnight.')
    if (!task.done) {
      const existing = await db
        .select()
        .from(records)
        .where(and(eq(records.userId, userId), eq(records.kind, 'task')))
      if (
        existing.some((r) => {
          const other = r.data as any
          return (
            r.id !== id &&
            other.date === task.date &&
            !other.done &&
            task.start < other.start + other.duration &&
            task.start + task.duration > other.start
          )
        })
      )
        throw new Error(
          'This session overlaps another. Choose a different time.',
        )
    }
  }
}

export default async (req: Request) => {
  const requestId = crypto.randomUUID()
  const origin = req.headers.get('origin')
  if (
    !['GET', 'HEAD'].includes(req.method) &&
    origin &&
    origin !== new URL(req.url).origin
  )
    return Response.json(
      { error: 'Request origin is not permitted.' },
      { status: 403 },
    )
  try {
    const user = await getUser()
    if (!user)
      return Response.json(
        { error: 'Sign in to save your work or use AI.' },
        { status: 401 },
      )
    const path = new URL(req.url).pathname.replace('/api/', '')
    const method = req.method
    if (Number(req.headers.get('content-length')) > 4500000)
      return Response.json(
        { error: 'File or request is too large.' },
        { status: 413 },
      )
    await db
      .insert(profiles)
      .values({ id: user.id, username: 'student-' + user.id.slice(0, 8) })
      .onConflictDoNothing()
    if (path === 'profile') {
      if (method === 'GET')
        return Response.json(
          (await db.select().from(profiles).where(eq(profiles.id, user.id)))[0],
        )
      const b = z
        .object({
          username: z.string().regex(/^[a-zA-Z0-9_-]{3,30}$/),
          privacy: z.enum(['private', 'friends']),
          preferences: z.record(z.string(), z.unknown()),
        })
        .parse(await req.json())
      return Response.json(
        (
          await db
            .update(profiles)
            .set({ ...b, updatedAt: new Date() })
            .where(eq(profiles.id, user.id))
            .returning()
        )[0],
      )
    }
    if (path === 'records') {
      if (method === 'GET') {
        const all = await db
          .select()
          .from(records)
          .where(and(eq(records.userId, user.id), ne(records.kind, 'quiz')))
          .orderBy(desc(records.createdAt))
        return Response.json(all)
      }
      const b = recordInput.parse(await req.json())
      if (['quiz', 'attempt'].includes(b.kind))
        throw new Error('Use the quiz endpoint for scored activities.')
      await validateLearningRecord(user.id, b)
      const [r] = await db
        .insert(records)
        .values({ ...b, userId: user.id })
        .returning()
      return Response.json(r)
    }
    if (path.startsWith('records/')) {
      const id = z.string().uuid().parse(path.split('/')[1])
      if (method === 'DELETE') {
        await db
          .delete(records)
          .where(and(eq(records.id, id), eq(records.userId, user.id)))
        return Response.json({ ok: true })
      }
      const b = recordInput.parse(await req.json())
      if (['quiz', 'attempt', 'session'].includes(b.kind))
        throw new Error('This record cannot be edited.')
      await validateLearningRecord(user.id, b, id)
      return Response.json(
        (
          await db
            .update(records)
            .set({ ...b, updatedAt: new Date() })
            .where(
              and(
                eq(records.id, id),
                eq(records.userId, user.id),
                ne(records.kind, 'quiz'),
                ne(records.kind, 'attempt'),
              ),
            )
            .returning()
        )[0],
      )
    }
    if (path === 'ai') {
      const b = z
        .object({
          prompt: z.string().min(2).max(16000),
          language: z.string().max(20).default('en'),
          exam: z.enum(['JEE Main', 'NEET UG']).default('JEE Main'),
          mode: z.enum([
            'tutor',
            'doubt',
            'summary',
            'translation',
            'flashcards',
            'mindmap',
            'notes',
            'formulas',
            'quiz',
          ]),
          level: z.string().max(30).optional(),
          image: z.string().max(4000000).optional(),
        })
        .parse(await req.json())
      const minute = new Date().toISOString().slice(0, 16)
      const [limit] = await db
        .insert(usage)
        .values({ userId: user.id, minute })
        .onConflictDoUpdate({
          target: [usage.userId, usage.minute],
          set: { count: sql`${usage.count}+1` },
        })
        .returning()
      if (limit.count > 8)
        return Response.json(
          { error: 'Please wait a minute before another AI request.' },
          { status: 429 },
        )
      const text = await generate(b)
      if (b.mode === 'quiz') {
        const q = z
          .object({
            questions: z
              .array(
                z.object({
                  question: z.string().min(5),
                  options: z.array(z.string().min(1)).length(4),
                  correct: z.number().int().min(0).max(3),
                  explanation: z.string(),
                  topic: z.string(),
                }),
              )
              .min(1)
              .max(20),
          })
          .parse(JSON.parse(text))
        const [saved] = await db
          .insert(records)
          .values({
            userId: user.id,
            kind: 'quiz',
            title: 'AI-generated practice',
            data: { ...q, exam: b.exam, marking: exams[b.exam] },
          })
          .returning()
        return Response.json({
          id: saved.id,
          questions: q.questions.map(
            ({ correct, explanation, ...rest }) => rest,
          ),
        })
      }
      const kind = b.mode === 'tutor' ? 'conversation' : 'material'
      await db.insert(records).values({
        userId: user.id,
        kind,
        title: b.prompt.slice(0, 100),
        data: { prompt: b.prompt, text, mode: b.mode, language: b.language },
      })
      return Response.json({ text })
    }
    if (path === 'quiz/submit') {
      const b = z
        .object({
          id: z.string().uuid(),
          answers: z.array(z.number().int().min(-1).max(3)).max(20),
          seconds: z.number().min(0).max(18000),
        })
        .parse(await req.json())
      const result = await db.transaction(async (tx) => {
        const [quiz] = await tx
          .select()
          .from(records)
          .where(
            and(
              eq(records.id, b.id),
              eq(records.userId, user.id),
              eq(records.kind, 'quiz'),
            ),
          )
          .for('update')
        if (!quiz) throw new Error('Quiz not found.')
        const data = quiz.data as any
        if (data.submitted) return data.result
        const questions = data.questions
        const correct = questions.filter(
          (q: any, i: number) => q.correct === b.answers[i],
        ).length
        const wrong = questions.filter(
          (q: any, i: number) =>
            b.answers[i] !== undefined &&
            b.answers[i] !== -1 &&
            q.correct !== b.answers[i],
        ).length
        const result = {
          score:
            correct * (data.marking?.marks || 4) -
            wrong * (data.marking?.negative || 1),
          total: questions.length * (data.marking?.marks || 4),
          correct,
          questions,
          answers: b.answers,
          seconds: b.seconds,
        }
        await tx
          .update(records)
          .set({ data: { ...data, submitted: true, result } })
          .where(eq(records.id, b.id))
        await tx.insert(records).values({
          userId: user.id,
          kind: 'attempt',
          title: quiz.title,
          data: result,
        })
        return result
      })
      return Response.json(result)
    }
    if (path === 'friends') {
      if (method === 'GET') {
        const search = new URL(req.url).searchParams.get('search')
        if (search) {
          if (search.length < 3)
            throw new Error('Enter at least 3 username characters.')
          return Response.json(
            await db
              .select({ id: profiles.id, username: profiles.username })
              .from(profiles)
              .where(
                and(
                  ilike(profiles.username, search.replace(/[%_]/g, '') + '%'),
                  ne(profiles.id, user.id),
                ),
              )
              .limit(10),
          )
        }
        const rows = await db
          .select()
          .from(friendships)
          .where(
            or(
              eq(friendships.sender, user.id),
              eq(friendships.recipient, user.id),
            ),
          )
        return Response.json(rows)
      }
      const b = z
        .object({
          recipient: z.string().max(100),
          action: z.enum(['request', 'accept', 'remove', 'reject']),
        })
        .parse(await req.json())
      if (b.recipient === user.id) throw new Error('Choose another student.')
      if (b.action === 'request')
        await db
          .insert(friendships)
          .values({ sender: user.id, recipient: b.recipient })
          .onConflictDoNothing()
      else if (b.action === 'accept')
        await db
          .update(friendships)
          .set({ status: 'accepted' })
          .where(
            and(
              eq(friendships.sender, b.recipient),
              eq(friendships.recipient, user.id),
              eq(friendships.status, 'pending'),
            ),
          )
      else
        await db
          .delete(friendships)
          .where(
            or(
              and(
                eq(friendships.sender, user.id),
                eq(friendships.recipient, b.recipient),
              ),
              and(
                eq(friendships.recipient, user.id),
                eq(friendships.sender, b.recipient),
              ),
            ),
          )
      return Response.json({ ok: true })
    }
    return Response.json({ error: 'Endpoint not found.' }, { status: 404 })
  } catch (e) {
    const known =
      e instanceof z.ZodError
        ? 'Please check the input fields.'
        : e instanceof Error && e.name !== 'TypeError' && !('code' in e)
          ? e.message
          : 'The service is unavailable. Please retry.'
    return Response.json({ error: known, requestId }, { status: 400 })
  }
}
export const config = { path: '/api/*' }
