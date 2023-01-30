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

  componentDidLoad() {
  }

  render() {
    return (
      <div class="ds-components-demo">
        <ds-rsp>
        <ds-button
            data-rsp={`{
              "sm": {
                "mods": ["solid", "primary", "sm"]
              },
              "md": {
                "mods": ["solid", "primary", "md"]
              },
              "lg": {
                "mods": ["solid", "primary", "lg"]
              }
            }`}
            mods={['solid', 'primary', 'lg']}
          >Mods Click me !</ds-button>
        <ds-block>
          <ds-title>
            Buttons
          </ds-title>
          


          <ds-grid class="ds-button-list" ds-cols="5" ds-h-gap="1" ds-v-gap="1" ds-type="fixed">
            <ds-grid-item class="ds-buttton-list__item" dsRatio={1}>
              <ds-button id="button" mods={["solid", "primary", "xs"]} onDsButtonClick={() => (document.querySelector('#button') as any).mods = ["solid", "primary", "xl"] }>Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item" dsRatio={1}>
              <ds-button mods={["solid", "primary", "sm"]}>Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item" dsRatio={1}>
              <ds-button mods={["solid", "primary", "md"]} disabled>
                <div slot="before">Before sdkjfh sjkdf</div>
                <div>Click me !</div>
                <div slot="after">After</div>
              </ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item" dsRatio={1}>
              <ds-button
                data-use-rsp
                data-rsp={{
                'sm': {
                  mods: ["solid", "primary", "sm"]
                },
                'md': {
                  mods: ["solid", "primary", "md"]
                },
                'lg': {
                  mods: ["solid", "primary", "lg"]
                }
              }} mods={["solid", "primary", "lg"]}>Mods Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item" dsRatio={1}>
              <ds-button mods={["solid", "primary", "xl"]}>Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item">
              <ds-button mods={["outlined", "primary", "xs"]}>Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item">
              <ds-button mods={["outlined", "primary", "sm"]}>Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item">
              <ds-button mods={["outlined", "primary", "md"]}>Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item">
              <ds-button mods={["outlined", "primary", "lg"]}>Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item">
              <ds-button mods={["outlined", "primary", "xl"]}>Click me !</ds-button>
            </ds-grid-item>
          </ds-grid>
        </ds-block>
        </ds-rsp>
      </div>
    );
  }
}
