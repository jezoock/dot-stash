/* eslint-disable react/jsx-filename-extension */
import { Component, h, State, Event, EventEmitter, Listen } from '@stencil/core';
import { translations } from './translations';
import { ErrorCodeList } from '../../../../../interfaces';
import { DS_setTranslations } from '../../../../../../utils';

@Component({
	tag: 'ds-password-change-block',
	styleUrl: 'password-change-block.scss'
})
export class DSPasswordChangeBlock {

	@State() hasError: boolean = false;
	@State() messages: any;
	
	@Event() notify_passwordChange_event: EventEmitter;

	@Listen('request_passwordDisplayMessage_event')
	request_passwordDisplayMessage_eventHandler({ detail: { success } }) {
		if (this.hasError !== !success) {
			this.hasError = !success;	
		}
		this.displayMessage(this.translations.message[ success ? 'success' : 'error' ]);
	}

	@Listen('notify_messageTimerEnd_event')
	notify_messageTimerEnd_eventHandler(event) {
		event.stopPropagation();
		event.preventDefault();
    this.displayMessage(null);
  }
	
	translations: any;
	passwordValue: string;
	passwordConfirmValue: string;

	constructor() {
    this.translations = DS_setTranslations(translations, ['gbx_passwordChangeBlock']);

		this.formSubmitHandler = this.formSubmitHandler.bind(this);
		this.passwordChangeHandler = this.passwordChangeHandler.bind(this);
		this.passwordConfirmChangeHandler = this.passwordConfirmChangeHandler.bind(this);
	}

	displayMessage( message: any ): void {
		this.messages = message;
	}

  formSubmitHandler(event: Event): void {
    event.preventDefault();

    this.hasError = this.formValidate();

    if (!this.hasError) {
      this.notify_passwordChange_event.emit({ password: this.passwordValue });
    }
  }

  formValidate(): boolean {
    let hasError: boolean = false;

    const {
      passwordValue: password = '',
      passwordConfirmValue: passwordConfirm = '',
    }: {
      passwordValue: string;
      passwordConfirmValue: string;
    } = this;

    const errorMessages: ErrorCodeList = {};

    if (password.length < 8) {
      hasError = true;
      errorMessages.password = [{ rule: 'lengthPassword' }];
    }

    if (password !== passwordConfirm) {
      hasError = true;
      errorMessages.confirmPassword = [{ rule: 'confirmPassword' }];
    }

    this.displayMessage( hasError ? errorMessages : null );

    return hasError;
  }

  passwordChangeHandler( event: Event): void {
    const { value } = event.target as HTMLInputElement;
    this.passwordValue = value;
  }

  passwordConfirmChangeHandler( event: Event): void {
    const { value } = event.target as HTMLInputElement;
    this.passwordConfirmValue = value;
  }

  render() {
    return (
      <ds-block
        blockTag="section"
        blockMods={['account', 'password-change']}
      >

				<ds-title
					slot="header"
					heading={3}
					mods={["block", "main"]}
				>
					{this.translations.title.passwordChange}
				</ds-title>

				<form
					class={{
						"ds-form": true,
						"--default": true
					}}
					id="resetPasswordForm"
					onSubmit={ this.formSubmitHandler }
				>

					{this.messages && (
						<ds-message
							messages={this.messages}
							messageMods={[this.hasError ? "error" : "valid", "form"]}
							messageTimer={3000}
						/>
					)}

					<fieldset class="ds-form__input">
						<label htmlFor="profileFormPassword">
							{this.translations.label.newPassword}
						</label>
						<input
							type="password"
							name="password"
							id="profileFormPassword"
							onChange={ this.passwordChangeHandler }
							autoComplete="password"
						/>
					</fieldset>

					<fieldset class="ds-form__input">
						<label htmlFor="profileFormConfirmPassword">
							{this.translations.label.confirmPassword}
						</label>
						<input
							type="password"
							name="confirmPassword"
							id="profileFormConfirmPassword"
							onChange={ this.passwordConfirmChangeHandler }
						/>
					</fieldset>

					<fieldset class="ds-form__input">
						<button
							type="submit"
							class={{
								"ds-button": true,
								"--profile": true,
								"--color-2": true
							}}>
							{this.translations.button.update}
						</button>

					</fieldset>
				
				</form>

			</ds-block>
		);
	}
	
}