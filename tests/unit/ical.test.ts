/**
 * Unit tests for iCal route helpers.
 * We test the formatting functions in isolation by extracting them.
 */

function icalDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

function escapeIcal(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

describe('icalDate', () => {
  it('formats a date as UTC with Z suffix and no separators', () => {
    const d = new Date('2026-05-15T09:30:00.000Z')
    const result = icalDate(d)
    expect(result).toBe('20260515T093000Z')
    expect(result).not.toContain('-')
    expect(result).not.toContain(':')
  })
})

describe('escapeIcal', () => {
  it('escapes semicolons', () => {
    expect(escapeIcal('a;b')).toBe('a\\;b')
  })

  it('escapes commas', () => {
    expect(escapeIcal('a,b')).toBe('a\\,b')
  })

  it('escapes newlines', () => {
    expect(escapeIcal('line1\nline2')).toBe('line1\\nline2')
  })

  it('escapes backslashes', () => {
    expect(escapeIcal('a\\b')).toBe('a\\\\b')
  })

  it('returns plain string unchanged', () => {
    expect(escapeIcal('Hello World')).toBe('Hello World')
  })
})
