import React from 'react'
import { clipboard } from 'electron'
import Debug from 'debug'
import { Avatar, Divider, FloatingActionButton, Toggle, RaisedButton } from 'material-ui'
import ActionSupervisorAccount from 'material-ui/svg-icons/action/supervisor-account'
import ContentAdd from 'material-ui/svg-icons/content/add'
import SocialPersonAdd from 'material-ui/svg-icons/social/person-add'
import ContextMenu from '../common/ContextMenu'
import DialogOverlay from '../common/DialogOverlay'
import ChangeAccountDialog from './ChangeAccountDialog'
import FlatButton from '../common/FlatButton'

const debug = Debug('component:control:AdminUsers: ')

class AdminUsersApp extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      user: null,
      createNewUser: false,
      resetPwd: false,
      randomPwd: false,
      disableUser: false
    }

    this.toggleDialog = (op, user) => {
      this.setState({ [op]: !this.state[op], user })
    }

    this.resetPwd = () => {
      debug('this.resetPwd', this.state.user)
      this.setState({ resetPwd: false, randomPwd: 'true' })
    }
    this.disableUser = () => {
      debug('this.resetPwd', this.state.user)
      this.setState({ disableUser: false })
    }
    this.copyText = () => {
      clipboard.writeText('145343')
      this.props.openSnackBar('复制成功')
    }
  }

  renderUserRow(user) {
    return (
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          fontSize: 16,
          color: user.nologin ? 'rgba(0,0,0,0.54)' : 'rgba(0,0,0,0.87)'
        }}
        key={user.uuid}
      >
        <div style={{ flex: '0 0 32px' }} />
        <div style={{ flex: '0 0 40px' }}>
          <Avatar>{ user.username.slice(0, 1).toUpperCase() }</Avatar>
        </div>
        <div style={{ flex: '0 0 32px' }} />
        <div style={{ flex: '0 0 270px' }}>{ user.username }</div>
        <div style={{ flex: '0 0 125px', textAlign: 'center' }}>{ user.isAdmin ? '管理员' : '普通用户' }</div>
        <div style={{ flex: '0 0 125px', textAlign: 'center' }}>{ 0 ? '是' : '否' }</div>
        <div style={{ flex: '0 0 200px', textAlign: 'center' }}>{ 0 ? '' : '-' }</div>
        <div style={{ flex: '0 0 200px', textAlign: 'center' }}>{ 0 ? '' : '-' }</div>
        <div style={{ flex: '0 0 150px', textAlign: 'center' }}>
          {
            user.isFirstUser
            ? <div />
            : <FlatButton
              label="重置密码"
              onTouchTap={() => this.toggleDialog('resetPwd', user)}
              primary
              disabled={user.nologin}
            />
          }
        </div>
        <div style={{ flex: '0 0 50px', textAlign: 'center' }}>
          {
            user.isFirstUser
            ? <div />
            : <Toggle
              toggled={!user.nologin}
              onToggle={() => this.toggleDialog('disableUser', user)}
            />
          }
        </div>
      </div>
    )
  }

  render() {
    const { users, apis, refreshUsers, openSnackBar } = this.props
    if (!users) return <div />
    debug('this.props', this.props, users)
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <FloatingActionButton
          style={{ position: 'absolute', top: -36, left: 24 }}
          secondary
          onTouchTap={() => this.toggleDialog('createNewUser')}
        >
          <SocialPersonAdd />
        </FloatingActionButton>
        <div style={{ overflow: 'auto', height: '100%' }}>
          <div style={{ height: 48, display: 'flex', alignItems: 'center', fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.54)' }}>
            <div style={{ flex: '0 0 104px' }} />
            <div style={{ flex: '0 0 270px' }}>
              设备登录用户名
            </div>
            <div style={{ flex: '0 0 125px', textAlign: 'center' }}>
              设备使用权限
            </div>
            <div style={{ flex: '0 0 125px', textAlign: 'center' }}>
              绑定微信
            </div>
            <div style={{ flex: '0 0 200px', textAlign: 'center' }}>
              微信ID
            </div>
            <div style={{ flex: '0 0 200px', textAlign: 'center' }}>
              微信昵称
            </div>
          </div>
          <div style={{ height: 8 }} />
          <Divider style={{ marginLeft: 104, width: 1143 }} />
          { users.reduce((acc, user) =>
              [...acc, this.renderUserRow(user), <Divider style={{ marginLeft: 104, width: 1143 }} key={user.username} />],
              []) }
        </div>
        {/* createNewUser */}
        <DialogOverlay open={!!this.state.createNewUser} onRequestClose={() => this.toggleDialog('createNewUser')}>
          {
            this.state.createNewUser &&
            <ChangeAccountDialog
              refreshUsers={refreshUsers}
              apis={apis}
              op="createUser"
              openSnackBar={openSnackBar}
            />
          }
        </DialogOverlay>

        {/* reset password dialog */}
        <DialogOverlay open={!!this.state.resetPwd || !!this.state.randomPwd}>
          <div>
            {
              this.state.resetPwd &&
                <div style={{ width: 320, padding: '24px 24px 0px 24px' }}>
                  <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}> 重置密码 </div>
                  <div style={{ height: 20 }} />
                  <div style={{ color: 'rgba(0,0,0,0.54)' }}>{'重置密码后，该用户当前密码将会失效。'}</div>
                  <div style={{ color: 'rgba(0,0,0,0.54)' }}>
                    { '确认后，系统会提供随机密码并仅有一次登录时效。用户登录后请立刻修改密码。' }
                  </div>
                  <div style={{ height: 24 }} />
                  <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                    <FlatButton label="取消" primary onTouchTap={() => this.toggleDialog('resetPwd')} keyboardFocused />
                    <FlatButton label="确定" primary onTouchTap={this.resetPwd} />
                  </div>
                </div>
            }
            {
              this.state.randomPwd &&
                <div style={{ width: 320, padding: '24px 24px 0px 24px' }}>
                  <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}> 随机密码 </div>
                  <div style={{ height: 20 }} />
                  <div style={{ color: 'rgba(0,0,0,0.87)', fontSize: 34, fontWeight: '500', textAlign: 'center' }}>
                    { '145343' }
                  </div>
                  <div style={{ height: 24 }} />
                  <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                    <FlatButton label="复制到剪贴板" primary onTouchTap={this.copyText} />
                    <div style={{ width: 158 }} />
                    <FlatButton label="确定" primary onTouchTap={() => this.toggleDialog('randomPwd')} />
                  </div>
                </div>
            }
          </div>
        </DialogOverlay>

        {/* disable user dialog */}
        <DialogOverlay open={!!this.state.disableUser}>
          <div>
            {
              this.state.disableUser &&
                <div style={{ width: 320, padding: '24px 24px 0px 24px' }}>
                  <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}>
                    { this.state.user.nologin ? '启用用户' : '禁用用户' }
                  </div>
                  <div style={{ height: 20 }} />
                  <div style={{ color: 'rgba(0,0,0,0.54)' }}>
                    {
                      this.state.user.nologin
                      ? '您启用后，该用户将恢复权限，可登录并访问设备，确定吗？'
                      : '您禁用后，该用户将无法登录并访问设备，确定吗？'
                    }
                  </div>
                  <div style={{ height: 24 }} />
                  <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                    <FlatButton label="取消" primary onTouchTap={() => this.toggleDialog('disableUser')} keyboardFocused />
                    <FlatButton label="确定" primary onTouchTap={this.disableUser} />
                  </div>
                </div>
            }
          </div>
        </DialogOverlay>
      </div>
    )
  }
}

export default AdminUsersApp
