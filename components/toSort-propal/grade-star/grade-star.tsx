import { Component, h, Prop } from '@stencil/core';
import _ds from '../../../typescript/dot-stash';


@Component({
  tag: 'ds-grade-star',
  styleUrl: 'grade-star.scss'
})
export class DSGradeStar {

  @Prop() dsCount: string | number;
  @Prop() dsGrade: string | number;
  
  componentWillLoad() {
    this.dsGrade = _ds.props.toFloat(this.dsGrade);
  }

  render() {
    const gradeWidth = ((this.dsGrade as number)*100)/5;
    const jaugeWidth = 100 - gradeWidth;
    return (
      <div class="ds-grade-star">
        <div
          class="ds-grade-star__jauge"
          style={{
            width: `${jaugeWidth}%`
          }}
        >
          <div class="ds-placeholder --star --empty" />
          <div class="ds-placeholder --star --empty" />
          <div class="ds-placeholder --star --empty" />
          <div class="ds-placeholder --star --empty" />
          <div class="ds-placeholder --star --empty" />
        </div>
        <div
          class="ds-grade-star__grade"
          style={{
            width: `${gradeWidth}%`
          }}
        >
          <div class="ds-placeholder --star --full" />
          <div class="ds-placeholder --star --full" />
          <div class="ds-placeholder --star --full" />
          <div class="ds-placeholder --star --full" />
          <div class="ds-placeholder --star --full" />
        </div>
      </div>
    );
  }
}