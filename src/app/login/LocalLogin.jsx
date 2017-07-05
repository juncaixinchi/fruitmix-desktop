import Debug from 'debug'
import React, { Component, PureComponent } from 'react'
import ReactDOM from 'react-dom'
import { FlatButton, CircularProgress, Divider } from 'material-ui'
import { indigo900, cyan500, cyan900, teal900, lightGreen900, lime900, yellow900
} from 'material-ui/styles/colors'

import CrossNav from './CrossNav'
import InfoCard from './InfoCard'
import UserBox from './UserBox'
import ErrorBox from './ErrorBox'
import CardDisplay from './ModelNameCard'
import InitWizard from './InitStep'

const debug = Debug('component:Login')
const colorArray = [indigo900, cyan900, teal900, lightGreen900, lime900, yellow900]
const duration = 300

// pure animation frame !
class DeviceCard extends PureComponent {

  componentWillEnter(callback) {
    this.props.onWillEnter(ReactDOM.findDOMNode(this), callback)
  }

  componentWillLeave(callback) {
    this.props.onWillLeave(ReactDOM.findDOMNode(this), callback)
  }

  render() {
    return (
      <div style={this.props.style}>
        { this.props.children }
      </div>
    )
  }
}

// This component is responsible for
// 1. device card navigation
// 2. card animation
// 3. background dim
// 4. card color
class Login extends React.Component {

  constructor(props) {
    super(props)

    this.state = {

      hello: true,

      enter: 'bottom',
      expanded: false,
      vexpand: false,
      hexpand: false,
      compact: false,
      dim: false,

      pin: '', // initWizard, pin child UI view, prevent auto dispatch, see footer

      bye: false,
      byebye: false
    }

    this.navPrevBound = this.navPrev.bind(this)
    this.navNextBound = this.navNext.bind(this)

    this.toggleDisplayBound = this.toggleDisplay.bind(this)
    this.toggleExpandedBound = this.toggleExpanded.bind(this)

    this.initWizardOnCancelBound = this.initWizardOnCancel.bind(this)
    this.initWizardOnFailBound = this.initWizardOnFail.bind(this)
    this.initWizardOnOKBound = this.initWizardOnOK.bind(this)

    this.refresh = () => {
      global.mdns.scan()
      setTimeout(() => {
        const mdns = global.mdnsStore
        if (mdns.length > 0) {
          this.props.selectDevice(mdns[0])
        }
      }, 1000)
      debug('this.refresh...')
    }


  }

  toggleDisplay(done) {
    this.setState({ compact: !this.state.compact, dim: !this.state.dim })
    if (done) setTimeout(() => done(), duration)
  }

  async toggleExpandedAsync() {
    const { vexpand, hexpand, expanded } = this.state
    if (vexpand !== hexpand || hexpand !== expanded) return

    if (!expanded) {
      this.setState({ vexpand: true, compact: true, dim: true })
      await Promise.delay(duration)
      this.setState({ hexpand: true })
      await Promise.delay(duration)
      this.setState({ expanded: true, pin: 'initWizard' })
    } else {
      this.setState({ vexpand: false })
      await Promise.delay(duration)
      this.setState({ hexpand: false })
      await Promise.delay(duration)
      this.setState({ expanded: false, compact: false, dim: false, pin: undefined })
      await Promise.delay(duration)
    }
  }

  toggleExpanded() {
    this.toggleExpandedAsync().asCallback()
  }

  navPrev() {
    const { mdns, selectedDevice, selectDevice } = this.props
    const index = mdns.findIndex(mdev => mdev === selectedDevice.mdev)
    if (index <= 0) return
    this.props.selectDevice(mdns[index - 1])
  }

  navNext() {
    const { mdns, selectedDevice, selectDevice } = this.props
    const index = mdns.findIndex(mdev => mdev === selectedDevice.mdev)
    if (index >= mdns.length - 1) return
    selectDevice(mdns[index + 1])
  }

  isFirst() {
    const { mdns, selectedDevice } = this.props
    return mdns[0] === selectedDevice.mdev
  }

  isLast() {
    const { mdns, selectedDevice } = this.props
    return mdns[mdns.length - 1] === selectedDevice.mdev
  }

  // card change detection is implemented here to conform to
  // `stateless` and `unidirection dataflow`
  componentWillReceiveProps(nextProps) {
    const currProps = this.props

    // device card enter from bottom
    if (!currProps.selectedDevice && nextProps.selectedDevice) { this.setState({ enter: 'bottom' }) }

    // device card leave from top
    else if (currProps.selectedDevice && !nextProps.selectedDevice) { this.setState({ enter: 'top' }) }

    // device card change
    else if (currProps.selectedDevice && nextProps.selectedDevice) {
      if (currProps.selectedDevice.mdev === nextProps.selectedDevice.mdev) return

      const currIndex = this.props.mdns.findIndex(mdev => mdev === this.props.selectedDevice.mdev)
      const nextIndex = nextProps.mdns.findIndex(mdev => mdev === nextProps.selectedDevice.mdev)

      this.setState({ enter: nextIndex >= currIndex ? 'right' : 'left' })
    }

    // don't know final sequence TODO
    else {
      this.setState({ enter: 'bottom' })
    }
  }

  componentDidMount() {
    setTimeout(() => this.setState({ hello: false }), 300)
  }

  initWizardOnCancel() {
    this.toggleExpandedAsync().asCallback()
  }

  initWizardOnFail() {
    // FIXME
    this.toggleExpandedAsync().asCallback()
  }

  async doneAsync(view, device, user) {
    this.setState({ bye: true, dim: false, enter: 'bottom' })
    await Promise.delay(360)

    this.setState({ byebye: true })
    await Promise.delay(360)

    if (view === 'maintenance') { this.props.maintain() } else {
      this.props.ipcRenderer.send('LOGIN', device, user)
      this.props.login()
    }
  }

  done(view, device, user) {
    this.doneAsync(view, device, user).asCallback()
  }

  initWizardOnOK() {
    const view = 'LOGIN'
    debug('this.props.selectedDevice', this.props.selectedDevice)
    const device = this.props.selectedDevice
    const user = device.users.value()[0]
    this.done(view, device, user)
  }

  footer() {
    const pullError = () => {
      const { boot, storage, users } = this.props.selectedDevice
      const obj = {
        boot: boot.isFulfilled() ? boot.value() : boot.reason(),
        storage: storage.isFulfilled() ? storage.value() : storage.reason(),
        users: users.isFulfilled() ? users.value() : users.reason()
      }
      return JSON.stringify(obj, null, '  ')
    }

    const boxStyle = {
      width: '100%',
      height: 64,
      backgroundColor: '#FAFAFA',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxSizing: 'border-box',
      paddingLeft: 24,
      paddingRight: 24
    }

    // //////////////////////////////////////////////////////////////////////////

    const status = this.props.selectedDevice.systemStatus()
    debug('footer', status, this.props.selectedDevice)

    if (this.state.pin === 'initWizard' || status === 'uninitialized') {
      const { hexpand, vexpand, expanded } = this.state

      if (hexpand === vexpand && vexpand === expanded) {
        if (expanded) {
          return (
            <InitWizard
              device={this.props.selectedDevice}
              showContent
              onCancel={this.initWizardOnCancelBound}
              onFail={this.initWizardOnFailBound}
              onOK={this.initWizardOnOKBound}
            />
          )
        }

        return (
          <div style={boxStyle}>
            <div>该设备尚未初始化</div>
            <FlatButton label="初始化" onTouchTap={this.toggleExpandedBound} />
          </div>
        )
      }
      return null
    }

    if (status === 'ready') {
      const users = this.props.selectedDevice.users.value()
      const style = { width: '100%', transition: 'all 300ms', position: 'relative' }

      if (users.length > 0) {
        return (
          <UserBox
            style={style}
            device={this.props.selectedDevice}
            toggleDisplay={this.toggleDisplayBound}
            done={this.done.bind(this)}
          />
        )
      }
    }

    let text,
      busy,
      maint,
      error,
      uninit
    switch (status) {
      case 'ready': // users.length === 0 need to add FirstUser Box TODO
        text = '系统错误：未发现用户'
        error = pullError()
        break
      case 'probing':
        text = '通讯中....'
        busy = true
        break
      case 'systemError':
        text = '系统错误：无法与该设备通讯，它可能刚刚离线或正在启动'
        error = pullError()
        break
      case 'fruitmixError':
        text = '应用错误：系统启动但应用服务无法连接'
        error = pullError()
        break
      case 'userMaint':
        text = '用户指定进入维护模式'
        maint = true
        break
      case 'failLast':
        text = '启动错误：未能启动上次使用的系统'
        maint = true
        break
      case 'failMulti':
        text = '启动错误：存在多个可用系统'
        maint = true
        break
      case 'failNoAlt':
        text = '启动错误：未能发现可用系统'
        maint = true
        break
      case 'unknownMaint':
      default:
        text = '未知错误'
        maint = true
        break
    }

    if (busy) {
      return (
        <div style={Object.assign({}, boxStyle, { paddingLeft: 16, justifyContent: 'start' })}>
          <CircularProgress style={{ flexBasis: 32 }} size={28} />
          <div style={{ flexBasis: 16 }} />
          <div>{text}</div>
        </div>
      )
    } else if (maint) {
      return (
        <div style={boxStyle}>
          <div>{text}</div>
          <FlatButton label="维护模式" onTouchTap={() => this.done('maintenance')} />
        </div>
      )
    } else if (error) { return <ErrorBox style={boxStyle} text={text} error={error} /> }
    return <div style={boxStyle} />
  }

  renderNoDevice() {
    return (
      <div>
        <div style={{ height: 16 }} />
        <div style={{ fontSize: 16, marginBottom: 12, color: 'rgba(0,0,0,0.87)' }}>
          未发现WISNUC OS设备
        </div>
        <div style={{ fontSize: 14, marginBottom: 12, color: 'rgba(0,0,0,0.54)' }}>
          局域网登录仅支持同一网段的WISNUC设备登录
        </div>
        <div style={{ height: 24 }} />
        <div style={{ fontSize: 16, marginBottom: 12, color: 'rgba(0,0,0,0.87)' }}>
          1. 请确保WISNUC设备电源开启并已连接网络
        </div>
        <div style={{ height: 24 }} />
        <div style={{ fontSize: 16, marginBottom: 12, color: 'rgba(0,0,0,0.87)' }}>
          2. 请尝试微信扫码登录
        </div>
        <div style={{ height: 24 }} />
        <div style={{ fontSize: 16, marginBottom: 12, color: 'rgba(0,0,0,0.87)' }}>
          3. 请刷新再次搜索
        </div>
      </div>
    )
  }

  render() {
    const { mdns, selectedDevice } = this.props

    let cardProps,
      displayProps,
      cardInnerStyle
    if (selectedDevice === null) {
      cardProps = {
        key: 'info-card',
        text: '正在搜索网络上的WISNUC OS设备'
      }
    } else {
      cardProps = { key: `device-card-${selectedDevice.mdev.name}` }
      displayProps = {
        toggle: this.state.compact,
        device: selectedDevice.mdev,
        ws215i: selectedDevice.device && selectedDevice.device.data && !!selectedDevice.device.data.ws215i,
        backgroundColor: colorArray[1],
        onNavPrev: (!selectedDevice || this.isFirst()) ? null : this.navPrevBound,
        onNavNext: (!selectedDevice || this.isLast()) ? null : this.navNextBound
      }

      cardInnerStyle = {
        backgroundColor: '#FAFAFA',
        width: this.state.hexpand ? 1152 : '100%',
        transition: `all ${duration}ms`
      }
    }

    return (
      <div style={{ zIndex: 100 }}>
        {
          mdns.length > 0
            ?  <div style={{ width: 540, height: 380, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CrossNav duration={0.35} enter={this.state.enter}>
                {
                  (this.state.bye || this.state.hello)
                  ? <DeviceCard key="animation-card-dummy" />
                  : selectedDevice === null
                  ? <InfoCard {...cardProps} />
                  : <DeviceCard {...cardProps}>
                    <div id="card inner style" style={cardInnerStyle}>
                      <CardDisplay {...displayProps} />
                      {this.footer()}
                    </div>
                  </DeviceCard>
                }
              </CrossNav>
            </div>
            : <div style={{ width: 380, height: 540, backgroundColor: '#FAFAFA' }}>
              <div style={{ height: 72, backgroundColor: '#FAFAFA', display: 'flex', alignItems: 'center' }} >
                <div style={{ marginLeft: 24 }} >
                  { '局域网登录' }
                </div>
              </div>
              <Divider />

              <div style={{ height: 8 }} />
              {/* content */}
                <div style={{ marginLeft: 24 }} >
                  { this.renderNoDevice() }
                </div>

              {/* button */}
              <div style={{ height: 152 }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginRight: 8 }}>
                <FlatButton
                  label={'刷新'}
                  labelStyle={{ color: '#424242', fontWeight: 500 }}
                  onTouchTap={this.refresh}
                />
              </div>
            </div>
        }
      </div>
    )
  }
}

export default Login
