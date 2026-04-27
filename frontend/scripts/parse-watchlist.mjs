import { parse } from '@vue/compiler-sfc'
import fs from 'node:fs'

const source = fs.readFileSync('src/pages/WatchlistPage.vue', 'utf8')
const { descriptor, errors } = parse(source, { filename: 'WatchlistPage.vue' })
if (errors.length) {
  for (const e of errors) {
    console.error(e.message)
    console.error(JSON.stringify(e.loc, null, 2))
  }
  process.exit(1)
}
console.log('SFC parse OK, template length:', descriptor.template?.content.length)
