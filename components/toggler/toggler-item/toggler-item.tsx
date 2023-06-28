import {
  Component,
  Event,
  EventEmitter,
  h,
  Prop,
  Element
} from "@stencil/core";

@Component({
  tag: "ds-toggler-item",
  styleUrl: "toggler-item.scss"
})
export class DSTogglerItem {
  @Prop() titleContent = "";
  @Prop() titleLevel = "4";
  @Prop({ mutable: true, reflect: true }) expanded = false;
  @Prop({ mutable: true }) replaceExtendFunction: any;
  @Prop({ mutable: true }) hasContent = true;

  @Element() container: HTMLElement;

  transitionStarted = false;

  @Event() notify_togglerCollapsed_event: EventEmitter;
  @Event() notify_togglerExpanded_event: EventEmitter;

  constructor() {
    this.toggleContent = this.toggleContent.bind(this);
    this.togglerTitleClickHandler = this.togglerTitleClickHandler.bind(this);
  }

  componentDidLoad() {
    if (this.expanded) {
      (this.container.querySelector(
        ".ds-toggler-item__content"
      ) as HTMLDivElement).style.height = "auto";
    }
  }

  toggleContent() {
    const item = this.container.querySelector(
      ".ds-toggler-item__content"
    ) as HTMLDivElement;
    item.removeEventListener("transitionend", this.toggleContent);
    if (item.offsetHeight !== 0) {
      item.style.height = "auto";
      this.notify_togglerExpanded_event.emit();
    } else {
      this.notify_togglerCollapsed_event.emit();
    }
    item.classList.remove("--js-animated");
    this.transitionStarted = false;
  }

  togglerTitleClickHandler() {

    if (this.replaceExtendFunction) {
      this.replaceExtendFunction();
      return;
    }

    if (!this.transitionStarted) {

      this.transitionStarted = true;
      const { expanded } = this;
      this.expanded = !expanded;

      const item = this.container.querySelector(
        ".ds-toggler-item__content"
      ) as HTMLDivElement;

      const height = this.expanded
        ? (item?.firstElementChild as HTMLDivElement)?.offsetHeight
        : 0;

      if (item?.style?.height == "auto") {
        item.style.height = (item.firstElementChild as HTMLDivElement).offsetHeight + "px";
      }
      if (item && typeof window.getComputedStyle(item).height === 'undefined') { // Force recalculate style https://gist.github.com/paulirish/5d52fb081b3570c81e3a
        return;
      }

      setTimeout(() => {
        item?.classList.add("--js-animated");
        item?.addEventListener("transitionend", this.toggleContent);
        if (item) {
          item.style.height = height && height + "px";
        }
      }, 0);

    }
  }

  render() {
    const TitleTag = `h${this.titleLevel}`;

    return (
      <div
        class={{
          "ds-toggler-item": true,
          "--active": this.expanded && this.hasContent
        }}
      >
        <div
          class={{
            "ds-toggler-item__title": true,
            "--content": this.hasContent
          }}
          onClick={this.togglerTitleClickHandler}
        >
          {this.titleContent === "" ? (
            <slot name="title" />
          ) : (
            <TitleTag>
              {this.titleContent}
            </TitleTag>
          )}
        </div>

        {this.hasContent && (
          <div class="ds-toggler-item__content">
            <div>
              <slot />
            </div>
          </div>
        )}

      </div>
    );
  }
}
