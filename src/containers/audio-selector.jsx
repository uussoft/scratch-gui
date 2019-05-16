import React from 'react';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import AudioSelectorComponent from '../components/audio-trimmer/audio-selector.jsx';
import {getEventXY} from '../lib/touch-utils';

const MIN_LENGTH = 0.01; // Used to stop sounds being trimmed smaller than 1%

class AudioSelector extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleNewSelectionMouseDown',
            'handleTrimStartMouseDown',
            'handleTrimEndMouseDown',
            'handleTrimStartMouseMove',
            'handleTrimEndMouseMove',
            'handleTrimStartMouseUp',
            'handleTrimEndMouseUp',
            'storeRef'
        ]);

        this.state = {
            trimStart: props.trimStart,
            trimEnd: props.trimEnd
        };
    }
    componentWillReceiveProps (newProps) {
        this.setState({
            trimStart: newProps.trimStart,
            trimEnd: newProps.trimEnd
        });
    }
    clearSelection () {
        this.props.onSetTrim(null, null);
    }
    handleNewSelectionMouseDown (e) {
        this.initialX = getEventXY(e).x;
        const {width, left} = this.containerElement.getBoundingClientRect();
        this.initialTrimEnd = (this.initialX - left) / width;
        this.initialTrimStart = this.initialTrimEnd;
        this.props.onSetTrim(this.initialTrimStart, this.initialTrimEnd);
        // this.props.onStop();

        window.addEventListener('mousemove', this.handleTrimEndMouseMove);
        window.addEventListener('mouseup', this.handleTrimEndMouseUp);
        window.addEventListener('touchmove', this.handleTrimEndMouseMove);
        window.addEventListener('touchend', this.handleTrimEndMouseUp);

    }
    handleTrimStartMouseMove (e) {
        const containerSize = this.containerElement.getBoundingClientRect().width;
        const dx = (getEventXY(e).x - this.initialX) / containerSize;
        const newTrim = Math.max(0, Math.min(1, this.initialTrimStart + dx));
        if (newTrim > this.initialTrimEnd) {
            this.setState({
                trimStart: this.initialTrimEnd,
                trimEnd: newTrim
            });
        } else {
            this.setState({
                trimStart: newTrim
            });
        }
        e.preventDefault();
    }
    handleTrimEndMouseMove (e) {
        const containerSize = this.containerElement.getBoundingClientRect().width;
        const dx = (getEventXY(e).x - this.initialX) / containerSize;
        const newTrim = Math.min(1, Math.max(0, this.initialTrimEnd + dx));
        if (newTrim < this.initialTrimStart) {
            this.setState({
                trimStart: newTrim,
                trimEnd: this.initialTrimStart
            });
        } else {
            this.setState({
                trimEnd: newTrim
            });
        }
        e.preventDefault();
    }
    handleTrimStartMouseUp () {
        window.removeEventListener('mousemove', this.handleTrimStartMouseMove);
        window.removeEventListener('mouseup', this.handleTrimStartMouseUp);
        window.removeEventListener('touchmove', this.handleTrimStartMouseMove);
        window.removeEventListener('touchend', this.handleTrimStartMouseUp);
        this.props.onSetTrim(this.state.trimStart, this.state.trimEnd);
        // this.props.onPlay();
    }
    handleTrimEndMouseUp () {
        window.removeEventListener('mousemove', this.handleTrimEndMouseMove);
        window.removeEventListener('mouseup', this.handleTrimEndMouseUp);
        window.removeEventListener('touchmove', this.handleTrimEndMouseMove);
        window.removeEventListener('touchend', this.handleTrimEndMouseUp);
        if (this.state.trimEnd - this.state.trimStart < MIN_LENGTH) {
            this.props.onPlay(true, true);
            this.clearSelection();
        } else {
            this.props.onSetTrim(this.state.trimStart, this.state.trimEnd);
            // this.props.onPlay();
        }
    }
    handleTrimStartMouseDown (e) {
        this.initialX = getEventXY(e).x;
        this.initialTrimStart = this.props.trimStart;
        this.initialTrimEnd = this.props.trimEnd;
        window.addEventListener('mousemove', this.handleTrimStartMouseMove);
        window.addEventListener('mouseup', this.handleTrimStartMouseUp);
        window.addEventListener('touchmove', this.handleTrimStartMouseMove);
        window.addEventListener('touchend', this.handleTrimStartMouseUp);
        e.stopPropagation();
    }
    handleTrimEndMouseDown (e) {
        this.initialX = getEventXY(e).x;
        this.initialTrimEnd = this.props.trimEnd;
        this.initialTrimStart = this.props.trimStart;
        window.addEventListener('mousemove', this.handleTrimEndMouseMove);
        window.addEventListener('mouseup', this.handleTrimEndMouseUp);
        window.addEventListener('touchmove', this.handleTrimEndMouseMove);
        window.addEventListener('touchend', this.handleTrimEndMouseUp);
        e.stopPropagation();
    }
    storeRef (el) {
        this.containerElement = el;
    }
    render () {
        // console.log('start: ', this.props.trimStart, 'end: ', this.props.trimEnd)
        return (
            <AudioSelectorComponent
                containerRef={this.storeRef}
                playhead={this.props.playhead}
                trimEnd={this.state.trimEnd}
                trimStart={this.state.trimStart}
                onNewSelectionMouseDown={this.handleNewSelectionMouseDown}
                onTrimEndMouseDown={this.handleTrimEndMouseDown}
                onTrimStartMouseDown={this.handleTrimStartMouseDown}
            />
        );
    }
}

AudioSelector.propTypes = {
    onPlay: PropTypes.func,
    onSetTrim: PropTypes.func,
    onStop: PropTypes.func,
    playhead: PropTypes.number,
    trimEnd: PropTypes.number,
    trimStart: PropTypes.number
};

export default AudioSelector;
