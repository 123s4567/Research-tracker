import { addWebhook, listWebhooks, deleteWebhook, updateWebhook } from '@/lib/webhooks'
import { existsSync, unlinkSync } from 'fs'
import { join } from 'path'

const STORE = join(process.cwd(), 'data', 'webhooks.json')

beforeEach(() => {
  // Remove store before each test for isolation
  if (existsSync(STORE)) unlinkSync(STORE)
})

afterAll(() => {
  if (existsSync(STORE)) unlinkSync(STORE)
})

describe('webhooks store', () => {
  it('starts with empty list', () => {
    expect(listWebhooks()).toEqual([])
  })

  it('adds a webhook and assigns id + createdAt', () => {
    const wh = addWebhook({
      url:    'https://example.com/hook',
      events: ['group.created'],
      secret: 'supersecret123',
      active: true,
    })

    expect(wh.id).toMatch(/^wh_/)
    expect(wh.url).toBe('https://example.com/hook')
    expect(wh.events).toContain('group.created')
    expect(wh.createdAt).toBeTruthy()
  })

  it('lists added webhooks', () => {
    addWebhook({ url: 'https://a.com', events: ['group.updated'], secret: 'secret1', active: true })
    addWebhook({ url: 'https://b.com', events: ['milestone.completed'], secret: 'secret2', active: false })

    const list = listWebhooks()
    expect(list).toHaveLength(2)
    expect(list[0].url).toBe('https://a.com')
    expect(list[1].active).toBe(false)
  })

  it('deletes a webhook by id', () => {
    const wh = addWebhook({ url: 'https://del.com', events: ['group.created'], secret: 'secret', active: true })
    expect(deleteWebhook(wh.id)).toBe(true)
    expect(listWebhooks()).toHaveLength(0)
  })

  it('returns false when deleting non-existent webhook', () => {
    expect(deleteWebhook('wh_nonexistent')).toBe(false)
  })

  it('updates a webhook', () => {
    const wh = addWebhook({ url: 'https://upd.com', events: ['group.created'], secret: 'secret', active: true })
    const updated = updateWebhook(wh.id, { active: false })
    expect(updated?.active).toBe(false)
    expect(listWebhooks()[0].active).toBe(false)
  })
})
