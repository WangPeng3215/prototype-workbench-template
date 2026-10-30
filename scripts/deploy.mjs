#!/usr/bin/env node
/**
 * 一键把原型工作台发布到 PinMe 的固定域名。
 *
 * 用法:
 *   npm run deploy                    # 使用 .pinme.json 或 PINME_DOMAIN 里的域名
 *   npm run deploy -- example-domain        # 临时指定域名
 *   npm run deploy -- --skip-build    # 复用已有 dist，只上传
 *
 * 首次发布前需要先登录或配置 AppKey:
 *   pinme login
 *   pinme set-appkey <你的 AppKey>
 */
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const configPath = resolve(root, '.pinme.json')
const isWindows = process.platform === 'win32'

/** 读取固定域名：命令行 > 环境变量 > .pinme.json */
function resolveDomain(args) {
  const positional = args.filter((arg) => !arg.startsWith('-'))
  if (positional[0]) return positional[0]
  if (process.env.PINME_DOMAIN) return process.env.PINME_DOMAIN

  if (existsSync(configPath)) {
    try {
      const config = JSON.parse(readFileSync(configPath, 'utf8'))
      if (config.domain) return config.domain
    } catch {
      console.warn('⚠️  .pinme.json 解析失败，已忽略')
    }
  }
  return ''
}

const args = process.argv.slice(2)
const skipBuild = args.includes('--skip-build')
const domain = resolveDomain(args)

if (!domain) {
  console.error(
    [
      '',
      '❌ 没有找到固定域名。',
      '',
      '这个项目靠「同一个域名重复上传」来保持地址不变，所以必须先定一个域名。',
      '',
      '二选一：',
      '  1) 把 .pinme.example.json 复制成 .pinme.json，改掉里面的 domain',
      '  2) 每次发布时带上：npm run deploy -- example-domain',
      '',
      'PinMe 子域名（如 example-domain）→ 最终地址 https://example-domain.pinme.eth.limo',
      '自有域名（如 proto.example.com）→ 需要先把 CNAME 指向 p.eth.flights',
      '',
    ].join('\n'),
  )
  process.exit(1)
}

console.log(`📦 目标域名: ${domain}`)

if (skipBuild) {
  console.log('⏭️  已跳过构建，直接上传现有 dist/')
} else {
  console.log('\n$ npm run build\n')
  const build = spawnSync('npm', ['run', 'build'], {
    cwd: root,
    stdio: 'inherit',
    shell: isWindows,
  })
  if (build.status !== 0) {
    console.error('\n❌ 构建失败，已中止发布')
    process.exit(build.status ?? 1)
  }
}

if (!existsSync(resolve(root, 'dist/index.html'))) {
  console.error('❌ dist/index.html 不存在，构建可能失败了')
  process.exit(1)
}

console.log(`\n$ pinme upload ./dist --domain ${domain}\n`)
const upload = spawnSync('pinme', ['upload', './dist', '--domain', domain], {
  cwd: root,
  encoding: 'utf8',
  shell: isWindows,
})

const output = `${upload.stdout ?? ''}${upload.stderr ?? ''}`
process.stdout.write(output)

// pinme 在未登录时也会返回退出码 0，所以必须自己判断输出内容
const loginRequired = /please login first|not logged in|unauthorized|invalid .*appkey/i.test(output)
const hasResult = /https?:\/\/\S+/.test(output) || /\bbafy[a-z0-9]{20,}\b|\bQm[1-9A-HJ-NP-Za-km-z]{44}\b/.test(output)

if (loginRequired) {
  console.error(
    [
      '',
      '❌ 发布失败：PinMe 尚未登录或 AppKey 无效。',
      '',
      '任选一种方式完成认证后重试：',
      '  pinme login',
      '  pinme set-appkey <你的 AppKey>   （AppKey 在 pinme.eth.limo 控制台获取）',
      '',
    ].join('\n'),
  )
  process.exit(1)
}

if (upload.status !== 0 || !hasResult) {
  console.error(
    [
      '',
      '❌ 发布失败：没有拿到 CID 或访问地址。',
      '请检查上面的错误信息，常见原因是网络不通、域名未绑定或余额不足。',
      '',
    ].join('\n'),
  )
  process.exit(1)
}

console.log(
  [
    '',
    '✅ 发布完成',
    '',
    `  固定地址: https://${domain}.pinme.eth.limo`,
    domain.includes('.') && !domain.endsWith('.eth.limo')
      ? '  自有域名请确认 CNAME 已指向 p.eth.flights'
      : '',
    '',
    '  同一域名再次执行 npm run deploy 就是原地更新，地址不会变。',
    '',
  ]
    .filter(Boolean)
    .join('\n'),
)
