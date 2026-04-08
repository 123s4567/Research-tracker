import { rateLimit } from '@/lib/rateLimit'

function makeRequest(ip: string) {
  return new Request('http://localhost/api/test', {
    headers: { 'x-forwarded-for': ip },
  })
}

describe('rateLimit', () => {
  beforeEach(() => {
    // Each test needs a fresh module to reset the store
    jest.resetModules()
  })

  it('allows requests under the limit', () => {
    const req = makeRequest('1.2.3.4')
    const result = rateLimit(req, { limit: 5, windowSec: 60 })
    expect(result).toBeNull()
  })

  it('blocks requests over the limit', () => {
    const ip = '10.0.0.1'
    for (let i = 0; i < 5; i++) {
      rateLimit(makeRequest(ip), { limit: 5, windowSec: 60 })
    }
    const blocked = rateLimit(makeRequest(ip), { limit: 5, windowSec: 60 })
    expect(blocked).not.toBeNull()
    expect(blocked?.status).toBe(429)
  })

  it('returns 429 with Retry-After header when limited', async () => {
    const ip = '192.168.1.1'
    for (let i = 0; i < 3; i++) {
      rateLimit(makeRequest(ip), { limit: 3, windowSec: 60 })
    }
    const response = rateLimit(makeRequest(ip), { limit: 3, windowSec: 60 })
    expect(response?.status).toBe(429)
    expect(response?.headers.get('Retry-After')).toBeTruthy()

    const body = await response?.json()
    expect(body.code).toBe('RATE_LIMITED')
  })

  it('allows different IPs independently', () => {
    const ip1 = '5.5.5.5'
    const ip2 = '6.6.6.6'

    for (let i = 0; i < 5; i++) {
      rateLimit(makeRequest(ip1), { limit: 5, windowSec: 60 })
    }
    const blockedIp1 = rateLimit(makeRequest(ip1), { limit: 5, windowSec: 60 })
    const allowedIp2 = rateLimit(makeRequest(ip2), { limit: 5, windowSec: 60 })

    expect(blockedIp1?.status).toBe(429)
    expect(allowedIp2).toBeNull()
  })
})
