import { Component, h } from "@stencil/core";

const containerName = "ds-two-columns";

@Component({
  tag: 'ds-two-columns',
  styleUrl: './two-columns.scss'
})
export class DSTwoColumns {
  render() {
    return (
      <div class={containerName}>
        <div class={`${containerName}__first`}>
          <slot name="first-column-content" />
        </div>
        <div class={`${containerName}__second`}>
          <slot name="second-column-content" />
        </div>
      </div>
    );
  }
}
