import { Component, h, Prop } from '@stencil/core';
import _ds from '../../../typescript/dot-stash';

@Component({
  tag: 'ds-social-link',
  styleUrl: 'social-link.scss'
})
export class DSSocialLink {
  
  @Prop({mutable: true}) dsNetworks: any[]|string = [];

  componentWillLoad() {
    this.dsNetworks = _ds.props.fromJSON( this.dsNetworks as string, 'list' );
  }

  render() {
    return (
      <div class="ds-social-link">
        <ul class="ds-social-link__list">
          {(this.dsNetworks as []).map( (network: any) => {
            return (
              <li class={{
                "ds-social-link__item": true,
                [`--${network.name}`]: true
              }}>
                <a href={network.url} target="_new" />
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}