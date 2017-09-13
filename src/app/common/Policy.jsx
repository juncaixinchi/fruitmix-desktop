import React from 'react'
import Debug from 'debug'
import { IconButton, Checkbox, RaisedButton, TextField, RadioButtonGroup, RadioButton } from 'material-ui'
import DoneIcon from 'material-ui/svg-icons/action/done'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back'
import EditorInsertDriveFile from 'material-ui/svg-icons/editor/insert-drive-file'
import FileCreateNewFolder from 'material-ui/svg-icons/file/create-new-folder'
import FileFolder from 'material-ui/svg-icons/file/folder'
import ArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right'
import Promise from 'bluebird'
import request from 'superagent'
import sanitize from 'sanitize-filename'
import FlatButton from '../common/FlatButton'
import { ShareDisk } from '../common/Svg'

const debug = Debug('component:file:Policy: ')

class PolicyDialog extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      value: 'rename',
      checked: true,
      current: 0
    }

    this.response = ['rename']

    this.toggleCheck = () => this.setState({ checked: !this.state.checked })

    this.fire = () => {
      const session = this.props.data.session
      const response = this.response
      debug('this.fire', session, response)
      this.props.ipcRenderer.send('resolveConflicts', { session, response, conflicts: this.props.data.conflicts })
      this.props.onRequestClose()
    }

    this.cancel = () => {
      const session = this.props.data.session
      this.props.ipcRenderer.send('resolveConflicts', { session, response: null })
      this.props.onRequestClose()
    }

    this.next = () => {
      let current = this.state.current + 1
      const length = this.props.data.conflicts.length
      this.response[this.state.current] = this.state.value
      debug('this.next', current, length, this.state.checked, this.response, this.state.value)
      if (this.state.checked) {
        this.response.length = length
        this.response.fill(this.state.value, current, length)
        current = length
      }
      if (current === length) this.fire()
      else this.setState({ current })
    }

    this.handleChange = (value) => {
      this.response[this.state.current] = value
      this.setState({ value })
    }
  }

  renderChoice() {
    const curr = this.props.data.conflicts[this.state.current]
    debug('renderChoice', curr.entryType, curr.remote.type)
    const choices = [
      { value: 'rename', label: '保留，两个项目均保留，自动重命名新项目' },
      { value: 'replace', label: '替换，使用新上传的项目替换原有项目' },
      { value: 'skip', label: '跳过，该项目将不会被上传' },
      { value: 'merge', label: '合并，两个文件夹的内容都保留' }
    ]
    return (
      <RadioButtonGroup
        onChange={(e, value) => this.handleChange(value)}
        defaultSelected={choices[0].value}
        name={'policy'}
      >
        {
          choices.map(c => (
            <RadioButton
              key={c.value}
              style={{ marginBottom: 16 }}
              labelStyle={{ color: '#757575' }}
              iconStyle={{ fill: this.state.value === c.value ? this.props.primaryColor : '#757575' }}
              value={c.value}
              label={c.label}
            />
          ))
        }
      </RadioButtonGroup>
    )
  }

  render() {
    debug('PolicyDialog', this.props, this.state)
    const name = this.props.data.conflicts[this.state.current].name
    return (
      <div style={{ width: 576, padding: '24px 24px 0px 24px' }}>
        {/* title */}
        <div style={{ fontSize: 16 }}>
          { `文件“${name}”在上传目标目录路径下已经存在，请选择您要执行的操作：` }
        </div>
        <div style={{ height: 20 }} />

        {/* choice */}
        { this.renderChoice() }
        <div style={{ height: 24 }} />

        <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
          { this.props.data.conflicts.length - this.state.current - 1 > 0 &&
            <Checkbox
              label={`其他冲突也执行此操作（还有${this.props.data.conflicts.length - this.state.current - 1}项）`}
              labelStyle={{ color: '#757575' }}
              iconStyle={{ fill: this.state.checked ? this.props.primaryColor : '#757575' }}
              checked={this.state.checked}
              onCheck={this.toggleCheck}
              style={{ width: 456 }}
            />
          }
          <FlatButton label="取消" onTouchTap={this.cancel} primary />
          <FlatButton label="确认" onTouchTap={this.next} primary />
        </div>
      </div>
    )
  }
}

export default PolicyDialog
