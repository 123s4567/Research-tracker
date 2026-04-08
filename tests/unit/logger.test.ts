import { logger } from '@/lib/logger'

describe('logger', () => {
  it('exposes debug, info, warn, error, request methods', () => {
    expect(typeof logger.debug).toBe('function')
    expect(typeof logger.info).toBe('function')
    expect(typeof logger.warn).toBe('function')
    expect(typeof logger.error).toBe('function')
    expect(typeof logger.request).toBe('function')
  })

  it('does not throw when called with message only', () => {
    expect(() => logger.info('test message')).not.toThrow()
    expect(() => logger.warn('warning')).not.toThrow()
    expect(() => logger.error('error')).not.toThrow()
  })

  it('does not throw when called with meta', () => {
    expect(() => logger.info('with meta', { userId: '123', action: 'test' })).not.toThrow()
    expect(() => logger.request('GET', '/api/groups', 200, 42)).not.toThrow()
  })
})
