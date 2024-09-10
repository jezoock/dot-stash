import { Component, h, Prop } from '@stencil/core';
import _ds from '../../../typescript/dot-stash';


@Component({
  tag: 'ds-rating-list',
  styleUrl: 'rating-list.scss'
})
export class DSRatingList {

  @Prop({ mutable: true, reflect: true }) dsAverage: string|number;
  @Prop({ mutable: true, reflect: true }) dsRatings: string|any[];
  
  componentWillLoad() {
    this.dsAverage = _ds.props.toNumber(this.dsAverage) as number;
    const ratings = _ds.props.fromJSON(this.dsRatings as string);
    ratings.splice(-1,1);
    this.dsRatings = ratings;
  }

  render() {
    return (
      <div class="ds-rating-list">
        <ul class="ds-rating-list__jauges">
          {(this.dsRatings as any[]).map( (rating, index) => (
            this.dsRatings.length && <li class="ds-rating-list__item">
              <div class="ds-rating --list">
                <div class="ds-rating__title">{5-index}</div>
                <div class="ds-rating__jauge">
                  <div style={{
                    width: `${((rating / this.dsRatings.length)*100).toString()}%`
                  }} />
                </div>
                <div class="ds-rating__count">( {rating} )</div>
              </div>
            </li>
          ))}
        </ul>
        <slot name="average" />
      </div>
    );
  }
}