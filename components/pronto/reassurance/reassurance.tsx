import { Component, h, Host } from '@stencil/core/internal';

@Component({
  tag: 'ds-reassurance',
  styleUrl: 'reassurance.scss',
})
export class DSReassurance {
  render() {
    return (
      <Host class="ds-reassurance">
        <slot />
      </Host>
    );
  }
}
