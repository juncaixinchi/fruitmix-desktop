const os = require('os')
const i18n = require('i18n')
const path = require('path')
const UUID = require('uuid')
const Promise = require('bluebird')
const request = require('superagent')
const fs = Promise.promisifyAll(require('original-fs')) // eslint-disable-line
const { ipcMain, shell, app, Notification } = require('electron')

const store = require('./store')
const { ftpGet } = require('./ftp')
const { getMainWindow } = require('./window')

const getTmpPath = () => store.getState().config.tmpPath

const checkAsync = async () => {
  console.log('CHECK_UPDATE...')
  const platform = os.platform()
  const type = platform === 'win32' ? 'windows' : 'mac' // mac or windows
  // const type = 'mac'
  const url = `https://api.github.com/repos/wisnuc/wisnuc-desktop-${type}/releases`
  const req = await request.get(url).set('User-Agent', 'request').timeout(10000)
  const rels = req.body

  const ltsRel = rels.filter(rel => !rel.prerelease)[0]
  const asset = ltsRel.assets.find((item) => {
    const extension = item.name.replace(/.*\./, '')
    return (extension === 'exe' || extension === 'dmg')
  })

  const fileName = asset.browser_download_url.replace(/.*\//, '')
  const filePath = path.join(getTmpPath(), fileName)
  console.log('lts version:', ltsRel.name)
  return { fileName, filePath, rel: ltsRel, url: asset.browser_download_url }
}

const checkUpdateAsync = async () => {
  let data
  try {
    data = await checkAsync()
  } catch (e) {
    const error = (e && e.response && e.response.body) || e
    console.log('checkUpdateAsync error', error)
    return getMainWindow().webContents.send('NEW_RELEASE', { error })
  }
  const { filePath, rel } = data
  try {
    await fs.accessAsync(filePath)
  } catch (error) {
    return getMainWindow().webContents.send('NEW_RELEASE', { rel })
  }
  return getMainWindow().webContents.send('NEW_RELEASE', { filePath, rel })
}

const checkUpdate = () => {
  if (os.platform() !== 'win32' && os.platform() !== 'darwin') return
  checkUpdateAsync().catch(e => console.log(e))
}

const install = (e, filePath) => {
  shell.openItem(filePath)
  setTimeout(() => app.quit(), 100)
}

const download = (url, filePath) => { // eslint-disable-line
  const tmpPath = path.join(getTmpPath(), UUID.v4())
  const stream = fs.createWriteStream(tmpPath)
  const promise = new Promise((resolve, reject) => {
    stream.on('finish', () => {
      fs.rename(tmpPath, filePath, (err) => {
        if (!err) return resolve(filePath)
        return reject(err)
      })
    })
    stream.on('error', reject)
  })
  stream.on('drain', () => {
    console.log(`Received ${stream.bytesWritten} bytes of data.`)
  })
  const handle = request.get(url).on('error', err => console.error(err))
  handle.pipe(stream)
  return promise
}

const compareVerison = (a, b) => {
  const aArray = a.split('.')
  const bArray = b.split('.')

  const len = Math.min(aArray.length, bArray.length)
  for (let i = 0; i < len; i++) {
    if (parseInt(aArray[i], 10) > parseInt(bArray[i], 10)) return 1
    if (parseInt(aArray[i], 10) < parseInt(bArray[i], 10)) return -1
  }
  if (aArray.length > bArray.length) return 1
  if (aArray.length < bArray.length) return -1
  return 0
}

const downloadAsync = async () => { // eslint-disable-line
  if (!['win32', 'darwin'].includes(os.platform())) return console.log('not support platform')
  const { filePath, url, rel, fileName } = await checkAsync() // eslint-disable-line
  console.log('downloadAsync: check release')
  const currVersion = app.getVersion()
  if (compareVerison(currVersion, rel.name) >= 0) return console.log('already latest')
  console.log('downloadAsync: start download...', currVersion, rel.name, compareVerison(currVersion, rel.name) < 0)
  try {
    await fs.accessAsync(filePath)
  } catch (error) {
    console.log('downloadAsync: downloading')
    // await download(url, filePath)
    const tmpPath = path.join(getTmpPath(), `${UUID.v4()}AND${fileName}`)
    const remotePath = `wisnuc_update/download/${fileName}`
    await ftpGet(remotePath, tmpPath, filePath)
  }
  return console.log('downloadAsync: download success')
}

const sendNotification = () => {
  console.log('sendNotification')
  const myNotification = new Notification({
    title: i18n.__('New Client Version Detected'),
    body: i18n.__('New Client Version Detected Text')
  })

  myNotification.on('click', () => {
    console.log('Notification clicked')
    shell.openExternal('http://www.wisnuc.com/download')
  })

  myNotification.show()
}

const firstCheckAsync = async () => {
  if (!['win32', 'darwin'].includes(os.platform())) return
  const { rel } = await checkAsync()
  const currVersion = app.getVersion()
  if (compareVerison(currVersion, rel.name) >= 0) console.log('already latest')
  else sendNotification()
}

setTimeout(() => firstCheckAsync().catch(e => console.log('firstCheck error', e)), 2000)

// downloadAsync().catch(e => console.error(e))

ipcMain.on('CHECK_UPDATE', checkUpdate)
ipcMain.on('INSTALL_NEW_VERSION', install)
