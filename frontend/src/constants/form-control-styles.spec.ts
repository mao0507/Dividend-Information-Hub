import { themedCheckboxClass, themedSelectClass } from './form-control-styles'

describe('form control themed styles', () => {
  it('contains required select states', () => {
    expect(themedSelectClass).toContain('hover:border-border-strong')
    expect(themedSelectClass).toContain('focus-visible:ring-2')
    expect(themedSelectClass).toContain('disabled:cursor-not-allowed')
  })

  it('contains required checkbox states', () => {
    expect(themedCheckboxClass).toContain('checked:bg-accent')
    expect(themedCheckboxClass).toContain('focus-visible:ring-2')
    expect(themedCheckboxClass).toContain('disabled:cursor-not-allowed')
  })
})
