import { Component, h, State, Prop } from "@stencil/core";

import { Store, Action, Unsubscribe } from "@stencil/redux";
import { translations } from "./translations";
import { TransAddTranslations } from "../../../../_redux/actions/localization";
import { ListAccountHistoriesAction } from "../../../../_redux/actions/user";
import dayjs from "dayjs";
import { DS_formatPrice } from "../../../../utils";

interface AccountHistoryEntry {
  action: string
  args: {
    action: string
    amount: number
    order: string
    orderNumber: string
    expiresAt?: string // date encoded into a string
    remainder: number
  }
  author: string
  createdAt: string // date encoded into a string
  updatedAt: string // same
  id: string
}

@Component({
  tag: "ds-wallet",
  styleUrl: "wallet.scss"
})
export class DSWallet {

  @Prop({ context: "store" }) store: Store;

  @State() user: any;
  @State() isLoading: boolean = false;
  @State() settings: any;
  @State() translations: any;
  @State() currentPage: number = 0;
  @State() page: number = 1;
  @State() limitPerPage: number = 10;
  @State() userToken: string;
  @State() accountHistories: string;
  @State() myPhones: any;

  TransAddTranslations: Action;
  ListAccountHistoriesAction: Action;
  unsubscribe!: Unsubscribe;

  constructor() { }

  componentWillLoad() {
    this.unsubscribe = this.store.mapStateToProps(this, state => {
      const {
        app: { settings },
        localization: translations,
        user: { loading, user }
      } = state;
      return {
        settings,
        translations,
        user,
        userToken: user.token,
        isLoading: loading,
        myPhones: user.phones
      };
    });

    this.store.mapDispatchToProps(this, {
      TransAddTranslations,
      ListAccountHistoriesAction
    });
    if (this.translations?.ds_accountWallet === undefined) {
      this.TransAddTranslations(translations[this.settings.locale]);
    }
  }

  componentDidLoad() {
    this.loadPage();
  };

  disconnectedCallback() {
    this.unsubscribe();
  }

  loadPage(pageNumber = 0) {
    this.ListAccountHistoriesAction({
      page: pageNumber,
      limit: this.limitPerPage,
      token: this.userToken
    });
  };

  formatDescription(walletEntry: AccountHistoryEntry, originalDescription: string) {
    if (walletEntry.action === "walletChanged" && walletEntry?.args?.expiresAt) {
      // we're either in "sponsored", "sponsorship" or "walletReward" cases.
      // for now we're not individually distinguishing between them.
      const expiryDate = dayjs(walletEntry.args.expiresAt);
      const walletChangedDescriptions = translations[this.settings.locale].ds_accountWallet;
      const now = dayjs();
      const difference = Math.ceil((expiryDate.unix() - now.unix()) / 86400);

      if (difference > 0) {
        const description: string = walletChangedDescriptions['receivedLimitedCashback'];
        return description.replace('%remainingDays%', difference.toString()).replace('%remainingAmount%', walletEntry?.args?.remainder.toString());
      } else {
        const expiredDescription: string = walletChangedDescriptions['expiredLimitedCashback'];
        return expiredDescription.replace('%remainingAmount', walletEntry?.args?.remainder.toString());
      }

    } else {
      return originalDescription;
    }
  };

  render() {
    return (
      <div class="ds-wallet">

        <div class="ds-wallet__amount-line">
          {DS_formatPrice({ price: this.user && this.user.wallet ? this.user.wallet : 0, currency: false })}{" "}
          <span>CHF</span>
        </div>
        <div class="ds-wallet__description">
          {this.translations.ds_accountWallet.description}
        </div>

        <h2>{this.translations.ds_accountWallet.history.title}</h2>
        <table cellpadding="0" cellspacing="0">
          <thead>
            <tr>
              <th>{this.translations.ds_accountWallet.table.date}</th>
              <th>{this.translations.ds_accountWallet.table.amount}</th>
              <th>
                {this.translations.ds_accountWallet.table.orderNumber}
              </th>
              <th>
                {this.translations.ds_accountWallet.table}
              </th>
            </tr>
          </thead>
          {this.user.accountHistories?.nbPages > 1 && (
            <tfoot>
              <tr>
                <td colSpan={8}>
                  <ul class="ds-wallet-pages">
                    {[...Array(this.user.accountHistories.nbPages)].map(
                      (_x, i) => {
                        let currentPage = i + 1;
                        return (
                          <li
                            class={{
                              "ds-wallet-page": true,
                              "--active": this.user.accountHistories.page === currentPage.toString()
                            }}>
                            <ds-button
                              onClick={evt => {
                                evt.preventDefault();
                                this.loadPage(currentPage);
                              }}>
                              {currentPage}
                            </ds-button>
                          </li>
                        );
                      }
                    )}
                  </ul>
                </td>
              </tr>
            </tfoot>
          )}
          <tbody>
            {this.isLoading && (
              <tr>
                <td colSpan={8}>
                  <ds-loader
                    message={
                      this.translations.page.common.loading
                    } />
                </td>
              </tr>
            )}
            {!this.isLoading &&
              this.user.accountHistories?.histories?.length === 0 && (
                <tr>
                  <td colSpan={8} class="ds-wallet__empty">
                    {this.translations.ds_accountWallet.noHistory}
                  </td>
                </tr>
              )}
            {!this.isLoading &&
              this.user.accountHistories?.histories?.map((accountHistory: AccountHistoryEntry) => {
                return (
                  <tr>
                    <td class="ds-wallet__date">
                      {dayjs(accountHistory.createdAt).format(
                        "DD/MM/YYYY HH:mm"
                      )}
                    </td>
                    <td class="ds-wallet__amount">
                      {DS_formatPrice({ price: accountHistory.args.amount })}
                    </td>
                    <td class="ds-wallet__order">
                      {accountHistory.args.orderNumber
                        ? accountHistory.args.orderNumber
                        : ""}
                    </td>
                    <td class="ds-wallet__description">
                      {this.formatDescription(accountHistory,
                        this.translations.ds_accountWallet
                          .commonHistoryDescription[
                        accountHistory.args.action
                        ])
                      }
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    );
  }
}
