import { Component, h, Watch, Method, State, Prop, Event, EventEmitter } from '@stencil/core';
import CssClassList from '../../utils/interfaces/css-class-list';
import { toArray, toClassList } from '../../utils/props';
import { TOASTER_HORIZONTAL_POSITION, TOASTER_VERTICAL_POSITION } from './toaster-positions.enum';

@Component({
  tag: 'ds-toaster',
  styleUrl: 'toaster.scss',
})
export class DSToaster {
  container: HTMLDivElement;
  CSSClassList: CssClassList;

  @Prop({ mutable: true, reflect: true }) position: string | [TOASTER_VERTICAL_POSITION, TOASTER_HORIZONTAL_POSITION] = [
    TOASTER_VERTICAL_POSITION.TOP,
    TOASTER_HORIZONTAL_POSITION.LEFT,
  ];
  @Prop({ mutable: true, reflect: true }) mods: string | string[] = '';
  @Prop({ mutable: true, reflect: true }) messages: string | string[];
  @Prop({ reflect: true }) maxDisplayedToast = 3;
  @Prop() closingDelay = 3000;

  @State() isShown = false;

  @Watch('mods')
  modsChangeHandler(mods: string | string[]) {
    this.CSSClassList = toClassList('ds-title', toArray(mods));
  }

  @Event() toasterShow: EventEmitter;
  @Event() toasterShown: EventEmitter;
  @Event() toasterHide: EventEmitter;
  @Event() toasterHidden: EventEmitter;

  @Method()
  async displayToast() {
    this.show();
    if (this.closingDelay !== 0) {
      setTimeout(() => {
        this.hide();
      }, this.closingDelay);
    }
  }

  @Method()
  async show() {
    this.toasterShow.emit();
    this.container.addEventListener('transitionend', this.animationEndHandler);
    this.isShown = true;
  }

  @Method()
  async hide() {
    this.toasterHide.emit();
    this.container.addEventListener('transitionend', this.animationEndHandler);
    this.isShown = false;
  }

  constructor() {
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  componentWillLoad() {
    this.CSSClassList = toClassList('ds-toaster', toArray(this.mods));
  }

  //#region HANDLERS

  animationEndHandler() {
    this.container.removeEventListener('transitionend', this.animationEndHandler);
    this[`toaster${this.isShown ? 'Shown' : 'Hidden'}`].emit();
  }

  //#endregion

  render() {
    return (
      <div
        class={{
          'ds-toaster': true,
          [`--v-pos-${this.position[0]}`]: true,
          [`--h-pos-${this.position[1]}`]: true,
        }}
        ref={el => {
          this.container = el as HTMLDivElement;
        }}
        onClick={this.hide}
      >
        <div class={`ds-toaster__container`}>
          {toArray(this.messages).map(message => (
            <ds-toast>{message}</ds-toast>
          ))}
        </div>
      </div>
    );
  }
}
