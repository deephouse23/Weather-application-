import { splitCsvLine } from '@/lib/services/spc-storm-reports-service'

describe('splitCsvLine', () => {
  it('splits simple comma fields', () => {
    expect(splitCsvLine('a,b,c')).toEqual(['a', 'b', 'c'])
  })

  it('preserves commas inside double-quoted fields', () => {
    expect(splitCsvLine('12:34,"1.75"" hail",Loc,"A, B County",TX,33.1,-97.2,note')).toEqual([
      '12:34',
      '1.75" hail',
      'Loc',
      'A, B County',
      'TX',
      '33.1',
      '-97.2',
      'note',
    ])
  })
})
