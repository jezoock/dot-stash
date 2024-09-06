import { Element, Component, h, Host, Prop, Event, EventEmitter, State, Method } from '@stencil/core';
import _ds from '../../../../typescript/dot-stash';
import { MediaPosition, MediaType, MediaUrlType, MediaUrlTypes, mediaTypes } from '../configurator/types';

let globalInputModalId = 0;

@Component({
  tag: 'ds-input-modal',
})
export class DSInputModal {
  @Element() host: HTMLDsInputModalElement;

  @Prop() name: string;
  @Prop() associatedRoute: string;
  @Prop() MediaPositions: MediaPosition[] = [];
  @Prop({ mutable: true }) value: any;
  @Prop({ attribute: "type" }) defaultType: any;

  /* @State() mediaPosition: 'block-before' | 'inline-before' | 'under' | 'inline-after' | 'block-after' = 'block-before';  */
  @State() showModal: boolean; 
  @State() path: string; 
  @State() MediaUrlType: MediaUrlType = 'local'; 
  @State() type: MediaType = 'image';
  @State() position: MediaPosition = 'top';

  inputId: string;

  @Event() valueChange: EventEmitter;

  /* For filemanager script */
  @Method()
  async setPath(path: string) {
    this.mediaChangeHandler("path", path);
  }
  
  @Method()
  async setType(type: MediaType) {
    this.mediaChangeHandler("type", type);
  }

  @Method()
  async setMediaUrlType(MediaUrlType: MediaUrlType) {
    this.mediaChangeHandler("MediaUrlType", MediaUrlType);
  }

  @Method()
  async setPosition(position: MediaPosition) {
    this.mediaChangeHandler("position", position);
  }

  @Method()
  async show() {
    this.toggle(true);
  }

  @Method()
  async hide() {
    this.toggle(false);
  }

  @Method()
  async toggle(mustShow?: boolean) {
    const { showModal } = this;
    this.showModal = typeof mustShow === "boolean" ? mustShow : !showModal;
  }

  /* For HTML Editor */
  /* @Listen('valueChange')
  valueChangeHandler(event: CustomEvent) {
    event.preventDefault();
    event.stopPropagation();
    const { name } = this;
    const {detail: { value }} = event;
    this.value = value;
    this.valueChange.emit({ value, name });
  } */

 /*  @Listen('requestCloseModal')
  requestCloseModalHandler() {
    this.hide();
  } */

  constructor() {
    this.inputClickHandler = this.inputClickHandler.bind(this);
    this.modalCloseHandler = this.modalCloseHandler.bind(this);
    this.clearButtonClickHandler = this.clearButtonClickHandler.bind(this);

    this.mediaChangeHandler = this.mediaChangeHandler.bind(this);
    this.mediaPathChangeHandler = this.mediaPathChangeHandler.bind(this);
    this.mediaTypeChangeHandler = this.mediaTypeChangeHandler.bind(this);
    this.mediaMediaUrlTypeChangeHandler = this.mediaMediaUrlTypeChangeHandler.bind(this);
    this.mediaPositionChangeHandler = this.mediaPositionChangeHandler.bind(this);
  }

  componentWillLoad() {
    this.inputId = `input-modal-${globalInputModalId++}`;
    this.host.setAttribute("id", this.inputId);
    
    let path = '';
    let [ position ] = this.MediaPositions;
    let [ MediaUrlType ] = MediaUrlTypes;
    let [ type ] = mediaTypes;

    if (typeof this.value !== 'undefined') {
      if (typeof this.value === 'string') {
        path = this.value;
        /* type = this.defaultType === "media" ? "image" : "html"; */
      } else {
        ({ position, MediaUrlType, path, type } = this.value);

        if (this.value.mediaPosition) {
          position = this.value.mediaPosition;
        }

        if (this.value.mediaMediaUrlType) {
          MediaUrlType = this.value.mediaMediaUrlType;
        }

        if (this.value.mediaPath) {
          path = this.value.mediaPath;
        }

        if (this['type'] && typeof type === "undefined") {
          type = this["type"];
        }
      }
    }

    this.type = type;
    this.path = path;
    this.position = position;
    this.MediaUrlType = MediaUrlType;
    this.value = {
      type,
      path,
      MediaUrlType,
      position
    }
  }

  mediaChangeHandler(key, value) {
    const newValue = { ...this.value, [key]: value };
    this.hide();
    this.valueChange.emit({ value: newValue, name: this.name });
    this[key] = value;
    this.value = newValue;
  }

  inputClickHandler() {
    if (this.MediaUrlType === "local") {
      this.show();
    }
  }

  modalCloseHandler() {
    this.hide();
  }

  clearButtonClickHandler() {
    this.setPath("");
  }

  mediaPathChangeHandler(event: FocusEvent) {
    this.setPath((event.target as HTMLInputElement).value);
  }

  mediaTypeChangeHandler({ detail: { value: [type] }}) {
    this.setType(type);
  }
  
  mediaMediaUrlTypeChangeHandler({ detail: { value: [MediaUrlType] }}) {
    this.setMediaUrlType(MediaUrlType);
  }
  
  mediaPositionChangeHandler({ detail: { value: [position] }}) {
    this.setPosition(position);
  }

  render() {
    console.log(this.inputId, this.type);
    return (
      <Host class={{
          "ds-input-modal": true,
          "--with-positions": this.MediaPositions.length > 0,
        }}
      >

        {/* {this.type !== "html" && (
          <Fragment>

            <ds-toggle-group name="type" onToggleValueChange={this.mediaTypeChangeHandler}>
              <ds-toggle checked={this.type === "image"} type="icon" name="type" value="image" />
              <ds-toggle checked={this.type === "video"} type="icon" name="type" value="video" />
            </ds-toggle-group>

            <ds-toggle-group name="MediaUrlType" onToggleValueChange={this.mediaMediaUrlTypeChangeHandler}>
              <ds-toggle checked={this.MediaUrlType === "local"} type="icon" name="MediaUrlType" value="local" />
              <ds-toggle checked={this.MediaUrlType === "remote"} type="icon" name="MediaUrlType" value="remote" />
            </ds-toggle-group>

          </Fragment>
        )} */}

        <div class="ds-input-modal__input">
          {/* {this.type !== "html" && this.MediaPositions.length > 0 && (
            <ds-toggle-group 
              name="position" 
              onToggleValueChange={this.mediaPositionChangeHandler} 
              mods={`item-count-${this.MediaPositions.length.toString()}`}
            >
              {this.MediaPositions.map( position => (
                <ds-toggle 
                  type="icon" 
                  name="position" 
                  checked={this.position === position} 
                  value={position} 
                />
              ))}
            </ds-toggle-group>
          )} */}
          <input
            type="text"
            name={this.inputId}
            value={this.path}
            onClick={this.inputClickHandler}
            onBlur={this.mediaPathChangeHandler}
          />
        </div>
        
        {this.showModal && (
          <pronto-modal
            overlay
            value={this.value}
            type={this.type}
            name={this.inputId}
            onModalClose={this.modalCloseHandler}
            associated-route={this.associatedRoute}
          />
        )}

        <ds-trigger class="pronto-field__clear-button" onClick={this.clearButtonClickHandler} type="button">X</ds-trigger>

      </Host>
    );
  }
}