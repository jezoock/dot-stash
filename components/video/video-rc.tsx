import { Element, Prop, Component, h, Host } from '@stencil/core';
import _ds from '../dot-stash';

@Component({
  tag: 'ds-video-rc',
})
export class DSVideoRc {
  @Element() hostContainer: HTMLDsVideoRcElement;

  @Prop() action: string;
  @Prop() target: string;

  targetMap: HTMLDsVideoElement;

  componentDidLoad() {
    this.targetMap = this.target ? document.querySelector(this.target) : this.hostContainer.closest("ds-video");
  }

  hostClickHandler = () => {
    const [ action, args ] = this.action.split(/:(.*)/s);
    this.targetMap[action](..._ds.props.fromJSON(args||[]));
  }

  render() {
    return (
      <Host onClick={this.hostClickHandler}><slot /></Host>
    );
  }
}