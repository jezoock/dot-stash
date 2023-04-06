import { Element, Prop, Component, h, Host } from '@stencil/core';
import _ds from '../dot-stash';

@Component({
  tag: 'ds-map-rc',
})
export class DSMapRc {
  @Element() hostContainer: HTMLDsMapRcElement;

  @Prop() action: string;
  @Prop() target: string;

  targetMap: HTMLDsMapElement;

  componentDidLoad() {
    this.targetMap = this.target ? document.querySelector(this.target) : this.hostContainer.closest("ds-map");
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