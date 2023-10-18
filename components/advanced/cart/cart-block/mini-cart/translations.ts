/* code reviewer ignore */

export const translations = {
  fr: {
    gbx_miniCart: {
      title: {
        activeCart: "Votre panier actuel",
        inactiveCart: "Vos paniers sauvegardés"
      },
      checkout: "commande",
      text: {
        switchToClickNCollect: "Passer en click&Collect et récupérer {amount}",
        emptyCart: "Panier vide",
        smallFee: "Dépensez %smallfee% CHF et ne vous souciez pas de la commande minimale de %mintotalproducts% CHF.",
        smallFeeMessage: "Votre commande est inférieure au minimum de %mintotalproducts% CHF pour ce restaurant. Ajoutez plus d'articles ou payez ces frais.",
      },
      label: {
        allergies: "Allergies ou régime alimentaire spécifique ?",
      },
      placeholder: {
        allergies: "ex. Sans gluten, sans lactose, etc...",
      },
      button: {
        checkout: "Confirmer ma commande",
        remove: "Supprimer",
        addItems: "+ Ajouter des articles",
        showMore: "Afficher plus de produits",
        showLess: "Afficher moins de produits",
      },
      errors: {
        storeNotPublished: "Pour cause d'affluence, les commandes ne sont plus possible pour le moment. Veuillez réessayer dans quelques heures.",
        badAddress: "Nous avons besoin d'une adresse complète avec numéro de rue pour vous livrer.",
        cartAmountInsufficient: "Min. commande CHF %amount%",
        distanceNotFound: "Nous ne parvenons pas à calculer une distance entre le magasin et votre adresse.",
        distanceTooFar: "Votre adresse de livraison est trop éloignée du magasin.",
        missingDeliveryInformation: "Nous avons besoin de votre adresse ainsi que de l'heure de livraison.",
        productNotAvailable: "Vous avez le produit \"%name%\" qui est indisponible, vous devez le supprimer de votre panier.",
        productUnavailable: "Vous avez des produits indisponibles dans votre panier, vous devez les supprimer pour passer à l'étape suivante.",
        noPaymentMethod: "Veuillez sélectionner un moyen de paiement.",
        acceptCGU: "Merci d'accepter les conditions générales de vente et la politique de confidentialité.",
        default: "Une erreur est survenue. Veuillez ré-essayer."
      },
      modal: {
        text: {
          addMoreItems: "Commander d'autres articles",
          cancelOrder: "Garder la même commande",
          cartDeleteConfirm: "Etes-vous sûr(e) de vouloir supprimer ce panier ?",
          minOrderAmount: "Pour s'assurer que les restaurants et les chauffeurs sont payés équitablement, il y a un supplément de %smallFee% CHF pour les commandes inférieures à %minAmountToOrder% CHF.",
          orderError: "Erreur dans la validation de votre commande",
          orderErrorMessage: "Pour commander, vous devez avoir dans votre panier un montant minimum de %minTotalProducts% CHF, frais annexes exclus",
          productDeleteConfirm: "Etes-vous sûr(e) de vouloir supprimer ce produit ?"
        },
        button: {
          ok: "OK"
        }
      },
      tooltipSwitchAndCollect : "Choisissez l'option Click&Collect lors de votre commande, récupérez votre repas et faites-vous rembourser 20% du montant de votre commande sur votre porte-monnaie Smood.",
      snackBar: {
        orderRemoved: "Cette commande a été retirée de votre panier.",
        itemRemoved: "Un élément a été supprimé.",
        itemAdded: "Un article a été ajouté à votre panier.",
        undo: "Annuler",
      },
    },
  },
  en: {
    gbx_miniCart: {
      title: {
        activeCart: "Your current cart",
        inactiveCart: "Your saved carts"
      },
      checkout: "checkout",
      text: {
        switchToClickNCollect: "Switch now to Click&Collect and get {amount} back ",
        emptyCart: "Empty cart",
        smallFee: "Spend CHF %smallfee% and forget about the CHF %mintotalproducts% Minimum order.",
        smallFeeMessage: "Your order is below CHF %mintotalproducts% minimum for this restaurant. Add more items or pay this fee.",
      },
      label: {
        allergies: "Allergies or specific diet?",
      },
      placeholder: {
        allergies: "eg. Gluten free, lactose free, etc...",
      },
      button: {
        checkout: "Go to checkout",
        remove: "Remove",
        addItems: "+ Add items",
        showMore: "Show more products",
        showLess: "Show less products",
      },
      errors: {
        storeNotPublished: "Due to the large number of visitors, orders are no longer possible at the moment. Please try again in a few hours.",
        badAddress: "We need a complete address with street number to deliver you.",
        cartAmountInsufficient: "Min. order is CHF %amount%",
        distanceNotFound: "We can't calculate a distance between the store and your address.",
        distanceTooFar: "Your delivery address is too far from the store.",
        missingDeliveryInformation: "We need your delivery address and delivery hour.",
        productNotAvailable: "The product \"%name%\" is unavailable, you must remove it to proceed to the payment.",
        productUnavailable: "You have unavailable products in your cart, you must remove them to proceed to the next step.",
        noPaymentMethod: "Please select a payment method.",
        acceptCGU: "Please accept the terms and conditions and the privacy policy to continue.",
        default: "An error has occurred. Please try again.",
      },
      modal: {
        text: {
          addMoreItems: "Order more items",
          cancelOrder: "Keep the same order",
          cartDeleteConfirm: "Are you sure you want to delete this cart?",
          minOrderAmount: "To make sure restaurants and drivers are paid fairly, there is an extra fee of CHF %smallFee% for orders below CHF %minAmountToOrder%.",
          orderError: "Order validation error",
          orderErrorMessage: "To order, you need to have a minimum of %minTotalProducts% CHF in your cart, additional fees excluded",
          productDeleteConfirm: "Are you sure you want to delete this product?"
        },
        button: {
          ok: "OK"
        }
      },
      tooltipSwitchAndCollect : "Choose Click&Collect option while ordering, collect your meal and get refund 20% of the amount of your order on your Smood wallet.",
      snackBar: {
        orderRemoved: "This order has been removed from your basket.",
        itemRemoved: "An item has been removed.",
        itemAdded: "An item has been added to your basket.",
        undo: "Undo",
      },
    },
  },
  de: {
    gbx_miniCart: {
      title: {
        activeCart: "Ihr aktueller Warenkorb",
        inactiveCart: "Ihre gespeicherten Warenkörbe"
      },
      checkout: "bestellung",
      text: {
        switchToClickNCollect: "Wechseln Sie jetzt zu Click&Collect und erhalten Sie {amount} zurück",
        emptyCart: "Warenkorb leer",
        smallFee: "Geben Sie %smallfee% CHF aus und vergessen Sie den Mindestbestellwert von %mintotalproducts% CHF.",
        smallFeeMessage: "Ihre Bestellung liegt unter dem Mindestbestellwert von CHF %mintotalproducts% für dieses Restaurant. Fügen Sie weitere Artikel hinzu oder zahlen Sie diese Gebühr.",
      },
      label: {
        allergies: "Allergien oder spezielle Diät?",
      },
      placeholder: {
        allergies: "b.v.: glutenvrij, lactosevrij, enz.",
      },
      button: {
        checkout: "Meine Bestellung bestätigen",
        remove: "Entfernen",
        addItems: "+ Artikel hinzufügen",
        showMore: "Weitere Produkte anzeigen",
        showLess: "Weniger Produkte anzeigen",
      },
      errors: {
        storeNotPublished: "Wegen grossem Besucherandrang sind Bestellungen im Moment nicht mehr möglich. Bitte versuchen Sie es in ein paar Stunden erneut.",
        badAddress: "Wir benötigen eine vollständige Adresse mit Hausnummer, um Sie beliefern zu können.",
        cartAmountInsufficient: "Mindestbestellung ist CHF %amount%",
        distanceNotFound: "Wir können die Distanz zwischen dem Geschäft und Ihrer Adresse nicht berechnen.",
        distanceTooFar: "Ihre Lieferadresse ist zu weit vom Geschäft entfernt.",
        missingDeliveryInformation: "Wir benötigen Ihre Lieferadresse und Anlieferungszeit.",
        productNotAvailable: "Das Produkt \"%name%\" ist nicht verfügbar, Sie müssen es entfernen, um mit der Zahlung fortfahren zu können.",
        productUnavailable: "Sie haben nicht verfügbare Produkte in Ihrem Warenkorb, Sie müssen diese entfernen, um zum nächsten Schritt zu gelangen.",
        noPaymentMethod: "Bitte wählen Sie eine Zahlungsmethode.",
        acceptCGU: "Bitte akzeptieren Sie die Allgemeinen Geschäftsbedingungen und die Datenschutzrichtlinie, um fortzufahren.",
        default: "Es gab einen Fehler. Bitte versuche es später nochmal.",
      },
      modal: {
        text: {
          addMoreItems: "Weitere Artikel bestellen",
          cancelOrder: "Gleiche Reihenfolge beibehalten",
          cartDeleteConfirm: "Sind Sie sicher, dass Sie diesen Warenkorb löschen möchten?",
          minOrderAmount: "Um Sicherzustellen, dass Restaurants und Fahrer fair bezahlt werden, wird für Bestellungen %smallFee% CHF eine zusätzliche Gebühr von %minAmountToOrder% CHF.",
          orderError: "Mindestbestellwert nicht erreicht",
          orderErrorMessage: "Um zu bestellen, müssen Sie in ihrem Korb ein Mindestbetrag von %minTotalProducts% CHF haben, exklusive Nebenkosten",
          productDeleteConfirm: "Sind Sie sicher, dass Sie dieses Produkt löschen möchten?"
        },
        button: {
          ok: "OK"
        }
      },
      tooltipSwitchAndCollect : "Wählen Sie bei der Bestellung die Option Click&Collect, holen Sie Ihr Essen ab und erhalten Sie 20 % des Bestellwerts auf Ihre Smood-Geldbörse zurück.",
      snackBar: {
        orderRemoved: "Diese Bestellung wurde aus Ihrem Warenkorb entfernt.",
        itemRemoved: "Ein Artikel wurde entfernt.",
        itemAdded: "Ein Artikel wurde Ihrem Warenkorb hinzugefügt.",
        undo: "Rückgängig",
      },
    },
  },
  it: {
    gbx_miniCart: {
      title: {
        activeCart: "Il tuo carrello attuale",
        inactiveCart: "I tuoi carrelli salvati"
      },
      checkout: "ordinazione",
      text: {
        switchToClickNCollect: "Passa ora a Click&Collect e ottieni il {amount} di ritorno",
        emptyCart: "Carrello vuoto",
        smallFee: "Spendi %smallfee% CHF e dimentica l'ordine minimo di %mintotalproducts% CHF.",
        smallFeeMessage: "Il tuo ordine è inferiore a CHF %mintotalproducts% minimo per questo ristorante. Aggiungi più articoli o paga questa tassa.",
      },
      label: {
        allergies: "Allergie o dieta specifica?",
      },
      placeholder: {
        allergies: "Per esempio: senza glutine, senza lattosio, ecc.",
      },
      button: {
        checkout: "Confermare il mio ordine",
        remove: "Rimuovi",
        addItems: "+ Aggiungere articoli",
        showMore: "Mostrare più prodotti",
        showLess: "Mostra meno prodotti",
      },
      errors: {
        storeNotPublished: "A causa di un'elevata affluenza, gli ordini non sono più possibili in questo momento. Riprova tra qualche ora.",
        badAddress: "Abbiamo bisogno di un indirizzo completo con il numero civico per effettuare la consegna.",
        cartAmountInsufficient: "Ordine minimo %amount% CHF",
        distanceNotFound: "Non siamo in grado di calcolare la distanza tra il negozio e il tuo indirizzo.",
        distanceTooFar: "Il tuo indirizzo di consegna è troppo lontano dal negozio.",
        missingDeliveryInformation: "Abbiamo bisogno del tuo indirizzo e dell'ora di consegna.",
        productNotAvailable: "Il prodotto \"%name%\" non è disponibile, devi rimuoverlo dal carrello.",
        productUnavailable: "Hai dei prodotti non disponibili nel carrello, devi rimuoverli per procedere al passaggio successivo.",
        noPaymentMethod: "Seleziona un metodo di pagamento.",
        acceptCGU: "Si prega di accettare le condizioni generali di vendita e l'informativa sulla privacy.",
        default: "Si é verificato un errore. Si prega di riprovare più tardi."
      },
      modal: {
        text: {
          addMoreItems: "Ordina altri articoli",
          cancelOrder: "Mantenere lo stesso ordine",
          cartDeleteConfirm: "Sei sicuro di voler cancellare questo cestino?",
          minOrderAmount: "Per assicurarsi che i ristoranti e gli autisti siano pagati equamente, c'è una tassa extra di %smallFee% CHF per ordini inferiori a %minAmountToOrder% CHF.",
          orderError: "Errore nella convalida del tuo ordine",
          orderErrorMessage: "Per ordinare, è necessario avere nel carrello un importo minimo di %minTotalProducts% CHF, tasse aggiuntive escluse",
          productDeleteConfirm: "Sei sicuro di voler rimuovere questo prodotto?"
        },
        button: {
          ok: "OK"
        }
      },

      tooltipSwitchAndCollect : "Scegli l'opzione Click&Collect durante l'ordine, ritira il tuo pasto e fatti rimborsare il 20% dell'importo del tuo ordine sul tuo portafoglio Smood.",
      snackBar: {
        orderRemoved: "Questo ordine è stato rimosso dal tuo carrello.",
        itemRemoved: "Un elemento è stato rimosso.",
        itemAdded: "Un articolo è stato aggiunto al tuo carrello.",
        undo: "Annullare",
      },
    },
  },
};
