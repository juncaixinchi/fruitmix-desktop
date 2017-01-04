/**
  LazyloadBox.jsx
**/

import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import { add, remove } from './utils/eventListeners';
import throttle from './utils/throttle';
import Lazyload from './Lazyload';

// const __DELAY__ = 300;
// const __MUSTEXECTIME__ = 200;

export default class LazyloadBox extends Component {
  constructor(props) {
    super(props);

    // this.scrollHandler = throttle((parentNodeWidth, scrollTop) => {
    //   this.setState({ visible: this.inVisualNode(parentNodeWidth, scrollTop) });
    // }, __DELAY__, __MUSTEXECTIME__);
    // this.inVisualNode = (parentNodeWidth, scrollTop) => {
    //   const actualTop = this.props.actualTop - scrollTop;
    //   return actualTop < parentNodeWidth
    //     && actualTop + this.state.height >= 0;
    // };
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   return false;
  //   // return nextProps.actualTop !== this.props.actualTop
  //   //   || nextState.height !== this.state.height
  //   //   || nextState.visible !== this.state.visible;
  // }

  render() {
    return (
      <div>
        {React.createElement(this.props.children.type, {
          style: { display: 'flex', flexFlow: 'row wrap', justifyContent: 'flex-start' },
          key: this.props.key,
          date: this.props.date,
          allPhotos: this.props.allPhotos,
          photos: this.props.list.slice(0, 50),
          addListToSelection: this.props.addListToSelection,
          lookPhotoDetail: this.props.lookPhotoDetail,
          removeListToSelection: this.props.removeListToSelection
        })}
      </div>
    );
  }
}

LazyloadBox.propTypes = {
  date: PropTypes.string.isRequired,
  list: PropTypes.array.isRequired
};
