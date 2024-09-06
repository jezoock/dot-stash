import { Element, Component, h, Host, Prop, Event, EventEmitter, State, Method } from '@stencil/core';
import { MediaPosition, MediaProps, MediaType, MediaUrlType, MediaUrlTypes, mediaTypes } from '../types';
import _ds from '../../../../../typescript/dot-stash';

let globalMediaModalId = 0;

@Component({
  tag: 'ds-media',
  styleUrl: 'media.scss'
})
export class DSMediaModal {

  //#region PROPS

  @Element() host: HTMLDsMediaElement;

  @Prop({ reflect: true }) name: string;
  @Prop() associatedRoute: string;
  @Prop() mediaPositions: MediaPosition[] = [];
  @Prop({ mutable: true }) value: any;

  /* @State() mediaPosition: 'block-before' | 'inline-before' | 'under' | 'inline-after' | 'block-after' = 'block-before';  */
  @State() showModal: boolean; 
  @State() path: string[]; 
  /* @State() pathMobile: string;  */
  @State() urlType: MediaUrlType = 'local'; 
  @State() type: MediaType = 'image';
  @State() position: MediaPosition = 'top';
  @State() currentImageIndex: string = '0';

  inputId: string;

  //#endregion

  //#region EVENTS

  @Event() valueChange: EventEmitter;

  //#region 

  //#region METHODS

  /* For filemanager script */
  @Method()
  async setPath(newPath: string, imageIndex?: number) {
    const { path, currentImageIndex } = this;
    const index = typeof imageIndex !== "undefined" ? imageIndex : currentImageIndex;
    path[index] = newPath;

    /* console.log(path, newPath, imageIndex, this.currentImageIndex); */

    this.mediaChangeHandler("path", path);
  }
  
  @Method()
  async setType(type: MediaType) {
    this.mediaChangeHandler("type", type);
  }

  @Method()
  async setUrlType(urlType: MediaUrlType) {
    this.mediaChangeHandler("urlType", urlType);
  }

  @Method()
  async setPosition(position: MediaPosition) {
    this.mediaChangeHandler("position", position);
  }

  @Method()
  async setAttributes(attributes) {
    this.mediaChangeHandler("attributes", attributes);
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

  @Method()
  async getConfig(extraProps: Record<string, unknown>) {
    let markup = '';
    const { path, type, attributes } = this.value;
    const filteredPath = path.filter( mediaPath => mediaPath !== "");

    if (path?.length) {
      const isImage = type === "image";
      const mediaProps: MediaProps = {};
      let mediaTag = "img";

      if (isImage) {
        mediaProps.src = filteredPath.shift();

        if (filteredPath.length >= 1) {
          let srcset = `${mediaProps.src} 2x`;
          /* let sizes = `(max-width: 767px) 767px,  ${attributes.width}px`; */
          filteredPath.map( mediaPath => srcset = `${srcset}, ${mediaPath} 1x`);
          mediaProps.srcset = srcset;
          /* mediaProps.sizes = sizes; */
        }
      } else {
        mediaTag = "ds-video";
        mediaProps.muted = true;
        mediaProps.playsinline = true;
        mediaProps.sources = path;
      }

      const props = { ...attributes, ...extraProps, ...mediaProps };
      markup = `<${mediaTag} ${_ds.props.toString(props)} />`;
      
    }

    return {
      config: this.value,
      markup
    }
  }

  //#endregion

  //#region LYFECYCLE

  constructor() {
    this.inputClickHandler = this.inputClickHandler.bind(this);
    this.modalCloseHandler = this.modalCloseHandler.bind(this);
    this.clearButtonClickHandler = this.clearButtonClickHandler.bind(this);

    this.mediaChangeHandler = this.mediaChangeHandler.bind(this);
    this.mediaPathChangeHandler = this.mediaPathChangeHandler.bind(this);
    this.mediaTypeChangeHandler = this.mediaTypeChangeHandler.bind(this);
    this.mediaUrlTypeChangeHandler = this.mediaUrlTypeChangeHandler.bind(this);
    this.mediaPositionChangeHandler = this.mediaPositionChangeHandler.bind(this);
    this.videoSettingsChangeHandler = this.videoSettingsChangeHandler.bind(this);
    this.imageSettingsChangeHandler = this.imageSettingsChangeHandler.bind(this);
  }

  componentWillLoad() {
    this.inputId = `media-modal-${globalMediaModalId++}`;
    this.host.setAttribute("id", this.inputId);
    
    let path = ['', ''];
    let [ position ] = this.mediaPositions;
    let [ urlType ] = MediaUrlTypes;
    let [ type ] = mediaTypes;
    let attributes: MediaProps = {};

    /* console.log(this.value); */

    /* 
      To remove once old data has been updated
      use code below instead
    */
    if (typeof this.value !== 'undefined') {
      if (typeof this.value === 'string') {
        path = [this.value, ''];
        type = "image";
        attributes.alt = "";
        attributes.title = "";
        attributes.loading = "lazy";
      } else {
        ({ position, urlType, path, type, attributes } = this.value);

        if (this.value.mediaPosition) {
          position = this.value.mediaPosition;
        }

        if (this.value.mediaUrlType) {
          urlType = this.value.mediaUrlType;
        }

        if (this.value.mediaPath) {
          path = this.value.mediaPath;
        }

        if (typeof path === "string") {
          path = [ path, '' ];
        }

        if (type === "image") {
          if (!Boolean(attributes)) {
            attributes = {};
          }
          if (!Boolean(attributes.loading)) {
            attributes.loading = "lazy";
          }
        }

        if (this['type'] && typeof type === "undefined") {
          type = this["type"];
        }
      }
    }

    /* 
      Code to use when data has been updated */

      /*
    if (typeof this.value !== 'undefined') {
      ({ position, urlType, path, type, attributes } = this.value);
    } */

    this.type = type;
    this.path = path;
    this.position = position;
    this.urlType = urlType;
    this.value = {
      type,
      path,
      urlType,
      position,
      attributes,
    }

    this.valueChange.emit({ value: this.value, name: this.name });
  }

  //#endregion

  //#region HANDLERS 

  mediaChangeHandler(key, value) {
    const newValue = { ...this.value, [key]: value };
    this.hide();
    this.valueChange.emit({ value: newValue, name: this.name });
    this[key] = value;
    this.value = newValue;
  }

  inputClickHandler(event:FocusEvent) {
    if (this.urlType === "local") {
      const input = (event.target as HTMLInputElement);
      const imageIndex = input.name.split("-").pop();
      this.currentImageIndex = imageIndex;
      this.show();
    }
  }

  modalCloseHandler() {
    this.hide();
  }

  clearButtonClickHandler(event: Event) {
    const { currentTarget } = event;
    const imageIndex = (currentTarget as HTMLElement).getAttribute("data-pos");

    this.setPath('', parseInt(imageIndex, 10));
  }

  mediaPathChangeHandler(event: FocusEvent) {
    if (this.urlType !== "local") {
      const input = (event.target as HTMLInputElement);
      const imageIndex = input.name.split("-").pop();
      
      this.setPath(input.value, parseInt(imageIndex, 10));
    }
  }

  mediaTypeChangeHandler({ detail: { value: [type] }}) {
    this.setType(type);
  }
  
  mediaUrlTypeChangeHandler({ detail: { value: [urlType] }}) {
    this.setUrlType(urlType);
  }
  
  mediaPositionChangeHandler({ detail: { value: [position] }}) {
    this.setPosition(position);
  }

  videoSettingsChangeHandler({detail: {value}}) {
    const attributes: any = {};
    value.map( attribute => attributes[attribute] = true );
    this.setAttributes(attributes);
  }

  imageSettingsChangeHandler(event: CustomEvent) {
    event.preventDefault();
    event.stopPropagation();
    const { detail: { name, value } } = event;

    this.setAttributes({
      ...this.value.attributes,
      [name]: value
    });
    /* if (name === "componentType" && this.componentType !== value) {
      this.config = value === "features" ? [] : {};
    }
    this[name] = value;
    this.settingChangeHandler(); */
  }

  //#endregion

  render() {
    
    return (
      <Host class={{
          "ds-media": true,
          "ds-input-modal": true,
          "--with-positions": this.mediaPositions.length > 0,
        }}
      >
        <div class="ds-media__container">

          <ds-toggle-group count={[1]} class="ds-media__type" name="type" onToggleValueChange={this.mediaTypeChangeHandler}>
            <ds-toggle checked={this.type === "image"} type="icon" name="type" value="image" />
            <ds-toggle checked={this.type === "video"} type="icon" name="type" value="video" />
          </ds-toggle-group>

          <ds-toggle-group count={[1]} class="ds-media__url-type" name="urlType" onToggleValueChange={this.mediaUrlTypeChangeHandler}>
            <ds-toggle checked={this.urlType === "local"} type="icon" name="urlType" value="local" />
            <ds-toggle checked={this.urlType === "remote"} type="icon" name="urlType" value="remote" />
          </ds-toggle-group>

          {this.mediaPositions.length > 0 && (
            <ds-toggle-group 
              name="position" 
              onToggleValueChange={this.mediaPositionChangeHandler} 
              mods={`item-count-${this.mediaPositions.length.toString()}`}
            >
              {this.mediaPositions.map( position => (
                <ds-toggle 
                  type="icon" 
                  name="position" 
                  checked={this.position === position} 
                  value={position} 
                />
              ))}
            </ds-toggle-group>
          )}

        </div>

        <div class="ds-input-modal__input ds-media__input">
          {(this.path as []).map( (mediaPath, index) => 
            <div class="ds-media__field">
              <input
                type="text"
                name={`${this.inputId}-${index}`}
                value={mediaPath}
                onClick={this.inputClickHandler}
                onChange={this.mediaPathChangeHandler}
              />
              <ds-trigger
                class="pronto-field__clear-button" 
                onClick={this.clearButtonClickHandler}
                type="button" 
                mods="clear-field"
                data-pos={`${index}`}
              >
                <pronto-icon type="trash" />
              </ds-trigger>
            </div>
          )}
        </div>

        {this.value.type === "video" && (
          <ds-toggle-group count={[0, 3]} name="video-settings" onToggleValueChange={this.videoSettingsChangeHandler} type="switch" class="ds-input-modal__video-settings ds-media__video-settings">
            <ds-toggle value="controls" checked={Boolean(this.value.attributes.controls)} /><div>Contrôles</div>
            <ds-toggle value="autoplay" checked={Boolean(this.value.attributes.autoplay)} /><div>Lecture automatique</div>
            <ds-toggle value="loop" checked={Boolean(this.value.attributes.loop)} /><div>Lecture en boucle</div>
            {/* <ds-select>
              <option>File format</option>
              <option>MP4</option>
              <option>WEBM</option>
            </ds-select> */}
          </ds-toggle-group>
        )}

        {this.value.type === "image" && (
          <pronto-form
            class="ds-input-modal__image-settings ds-media__image-settings" 
            mods={["inline"]}
            onValueChange={this.imageSettingsChangeHandler}
            fields={[
              {
                name: "alt",
                label: "alt",
                defaultValue: this.value.attributes?.alt || "",
                type: "simple-title"
              },
              {
                name: "title",
                label: "title",
                defaultValue: this.value.attributes?.title || "",
                type: "simple-title"
              },
              {
                name: "loading",
                label: "loading",
                type: "select",
                defaultValue: this.value.attributes?.loading || "lazy",
                values: [
                  {
                    label: "Auto",
                    value: "auto"
                  },
                  {
                    label: "Eager",
                    value: "eager"
                  },
                  {
                    label: "Lazy",
                    value: "lazy"
                  },
                ]
              },
              {
                name: "width",
                label: "width",
                defaultValue: this.value.attributes?.width || 0,
                type: "number"
              },
              {
                name: "height",
                label: "height",
                defaultValue: this.value.attributes?.height || 0,
                type: "number"
              },
            ]}
          />
        )}
        
        {this.showModal && (
          <pronto-modal
            overlay
            onModalClose={this.modalCloseHandler}
            class="ds-media__modal"
          >
            <ds-filemanager 
              type={this.type} 
              url={this.associatedRoute} 
              name={this.inputId}
              mediaIndex={this.currentImageIndex}
              media-index={this.currentImageIndex}
            />
          </pronto-modal>
        )}

        

      </Host>
    );
  }
}