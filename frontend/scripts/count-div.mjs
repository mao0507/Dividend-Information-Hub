import fs from 'node:fs'

const c = fs.readFileSync('src/pages/WatchlistPage.vue', 'utf8')
const t = c.split('<template>')[1].split('</template>')[0]
const tags = ['div', 'section', 'aside', 'button', 'span', 'AppLayout', 'UButton', 'UChip', 'USelect', 'SparkLine']
for (const tag of tags) {
  const o = (t.match(new RegExp(`<${tag}\\b`, 'g')) ?? []).length
  const c = (t.match(new RegExp(`</${tag}>`, 'g')) ?? []).length
  if (o !== c) console.log(tag, { o, c, diff: o - c })
}

