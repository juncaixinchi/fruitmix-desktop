import React from 'react'
import prettysize from 'prettysize'
import { Checkbox, Chip, Avatar, Divider } from 'material-ui'
import { HDDIcon } from './Svg'

export const SUBTITLE_HEIGHT = 32
export const TABLEHEADER_HEIGHT = 48
export const TABLEDATA_HEIGHT = 48
export const HEADER_HEIGHT = 80
export const FOOTER_HEIGHT = 48
export const SUBTITLE_MARGINTOP = 24
export const alphabet = 'abcdefghijklmnopqrstuvwxyz'

export const styles = {
  chip: {
    backgroundColor: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'medium',
    height: 26,
    marginRight: 5,
    border: '1px solid #e6e6e6'
  },
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  paperHeader: {
    position: 'relative',
    width: '100%',
    height: HEADER_HEIGHT,
    border: '1px solid #e6e6e6',
    display: 'flex',
    alignItems: 'center'
  }
}

export const partitionDisplayName = (name) => {
  const numstr = name.slice(3)
  return `分区 #${numstr}`
}

export const SubTitleRow = props => (
  <div style={{ width: '100%', height: SUBTITLE_HEIGHT, display: 'flex', alignItems: 'center' }}>
    <div style={{ flex: '0 0 256px' }} />
    <div
      style={{ flex: '0 0 184px',
        fontSize: 13,
        color: props.disabled ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.87)',
        fontWeight: 'bold'
      }}
    >
      {props.text}
    </div>
  </div>
)

export const VerticalExpandable = props => (
  <div style={{ width: '100%', height: props.height, transition: 'height 300ms', overflow: 'hidden' }}>
    { props.children }
  </div>
)

export const TableHeaderRow = (props) => {
  const style = {
    fontWeight: 'regular',
    fontSize: 12,
    height: TABLEHEADER_HEIGHT,
    display: 'flex',
    alignItems: 'center',
    color: '#9e9e9e'
  }

  return (
    <div style={style}>
      { props.items.map((item) => {
        const styleTmp = { flex: `0 0 ${item[1]}px` }
        if (item[2] === true) { styleTmp.textAlign = 'right' }
        return (<div style={styleTmp} key={item.toString()}>{item[0]}</div>)
      }) }
    </div>
  )
}

export const TableDataRow = (props) => {
  const containerStyle = {
    height: TABLEDATA_HEIGHT,
    fontSize: 14,
    fontWeight: 'medium',
    display: 'flex',
    alignItems: 'center',
    color: props.disabled ? 'rgba(0,0,0,0.38)' : '#212121'
  }

  if (!props.disabled && props.selected) { containerStyle.backgroundColor = '#F5F5F5' }

  return (
    <div style={props.style}>
      <div style={containerStyle}>
        { props.items.map((item) => {
          if (typeof item[0] === 'string') {
            const style = { flex: `0 0 ${item[1]}px` }
            if (item[2] === true) style.textAlign = 'right'
            return <div style={style} key={item.toString()}>{item[0]}</div>
          }
          const style = {
            flex: `0 0 ${item[1]}px`,
            display: 'flex',
            alignItems: 'center'
          }

          if (item[2] === true) style.justifyContent = 'center'
          return <div style={style} key={item.toString()}>{item[0]}</div>
        }) }
      </div>
    </div>
  )
}

export const diskDisplayName = (name) => {
  const chr = name.charAt(2)
  const number = alphabet.indexOf(chr) + 1
  return `硬盘 #${number}`
}

export const HeaderTitle1 = props => (
  <div style={props.style} onTouchTap={props.onTouchTap}>
    {props.title}
  </div>
)

export const FsAndVolumemode = props => (
  <div style={props.style} onTouchTap={props.onTouchTap}>
    <div style={styles.wrapper}>
      {
        props.textFilesystem &&
        <Chip style={styles.chip} labelStyle={{ marginTop: -4 }}>
          <span style={{ color: '#9e9e9e' }}>
            {props.textFilesystem}
          </span>
        </Chip>
      }
      {
        props.volumemode &&
          <Chip style={styles.chip} labelStyle={{ marginTop: -4 }}>
            <span style={{ color: '#9e9e9e' }}>
              {props.volumemode}
            </span>
          </Chip>
      }
    </div>
  </div>
)
export const Checkbox40 = props => (
  <div style={{ width: 40, height: 40 }}>
    <Checkbox
      {...props} style={{ margin: 8 }}
      iconStyle={{ fill: props.fill }}
    />
  </div>
)

export const HeaderIcon = props => (
  <div
    style={{
      width: 40,
      marginLeft: 24,
      marginTop: 24,
      marginRight: 16
    }}
  >
    { props.children }
  </div>
)

export const DiskHeadline = (props) => {
  const disk = props.disk
  const cnv = props.cnv
  let text = ''
  if (disk.isPartitioned) {
    text = '分区使用的磁盘'
  } else if (disk.idFsUsage === 'filesystem') {
    text = '包含文件系统，无分区表'
  } else if (disk.idFsUsage === 'other') {
    text = '包含特殊文件系统，无分区表'
  } else if (disk.idFsUsage === 'raid') {
    text = 'Linux RAID设备'
  } else if (disk.idFsUsage === 'crypto') {
    text = '加密文件系统'
  } else if (disk.idFsUsage) {
    text = `未知的使用方式 (ID_FS_USAGE=${disk.idFsUsage})`
  } else {
    text = '未发现文件系统或分区表'
  }

  return (
    <div
      style={{
        fontSize: 13,
        color: cnv ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.87)'
      }}
    >
      {text}
    </div>
  )
}

export const DiskTitle = (props) => {
  const { disk, cnv, uf, toggleCandidate } = props
  const { accent } = props.colors

  return (
    <div
      style={{ position: 'absolute',
        width: 256,
        display: 'flex',
        top: props.top,
        height: cnv ? TABLEDATA_HEIGHT : HEADER_HEIGHT,
        transition: 'all 300ms' }}
    >
      <HeaderIcon>
        { cnv ?
          <div style={{ marginTop: -16, marginLeft: 56 }}>
            <Checkbox40
              fill={accent}
              disabled={uf}
              onTouchTap={e => e.stopPropagation()}
              checked={!!cnv.disks.find(d => d === disk)}
              onCheck={() => toggleCandidate(disk)}
            />
          </div>
              :
          <Avatar
            size={40}
            color="white"
            backgroundColor="#BDBDBD"
            icon={<HDDIcon />}
          />
          }
      </HeaderIcon>
      <HeaderTitle1
        style={{
          fontWeight: 'regular',
          fontSize: cnv ? 13 : 26,
          height: cnv ? TABLEDATA_HEIGHT : HEADER_HEIGHT,
          width: 176,
          marginTop: cnv ? 18 : 22,
          marginLeft: cnv ? 40 : 0,
          color: (!cnv) ? '#212121' : 'rgba(0,0,0,0.38)',
          transition: 'height 300ms'
        }}
        title={diskDisplayName(disk.name)}
        onTouchTap={e => cnv && e.stopPropagation()}
      />
    </div>
  )
}

export const DiskInfoTable = (props) => {
  const { cnv, disk, type } = props
  return (
    <div>
      <TableHeaderRow
        disabled={cnv}
        items={[
          ['', 256],
          ['接口', 64],
          ['容量', 80, true],
          ['', 64],
          ['设备名', 96],
          ['型号', 200],
          ['序列号', 200],
          type === 'PartitionedDisk' ? ['分区表类型', 112] : []
        ]}
      />
      <TableDataRow
        disabled={cnv}
        selected={cnv && !!cnv.disks.find(d => d === disk)}
        items={[
          ['', 72],
          ['', 184],
          [disk.idBus, 64],
          [prettysize(disk.size * 512), 80, true],
          ['', 64],
          [disk.name, 96],
          [disk.model || '', 200],
          [disk.serial || '', 200],
          type === 'PartitionedDisk' ? [disk.partitionTableType, 112] : []
        ]}
      />
    </div>
  )
}

export const KeyValueList = (props) => {
  const style = { flexGrow: 1 }
  if (props.right === true) { style.textAlign = 'right' }
  return (
    <div style={props.style}>
      { props.items.map(item => (
        <div
          key={item.toString()}
          style={{
            height: 24,
            display: 'flex',
            alignItems: 'center',
            fontSize: 13,
            color: props.disabled ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.87'
          }}
        >
          <div style={{ width: 184 }}>{item[0]}</div>
          <div style={style}>{item[1]}</div>
        </div>
      ))}
    </div>
  )
}

export const DoubleDivider = props => (
  <div>
    { props.grayLeft &&
      <Divider
        style={{
          marginLeft: props.grayLeft,
          transition: 'margin 300ms',
          width: props.width
        }}
      /> }

    { props.colorLeft &&
    <Divider
      style={{
        marginLeft: props.colorLeft,
        backgroundColor: props.accent1Color,
        transition: 'margin 300ms',
        width: props.width
      }}
    /> }
  </div>
)
