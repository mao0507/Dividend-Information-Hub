import {
  themedCheckboxClass,
  themedSelectTriggerClass,
  themedSelectListClass,
  themedSelectOptionClass,
} from './form-control-styles'

describe('form control themed styles', () => {
  it('contains required select trigger states', () => {
    expect(themedSelectTriggerClass).toContain('hover:border-border-strong')
    expect(themedSelectTriggerClass).toContain('focus-visible:ring-2')
    expect(themedSelectTriggerClass).toContain('disabled:cursor-not-allowed')
  })

  it('contains required select list and option states', () => {
    expect(themedSelectListClass).toContain('absolute')
    expect(themedSelectListClass).toContain('max-h-48')
    expect(themedSelectOptionClass).toContain('hover:bg-surface-2')
    expect(themedSelectOptionClass).toContain('cursor-pointer')
  })

  it('contains required checkbox states', () => {
    expect(themedCheckboxClass).toContain('checked:bg-accent')
    expect(themedCheckboxClass).toContain('focus-visible:ring-2')
    expect(themedCheckboxClass).toContain('disabled:cursor-not-allowed')
  })
})
