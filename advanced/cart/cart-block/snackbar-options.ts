import { DS_getAppLocale } from "../../../../../utils";
import { translations } from "./translations";

const { [DS_getAppLocale()]: { ds_cartBlock: { snackBar: snackBarTranslations } } } = translations;

export const SNACKBAR_OPTIONS = {
  "quantity-decreased": {
    type: "with-warning",
    message: snackBarTranslations.itemRemoved,
    undoLabel: snackBarTranslations.undo,
    closingDelay: 2000,
  },
  "item-removed": {
    type: "with-warning",
    message: snackBarTranslations.itemRemoved,
    undoLabel: snackBarTranslations.undo,
    closingDelay: 2000,
  },
  "cart-removed":{
    type: "with-warning",
    message: snackBarTranslations.cartRemoved,
    undoLabel: snackBarTranslations.undo,
    closingDelay: 2000,
  },
  "item-added": {
    message: snackBarTranslations.itemAdded,
    closingDelay: 1000,
  },
  "note-added": {
    message: snackBarTranslations.noteToStoreSuccess,
    closingDelay: 1000,
  },
  "delivery-mode-updated": {
    message: snackBarTranslations.deliveryModeUpdated,
    closingDelay: 1000,
  },
  "note-error":{
    type: "with-warning",
    message: snackBarTranslations.noteToStoreError,
    closingDelay: 1000,
  },
  "delivery-mode-error":{
    type: "with-warning",
    message: snackBarTranslations.deliveryModeError,
    closingDelay: 1000,
  },
  "item-add-error":{
    type: "with-warning",
    message: snackBarTranslations.itemAddError,
    closingDelay: 1000,
  },
  "item-update-error":{
    type: "with-warning",
    message: snackBarTranslations.itemEditError,
    closingDelay: 1000,
  },
  "item-remove-error":{
    type: "with-warning",
    message: snackBarTranslations.itemRemoveError,
    closingDelay: 1000,
  },
  "default":{
    type: "with-warning",
    message: snackBarTranslations.defaultError,
    closingDelay: 1000,
  },
}
  

  
