import { Element, Prop, Component, Host, h } from '@stencil/core/internal';
import _ds from '../../../typescript/dot-stash';

@Component({
  tag: 'ds-trigger',
})
export class DSTrigger {
  @Element() hostContainer: HTMLElement;

  @Prop() action: string;
  @Prop() event: string;
  @Prop() target: string;
  @Prop() type: 'button' | 'submit' | 'control' | 'link' = 'control';

  targetComponent: HTMLElement;

  componentDidLoad() {
    this.targetComponent = this.target ? document.querySelector(this.target) : this.hostContainer.closest("[ctx]");
    if(!this.targetComponent) {
      console.log(`[ERROR] DSControl: can't find target component, selector: ${this.target}, type: ${this.type}`);
    }
    console.log(this.targetComponent)
    this.hostContainer.addEventListener( this.event, this.hostClickHandler )
  }

  hostClickHandler = () => {
   
    if(this.targetComponent) {
      const [ action, args ] = this.action.split(/:(.*)/s);
      this.targetComponent[action](..._ds.props.fromJSON(args||[]));
    }
  }

  render() {
    return (
      <Host onClick={this.hostClickHandler}>
        <slot />
      </Host>
    );
  }
}