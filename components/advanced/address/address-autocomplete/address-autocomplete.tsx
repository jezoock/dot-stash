import { Component, h, Prop, State, Event, EventEmitter, Watch } from "@stencil/core";
import { translations } from "./translations";
import { DS_uuid } from "../../../utils";

@Component({
  tag: "ds-address-autocomplete",
  styleUrl: "address-autocomplete.scss"
})
export class DSAddressAutocomplete {

  @Prop() peliasUri: string = "";
  @Prop({ mutable: true }) minChar: number = 4;
  @Prop({ mutable: true }) inputDelay: number = 500;
  @Prop({ mutable: true }) address: any = null;
  @Prop() locale: string = "en";
  @Prop() pageName: string = "Grocery";

  @State() items: any[] = [];
  @State() offset: number = -1;
  @State() valueBackup: string = "";

  @Event() notify_addressSet_event: EventEmitter;
  @Event() request_messageReset_event: EventEmitter;

  input!: HTMLInputElement;
  translations: any = translations[this.locale].gbx_autocomplete;
  fromGoogle: boolean = false;
  _sessionToken: string;
  _sessionTokenLastUsed: Date;
  _blurEventTimeout: any;
  _timeout: any;
  _blurHasOccurred: boolean;

  @Watch('address')
  addressWatchHandler() {
    if (this.address && this.address.formatted) {
      this.input.value = this.address.formatted;
    }
  }

  constructor() {
    this.setPlace = this.setPlace.bind(this);
    this.inputKeyDownhandler = this.inputKeyDownhandler.bind(this);
    this.inputChangeHandler = this.inputChangeHandler.bind(this);
    this.inputBlurHandler = this.inputBlurHandler.bind(this);
  }

  _getSessionToken() {
    if (
      !this._sessionToken ||
      (new Date() as any) - (this._sessionTokenLastUsed as any) > 30000
    ) {
      this._sessionToken = DS_uuid();
    }
    this._sessionTokenLastUsed = new Date();
    return this._sessionToken;
  }

  _resetSessionToken() {
    delete this._sessionToken;
  }

  _getDetails({ id, provider, sessionToken, lang }) {
    return new Promise((resolve, reject) => {
      let uri = `${this.peliasUri}/v1/place?id=${encodeURIComponent(id)}&provider=${encodeURIComponent(provider)}&sessionToken=${encodeURIComponent(sessionToken)}`;
      if (lang) {
        uri += `&lang=${encodeURIComponent(lang)}`;
      }
      fetch(uri, {
        method: "GET"
      })
        .then(response => {
          let json = response.json();
          if (!response.ok) {
            return json
              .then(data => {
                return {
                  response: response,
                  data: data
                };
              })
              .then(Promise.reject.bind(Promise));
          }
          return json;
        })
        .then(data => {
          if (data.code && data.code === 200 && data.result) {
            this._resetSessionToken();
            return resolve(data.result);
          }
          return reject("[Autocomplete][Place] An error happened");
        })
        .catch(err => {
          return reject(err);
        });
    });
  }

  _getPredictions({ input, sessionToken, lang }) {
    return new Promise((resolve, reject) => {
      let uri = `${this.peliasUri}/v1/predictions?search=${encodeURIComponent(input)}&sessionToken=${encodeURIComponent(sessionToken)}`;
      if (lang) {
        uri += `&lang=${encodeURIComponent(lang)}`;
      }
      fetch(uri, {
        method: "GET"
      })
        .then(response => {
          let json = response.json();
          if (!response.ok) {
            return json
              .then(data => {
                return {
                  response: response,
                  data: data
                };
              })
              .then(Promise.reject.bind(Promise));
          }
          return json;
        })
        .then(data => {
          if (data.code && data.code === 200 && data.result) {
            return resolve(data.result);
          }
          return reject("[Autocomplete][Prediction] An error happened");
        })
        .catch(err => {
          return reject(err);
        });
    });
  }

  componentDidLoad() {
    this.input.value = this.address?.formatted ? this.address.formatted : "";
    this.input.focus();
  }

  refresh(newAddress) {
    this.setDisplayedAddress(newAddress.formatted);

    this.items = [];
    this.input.blur();

    this.notify_addressSet_event.emit({
      address: newAddress
    });
  }

  setDisplayedAddress(address) {
    this.input.value = address;
  }

  setPlace(place) {
    clearTimeout(this._blurEventTimeout);
    let query: any = {
      id: place.id,
      provider: place.provider,
      sessionToken: this._getSessionToken()
    };
    if (this.locale) {
      query.lang = this.locale;
    }

    this._getDetails(query)
      .then((result: any) => {
        if (result) {
          this.refresh(result);
        } else {
          console.error(
            "[AutoComplete._setPlace getDetails()] Error getting details of place"
          );
        }
      })
      .catch(() => {
        console.error(
          "[AutoComplete._setPlace findPlaceFromQuery()] Error finding places from query"
        );
      });
  }

  inputChangeHandler(event) {
    const value = event.target.value;
    const _self = this;

    this.request_messageReset_event.emit();

    if (this._timeout) clearTimeout(this._timeout);
    this._blurHasOccurred = false;
    this._timeout = setTimeout(() => {
      if (this._blurHasOccurred) {
        return;
      }

      if (value && this.minChar <= value.trim().length) {
        const autocompletionRequest: any = {
          input: value,
          sessionToken: this._getSessionToken()
        };
        if (this.locale) {
          autocompletionRequest.lang = this.locale;
        }

        this._getPredictions(autocompletionRequest).then(
          (AutocompletePredictionArray: any[]) => {
            if (this._blurHasOccurred) {
              return;
            }

            _self.items = [];

            let fromGoogle = 0;
            AutocompletePredictionArray.forEach(AutocompletePrediction => {
              _self.items.push({
                id: AutocompletePrediction.id,
                formatted: AutocompletePrediction.formatted,
                provider: AutocompletePrediction.provider
              });
              fromGoogle |= AutocompletePrediction.fromGoogle;
              this.fromGoogle = !!fromGoogle;
            });
          }
        );
      }
    }, this.inputDelay);
  }

  inputKeyDownhandler(event) {
    if (this.items && this.items.length > 0) {
      const listLength = this.items.length;

      switch (event.keyCode) {
        case 38: // UP
          if (this.offset === -1) {
            this.valueBackup = this.input.value || "";
            this.offset = listLength - 1;
          } else this.offset--;
          break;
        case 40: // DOWN
          if (this.offset === -1) this.valueBackup = this.input.value || "";
          if (this.offset >= listLength - 1) this.offset = -1;
          else this.offset++;
          break;
        case 13:
          event.preventDefault();
          this.setPlace(this.items[this.offset !== -1 ? this.offset : 0]);
          this.offset = -1;
          return;
        default:
          this.offset = -1;
          return;
      }
    }

    if ([38, 40].indexOf(event.keyCode) != -1)
      this.setDisplayedAddress(
        this.offset === -1
          ? this.valueBackup
          : this.items[this.offset].formatted
      );
  }

  inputBlurHandler() {
    this._blurEventTimeout = window.setTimeout(() => {
      this._blurHasOccurred = true;
      if (this.offset !== -1) {
        this.setPlace(this.items[this.offset]);
      }
      this.offset = -1;
      this.items = [];
    }, 500);
  }

  render() {
    const { setPlace, offset } = this;

    return (
      <div class="ds-autocomplete">

        <label>{this.translations.addressInput}</label>

        <div class="ds-autocomplete__input-container">
          <input
            type="text"
            ref={el => (this.input = el as HTMLInputElement)}
            placeholder={this.translations.example}
            onFocus={this.inputChangeHandler}
            onInput={this.inputChangeHandler}
            onKeyDown={this.inputKeyDownhandler}
            onBlur={this.inputBlurHandler}
            value=""
            data-cy={this.pageName + '_Input_GbxAutocomplete'}
          />
        </div>

        {this.items && this.items.length > 0 && (
          <ul
            class={{
              "ds-autocomplete__results": true,
              "--from-google": this.fromGoogle
            }}>
            {this.items.map((item, index) => {
              return (
                <li
                  onClick={() => setPlace(item)}
                  class={{
                    "ds-autocomplete__result-item": true,
                    "--hover": index === offset
                  }}
                  data-cy={this.pageName + '_Button_GbxAutocompleteItem'}>
                  <span data-cy={this.pageName + '_Label_GbxAutocompleteItem'}>{item.formatted}</span>
                </li>
              );
            })}
          </ul>
        )}

      </div>
    );
  }
}
