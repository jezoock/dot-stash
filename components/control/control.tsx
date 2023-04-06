import { Element, Prop, Component, h, Host } from '@stencil/core';
import _ds from '../dot-stash';

@Component({
  tag: 'ds-control',
})
export class DSControl {
  @Element() hostContainer: HTMLDsControlElement;

  @Prop() action: string;
  @Prop() type: string;
  @Prop() target: string;

  targetComponent: HTMLElement;

  componentDidLoad() {
    this.targetComponent = this.target ? document.querySelector(this.target) : this.hostContainer.closest(this.type);
  }

  hostClickHandler = () => {
    const [ action, args ] = this.action.split(/:(.*)/s);
    this.targetComponent[action](..._ds.props.fromJSON(args||[]));
  }

  render() {
    return (
      <Host onClick={this.hostClickHandler}><slot /></Host>
    );
  }
}