import { Component, h, Prop } from '@stencil/core';
import { Element, Host, HostElement } from '@stencil/core/internal';
import _ds from '../../dot-stash';

export type DSButtonType = 'button' | 'submit' | 'trigger';
export type ButtonType = 'button' | 'submit';

@Component({
  tag: 'ds-video-play',
})
export class DSVideoPlay {
  @Element() container: HostElement;

  @Prop({ reflect: true }) target: string;
  @Prop({ reflect: true }) disabled: string | boolean = false;
  isDisabled: boolean;
  videoPlayer: HTMLDsVideoElement;

  componentWillLoad() {
    this.isDisabled = _ds.props.isTrue(this.disabled);
  }

  componentDidLoad() {
    if (this.target) {
      this.videoPlayer = document.querySelector(`ds-video${this.target}`)
    } else {
      this.videoPlayer = this.container.closest('ds-video');
    }
  }

  clickHandler = () => {
    console.log("here")
    this.videoPlayer.play();
  }

  render() {
    return (
      <Host onClick={this.clickHandler} />
    );
  }
}
