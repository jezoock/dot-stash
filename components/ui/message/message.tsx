import { Component, h, Prop, Listen } from '@stencil/core';


@Component({
  tag: 'ds-message',
  styleUrl: 'message.scss'
})
export class DSMessage {

  messageShown: boolean;

  @Prop() color: string;
  @Prop() bgColor: string;
  @Prop() speed: number;

  @Listen('panelHide')
  panelHideHandler() {
    if (!this.findMessageCookie()) {
      document.cookie = "dsMessage=true;path=/;expires=session;";
    }
  }

  componentWillLoad() {
    this.messageShown = !this.findMessageCookie();
  }

  getCookies = () => document.cookie.split(";")
  findMessageCookie = (): boolean => this.getCookies().find( cookie => cookie.split("=")[0].trim() === "dsMessage" ) !== undefined
  
  render() {
    return (
      <ds-panel-group mods="message" type="collapsible">
        <ds-panel 
          expanded={this.messageShown}
          id="pronto-message"
          style={{ 
            color: this.color, 
            backgroundColor: this.bgColor 
          }}
        >
          <ds-trigger target="#pronto-message" on="click" action="toggle">
            <i class="fa fa-times-circle"></i>
          </ds-trigger>
          <ds-slide-msg speed={this.speed} transition="slide-rtl">
            <slot />
          </ds-slide-msg>
        </ds-panel>
      </ds-panel-group>
    );
  }
}