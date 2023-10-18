import { Component, h, State, Prop } from "@stencil/core";

import { Store, Action, Unsubscribe } from "@stencil/redux";
import { translations } from "./translations";
import { TransAddTranslations } from "../../../../_redux/actions/localization";
import { ListAccountHistoriesAction } from "../../../../_redux/actions/user";
import dayjs from "dayjs";
import { Greenbox_formatPrice } from "../../../../utils";

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
  tag: "gbx-wallet",
  styleUrl: "wallet.scss"
})
export class GreenboxWallet {

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
    if (this.translations?.gbx_accountWallet === undefined) {
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
      const walletChangedDescriptions = translations[this.settings.locale].gbx_accountWallet;
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
      <div class="gbx-wallet">

        <div class="gbx-wallet__amount-line">
          {Greenbox_formatPrice({ price: this.user && this.user.wallet ? this.user.wallet : 0, currency: false })}{" "}
          <span>CHF</span>
        </div>
        <div class="gbx-wallet__description">
          {this.translations.gbx_accountWallet.description}
        </div>

        <h2>{this.translations.gbx_accountWallet.history.title}</h2>
        <table cellpadding="0" cellspacing="0">
          <thead>
            <tr>
              <th>{this.translations.gbx_accountWallet.table.date}</th>
              <th>{this.translations.gbx_accountWallet.table.amount}</th>
              <th>
                {this.translations.gbx_accountWallet.table.orderNumber}
              </th>
              <th>
                {this.translations.gbx_accountWallet.table}
              </th>
            </tr>
          </thead>
          {this.user.accountHistories?.nbPages > 1 && (
            <tfoot>
              <tr>
                <td colSpan={8}>
                  <ul class="gbx-wallet-pages">
                    {[...Array(this.user.accountHistories.nbPages)].map(
                      (_x, i) => {
                        let currentPage = i + 1;
                        return (
                          <li
                            class={{
                              "gbx-wallet-page": true,
                              "--active": this.user.accountHistories.page === currentPage.toString()
                            }}>
                            <gbx-button
                              onClick={evt => {
                                evt.preventDefault();
                                this.loadPage(currentPage);
                              }}>
                              {currentPage}
                            </gbx-button>
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
                  <gbx-loader
                    message={
                      this.translations.page.common.loading
                    } />
                </td>
              </tr>
            )}
            {!this.isLoading &&
              this.user.accountHistories?.histories?.length === 0 && (
                <tr>
                  <td colSpan={8} class="gbx-wallet__empty">
                    {this.translations.gbx_accountWallet.noHistory}
                  </td>
                </tr>
              )}
            {!this.isLoading &&
              this.user.accountHistories?.histories?.map((accountHistory: AccountHistoryEntry) => {
                return (
                  <tr>
                    <td class="gbx-wallet__date">
                      {dayjs(accountHistory.createdAt).format(
                        "DD/MM/YYYY HH:mm"
                      )}
                    </td>
                    <td class="gbx-wallet__amount">
                      {Greenbox_formatPrice({ price: accountHistory.args.amount })}
                    </td>
                    <td class="gbx-wallet__order">
                      {accountHistory.args.orderNumber
                        ? accountHistory.args.orderNumber
                        : ""}
                    </td>
                    <td class="gbx-wallet__description">
                      {this.formatDescription(accountHistory,
                        this.translations.gbx_accountWallet
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
