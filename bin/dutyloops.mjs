#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const ROOT = path.resolve(import.meta.dirname, '..')
const BLUEPRINTS_DIR = path.join(ROOT, 'blueprints')

function usage() {
  return `Duty Loops

Usage:
  dutyloops doctor
  dutyloops list
  dutyloops new <loop-id> --title <title> --scenario <text>
  dutyloops copy <source-loop-id> <new-loop-id> [--title <title>]
  dutyloops status <loop-id>
  dutyloops context <loop-id> [--slot <slot>] [--trigger <trigger>] [--reason <text>]
  dutyloops sandbox <loop-id|--all> [--slot <slot>] [--trigger <trigger>] [--writeback]
  dutyloops writeback <loop-id> --decision quiet|notify|ask|act --summary <text> [--material-change] [--gate <text>] [--next <text>]
  dutyloops review <loop-id>
`
}

function parseArgs(argv) {
  const args = { _: [] }
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (!token.startsWith('--')) {
      args._.push(token)
      continue
    }
    const key = token.slice(2)
    const next = argv[i + 1]
    if (!next || next.startsWith('--')) {
      args[key] = true
    } else {
      args[key] = next
      i += 1
    }
  }
  return args
}

function safeLoopId(value) {
  const id = String(value || '').trim()
  if (!/^[a-z0-9][a-z0-9-]{1,62}$/.test(id)) {
    throw new Error('loop id must be lowercase letters, digits, and hyphens, 2-63 chars')
  }
  return id
}

async function exists(file) {
  try {
    await fs.access(file)
    return true
  } catch {
    return false
  }
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'))
  } catch (error) {
    if (error?.code === 'ENOENT') return fallback
    throw error
  }
}

async function writeJson(file, data) {
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

async function appendJsonl(file, row) {
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.appendFile(file, `${JSON.stringify(row)}\n`, 'utf8')
}

async function readJsonl(file, limit = 20) {
  try {
    const raw = await fs.readFile(file, 'utf8')
    const rows = raw.trim()
      ? raw.trim().split('\n').filter(Boolean).map((line) => JSON.parse(line))
      : []
    return rows.slice(-limit)
  } catch (error) {
    if (error?.code === 'ENOENT') return []
    throw error
  }
}

function blueprintPath(loopId) {
  return path.join(BLUEPRINTS_DIR, safeLoopId(loopId))
}

function nowIso() {
  return new Date().toISOString()
}

function blueprintTemplate({ loopId, title, scenario }) {
  return `# ${title}

## Role

${scenario}

## Operating Principle

Act like a long-lived worker, not a one-shot chatbot. Each turn should inspect
fresh context, compare it with memory, decide whether there is material change,
and then either stay quiet, notify, ask for a human decision, or do a bounded
low-risk action.

## Triggers

- schedule: define the normal daily or weekly slots for this blueprint.
- event: define external changes that should wake the worker.
- manual: allow a human or agent to run one turn on demand.

## Context Sources

Update \`context/sources.json\` with the data sources this worker can read.
Connector scripts should write compact facts into \`context/latest.json\`.

## Material Change

List the changes that are worth attention. Avoid encoding every judgment as a
hard rule. The agent should explain why a change is material in the current
context.

## Notification Policy

- quiet: no material change or only stale/failed data.
- notify: material change that is useful but does not require immediate human action.
- ask: a concrete human decision is needed.
- act: only for bounded low-risk actions already allowed by this blueprint.

## Human Gates

The agent must stop and ask before irreversible, externally visible, financial,
destructive, credential, production, or publication actions.

## Writeback

Every turn must append one row to \`logs/runs.jsonl\` through:

\`\`\`bash
npm run writeback -- ${loopId} --decision quiet --summary "..."
\`\`\`
`
}

function firstMarkdownHeading(markdown) {
  const line = markdown.split('\n').find((item) => item.startsWith('# '))
  return line ? line.slice(2).trim() : null
}

async function listBlueprints() {
  const entries = await fs.readdir(BLUEPRINTS_DIR, { withFileTypes: true })
  const dirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort()
  return Promise.all(dirs.map(async (loopId) => {
    const dir = blueprintPath(loopId)
    const [state, contract] = await Promise.all([
      readJson(path.join(dir, 'state/state.json'), {}),
      fs.readFile(path.join(dir, 'BLUEPRINT.md'), 'utf8').catch(() => ''),
    ])
    return {
      loop_id: loopId,
      title: state.title || firstMarkdownHeading(contract) || loopId,
      blueprint: path.relative(ROOT, path.join(dir, 'BLUEPRINT.md')),
      latest_context: path.relative(ROOT, path.join(dir, 'context/latest.json')),
    }
  }))
}

async function buildContextPacket(loopId, args = {}) {
  const dir = blueprintPath(loopId)
  const [blueprint, state, sources, latest, runs] = await Promise.all([
    fs.readFile(path.join(dir, 'BLUEPRINT.md'), 'utf8'),
    readJson(path.join(dir, 'state/state.json'), {}),
    readJson(path.join(dir, 'context/sources.json'), {}),
    readJson(path.join(dir, 'context/latest.json'), {}),
    readJsonl(path.join(dir, 'logs/runs.jsonl'), 12),
  ])
  return {
    schema_version: 'duty_loop_context_packet_v1',
    generated_at: nowIso(),
    loop_id: loopId,
    trigger: String(args.trigger || 'manual'),
    slot: String(args.slot || 'adhoc'),
    reason: String(args.reason || ''),
    blueprint_contract: blueprint,
    current_state: state,
    sources,
    latest_context: latest,
    recent_runs: runs,
    runner_instruction: [
      'Decide whether this turn is quiet, notify, ask, or bounded act.',
      'Do not cross human gates. Ask one concrete question when a gate is needed.',
      'Write back exactly one run row with dutyloops writeback or npm run writeback.',
    ],
  }
}

function compactFactText(fact) {
  return [
    fact.id,
    fact.kind,
    fact.title,
    fact.name,
    fact.state,
    fact.summary,
  ].filter(Boolean).join(' ').toLowerCase()
}

function factLooksMaterial(fact) {
  const state = String(fact.state || '').toLowerCase()
  const text = compactFactText(fact)
  const quietStates = new Set(['routine', 'normal', 'low', 'ok', 'unchanged'])
  if (quietStates.has(state)) return false
  if (String(fact.risk_state || '').toLowerCase() === 'low' && !state) return false
  const materialStates = new Set([
    'actionable',
    'at_risk',
    'blocked',
    'degraded',
    'drifting',
    'elevated',
    'failing',
    'overdue',
    'opportunity',
    'ready',
    'risk',
    'stale',
    'unanswered',
    'unresolved',
  ])
  if (materialStates.has(state)) return true
  if (fact.ci === 'failing' || fact.review === 'changes_requested') return true
  if (fact.mergeable === true && /merge|release|approval/.test(text)) return true
  if (Number(fact.owner_wait_hours || 0) >= 24) return true
  if (Number(fact.age_hours || 0) >= 24) return true
  if (Number(fact.count || 0) >= 2 && /issue|question|request|cluster/.test(text)) return true
  if (String(fact.risk_state || '').toLowerCase().match(/risk|high|elevated/)) return true
  return /blocked|failing|stale|overdue|drift|at risk|high risk|elevated risk|spike|anomaly|complaint|unanswered|approval|ready for|needs owner|needs maintainer/.test(text)
}

function factNeedsGate(fact) {
  const text = compactFactText(fact)
  return [
    /ask before/,
    /(owner|maintainer|human) approval/,
    /approval (is )?needed/,
    /requires? (owner|maintainer|human) (approval|decision)/,
    /ready for owner .*decision/,
    /pricing approval/,
    /before (sending|posting|publishing|replying|trading|merging|releasing|changing|deleting|closing|locking)/,
    /(send|sending|post|posting|publish|publishing|public reply|posting publicly|replying publicly)/,
    /(merge decision|trade|order placement|rollback|credential use|customer outreach|public commitment|official position)/,
    /(security-sensitive|license acceptance|governance change|release publishing|publishing releases)/,
  ].some((pattern) => pattern.test(text))
}

function sandboxEvaluate(packet) {
  const facts = Array.isArray(packet.latest_context?.facts) ? packet.latest_context.facts : []
  const sourceHealth = Array.isArray(packet.latest_context?.source_health) ? packet.latest_context.source_health : []
  const staleSources = sourceHealth.filter((source) => {
    const status = String(source.status || '').toLowerCase()
    return status && !['ok', 'healthy', 'fixture'].includes(status)
  })
  const materialSignals = facts.filter(factLooksMaterial)
  const gateSignals = materialSignals.filter(factNeedsGate)
  let decision = 'quiet'
  if (gateSignals.length) decision = 'ask'
  else if (materialSignals.length) decision = 'notify'

  const primary = gateSignals[0] || materialSignals[0] || facts[0] || null
  const primarySummary = primary?.summary || primary?.title || primary?.id || 'No material signal'
  const summary = decision === 'quiet'
    ? staleSources.length
      ? `No material change; ${staleSources.length} source needs freshness review.`
      : 'No material change in sandbox fixture.'
    : `${decision === 'ask' ? 'Human gate likely needed' : 'Material signal detected'}: ${primarySummary}`
  const gate = gateSignals.length
    ? `Approve the next public, external, destructive, financial, production, or commitment-bearing action for ${gateSignals[0].id || packet.loop_id}?`
    : null
  const next = decision === 'quiet'
    ? 'Keep the loop quiet and refresh sources on the next trigger.'
    : decision === 'ask'
      ? 'Ask the owner for one concrete decision before acting.'
      : 'Notify with the primary signal and a bounded next check.'

  return {
    schema_version: 'duty_loop_sandbox_run_v1',
    generated_at: nowIso(),
    loop_id: packet.loop_id,
    slot: packet.slot,
    trigger: packet.trigger,
    decision,
    material_change: materialSignals.length > 0,
    summary,
    gate,
    next,
    signals: materialSignals.map((fact) => ({
      id: fact.id || null,
      kind: fact.kind || null,
      state: fact.state || null,
      summary: fact.summary || fact.title || fact.name || null,
      needs_gate: factNeedsGate(fact),
    })),
    source_health: {
      checked: sourceHealth.length,
      stale: staleSources.length,
    },
    feedback: [
      materialSignals.length ? 'Fixture exposes at least one material-change path.' : 'Fixture may be too quiet to validate notification behavior.',
      gateSignals.length ? 'Fixture exercises a human-gate path.' : 'Fixture does not exercise a human-gate path.',
      facts.length ? 'Context uses compact facts.' : 'Context/latest.json has no facts; add representative fixture data.',
    ],
  }
}

async function commandDoctor() {
  const checks = {
    root: ROOT,
    blueprintsDir: BLUEPRINTS_DIR,
    node: process.version,
    codexSkills: await exists(path.join(ROOT, '.agents/skills/duty-loop-runner/SKILL.md')),
    claudeSkillStubs: await exists(path.join(ROOT, '.claude/skills/duty-loop-runner/SKILL.md')),
  }
  console.log(JSON.stringify({ ok: true, checks }, null, 2))
}

async function commandList() {
  console.log(JSON.stringify({ ok: true, loops: await listBlueprints() }, null, 2))
}

async function commandNew(args) {
  const loopId = safeLoopId(args._[1])
  const title = String(args.title || loopId).trim()
  const scenario = String(args.scenario || 'Describe the responsibility of this worker blueprint.').trim()
  const dir = blueprintPath(loopId)
  if (await exists(dir)) throw new Error(`loop already exists: ${loopId}`)

  await fs.mkdir(path.join(dir, 'context'), { recursive: true })
  await fs.mkdir(path.join(dir, 'state'), { recursive: true })
  await fs.mkdir(path.join(dir, 'logs'), { recursive: true })
  await fs.writeFile(path.join(dir, 'BLUEPRINT.md'), blueprintTemplate({ loopId, title, scenario }), 'utf8')
  await writeJson(path.join(dir, 'context/sources.json'), {
    schema_version: 'duty_loop_sources_v1',
    sources: [],
    notes: ['Add connectors or manual context sources here. Keep credentials out of this file.'],
  })
  await writeJson(path.join(dir, 'context/latest.json'), {
    schema_version: 'duty_loop_latest_context_v1',
    generated_at: nowIso(),
    facts: [],
    source_health: [],
  })
  await writeJson(path.join(dir, 'state/state.json'), {
    schema_version: 'duty_loop_state_v1',
    loop_id: loopId,
    title,
    created_at: nowIso(),
    memory: [],
    open_gates: [],
    notification: {
      last_notified_at: null,
      recent_keys: [],
    },
  })
  await fs.writeFile(path.join(dir, 'logs/runs.jsonl'), '', 'utf8')
  console.log(JSON.stringify({ ok: true, loop_id: loopId, path: dir }, null, 2))
}

async function commandCopy(args) {
  const sourceLoopId = safeLoopId(args._[1])
  const loopId = safeLoopId(args._[2])
  const sourceDir = blueprintPath(sourceLoopId)
  const dir = blueprintPath(loopId)
  if (!(await exists(sourceDir))) throw new Error(`source loop does not exist: ${sourceLoopId}`)
  if (await exists(dir)) throw new Error(`loop already exists: ${loopId}`)

  await fs.cp(sourceDir, dir, { recursive: true })
  const stateFile = path.join(dir, 'state/state.json')
  const state = await readJson(stateFile, {})
  const title = String(args.title || state.title || loopId).trim()
  state.loop_id = loopId
  state.title = title
  state.created_at = nowIso()
  state.memory = Array.isArray(state.memory) ? state.memory : []
  state.open_gates = []
  state.notification = { last_notified_at: null, recent_keys: [] }
  delete state.last_run
  await writeJson(stateFile, state)

  const contractFile = path.join(dir, 'BLUEPRINT.md')
  let contract = await fs.readFile(contractFile, 'utf8')
  contract = contract.replace(/^# .+$/m, `# ${title}`)
  contract = contract.replaceAll(sourceLoopId, loopId)
  await fs.writeFile(contractFile, contract, 'utf8')
  await fs.writeFile(path.join(dir, 'logs/runs.jsonl'), '', 'utf8')

  console.log(JSON.stringify({ ok: true, loop_id: loopId, copied_from: sourceLoopId, path: dir }, null, 2))
}

async function commandStatus(args) {
  const loopId = safeLoopId(args._[1])
  const dir = blueprintPath(loopId)
  const state = await readJson(path.join(dir, 'state/state.json'), {})
  const latest = await readJson(path.join(dir, 'context/latest.json'), {})
  const runs = await readJsonl(path.join(dir, 'logs/runs.jsonl'), 8)
  console.log(JSON.stringify({
    ok: true,
    loop_id: loopId,
    title: state.title || loopId,
    latest_context_at: latest.generated_at || null,
    open_gates: state.open_gates || [],
    last_runs: runs.reverse(),
  }, null, 2))
}

async function commandContext(args) {
  const loopId = safeLoopId(args._[1])
  const dir = blueprintPath(loopId)
  const packet = await buildContextPacket(loopId, args)
  await writeJson(path.join(dir, 'context/latest-packet.json'), packet)
  console.log(JSON.stringify(packet, null, 2))
}

async function commandSandbox(args) {
  const loopIds = args.all
    ? (await listBlueprints()).map((loop) => loop.loop_id)
    : [safeLoopId(args._[1])]
  const results = []
  for (const loopId of loopIds) {
    const packet = await buildContextPacket(loopId, {
      ...args,
      trigger: args.trigger || 'sandbox',
      slot: args.slot || 'sandbox',
    })
    const result = sandboxEvaluate(packet)
    if (args.writeback) {
      const dir = blueprintPath(loopId)
      await appendJsonl(path.join(dir, 'logs/runs.jsonl'), {
        schema_version: 'duty_loop_run_v1',
        ts: result.generated_at,
        loop_id: loopId,
        decision: result.decision,
        summary: result.summary,
        material_change: result.material_change,
        gate: result.gate,
        next: result.next,
        sandbox: true,
      })
    }
    results.push(result)
  }
  console.log(JSON.stringify({
    ok: true,
    schema_version: 'duty_loop_sandbox_batch_v1',
    generated_at: nowIso(),
    count: results.length,
    results,
  }, null, 2))
}

async function commandWriteback(args) {
  const loopId = safeLoopId(args._[1])
  const decision = String(args.decision || '').trim()
  if (!['quiet', 'notify', 'ask', 'act'].includes(decision)) {
    throw new Error('--decision must be quiet, notify, ask, or act')
  }
  const summary = String(args.summary || '').trim()
  if (!summary) throw new Error('--summary is required')
  const dir = blueprintPath(loopId)
  const stateFile = path.join(dir, 'state/state.json')
  const state = await readJson(stateFile, {})
  const row = {
    schema_version: 'duty_loop_run_v1',
    ts: nowIso(),
    loop_id: loopId,
    decision,
    summary,
    material_change: Boolean(args['material-change']),
    gate: args.gate ? String(args.gate) : null,
    next: args.next ? String(args.next) : null,
  }
  await appendJsonl(path.join(dir, 'logs/runs.jsonl'), row)

  state.last_run = row
  if (row.gate) {
    const gates = Array.isArray(state.open_gates) ? state.open_gates : []
    if (!gates.some((gate) => gate.text === row.gate)) {
      gates.push({ text: row.gate, opened_at: row.ts, status: 'open' })
    }
    state.open_gates = gates
  }
  if (decision === 'notify') {
    state.notification = {
      ...(state.notification || {}),
      last_notified_at: row.ts,
    }
  }
  await writeJson(stateFile, state)
  console.log(JSON.stringify({ ok: true, row }, null, 2))
}

async function commandReview(args) {
  const loopId = safeLoopId(args._[1])
  const dir = blueprintPath(loopId)
  const runs = await readJsonl(path.join(dir, 'logs/runs.jsonl'), 50)
  const counts = runs.reduce((acc, row) => {
    acc[row.decision] = (acc[row.decision] || 0) + 1
    return acc
  }, {})
  const noisy = (counts.notify || 0) + (counts.ask || 0)
  const quiet = counts.quiet || 0
  const suggestions = []
  if (!runs.length) suggestions.push('Run the blueprint at least once before reviewing behavior.')
  if (noisy > quiet * 2 && runs.length >= 6) suggestions.push('Notification volume is high; tighten material-change criteria or add dedupe keys.')
  if ((counts.ask || 0) > 0) suggestions.push('Review open human gates and close or defer stale ones.')
  if (!suggestions.length) suggestions.push('No obvious control issue from recent logs. Keep the blueprint lightweight.')
  console.log(JSON.stringify({ ok: true, loop_id: loopId, counts, suggestions }, null, 2))
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const command = args._[0]
  if (!command || command === 'help' || args.help) {
    console.log(usage())
    return
  }
  if (command === 'doctor') return commandDoctor(args)
  if (command === 'list') return commandList(args)
  if (command === 'new') return commandNew(args)
  if (command === 'copy') return commandCopy(args)
  if (command === 'status') return commandStatus(args)
  if (command === 'context') return commandContext(args)
  if (command === 'sandbox') return commandSandbox(args)
  if (command === 'writeback') return commandWriteback(args)
  if (command === 'review') return commandReview(args)
  throw new Error(`unknown command: ${command}`)
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: String(error?.message || error) }, null, 2))
  process.exit(1)
})
