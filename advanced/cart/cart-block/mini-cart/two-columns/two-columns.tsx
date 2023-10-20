import { Component, h } from "@stencil/core";

const containerName = "snk-two-columns";

@Component({
  tag: 'snk-two-columns',
  styleUrl: './two-columns.scss'
})
export class SnkTwoColumns {
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
  };
};
