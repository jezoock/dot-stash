import { Component, h, Method, Host } from '@stencil/core';


@Component({
  tag: 'ds-app',
})
export class app {
  
  @Method()
  async backToTop() {
    window.scroll(0, 0);
  }

  render() {
    return (
      <Host />
    );
  }
}