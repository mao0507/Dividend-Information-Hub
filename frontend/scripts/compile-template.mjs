import { compile } from '@vue/compiler-dom'
import fs from 'node:fs'

const c = fs.readFileSync('src/pages/WatchlistPage.vue', 'utf8')
const t = c.split('<template>')[1].split('</template>')[0].trim()
try {
  const r = compile(t, { onError: (e) => console.error('onError', e) })
  console.log('compile ok', r.ast ? 'has ast' : 'no ast')
} catch (e) {
  console.error('compile throw', e)
}
