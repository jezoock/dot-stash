import { Element, Prop, Component, h } from '@stencil/core';


@Component({
  tag: 'ds-map-rc',
})
export class DSMapRc {
  @Element() hostContainer: any;

  @Prop() action: string;

  targetMap: HTMLDsMapElement;

  componentDidLoad() {
    this.targetMap = this.hostContainer.closest("ds-map");
  }

  hostClickHandler = () => {
    this.targetMap[this.action]();
  }

  render() {
    return (
      <button onClick={this.hostClickHandler}><slot /></button>
    );
  }
}