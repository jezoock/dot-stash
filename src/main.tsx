import { Component, h, Method } from '@stencil/core';

@Component({
  tag: 'ds-main',
  styleUrl: './global.scss',
})
export class DSMainTest {
  data: Record<string, any> = {
    mockup: {
      data: {
        name: 'bob',
        description: 'description',
        price: 4.5,
        products: [
          { name: 'raoul', number: 'test5' },
          { name: 'djibril', number: 'test12121212' },
          { name: 'djibril', number: 'test12121212' },
        ],
      },
    },
  };

  @Method()
  async getData(key: string) {
    const keys = key.split('.');
    let pointer = this.data;

    keys.forEach(key => {
      pointer = pointer[key];
    });
    const data = pointer;
    return data;
  }

  changeHandler = event => {
    console.log(event);
  };

  componentDidLoad() {}

  render() {
    return (
      <div class="ds-components-demo">
        <ds-block>
          <ds-title>
            Buttons
          </ds-title>
          <ds-grid class="ds-button-list" ds-cols="5" ds-h-gap="1" ds-v-gap="1" ds-type="fixed">
            <ds-grid-item class="ds-buttton-list__item">
              <ds-button dsMods={["solid", "primary", "xs"]}>Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item">
              <ds-button dsMods={["solid", "primary", "sm"]}>Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item">
              <ds-button dsMods={["solid", "primary", "md"]}>Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item">
              <ds-button dsMods={["solid", "primary", "lg"]}>Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item">
              <ds-button dsMods={["solid", "primary", "xl"]}>Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item">
              <ds-button dsMods={["outlined", "primary", "xs"]}>Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item">
              <ds-button dsMods={["outlined", "primary", "sm"]}>Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item">
              <ds-button dsMods={["outlined", "primary", "md"]}>Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item">
              <ds-button dsMods={["outlined", "primary", "lg"]}>Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item">
              <ds-button dsMods={["outlined", "primary", "xl"]}>Click me !</ds-button>
            </ds-grid-item>
          </ds-grid>
        </ds-block>
      </div>
    );
  }
}
