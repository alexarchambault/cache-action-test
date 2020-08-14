import * as cache from '@actions/cache'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
const hashFiles = require('hash-files')

// from https://github.com/c-hive/gha-npm-cache/blob/1d899ca6403e4536a2855679ab78f5b89a870863/src/restore.js#L6-L17
async function uname(): Promise<string> {
  let output = ''
  const options = {
    listeners: {
      stdout: (data: any) => {
        output += data.toString()
      }
    }
  }
  await exec.exec('uname', [], options)

  return output.trim()
}

async function run(): Promise<void> {
  const os = await uname()
  const paths = ['~/.cache/coursier']

  let root = core.getInput('root')
  if (!root.endsWith('/')) {
    root = `${root}/`
  }

  const hashOptions = {
    files: [
      `${root}*.sbt`,
      `${root}project/**.sbt`,
      `${root}project/build.properties`,
      `${root}project/**.scala`
    ],
    algorithm: 'sha1'
  }

  const hashPromise = new Promise<string>((resolve, reject) => {
    hashFiles(hashOptions, (error: any, hash: string) => {
      if (hash) resolve(hash)
      else reject(error)
    })
  })
  const hash = await hashPromise

  const key = `${os}-coursier-${hash}`
  const restoreKeys = [`${os}-coursier-`]

  core.saveState('COURSIER_CACHE_PATHS', JSON.stringify(paths))
  core.saveState('COURSIER_CACHE_KEY', key)

  const cacheHitKey = await cache.restoreCache(paths, key, restoreKeys)

  if (!cacheHitKey) {
    core.info('Cache not found')
    return
  }

  core.info(`Cache restored from key ${cacheHitKey}`)
  core.setOutput('COURSIER_CACHE_RESULT', cacheHitKey)
}

async function doRun(): Promise<void> {
  try {
    await run()
  } catch (err) {
    core.setFailed(err.toString())
  }
}

doRun()
