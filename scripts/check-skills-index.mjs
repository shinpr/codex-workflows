#!/usr/bin/env node
import { readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const INDEX_PATH = join(ROOT, '.agents', 'skills', 'task-analyzer', 'references', 'skills-index.yaml')
const SKILLS_DIR = join(ROOT, '.agents', 'skills')

function parseSkillsIndex(content) {
  const skills = {}
  const lines = content.split('\n')

  let currentSkill = null
  let inSections = false

  for (const [index, line] of lines.entries()) {
    const skillMatch = /^ {2}([\w-]+):\s*$/.exec(line)
    if (skillMatch) {
      currentSkill = skillMatch[1]
      skills[currentSkill] = { sections: [], lineNumber: index + 1 }
      inSections = false
      continue
    }

    if (!currentSkill) continue

    if (/^ {4}sections:\s*$/.test(line)) {
      inSections = true
      continue
    }

    if (/^ {4}[\w-]+:/.test(line)) {
      inSections = false
      continue
    }

    if (!inSections) continue

    const itemMatch = /^ {6}- "(.*)"\s*$/.exec(line)
    if (itemMatch) {
      skills[currentSkill].sections.push(itemMatch[1])
    }
  }

  return skills
}

function extractH2Headings(markdown) {
  return markdown
    .split('\n')
    .filter((line) => line.startsWith('## '))
    .map((line) => line.replace(/^## /, '').trim())
}

function diffArrays(expected, actual) {
  const max = Math.max(expected.length, actual.length)
  const mismatches = []

  for (let index = 0; index < max; index++) {
    if (expected[index] !== actual[index]) {
      mismatches.push({
        index,
        expected: expected[index] ?? '<missing>',
        actual: actual[index] ?? '<missing>',
      })
    }
  }

  return mismatches
}

async function main() {
  const indexContent = await readFile(INDEX_PATH, 'utf8')
  const skills = parseSkillsIndex(indexContent)
  const skillNames = Object.keys(skills)

  if (skillNames.length === 0) {
    console.error('check-skills-index: no skill entries parsed from skills-index.yaml; parser may be broken')
    process.exit(1)
  }

  let failed = 0
  const reports = []

  for (const name of skillNames) {
    const skillMdPath = join(SKILLS_DIR, name, 'SKILL.md')
    let markdown

    try {
      markdown = await readFile(skillMdPath, 'utf8')
    } catch {
      reports.push(`x ${name}: SKILL.md not found at ${skillMdPath} (yaml entry references a non-existent skill)`)
      failed++
      continue
    }

    const expected = skills[name].sections
    const actual = extractH2Headings(markdown)

    if (expected.length === 0) {
      reports.push(`! ${name}: yaml has no sections listed (expected at least one to validate)`)
      failed++
      continue
    }

    const mismatches = diffArrays(expected, actual)
    if (mismatches.length === 0) {
      reports.push(`ok ${name}: ${expected.length} sections match`)
      continue
    }

    reports.push(`x ${name}: ${mismatches.length} mismatch(es)`)
    for (const mismatch of mismatches) {
      reports.push(`    [${mismatch.index}] yaml: "${mismatch.expected}"`)
      reports.push(`        md:   "${mismatch.actual}"`)
    }
    failed++
  }

  for (const line of reports) {
    console.log(line)
  }

  if (failed > 0) {
    console.error(`\ncheck-skills-index: ${failed} skill(s) failed`)
    console.error('Either update .agents/skills/task-analyzer/references/skills-index.yaml to match the SKILL.md headings,')
    console.error('or update the SKILL.md headings to match the yaml. Order matters.')
    process.exit(1)
  }

  console.log(`\ncheck-skills-index: all ${skillNames.length} skill(s) consistent`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
