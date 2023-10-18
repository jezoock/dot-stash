import { Element, Prop, Component, Host, h } from '@stencil/core/internal';
import _ds from '../../../typescript/dot-stash';

@Component({
  tag: 'ds-control',
})
export class DSControl {
  @Element() hostContainer: HTMLElement;

  @Prop() action: string;
  @Prop() type: string;
  @Prop() target: string;

  targetComponent: HTMLElement;

  componentDidLoad() {
    this.targetComponent = this.target ? document.querySelector(this.target) : this.hostContainer.closest(this.type);
    if(!this.targetComponent) {
      console.log(`[ERROR] DSControl: can't find target component, selector: ${this.target}, type: ${this.type}`);
    }
  }

  hostClickHandler = () => {
    if(this.targetComponent) {
      const [ action, args ] = this.action.split(/:(.*)/s);
      this.targetComponent[action](..._ds.props.fromJSON(args||[]));

    }
  }

  render() {
    return (
      <Host onClick={this.hostClickHandler}><slot /></Host>
    );
  }
}