# Backlog

La liste de travail de dot-stash après la version 0.1.0 (10 novembre 2026) : tout ce qui reste à faire, découpé en tâches aussi petites que possible, chacune faisable seule, dans une session. Les tâches qui changent l'API ou le rendu ajoutent leur entrée au [CHANGELOG](../CHANGELOG.md), section [Unreleased]. Les tâches faites sont retirées des listes et notées à la fin, dans [Terminées](#terminées).

**Taille** : XS, une heure au plus ; S, une demi-journée au plus ; M, un à deux jours. **Décision** : « oui » quand la tâche attend un choix de votre part (ou une action de votre part, hors du dépôt) avant de commencer, ou en est un.

## Résumé

| Catégorie                                               | Tâches  | XS  | S   | M   | Avec décision |
| ------------------------------------------------------- | ------- | --- | --- | --- | ------------- |
| [Bugs](#bugs)                                           | 3       | 1   | 1   | 1   | 0             |
| [Accessibilité](#accessibilité)                         | 34      | 0   | 29  | 5   | 33            |
| [Compatibilité navigateurs](#compatibilité-navigateurs) | 18      | 3   | 15  | 0   | 3             |
| [Composants](#composants)                               | 18      | 11  | 6   | 1   | 7             |
| [Thème](#thème)                                         | 13      | 5   | 8   | 0   | 5             |
| [Outillage](#outillage)                                 | 17      | 7   | 10  | 0   | 1             |
| [Tests](#tests)                                         | 5       | 3   | 2   | 0   | 1             |
| [Documentation](#documentation)                         | 7       | 6   | 1   | 0   | 0             |
| [Release](#release)                                     | 6       | 1   | 5   | 0   | 5             |
| [Sécurité et hors dépôt](#sécurité-et-hors-dépôt)       | 2       | 1   | 1   | 0   | 2             |
| [Idées](#idées)                                         | 8       | 1   | 0   | 7   | 6             |
| **Total**                                               | **131** | 39  | 78  | 14  | 63            |

## Ordre suggéré

1. **Tag et secrets** : poser le tag `v0.1.0` (B-117), puis les dernières actions de sécurité, hors du dépôt (B-128, B-129).
2. **Petits correctifs sûrs** : B-053, B-001, B-002.
3. **Décisions groupées** (une séance avec vous) : tokens hérités (B-074), props sans effet (B-067), délai du toaster (B-066), page de développement (B-101), installation depuis git (B-119), et les autres tâches marquées « oui ».
4. **Compatibilité** : Firefox puis WebKit en CI (B-038, B-039), le tri par domaine, et la déclaration de support (B-052).
5. **Accessibilité manuelle** : la page de test (B-004), puis les passes au lecteur d'écran et les audits, groupe par groupe.
6. **Outillage** : export des tokens, contrastes, parité, générateurs ; puis les composants, le thème, les tests et la documentation au fil de l'eau ; les idées sur décision.

Les cinq premières tâches suggérées : B-117 (Poser le tag `v0.1.0` sur le commit de fusion de la 0.1.0), B-128 (Renommer le dossier d'administration exposé), B-053 (ds-select : garder l'état désactivé sans `:has()`), B-001 (ds-slider : les diapositives sont remplacées par des copies à chaque défilement), B-038 (Ajouter Firefox aux tests navigateur (local et CI)).

## Toutes les tâches

| ID              | Titre                                                                                                                    | Catégorie                 | Taille | Dépend de                  | Décision |
| --------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------- | ------ | -------------------------- | -------- |
| [B-001](#b-001) | ds-slider : les diapositives sont remplacées par des copies à chaque défilement                                          | bug                       | S      | —                          | non      |
| [B-002](#b-002) | ds-field : `form.submit()` ne masque pas de nouveau le mot de passe                                                      | bug                       | XS     | —                          | non      |
| [B-003](#b-003) | ds-select : état non restauré au retour dans l'historique                                                                | bug                       | M      | —                          | non      |
| [B-004](#b-004) | Page de test manuelle des composants, par groupe (jamais publiée)                                                        | accessibilité             | S      | B-101                      | non      |
| [B-005](#b-005) | Lecteur d'écran NVDA + Firefox : formulaires                                                                             | accessibilité             | S      | B-004                      | oui      |
| [B-006](#b-006) | Lecteur d'écran NVDA + Chrome : formulaires                                                                              | accessibilité             | S      | B-004                      | oui      |
| [B-007](#b-007) | Lecteur d'écran VoiceOver + Safari (macOS) : formulaires                                                                 | accessibilité             | S      | B-004                      | oui      |
| [B-008](#b-008) | Lecteur d'écran VoiceOver + Safari (iOS) : formulaires                                                                   | accessibilité             | S      | B-004                      | oui      |
| [B-009](#b-009) | Lecteur d'écran JAWS + Chrome (si disponible) : formulaires                                                              | accessibilité             | S      | B-004                      | oui      |
| [B-010](#b-010) | Lecteur d'écran NVDA + Firefox : navigation                                                                              | accessibilité             | S      | B-004                      | oui      |
| [B-011](#b-011) | Lecteur d'écran NVDA + Chrome : navigation                                                                               | accessibilité             | S      | B-004                      | oui      |
| [B-012](#b-012) | Lecteur d'écran VoiceOver + Safari (macOS) : navigation                                                                  | accessibilité             | S      | B-004                      | oui      |
| [B-013](#b-013) | Lecteur d'écran VoiceOver + Safari (iOS) : navigation                                                                    | accessibilité             | S      | B-004                      | oui      |
| [B-014](#b-014) | Lecteur d'écran JAWS + Chrome (si disponible) : navigation                                                               | accessibilité             | S      | B-004                      | oui      |
| [B-015](#b-015) | Lecteur d'écran NVDA + Firefox : divulgation                                                                             | accessibilité             | S      | B-004                      | oui      |
| [B-016](#b-016) | Lecteur d'écran NVDA + Chrome : divulgation                                                                              | accessibilité             | S      | B-004                      | oui      |
| [B-017](#b-017) | Lecteur d'écran VoiceOver + Safari (macOS) : divulgation                                                                 | accessibilité             | S      | B-004                      | oui      |
| [B-018](#b-018) | Lecteur d'écran VoiceOver + Safari (iOS) : divulgation                                                                   | accessibilité             | S      | B-004                      | oui      |
| [B-019](#b-019) | Lecteur d'écran JAWS + Chrome (si disponible) : divulgation                                                              | accessibilité             | S      | B-004                      | oui      |
| [B-020](#b-020) | Lecteur d'écran NVDA + Firefox : superpositions                                                                          | accessibilité             | S      | B-004                      | oui      |
| [B-021](#b-021) | Lecteur d'écran NVDA + Chrome : superpositions                                                                           | accessibilité             | S      | B-004                      | oui      |
| [B-022](#b-022) | Lecteur d'écran VoiceOver + Safari (macOS) : superpositions                                                              | accessibilité             | S      | B-004                      | oui      |
| [B-023](#b-023) | Lecteur d'écran VoiceOver + Safari (iOS) : superpositions                                                                | accessibilité             | S      | B-004                      | oui      |
| [B-024](#b-024) | Lecteur d'écran JAWS + Chrome (si disponible) : superpositions                                                           | accessibilité             | S      | B-004                      | oui      |
| [B-025](#b-025) | Lecteur d'écran NVDA + Firefox : retours                                                                                 | accessibilité             | S      | B-004                      | oui      |
| [B-026](#b-026) | Lecteur d'écran NVDA + Chrome : retours                                                                                  | accessibilité             | S      | B-004                      | oui      |
| [B-027](#b-027) | Lecteur d'écran VoiceOver + Safari (macOS) : retours                                                                     | accessibilité             | S      | B-004                      | oui      |
| [B-028](#b-028) | Lecteur d'écran VoiceOver + Safari (iOS) : retours                                                                       | accessibilité             | S      | B-004                      | oui      |
| [B-029](#b-029) | Lecteur d'écran JAWS + Chrome (si disponible) : retours                                                                  | accessibilité             | S      | B-004                      | oui      |
| [B-030](#b-030) | Vérifier le délai de 500 ms des régions live de ds-alert                                                                 | accessibilité             | S      | B-004                      | oui      |
| [B-031](#b-031) | Vérifier les onglets `aria-owns` de ds-panel-group avec VoiceOver                                                        | accessibilité             | S      | B-004                      | oui      |
| [B-032](#b-032) | Vérifier qu'un message de ds-toaster masqué avant d'être lu reste annoncé                                                | accessibilité             | S      | B-004                      | oui      |
| [B-033](#b-033) | Audit WCAG 2.2 AA / RGAA 4.1 : formulaires                                                                               | accessibilité             | M      | B-004                      | oui      |
| [B-034](#b-034) | Audit WCAG 2.2 AA / RGAA 4.1 : navigation                                                                                | accessibilité             | M      | B-004                      | oui      |
| [B-035](#b-035) | Audit WCAG 2.2 AA / RGAA 4.1 : divulgation                                                                               | accessibilité             | M      | B-004                      | oui      |
| [B-036](#b-036) | Audit WCAG 2.2 AA / RGAA 4.1 : superpositions                                                                            | accessibilité             | M      | B-004                      | oui      |
| [B-037](#b-037) | Audit WCAG 2.2 AA / RGAA 4.1 : retours                                                                                   | accessibilité             | M      | B-004                      | oui      |
| [B-038](#b-038) | Ajouter Firefox aux tests navigateur (local et CI)                                                                       | compatibilité navigateurs | S      | —                          | oui      |
| [B-039](#b-039) | Ajouter WebKit aux tests navigateur (local et CI)                                                                        | compatibilité navigateurs | S      | B-038                      | oui      |
| [B-040](#b-040) | Trier et corriger les échecs « formulaires et `ElementInternals` » dans Firefox                                          | compatibilité navigateurs | S      | B-038                      | non      |
| [B-041](#b-041) | Trier et corriger les échecs « styles fondés sur `:has()` » dans Firefox                                                 | compatibilité navigateurs | S      | B-038                      | non      |
| [B-042](#b-042) | Trier et corriger les échecs « focus et clavier » dans Firefox                                                           | compatibilité navigateurs | S      | B-038                      | non      |
| [B-043](#b-043) | Trier et corriger les échecs « media queries et points de rupture » dans Firefox                                         | compatibilité navigateurs | S      | B-038                      | non      |
| [B-044](#b-044) | Trier et corriger les échecs « icônes et masques » dans Firefox                                                          | compatibilité navigateurs | S      | B-038                      | non      |
| [B-045](#b-045) | Trier et corriger les échecs « couleurs forcées » dans Firefox                                                           | compatibilité navigateurs | S      | B-038                      | non      |
| [B-046](#b-046) | Trier et corriger les échecs « formulaires et `ElementInternals` » dans WebKit                                           | compatibilité navigateurs | S      | B-039                      | non      |
| [B-047](#b-047) | Trier et corriger les échecs « styles fondés sur `:has()` » dans WebKit                                                  | compatibilité navigateurs | S      | B-039                      | non      |
| [B-048](#b-048) | Trier et corriger les échecs « focus et clavier » dans WebKit                                                            | compatibilité navigateurs | S      | B-039                      | non      |
| [B-049](#b-049) | Trier et corriger les échecs « media queries et points de rupture » dans WebKit                                          | compatibilité navigateurs | S      | B-039                      | non      |
| [B-050](#b-050) | Trier et corriger les échecs « icônes et masques » dans WebKit                                                           | compatibilité navigateurs | S      | B-039                      | non      |
| [B-051](#b-051) | Trier et corriger les échecs « couleurs forcées » dans WebKit                                                            | compatibilité navigateurs | S      | B-039                      | non      |
| [B-052](#b-052) | Corriger la section Browser support du README une fois Firefox et WebKit testés                                          | compatibilité navigateurs | XS     | B-040, B-041 … (12 tâches) | non      |
| [B-053](#b-053) | ds-select : garder l'état désactivé sans `:has()`                                                                        | compatibilité navigateurs | XS     | —                          | non      |
| [B-054](#b-054) | Repli de `checkVisibility()` pour Safari 16.4 à 17.3                                                                     | compatibilité navigateurs | S      | —                          | non      |
| [B-055](#b-055) | Utiliser `:dir(rtl)` pour les flèches quand le plancher le permet                                                        | compatibilité navigateurs | XS     | —                          | oui      |
| [B-056](#b-056) | ds-field : suivre la valeur ou l'erreur posée par un script sans `refresh()`                                             | composant                 | S      | —                          | oui      |
| [B-057](#b-057) | ds-field : préfixe et suffixe autour d'un ds-select                                                                      | composant                 | S      | —                          | non      |
| [B-058](#b-058) | ds-toggle-group : clic sur le texte du groupe                                                                            | composant                 | XS     | —                          | oui      |
| [B-059](#b-059) | ds-combo : suivre ses libellés après le rendu                                                                            | composant                 | S      | —                          | non      |
| [B-060](#b-060) | ds-nav-item : relire `--ds-bp-md` après un `<style>` injecté                                                             | composant                 | S      | —                          | non      |
| [B-061](#b-061) | ds-grid : gouttière verticale d'une grille `fluid`                                                                       | composant                 | XS     | —                          | oui      |
| [B-062](#b-062) | ds-grid : `v-gap` en pourcentage                                                                                         | composant                 | S      | —                          | oui      |
| [B-063](#b-063) | ds-back-to-top : suivre un conteneur qui défile                                                                          | composant                 | S      | —                          | non      |
| [B-064](#b-064) | ds-pagination et ds-badge : séparateurs de milliers                                                                      | composant                 | XS     | —                          | non      |
| [B-065](#b-065) | ds-slider : appliquer `params.index` changé après le chargement                                                          | composant                 | XS     | —                          | non      |
| [B-066](#b-066) | ds-toaster : délai par défaut et pause au clavier                                                                        | composant                 | XS     | —                          | oui      |
| [B-067](#b-067) | Props sans effet : décider de les retirer ou de les implémenter                                                          | composant                 | XS     | —                          | oui      |
| [B-068](#b-068) | ds-text : retirer ou implémenter `type`, `inline`, `sup`, `sub`, `weight`                                                | composant                 | XS     | B-067                      | non      |
| [B-069](#b-069) | ds-heading : retirer ou implémenter `use-context`                                                                        | composant                 | XS     | B-067                      | non      |
| [B-070](#b-070) | ds-nav : retirer ou implémenter `current-active-item-id`                                                                 | composant                 | XS     | B-067                      | non      |
| [B-071](#b-071) | ds-slider : retirer ou implémenter `type`                                                                                | composant                 | XS     | B-067                      | non      |
| [B-072](#b-072) | ds-block, ds-sidebar et ds-title-bar : retirer ou implémenter `block` (`ds-block`), `ctx` (`ds-sidebar`, `ds-title-bar`) | composant                 | XS     | B-067                      | non      |
| [B-073](#b-073) | ds-panel-group : structure des onglets sans `aria-owns`                                                                  | composant                 | M      | B-031                      | oui      |
| [B-074](#b-074) | Neutraliser les 11 tokens hérités de l'ancien thème client : décider des valeurs                                         | thème                     | S      | —                          | oui      |
| [B-075](#b-075) | Appliquer les nouvelles couleurs des toggles (8 tokens `input`)                                                          | thème                     | XS     | B-074                      | non      |
| [B-076](#b-076) | Appliquer les nouvelles couleurs des points de ds-slider-menu (2 tokens `indicator`)                                     | thème                     | XS     | B-074                      | non      |
| [B-077](#b-077) | Appliquer la nouvelle ombre forte (`shadow.strong`)                                                                      | thème                     | XS     | B-074                      | non      |
| [B-078](#b-078) | Noms des statuts `discount` et `new`                                                                                     | thème                     | XS     | —                          | oui      |
| [B-079](#b-079) | Skin orphelin `.ds-toggler-item`                                                                                         | thème                     | XS     | —                          | oui      |
| [B-080](#b-080) | ds-ajax : remplacer son indicateur par ds-loader                                                                         | thème                     | S      | —                          | non      |
| [B-081](#b-081) | ds-ajax : afficher son erreur dans une ds-alert                                                                          | thème                     | S      | —                          | non      |
| [B-082](#b-082) | Aligner le skin `.ds-message` sur celui de ds-alert                                                                      | thème                     | S      | B-081                      | non      |
| [B-083](#b-083) | ds-toaster : région live rendue avant son contenu, comme ds-alert                                                        | thème                     | S      | —                          | non      |
| [B-084](#b-084) | Icônes : épaisseur du trait à 16 px                                                                                      | thème                     | S      | —                          | oui      |
| [B-085](#b-085) | Icônes pleines : détails intérieurs perdus                                                                               | thème                     | S      | —                          | non      |
| [B-086](#b-086) | Image d'une icône écrite deux fois (thème et feuille de page)                                                            | thème                     | S      | —                          | oui      |
| [B-087](#b-087) | Générateur de composant : script du squelette (`npm run new:component`)                                                  | outillage                 | S      | —                          | non      |
| [B-088](#b-088) | Générateur de composant : skin, `index.scss` et listes de `sass.spec.ts`                                                 | outillage                 | S      | B-087                      | non      |
| [B-089](#b-089) | Générateur de composant : test du générateur et documentation                                                            | outillage                 | XS     | B-088                      | non      |
| [B-090](#b-090) | Générateur de thème : script (`npm run new:theme`)                                                                       | outillage                 | S      | —                          | non      |
| [B-091](#b-091) | Générateur de thème : test et documentation                                                                              | outillage                 | XS     | B-090                      | non      |
| [B-092](#b-092) | Exporter les tokens en JSON (`dist/tokens/<thème>.json`)                                                                 | outillage                 | S      | —                          | non      |
| [B-093](#b-093) | Remplacer les tables de points de rupture en double par l'export JSON                                                    | outillage                 | S      | B-092                      | non      |
| [B-094](#b-094) | Documenter et exporter le JSON des tokens dans le paquet                                                                 | outillage                 | XS     | B-092                      | non      |
| [B-095](#b-095) | Vérificateur de contrastes : script                                                                                      | outillage                 | S      | B-092                      | non      |
| [B-096](#b-096) | Vérificateur de contrastes : dans `npm test` et la CI                                                                    | outillage                 | XS     | B-095                      | non      |
| [B-097](#b-097) | Corriger les paires de contraste en échec                                                                                | outillage                 | S      | B-096, B-074               | non      |
| [B-098](#b-098) | Page de parité générée depuis les exemples des readmes                                                                   | outillage                 | S      | —                          | non      |
| [B-099](#b-099) | Script de parité (`npm run parity -- <ref>`)                                                                             | outillage                 | S      | B-098                      | non      |
| [B-100](#b-100) | Script de parité : documentation et nettoyage                                                                            | outillage                 | XS     | B-099                      | non      |
| [B-101](#b-101) | Page de développement : décider de la réintroduire (pour le développement seulement)                                     | outillage                 | XS     | —                          | oui      |
| [B-102](#b-102) | Page de développement : génération depuis les exemples                                                                   | outillage                 | S      | B-101, B-098               | non      |
| [B-103](#b-103) | Page de développement : documentation                                                                                    | outillage                 | XS     | B-102                      | non      |
| [B-104](#b-104) | npm 10 ne peut pas ajouter de dépendance de test                                                                         | tests                     | XS     | —                          | oui      |
| [B-105](#b-105) | npm audit : 10 alertes modérées (minimatch d'ESLint)                                                                     | tests                     | XS     | —                          | non      |
| [B-106](#b-106) | Revérifier les contournements de `test/setup/` à chaque mise à jour                                                      | tests                     | XS     | —                          | non      |
| [B-107](#b-107) | Tests navigateur fondés sur des durées                                                                                   | tests                     | S      | —                          | non      |
| [B-108](#b-108) | Tester ds-slider vertical (`orientation: vtc`)                                                                           | tests                     | S      | —                          | non      |
| [B-109](#b-109) | Documenter les `url()` relatives dans une surcharge d'icône                                                              | documentation             | XS     | —                          | non      |
| [B-110](#b-110) | Readmes générés : colonne « attribut » des propriétés en lecture seule                                                   | documentation             | S      | —                          | non      |
| [B-111](#b-111) | Décrire les props sans description : mise en page et texte                                                               | documentation             | XS     | —                          | non      |
| [B-112](#b-112) | Décrire les props sans description : navigation et divulgation                                                           | documentation             | XS     | —                          | non      |
| [B-113](#b-113) | Décrire les props sans description : superpositions et formulaires                                                       | documentation             | XS     | —                          | non      |
| [B-114](#b-114) | Test : toute API publique a une description                                                                              | documentation             | XS     | B-111, B-112, B-113        | non      |
| [B-115](#b-115) | README : une section des limites connues                                                                                 | documentation             | XS     | —                          | non      |
| [B-117](#b-117) | Poser le tag `v0.1.0` sur le commit de fusion de la 0.1.0                                                                | release                   | XS     | —                          | oui      |
| [B-119](#b-119) | Installer depuis git : script `prepare` ou fichiers construits attachés à une release                                    | release                   | S      | —                          | oui      |
| [B-120](#b-120) | Workflow de release : tag → build → archive attachée à une release GitHub                                                | release                   | S      | B-119, B-117               | oui      |
| [B-121](#b-121) | Publier sur un registre npm (public ou privé)                                                                            | release                   | S      | B-120                      | oui      |
| [B-122](#b-122) | Ajouter la cible `dist-custom-elements` (imports par composant)                                                          | release                   | S      | —                          | oui      |
| [B-123](#b-123) | Tester les imports par composant dans un projet consommateur                                                             | release                   | S      | B-122                      | non      |
| [B-128](#b-128) | Renommer le dossier d'administration exposé                                                                              | sécurité/hors dépôt       | XS     | —                          | oui      |
| [B-129](#b-129) | Vérifier qu'aucun clone ni fork de l'ancien historique ne subsiste                                                       | sécurité/hors dépôt       | S      | —                          | oui      |
| [B-130](#b-130) | Reprendre `grade-star` (note de 0 à 5) avec `ds-rating-list`                                                             | idée                      | M      | —                          | oui      |
| [B-131](#b-131) | Reprendre `search-bar` et `search` en un composant de recherche générique                                                | idée                      | M      | —                          | oui      |
| [B-132](#b-132) | Reprendre `app-menu` (coquille de menu responsive)                                                                       | idée                      | M      | —                          | oui      |
| [B-133](#b-133) | Un conteneur « affiché après défilement » générique                                                                      | idée                      | M      | —                          | oui      |
| [B-134](#b-134) | Une coquille de page minimale (blocage du défilement, ancres)                                                            | idée                      | M      | —                          | oui      |
| [B-135](#b-135) | ds-field : plusieurs contrôles par champ                                                                                 | idée                      | M      | —                          | oui      |
| [B-136](#b-136) | Avertissement de Node à l'import ESM du loader                                                                           | idée                      | XS     | —                          | non      |
| [B-137](#b-137) | Préparer la migration vers Stencil 5                                                                                     | idée                      | M      | —                          | non      |

## Bugs

### B-001

**ds-slider : les diapositives sont remplacées par des copies à chaque défilement**

- **Catégorie** : bug · **Taille** : S · **Dépend de** : — · **Décision** : non
- **Contexte** : `next()` et `prev()` ajoutent des copies (`cloneNode`) des diapositives qui entrent, puis retirent les originales à la fin du défilement (`components/core/slider/slider.tsx`, `cloneSlide()`, `nextTransitionEndHandler()`). Après un défilement, les écouteurs que la page a posés sur le contenu d'une diapositive sont perdus, et les `id` sont en double pendant le défilement. `putSlideFirst()` (ajouté en 0.1.0 pour `params.index`) montre qu'on peut déplacer les nœuds au lieu de les copier.
- **Critères d'acceptation** :
  - Un écouteur posé par la page sur un lien d'une diapositive fonctionne encore après 5 défilements, avec et sans boucle (test navigateur).
  - Aucun `id` en double dans le document pendant un défilement (test unitaire).
  - Noms des diapositives (« 2 of 5 »), diapositives inertes, points du menu et événements `sliderEvent` inchangés (tests existants verts).

### B-002

**ds-field : `form.submit()` ne masque pas de nouveau le mot de passe**

- **Catégorie** : bug · **Taille** : XS · **Dépend de** : — · **Décision** : non
- **Contexte** : Le mot de passe affiché par le bouton de `ds-field` est masqué de nouveau à l'événement `submit` et au `reset`. `form.submit()` (un script) ne déclenche pas `submit` (limite documentée dans `components/core/field/readme.md`, section Limits). L'événement `formdata`, déclenché aussi par `form.submit()`, permettrait de couvrir ce cas (à vérifier dans Chromium, puis Firefox et WebKit).
- **Critères d'acceptation** :
  - Après `form.submit()` d'un formulaire dont le mot de passe est affiché, l'`input` est de nouveau `type="password"` avant l'envoi (test navigateur, le formulaire visant un `iframe`).
  - La limite est retirée du readme de `ds-field`.

### B-003

**ds-select : état non restauré au retour dans l'historique**

- **Catégorie** : bug · **Taille** : M · **Dépend de** : — · **Décision** : non
- **Contexte** : Sans le cache « back/forward », le navigateur restaure les contrôles d'un formulaire avant que `ds-select` ne rende son `select` natif : la sélection est perdue. Et Chromium reconnaît un formulaire à ses deux premiers contrôles nommés : quand le `select` de `ds-select` en fait partie, aucun contrôle du formulaire n'est restauré (contournement documenté dans le README, Forms > Restore). Fichier : `components/core/select/select.tsx`.
- **Critères d'acceptation** :
  - Une solution est choisie et justifiée (rendre le `select` natif plus tôt, ou mémoriser et restaurer la valeur), ou la limite est confirmée comme définitive.
  - Si corrigé : un test navigateur quitte la page, revient par l'historique sans bfcache, et retrouve la sélection de `ds-select` et des autres contrôles.
  - README (Forms > Restore) à jour.

## Accessibilité

### B-004

**Page de test manuelle des composants, par groupe (jamais publiée)**

- **Catégorie** : accessibilité · **Taille** : S · **Dépend de** : [B-101](#b-101) · **Décision** : non
- **Contexte** : Les passes au lecteur d'écran et l'audit ont besoin d'une page qui montre chaque composant dans ses états. La bibliothèque n'a plus de démo (supprimée à votre demande) : la page de `npm start` (`components/index.html`) est vide. Cette page peut être la page de développement générée depuis les exemples des readmes (voir l'outillage), si vous l'acceptez.
- **Critères d'acceptation** :
  - Une page par groupe (formulaires, navigation, divulgation, superpositions, retours), servie par `npm start`, absente de `dist/` et du paquet (`npm pack --dry-run`).
  - Chaque composant y figure dans ses états principaux (désactivé, invalide, ouvert, fermé…), avec des libellés en français et en anglais.

### Passes au lecteur d'écran

Une passe par groupe de composants et par couple lecteur d'écran et navigateur, sur la page de test (B-004). Contexte commun : les rôles, noms, états et touches sont vérifiés automatiquement dans l'arbre d'accessibilité de Chromium (tests navigateur), jamais avec un lecteur d'écran. Catégorie : accessibilité ; taille : S ; dépend de : [B-004](#b-004) ; décision : oui (passe manuelle, par vous ou un testeur).

Critères d'acceptation communs :

- chaque composant du groupe est parcouru au clavier et avec les commandes du lecteur (lecture continue, titres, points de repère, formulaires, rotor ou liste d'éléments) ;
- pour chacun, le rôle, le nom, l'état et les changements annoncés correspondent au tableau « Names, roles and keyboard » du README et à la section Accessibility de son readme ;
- les écarts sont notés (lecteur, navigateur, versions, pas à pas) et chacun devient une tâche de ce backlog ; un résumé daté est ajouté au readme du composant.

| ID                      | Groupe                                                                                          | Lecteur et navigateur         |
| ----------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------- |
| <a id="b-005"></a>B-005 | formulaires (`ds-field`, `ds-toggle`, `ds-toggle-group`, `ds-combo`, `ds-select`, `ds-trigger`) | NVDA + Firefox                |
| <a id="b-006"></a>B-006 | formulaires (`ds-field`, `ds-toggle`, `ds-toggle-group`, `ds-combo`, `ds-select`, `ds-trigger`) | NVDA + Chrome                 |
| <a id="b-007"></a>B-007 | formulaires (`ds-field`, `ds-toggle`, `ds-toggle-group`, `ds-combo`, `ds-select`, `ds-trigger`) | VoiceOver + Safari (macOS)    |
| <a id="b-008"></a>B-008 | formulaires (`ds-field`, `ds-toggle`, `ds-toggle-group`, `ds-combo`, `ds-select`, `ds-trigger`) | VoiceOver + Safari (iOS)      |
| <a id="b-009"></a>B-009 | formulaires (`ds-field`, `ds-toggle`, `ds-toggle-group`, `ds-combo`, `ds-select`, `ds-trigger`) | JAWS + Chrome (si disponible) |
| <a id="b-010"></a>B-010 | navigation (`ds-nav`, `ds-nav-item`, `ds-breadcrumb`, `ds-pagination`, `ds-back-to-top`)        | NVDA + Firefox                |
| <a id="b-011"></a>B-011 | navigation (`ds-nav`, `ds-nav-item`, `ds-breadcrumb`, `ds-pagination`, `ds-back-to-top`)        | NVDA + Chrome                 |
| <a id="b-012"></a>B-012 | navigation (`ds-nav`, `ds-nav-item`, `ds-breadcrumb`, `ds-pagination`, `ds-back-to-top`)        | VoiceOver + Safari (macOS)    |
| <a id="b-013"></a>B-013 | navigation (`ds-nav`, `ds-nav-item`, `ds-breadcrumb`, `ds-pagination`, `ds-back-to-top`)        | VoiceOver + Safari (iOS)      |
| <a id="b-014"></a>B-014 | navigation (`ds-nav`, `ds-nav-item`, `ds-breadcrumb`, `ds-pagination`, `ds-back-to-top`)        | JAWS + Chrome (si disponible) |
| <a id="b-015"></a>B-015 | divulgation (`ds-panel-group`, `ds-panel` en onglets et en accordéon, `ds-slider`)              | NVDA + Firefox                |
| <a id="b-016"></a>B-016 | divulgation (`ds-panel-group`, `ds-panel` en onglets et en accordéon, `ds-slider`)              | NVDA + Chrome                 |
| <a id="b-017"></a>B-017 | divulgation (`ds-panel-group`, `ds-panel` en onglets et en accordéon, `ds-slider`)              | VoiceOver + Safari (macOS)    |
| <a id="b-018"></a>B-018 | divulgation (`ds-panel-group`, `ds-panel` en onglets et en accordéon, `ds-slider`)              | VoiceOver + Safari (iOS)      |
| <a id="b-019"></a>B-019 | divulgation (`ds-panel-group`, `ds-panel` en onglets et en accordéon, `ds-slider`)              | JAWS + Chrome (si disponible) |
| <a id="b-020"></a>B-020 | superpositions (`ds-modal`, `ds-sidebar`, `ds-tooltip`)                                         | NVDA + Firefox                |
| <a id="b-021"></a>B-021 | superpositions (`ds-modal`, `ds-sidebar`, `ds-tooltip`)                                         | NVDA + Chrome                 |
| <a id="b-022"></a>B-022 | superpositions (`ds-modal`, `ds-sidebar`, `ds-tooltip`)                                         | VoiceOver + Safari (macOS)    |
| <a id="b-023"></a>B-023 | superpositions (`ds-modal`, `ds-sidebar`, `ds-tooltip`)                                         | VoiceOver + Safari (iOS)      |
| <a id="b-024"></a>B-024 | superpositions (`ds-modal`, `ds-sidebar`, `ds-tooltip`)                                         | JAWS + Chrome (si disponible) |
| <a id="b-025"></a>B-025 | retours (`ds-alert`, `ds-toaster`, `ds-badge`, `ds-loader`, `ds-ajax`)                          | NVDA + Firefox                |
| <a id="b-026"></a>B-026 | retours (`ds-alert`, `ds-toaster`, `ds-badge`, `ds-loader`, `ds-ajax`)                          | NVDA + Chrome                 |
| <a id="b-027"></a>B-027 | retours (`ds-alert`, `ds-toaster`, `ds-badge`, `ds-loader`, `ds-ajax`)                          | VoiceOver + Safari (macOS)    |
| <a id="b-028"></a>B-028 | retours (`ds-alert`, `ds-toaster`, `ds-badge`, `ds-loader`, `ds-ajax`)                          | VoiceOver + Safari (iOS)      |
| <a id="b-029"></a>B-029 | retours (`ds-alert`, `ds-toaster`, `ds-badge`, `ds-loader`, `ds-ajax`)                          | JAWS + Chrome (si disponible) |

### B-030

**Vérifier le délai de 500 ms des régions live de ds-alert**

- **Catégorie** : accessibilité · **Taille** : S · **Dépend de** : [B-004](#b-004) · **Décision** : oui (passe manuelle)
- **Contexte** : Une alerte `live` rend sa région, puis cache son contenu aux technologies d'assistance pendant `DS_ALERT_LIVE_DELAY` (500 ms) pour qu'il soit annoncé (`components/core/alert/alert.tsx`). Cette valeur est empirique (vérifiée dans l'arbre d'accessibilité de Chromium, pas avec un lecteur d'écran).
- **Critères d'acceptation** :
  - Une alerte insérée, montrée (`hidden` retiré) puis remplie par un script est annoncée une fois par NVDA (Firefox, Chrome), JAWS si disponible et VoiceOver (macOS, iOS).
  - Le délai est confirmé, ou ajusté (plus court ou plus long), avec les mesures notées dans le readme de `ds-alert`.

### B-031

**Vérifier les onglets `aria-owns` de ds-panel-group avec VoiceOver**

- **Catégorie** : accessibilité · **Taille** : S · **Dépend de** : [B-004](#b-004) · **Décision** : oui (passe manuelle)
- **Contexte** : Les onglets restent dans leurs panneaux ; `ds-panel-group` rend une `tablist` qui les possède par `aria-owns` (`components/core/panel-group/panel-group.tsx`). VoiceOver regroupe mal les éléments possédés par `aria-owns` : la liste d'onglets pourrait ne pas annoncer « onglet 1 sur 3 ».
- **Critères d'acceptation** :
  - VoiceOver (macOS et iOS) annonce le rôle, le nom, l'état sélectionné et la position de chaque onglet, et la navigation par le rotor les trouve.
  - Si ce n'est pas le cas : la tâche « structure des onglets de ds-panel-group » passe en priorité, avec le constat noté.

### B-032

**Vérifier qu'un message de ds-toaster masqué avant d'être lu reste annoncé**

- **Catégorie** : accessibilité · **Taille** : S · **Dépend de** : [B-004](#b-004) · **Décision** : oui (passe manuelle)
- **Contexte** : `hide()` vide la région live du toaster (`components/core/toaster/toaster.tsx`). Un message poli encore en attente de lecture peut être abandonné par certains lecteurs d'écran s'il disparaît avant son tour. Le readme de `ds-toaster` (Accessibility, Time to read) le signale sans l'avoir vérifié.
- **Critères d'acceptation** :
  - Avec NVDA, JAWS si disponible et VoiceOver : un toast de 3 s affiché pendant une autre annonce est lu ou non ; le résultat est noté dans le readme.
  - Si des lecteurs l'abandonnent : décider de garder le texte dans la région un temps après le masquage, ou de recommander un délai plus long.

### B-033

**Audit WCAG 2.2 AA / RGAA 4.1 : formulaires**

- **Catégorie** : accessibilité · **Taille** : M · **Dépend de** : [B-004](#b-004) · **Décision** : oui (audit manuel)
- **Contexte** : Les composants suivent les motifs WAI-ARIA et sont testés dans Chromium (arbre d'accessibilité, clavier), mais aucun audit complet n'a été fait. Groupe : formulaires (`ds-field`, `ds-toggle`, `ds-toggle-group`, `ds-combo`, `ds-select`, `ds-trigger`).
- **Critères d'acceptation** :
  - Chaque critère RGAA applicable est évalué (conforme, non conforme, non applicable) dans une grille jointe au readme des composants du groupe ou dans docs/.
  - Chaque non-conformité devient une tâche de ce backlog (catégorie bug ou accessibilité).

### B-034

**Audit WCAG 2.2 AA / RGAA 4.1 : navigation**

- **Catégorie** : accessibilité · **Taille** : M · **Dépend de** : [B-004](#b-004) · **Décision** : oui (audit manuel)
- **Contexte** : Les composants suivent les motifs WAI-ARIA et sont testés dans Chromium (arbre d'accessibilité, clavier), mais aucun audit complet n'a été fait. Groupe : navigation (`ds-nav`, `ds-nav-item`, `ds-breadcrumb`, `ds-pagination`, `ds-back-to-top`).
- **Critères d'acceptation** :
  - Chaque critère RGAA applicable est évalué (conforme, non conforme, non applicable) dans une grille jointe au readme des composants du groupe ou dans docs/.
  - Chaque non-conformité devient une tâche de ce backlog (catégorie bug ou accessibilité).

### B-035

**Audit WCAG 2.2 AA / RGAA 4.1 : divulgation**

- **Catégorie** : accessibilité · **Taille** : M · **Dépend de** : [B-004](#b-004) · **Décision** : oui (audit manuel)
- **Contexte** : Les composants suivent les motifs WAI-ARIA et sont testés dans Chromium (arbre d'accessibilité, clavier), mais aucun audit complet n'a été fait. Groupe : divulgation (`ds-panel-group`, `ds-panel` en onglets et en accordéon, `ds-slider`).
- **Critères d'acceptation** :
  - Chaque critère RGAA applicable est évalué (conforme, non conforme, non applicable) dans une grille jointe au readme des composants du groupe ou dans docs/.
  - Chaque non-conformité devient une tâche de ce backlog (catégorie bug ou accessibilité).

### B-036

**Audit WCAG 2.2 AA / RGAA 4.1 : superpositions**

- **Catégorie** : accessibilité · **Taille** : M · **Dépend de** : [B-004](#b-004) · **Décision** : oui (audit manuel)
- **Contexte** : Les composants suivent les motifs WAI-ARIA et sont testés dans Chromium (arbre d'accessibilité, clavier), mais aucun audit complet n'a été fait. Groupe : superpositions (`ds-modal`, `ds-sidebar`, `ds-tooltip`).
- **Critères d'acceptation** :
  - Chaque critère RGAA applicable est évalué (conforme, non conforme, non applicable) dans une grille jointe au readme des composants du groupe ou dans docs/.
  - Chaque non-conformité devient une tâche de ce backlog (catégorie bug ou accessibilité).

### B-037

**Audit WCAG 2.2 AA / RGAA 4.1 : retours**

- **Catégorie** : accessibilité · **Taille** : M · **Dépend de** : [B-004](#b-004) · **Décision** : oui (audit manuel)
- **Contexte** : Les composants suivent les motifs WAI-ARIA et sont testés dans Chromium (arbre d'accessibilité, clavier), mais aucun audit complet n'a été fait. Groupe : retours (`ds-alert`, `ds-toaster`, `ds-badge`, `ds-loader`, `ds-ajax`).
- **Critères d'acceptation** :
  - Chaque critère RGAA applicable est évalué (conforme, non conforme, non applicable) dans une grille jointe au readme des composants du groupe ou dans docs/.
  - Chaque non-conformité devient une tâche de ce backlog (catégorie bug ou accessibilité).

## Compatibilité navigateurs

### B-038

**Ajouter Firefox aux tests navigateur (local et CI)**

- **Catégorie** : compatibilité navigateurs · **Taille** : S · **Dépend de** : — · **Décision** : oui (CI bloquante ou non pendant le tri)
- **Contexte** : Seul Chromium est testé (`vitest.config.mts`, projet `browser`, `instances: [{ browser: 'chromium' }]` ; `.github/workflows/ci.yml`, job « Browser tests »). Le plancher du README (Firefox 121) vient des données de compatibilité, pas de tests. Certaines commandes de test sont propres à Chromium (`accessibleNode()` passe par le protocole DevTools) : à sauter ou adapter hors Chromium.
- **Critères d'acceptation** :
  - `npm run test:browser` lance aussi Firefox (instance `firefox` de Playwright), et le job de CI installe Firefox (`npx playwright install --with-deps firefox`).
  - Les tests propres à Chromium sont marqués et sautés ailleurs, avec la raison.
  - La liste des échecs est rangée dans les six tâches de tri Firefox ci-dessous ; selon votre décision, les échecs connus sont marqués `fails` jusqu'au tri, ou la CI Firefox n'est pas bloquante.

### B-039

**Ajouter WebKit aux tests navigateur (local et CI)**

- **Catégorie** : compatibilité navigateurs · **Taille** : S · **Dépend de** : [B-038](#b-038) · **Décision** : oui (CI bloquante ou non pendant le tri)
- **Contexte** : Même travail que pour Firefox, avec l'instance `webkit` de Playwright (le moteur de Safari). Le plancher du README (Safari 16.4, 17.4 sans dégradation) n'est pas testé.
- **Critères d'acceptation** :
  - `npm run test:browser` lance aussi WebKit, la CI l'installe (`--with-deps webkit`).
  - Les échecs sont rangés dans les six tâches de tri WebKit.

### B-040

**Trier et corriger les échecs « formulaires et `ElementInternals` » dans Firefox**

- **Catégorie** : compatibilité navigateurs · **Taille** : S · **Dépend de** : [B-038](#b-038) · **Décision** : non
- **Contexte** : Les tests navigateur de ce domaine, lancés dans Firefox : les composants associés aux formulaires (`ds-toggle`, `ds-toggle-group`, `ds-combo`), `ds-select`, `ds-field` : valeurs soumises, validation, `reset`, restauration, `fieldset` désactivé, libellés.
- **Critères d'acceptation** :
  - Chaque test de ce domaine passe dans Firefox, ou son échec est expliqué (limite du navigateur) et le test est adapté ou sauté avec la raison.
  - Les corrections ne changent rien dans Chromium (tests verts, parité vérifiée à 375, 800 et 1280 px).
  - Les écarts restants sont notés pour la déclaration de support.

### B-041

**Trier et corriger les échecs « styles fondés sur `:has()` » dans Firefox**

- **Catégorie** : compatibilité navigateurs · **Taille** : S · **Dépend de** : [B-038](#b-038) · **Décision** : non
- **Contexte** : Les tests navigateur de ce domaine, lancés dans Firefox : l'anneau de focus et l'état désactivé de `ds-select` (`scss/themes/default/components/_select.scss`), les parties vides de `ds-heading` et `ds-block`, le découpage des onglets de `ds-panel-group`.
- **Critères d'acceptation** :
  - Chaque test de ce domaine passe dans Firefox, ou son échec est expliqué (limite du navigateur) et le test est adapté ou sauté avec la raison.
  - Les corrections ne changent rien dans Chromium (tests verts, parité vérifiée à 375, 800 et 1280 px).
  - Les écarts restants sont notés pour la déclaration de support.

### B-042

**Trier et corriger les échecs « focus et clavier » dans Firefox**

- **Catégorie** : compatibilité navigateurs · **Taille** : S · **Dépend de** : [B-038](#b-038) · **Décision** : non
- **Contexte** : Les tests navigateur de ce domaine, lancés dans Firefox : Tab, Maj+Tab, Échap, flèches, `:focus-visible`, `inert`, les pièges à focus de `ds-modal`, `checkVisibility()` dans `components/utils/focus.ts`.
- **Critères d'acceptation** :
  - Chaque test de ce domaine passe dans Firefox, ou son échec est expliqué (limite du navigateur) et le test est adapté ou sauté avec la raison.
  - Les corrections ne changent rien dans Chromium (tests verts, parité vérifiée à 375, 800 et 1280 px).
  - Les écarts restants sont notés pour la déclaration de support.

### B-043

**Trier et corriger les échecs « media queries et points de rupture » dans Firefox**

- **Catégorie** : compatibilité navigateurs · **Taille** : S · **Dépend de** : [B-038](#b-038) · **Décision** : non
- **Contexte** : Les tests navigateur de ce domaine, lancés dans Firefox : la syntaxe d'intervalle (`width < 992px`), `matchMedia()`, `ds-rsp`, le mode de `ds-nav-item`, la pagination compacte, les largeurs fractionnaires (zoom).
- **Critères d'acceptation** :
  - Chaque test de ce domaine passe dans Firefox, ou son échec est expliqué (limite du navigateur) et le test est adapté ou sauté avec la raison.
  - Les corrections ne changent rien dans Chromium (tests verts, parité vérifiée à 375, 800 et 1280 px).
  - Les écarts restants sont notés pour la déclaration de support.

### B-044

**Trier et corriger les échecs « icônes et masques » dans Firefox**

- **Catégorie** : compatibilité navigateurs · **Taille** : S · **Dépend de** : [B-038](#b-038) · **Décision** : non
- **Contexte** : Les tests navigateur de ce domaine, lancés dans Firefox : `mask-image` et `-webkit-mask-image`, les URI de données SVG, la taille et la couleur des icônes, l'absence de requête de police ou d'image.
- **Critères d'acceptation** :
  - Chaque test de ce domaine passe dans Firefox, ou son échec est expliqué (limite du navigateur) et le test est adapté ou sauté avec la raison.
  - Les corrections ne changent rien dans Chromium (tests verts, parité vérifiée à 375, 800 et 1280 px).
  - Les écarts restants sont notés pour la déclaration de support.

### B-045

**Trier et corriger les échecs « couleurs forcées » dans Firefox**

- **Catégorie** : compatibilité navigateurs · **Taille** : S · **Dépend de** : [B-038](#b-038) · **Décision** : non
- **Contexte** : Les tests navigateur de ce domaine, lancés dans Firefox : `forced-colors: active`, `forced-color-adjust` (le repli `none` de `preserve-parent-color`), les icônes et les bordures des contrôles.
- **Critères d'acceptation** :
  - Chaque test de ce domaine passe dans Firefox, ou son échec est expliqué (limite du navigateur) et le test est adapté ou sauté avec la raison.
  - Les corrections ne changent rien dans Chromium (tests verts, parité vérifiée à 375, 800 et 1280 px).
  - Les écarts restants sont notés pour la déclaration de support.

### B-046

**Trier et corriger les échecs « formulaires et `ElementInternals` » dans WebKit**

- **Catégorie** : compatibilité navigateurs · **Taille** : S · **Dépend de** : [B-039](#b-039) · **Décision** : non
- **Contexte** : Les tests navigateur de ce domaine, lancés dans WebKit : les composants associés aux formulaires (`ds-toggle`, `ds-toggle-group`, `ds-combo`), `ds-select`, `ds-field` : valeurs soumises, validation, `reset`, restauration, `fieldset` désactivé, libellés.
- **Critères d'acceptation** :
  - Chaque test de ce domaine passe dans WebKit, ou son échec est expliqué (limite du navigateur) et le test est adapté ou sauté avec la raison.
  - Les corrections ne changent rien dans Chromium (tests verts, parité vérifiée à 375, 800 et 1280 px).
  - Les écarts restants sont notés pour la déclaration de support.

### B-047

**Trier et corriger les échecs « styles fondés sur `:has()` » dans WebKit**

- **Catégorie** : compatibilité navigateurs · **Taille** : S · **Dépend de** : [B-039](#b-039) · **Décision** : non
- **Contexte** : Les tests navigateur de ce domaine, lancés dans WebKit : l'anneau de focus et l'état désactivé de `ds-select` (`scss/themes/default/components/_select.scss`), les parties vides de `ds-heading` et `ds-block`, le découpage des onglets de `ds-panel-group`.
- **Critères d'acceptation** :
  - Chaque test de ce domaine passe dans WebKit, ou son échec est expliqué (limite du navigateur) et le test est adapté ou sauté avec la raison.
  - Les corrections ne changent rien dans Chromium (tests verts, parité vérifiée à 375, 800 et 1280 px).
  - Les écarts restants sont notés pour la déclaration de support.

### B-048

**Trier et corriger les échecs « focus et clavier » dans WebKit**

- **Catégorie** : compatibilité navigateurs · **Taille** : S · **Dépend de** : [B-039](#b-039) · **Décision** : non
- **Contexte** : Les tests navigateur de ce domaine, lancés dans WebKit : Tab, Maj+Tab, Échap, flèches, `:focus-visible`, `inert`, les pièges à focus de `ds-modal`, `checkVisibility()` dans `components/utils/focus.ts`.
- **Critères d'acceptation** :
  - Chaque test de ce domaine passe dans WebKit, ou son échec est expliqué (limite du navigateur) et le test est adapté ou sauté avec la raison.
  - Les corrections ne changent rien dans Chromium (tests verts, parité vérifiée à 375, 800 et 1280 px).
  - Les écarts restants sont notés pour la déclaration de support.

### B-049

**Trier et corriger les échecs « media queries et points de rupture » dans WebKit**

- **Catégorie** : compatibilité navigateurs · **Taille** : S · **Dépend de** : [B-039](#b-039) · **Décision** : non
- **Contexte** : Les tests navigateur de ce domaine, lancés dans WebKit : la syntaxe d'intervalle (`width < 992px`), `matchMedia()`, `ds-rsp`, le mode de `ds-nav-item`, la pagination compacte, les largeurs fractionnaires (zoom).
- **Critères d'acceptation** :
  - Chaque test de ce domaine passe dans WebKit, ou son échec est expliqué (limite du navigateur) et le test est adapté ou sauté avec la raison.
  - Les corrections ne changent rien dans Chromium (tests verts, parité vérifiée à 375, 800 et 1280 px).
  - Les écarts restants sont notés pour la déclaration de support.

### B-050

**Trier et corriger les échecs « icônes et masques » dans WebKit**

- **Catégorie** : compatibilité navigateurs · **Taille** : S · **Dépend de** : [B-039](#b-039) · **Décision** : non
- **Contexte** : Les tests navigateur de ce domaine, lancés dans WebKit : `mask-image` et `-webkit-mask-image`, les URI de données SVG, la taille et la couleur des icônes, l'absence de requête de police ou d'image.
- **Critères d'acceptation** :
  - Chaque test de ce domaine passe dans WebKit, ou son échec est expliqué (limite du navigateur) et le test est adapté ou sauté avec la raison.
  - Les corrections ne changent rien dans Chromium (tests verts, parité vérifiée à 375, 800 et 1280 px).
  - Les écarts restants sont notés pour la déclaration de support.

### B-051

**Trier et corriger les échecs « couleurs forcées » dans WebKit**

- **Catégorie** : compatibilité navigateurs · **Taille** : S · **Dépend de** : [B-039](#b-039) · **Décision** : non
- **Contexte** : Les tests navigateur de ce domaine, lancés dans WebKit : `forced-colors: active`, `forced-color-adjust` (le repli `none` de `preserve-parent-color`), les icônes et les bordures des contrôles.
- **Critères d'acceptation** :
  - Chaque test de ce domaine passe dans WebKit, ou son échec est expliqué (limite du navigateur) et le test est adapté ou sauté avec la raison.
  - Les corrections ne changent rien dans Chromium (tests verts, parité vérifiée à 375, 800 et 1280 px).
  - Les écarts restants sont notés pour la déclaration de support.

### B-052

**Corriger la section Browser support du README une fois Firefox et WebKit testés**

- **Catégorie** : compatibilité navigateurs · **Taille** : XS · **Dépend de** : [B-040](#b-040), [B-041](#b-041), [B-042](#b-042), [B-043](#b-043), [B-044](#b-044), [B-045](#b-045), [B-046](#b-046), [B-047](#b-047), [B-048](#b-048), [B-049](#b-049), [B-050](#b-050), [B-051](#b-051) · **Décision** : non
- **Contexte** : La section Browser support du README donne des planchers tirés des données de compatibilité de MDN, et dit que seuls les tests Chromium sont automatiques.
- **Critères d'acceptation** :
  - La section dit quels navigateurs sont testés en CI, avec quelles versions, et corrige les planchers ou les dégradations que les tests ont démentis.
  - Le CHANGELOG (section [Unreleased]) le mentionne.

### B-053

**ds-select : garder l'état désactivé sans `:has()`**

- **Catégorie** : compatibilité navigateurs · **Taille** : XS · **Dépend de** : — · **Décision** : non
- **Contexte** : Dans `scss/themes/default/components/_select.scss`, la règle `.ds-select.--disabled, .ds-select:has(> .ds-select__input:disabled)` est une liste de sélecteurs : sans `:has()` (Firefox avant 121), la règle entière est ignorée, et `--disabled` ne grise plus la boîte. `:is()` est tolérant (une liste qui contient `:has()` dans `:is()` garde ses autres sélecteurs).
- **Critères d'acceptation** :
  - La règle s'écrit de façon que `.ds-select.--disabled` s'applique sans `:has()` (deux règles, ou `:is()`).
  - Rendu identique dans Chromium (parité), test de feuille de style qui vérifie qu'aucune liste de sélecteurs ne mélange `:has()` à d'autres sélecteurs hors de `:is()`/`:where()`.

### B-054

**Repli de `checkVisibility()` pour Safari 16.4 à 17.3**

- **Catégorie** : compatibilité navigateurs · **Taille** : S · **Dépend de** : — · **Décision** : non
- **Contexte** : `components/utils/focus.ts` écarte les éléments masqués par CSS avec `checkVisibility()` (Safari 17.4). Sans elle, les éléments en `display: none` ou `visibility: hidden` comptent comme focalisables : focus déplacé dans `ds-modal` ou `ds-sidebar`, piège à Tab, élément décrit par `ds-tooltip`, focus après la fermeture d'une `ds-alert` (README, Browser support).
- **Critères d'acceptation** :
  - Sans `checkVisibility()`, un repli (`getClientRects().length`, `visibility` calculée) écarte les mêmes éléments.
  - Test unitaire du repli (fonction absente simulée) et test navigateur dans WebKit si disponible.
  - La dégradation est retirée du README.

### B-055

**Utiliser `:dir(rtl)` pour les flèches quand le plancher le permet**

- **Catégorie** : compatibilité navigateurs · **Taille** : XS · **Dépend de** : — · **Décision** : oui (plancher de navigateurs)
- **Contexte** : Les chevrons de `ds-breadcrumb` et les flèches de `ds-pagination` sont inversés de droite à gauche par `[dir='rtl'] …` (README, Icons) : un élément `dir="ltr"` dans une page de droite à gauche a aussi ses flèches inversées. `:dir()` corrige cela mais demande Chrome et Edge 120, au-dessus du plancher actuel (105).
- **Critères d'acceptation** :
  - Décision : relever le plancher Chrome et Edge à 120, ou garder `[dir='rtl']`.
  - Si relevé : les règles utilisent `:dir(rtl)`, un test navigateur couvre une partie `dir="ltr"` dans une page `dir="rtl"`, le README est à jour.

## Composants

### B-056

**ds-field : suivre la valeur ou l'erreur posée par un script sans `refresh()`**

- **Catégorie** : composant · **Taille** : S · **Dépend de** : — · **Décision** : oui (approche)
- **Contexte** : Après une valeur ou une erreur personnalisée (`setCustomValidity()`) posée par un script hors d'un événement du contrôle, il faut appeler `refresh()` sur le champ (README, checklist ; `components/core/field/field.tsx`) : aucun événement ne signale ces changements.
- **Critères d'acceptation** :
  - Décision : garder `refresh()` (documenté), ou intercepter le setter `value` et `setCustomValidity()` de l'instance du contrôle (au prix d'un patch du contrôle de la page).
  - Si interception : tests unitaires et navigateur du compteur et du message d'erreur après un `input.value = …` et un `setCustomValidity()` scriptés.

### B-057

**ds-field : préfixe et suffixe autour d'un ds-select**

- **Catégorie** : composant · **Taille** : S · **Dépend de** : — · **Décision** : non
- **Contexte** : Le préfixe, le suffixe et le bouton du mot de passe sont dans la boîte d'un `input` ; `ds-select` dessine sa propre boîte, sans préfixe ni suffixe (`components/core/field/readme.md`, Limits).
- **Critères d'acceptation** :
  - Un `slot="prefix"` ou `slot="suffix"` autour d'un `ds-select` s'affiche dans sa boîte, décrit par le `select` natif (`aria-describedby`).
  - Tests unitaires et navigateur (mise en page, de droite à gauche), readme à jour.

### B-058

**ds-toggle-group : clic sur le texte du groupe**

- **Catégorie** : composant · **Taille** : XS · **Dépend de** : — · **Décision** : oui
- **Contexte** : Un clic sur le groupe lui-même (son texte, pas un toggle) déplace le focus comme un clic sur son `<label>` (`hostClickHandler` dans `components/core/toggle-group/toggle-group.tsx`). Une `fieldset` native ne le fait pas : un clic sur le texte de la `legend` ne focalise rien.
- **Critères d'acceptation** :
  - Décision : garder (documenté dans le readme) ou limiter au clic sur un `<label for>` du groupe.
  - Si limité : test unitaire du clic sur un texte du groupe, readme à jour.

### B-059

**ds-combo : suivre ses libellés après le rendu**

- **Catégorie** : composant · **Taille** : S · **Dépend de** : — · **Décision** : non
- **Contexte** : `ds-combo` lit ses `<label>` au rendu et donne un `id` aux libellés qui n'en ont pas, pour les citer dans `aria-labelledby` (`components/core/combo/combo.tsx`, `components/utils/labels.ts`). Un libellé ajouté ou changé ensuite n'est pas suivi, et l'`id` ajouté modifie le balisage de la page.
- **Critères d'acceptation** :
  - Un `<label>` ajouté, retiré ou renommé après le chargement nomme la combobox (test navigateur avec l'arbre d'accessibilité).
  - Les `id` ajoutés aux libellés sont documentés, ou évités (par exemple `aria-label` calculé).

### B-060

**ds-nav-item : relire `--ds-bp-md` après un `<style>` injecté**

- **Catégorie** : composant · **Taille** : S · **Dépend de** : — · **Décision** : non
- **Contexte** : `ds-nav-item` relit le point de rupture `md` du thème au chargement d'une feuille `<link>` (`watchThemeBreakpoint()`, `components/utils/responsive.ts`), pas après un `<style>` injecté, une feuille construite ou une propriété changée en JavaScript, contrairement à `ds-rsp`, qui a `refresh()`.
- **Critères d'acceptation** :
  - `ds-nav-item` (ou `ds-nav`) expose une méthode `refresh()` qui relit le point de rupture, comme `ds-rsp`, ou observe ces changements.
  - Test navigateur : un thème injecté par `<style>` avec un autre `md` change le mode après `refresh()` ; README (Breakpoints shared with JavaScript) à jour.

### B-061

**ds-grid : gouttière verticale d'une grille `fluid`**

- **Catégorie** : composant · **Taille** : XS · **Dépend de** : — · **Décision** : oui
- **Contexte** : Une grille `fluid` n'a pas de gouttière verticale (`v-gap` n'est pas utilisé ; `components/core/grid/grid.scss`) : comportement gardé tel quel en 0.1.0 pour la parité avec le code d'origine.
- **Critères d'acceptation** :
  - Décision : garder (documenté) ou appliquer `v-gap` aux grilles `fluid` (changement visible, à noter comme rupture).
  - Si appliqué : test navigateur des boîtes, readme et CHANGELOG à jour.

### B-062

**ds-grid : `v-gap` en pourcentage**

- **Catégorie** : composant · **Taille** : S · **Dépend de** : — · **Décision** : oui
- **Contexte** : Depuis la mise en page CSS Grid, un `v-gap` en `%` est un pourcentage de la hauteur de la grille (comme tout `row-gap`), alors qu'il était un pourcentage de sa largeur : régression documentée dans le readme de `ds-grid` (« écrivez-le comme une longueur »).
- **Critères d'acceptation** :
  - Décision : rester documenté, ou émuler l'ancien comportement (convertir un pourcentage en `cqw` ou en longueur calculée).
  - Si émulé : test navigateur d'un `v-gap="5%"`, readme à jour.

### B-063

**ds-back-to-top : suivre un conteneur qui défile**

- **Catégorie** : composant · **Taille** : S · **Dépend de** : — · **Décision** : non
- **Contexte** : `ds-back-to-top` suit le défilement de la fenêtre (`window.scrollY`, `components/core/back-to-top/back-to-top.tsx`), pas celui d'un élément qui défile (une mise en page à panneau principal défilant).
- **Critères d'acceptation** :
  - Une prop (par exemple `container`, un sélecteur) fait suivre et remonter un élément qui défile ; la fenêtre reste le défaut.
  - Tests unitaires et navigateur (seuil, défilement, focus sur la cible), readme à jour.

### B-064

**ds-pagination et ds-badge : séparateurs de milliers**

- **Catégorie** : composant · **Taille** : XS · **Dépend de** : — · **Décision** : non
- **Contexte** : Les numéros de page de `ds-pagination` et le compte de `ds-badge` s'affichent sans séparateur (`12345`). `Intl.NumberFormat` avec la langue de la page (`lang` le plus proche) les formaterait (`12 345` en français). Fichiers : `components/core/pagination/pagination.tsx`, `components/core/badge/badge.tsx`.
- **Critères d'acceptation** :
  - Les nombres affichés et les noms (« Page 12 345 ») suivent la langue de la page ; les `aria-label` restent cohérents.
  - Tests unitaires en `en` et `fr`, readmes à jour.

### B-065

**ds-slider : appliquer `params.index` changé après le chargement**

- **Catégorie** : composant · **Taille** : XS · **Dépend de** : — · **Décision** : non
- **Contexte** : `params.index` est appliqué au chargement et par `refresh(true)` (correctif de la 0.1.0). Un `params` changé ensuite fusionne les options sans montrer la nouvelle diapositive (`paramsChangeHandler()` dans `components/core/slider/slider.tsx`).
- **Critères d'acceptation** :
  - Changer `params.index` après le chargement va à cette diapositive (comme un point du menu), sans défilement pendant un autre.
  - Test unitaire, readme (Accessibility, First slide) à jour.

### B-066

**ds-toaster : délai par défaut et pause au clavier**

- **Catégorie** : composant · **Taille** : XS · **Dépend de** : — · **Décision** : oui
- **Contexte** : Le délai par défaut de `displayToast()` est de 3000 ms (`components/core/toaster/toaster.tsx`), sous les 5000 ms que le readme recommande pour une phrase. Le compte à rebours s'arrête sous le pointeur ou le focus, mais un utilisateur du clavier seul ne peut pas l'arrêter : le toaster n'a pas d'élément focalisable, pour ne jamais prendre le focus (WCAG 2.2.1).
- **Critères d'acceptation** :
  - Décision : relever le défaut (5000 ms ou une durée calculée sur la longueur du texte), et offrir ou non une pause au clavier (un raccourci, un bouton de fermeture focalisable sans prise de focus).
  - Si changé : tests, readme et CHANGELOG (rupture : le défaut change).

### B-067

**Props sans effet : décider de les retirer ou de les implémenter**

- **Catégorie** : composant · **Taille** : XS · **Dépend de** : — · **Décision** : oui
- **Contexte** : Comme `mode` et `is-active` de `ds-tooltip` (retirées en 0.1.0), des props ne sont lues ni par le code ni par une feuille de style : `type`, `inline`, `sup`, `sub`, `weight` de `ds-text` ; `use-context` de `ds-heading` ; `current-active-item-id` de `ds-nav` ; `type` de `ds-slider` (reflété, `sld`) ; `block` de `ds-block` (reflété) ; `ctx` de `ds-sidebar` et de `ds-title-bar` (reflétés). Aucune n'a de description dans les readmes.
- **Critères d'acceptation** :
  - Pour chaque prop : retirer (rupture, version 0.x) ou implémenter, avec la raison ; les tâches de retrait ci-dessous suivent cette décision.

### B-068

**ds-text : retirer ou implémenter `type`, `inline`, `sup`, `sub`, `weight`**

- **Catégorie** : composant · **Taille** : XS · **Dépend de** : [B-067](#b-067) · **Décision** : non
- **Contexte** : Props sans effet (voir la tâche de décision). Fichier principal : `components/core/text/text.tsx`.
- **Critères d'acceptation** :
  - La décision est appliquée ; un test vérifie que l'élément n'a plus la prop (comme pour `ds-tooltip` en 0.1.0) ou qu'elle a son effet.
  - Readme régénéré, CHANGELOG (section [Unreleased], rupture si retrait).

### B-069

**ds-heading : retirer ou implémenter `use-context`**

- **Catégorie** : composant · **Taille** : XS · **Dépend de** : [B-067](#b-067) · **Décision** : non
- **Contexte** : Props sans effet (voir la tâche de décision). Fichier principal : `components/core/heading/heading.tsx`.
- **Critères d'acceptation** :
  - La décision est appliquée ; un test vérifie que l'élément n'a plus la prop (comme pour `ds-tooltip` en 0.1.0) ou qu'elle a son effet.
  - Readme régénéré, CHANGELOG (section [Unreleased], rupture si retrait).

### B-070

**ds-nav : retirer ou implémenter `current-active-item-id`**

- **Catégorie** : composant · **Taille** : XS · **Dépend de** : [B-067](#b-067) · **Décision** : non
- **Contexte** : Props sans effet (voir la tâche de décision). Fichier principal : `components/core/nav/nav.tsx`.
- **Critères d'acceptation** :
  - La décision est appliquée ; un test vérifie que l'élément n'a plus la prop (comme pour `ds-tooltip` en 0.1.0) ou qu'elle a son effet.
  - Readme régénéré, CHANGELOG (section [Unreleased], rupture si retrait).

### B-071

**ds-slider : retirer ou implémenter `type`**

- **Catégorie** : composant · **Taille** : XS · **Dépend de** : [B-067](#b-067) · **Décision** : non
- **Contexte** : Props sans effet (voir la tâche de décision). Fichier principal : `components/core/slider/slider.tsx`.
- **Critères d'acceptation** :
  - La décision est appliquée ; un test vérifie que l'élément n'a plus la prop (comme pour `ds-tooltip` en 0.1.0) ou qu'elle a son effet.
  - Readme régénéré, CHANGELOG (section [Unreleased], rupture si retrait).

### B-072

**ds-block, ds-sidebar et ds-title-bar : retirer ou implémenter `block` (`ds-block`), `ctx` (`ds-sidebar`, `ds-title-bar`)**

- **Catégorie** : composant · **Taille** : XS · **Dépend de** : [B-067](#b-067) · **Décision** : non
- **Contexte** : Props sans effet (voir la tâche de décision). Fichier principal : `components/core/block/block.tsx`.
- **Critères d'acceptation** :
  - La décision est appliquée ; un test vérifie que l'élément n'a plus la prop (comme pour `ds-tooltip` en 0.1.0) ou qu'elle a son effet.
  - Readme régénéré, CHANGELOG (section [Unreleased], rupture si retrait).

### B-073

**ds-panel-group : structure des onglets sans `aria-owns`**

- **Catégorie** : composant · **Taille** : M · **Dépend de** : [B-031](#b-031) · **Décision** : oui
- **Contexte** : Les onglets de `ds-panel-group` restent dans leurs `ds-panel` ; la `tablist` rendue les possède par `aria-owns` (README, tableau des rôles). Une structure où les onglets sont des enfants de la `tablist` est plus robuste pour les lecteurs d'écran, mais change le DOM rendu (styles de thème et de page).
- **Critères d'acceptation** :
  - Décision prise après la vérification VoiceOver.
  - Si changé : les onglets sont dans la `tablist` (rendue ou déplacée), tests unitaires et navigateur (clavier, arbre d'accessibilité), parité visuelle vérifiée, CHANGELOG (rupture du DOM).

## Thème

### B-074

**Neutraliser les 11 tokens hérités de l'ancien thème client : décider des valeurs**

- **Catégorie** : thème · **Taille** : S · **Dépend de** : — · **Décision** : oui (design)
- **Contexte** : Onze couleurs par défaut viennent encore de l'ancien thème client (`scss/engine/variables/_palette.scss`), alors que le thème `default` se veut neutre :

  | Token                  | Valeur actuelle    | Origine                                                         |
  | ---------------------- | ------------------ | --------------------------------------------------------------- |
  | `input.unchecked`      | `#000000`          | bordure et coche d'une case non cochée                          |
  | `input.checked`        | `#ff0000`          | case cochée (rouge pur : 4,0:1 sur blanc)                       |
  | `input.disabled`       | `#808080`          | case désactivée                                                 |
  | `input.track`          | `#dddddd`          | piste d'un interrupteur (1,36:1 sur blanc)                      |
  | `input.track-disabled` | `#eeeeee`          | piste désactivée                                                |
  | `input.knob`           | `#777777`          | bouton d'un interrupteur (3,3:1 sur la piste)                   |
  | `input.knob-checked`   | `#00cc00`          | bouton activé (1,6:1 sur la piste : sous le 3:1 de WCAG 1.4.11) |
  | `input.knob-disabled`  | `#dddddd`          | bouton désactivé                                                |
  | `indicator.base`       | `#283583`          | point de `ds-slider-menu` (bleu marine)                         |
  | `indicator.active`     | `#e1388c`          | point courant (rose : 2,67:1 contre le point normal)            |
  | `shadow.strong`        | `rgb(0 0 0 / 60%)` | ombre noire du toaster                                          |

- **Critères d'acceptation** :
  - Une valeur neutre est choisie pour chacun (par exemple tirée de `primary`, `secondary` et `gray`), avec des contrastes d'au moins 3:1 pour les composants d'interface (piste, bouton, point courant contre les autres).
  - Les trois tâches d'application ci-dessous suivent ce choix.

### B-075

**Appliquer les nouvelles couleurs des toggles (8 tokens `input`)**

- **Catégorie** : thème · **Taille** : XS · **Dépend de** : [B-074](#b-074) · **Décision** : non
- **Contexte** : Tokens `input.*` des toggles (`scss/engine/variables/_palette.scss`), lus par le skin `scss/themes/default/components/_toggle.scss`. Impact de parité : couleurs de `ds-toggle` (cases, boutons radio, interrupteurs) uniquement.
- **Critères d'acceptation** :
  - Les valeurs décidées sont en place ; `npm test` vérifie les propriétés personnalisées.
  - Contrôle de parité : seules les couleurs des toggles changent ; CHANGELOG ([Unreleased], Changed).

### B-076

**Appliquer les nouvelles couleurs des points de ds-slider-menu (2 tokens `indicator`)**

- **Catégorie** : thème · **Taille** : XS · **Dépend de** : [B-074](#b-074) · **Décision** : non
- **Contexte** : Tokens `indicator.base` et `indicator.active`, lus par le skin du slider. Impact de parité : les points du menu de `ds-slider`.
- **Critères d'acceptation** :
  - Valeurs en place, point courant distinct des autres par plus que la couleur ou avec 3:1 au moins.
  - Parité : seuls les points changent ; CHANGELOG.

### B-077

**Appliquer la nouvelle ombre forte (`shadow.strong`)**

- **Catégorie** : thème · **Taille** : XS · **Dépend de** : [B-074](#b-074) · **Décision** : non
- **Contexte** : `shadow.strong` (`rgb(0 0 0 / 60%)`) est l'ancienne ombre noire du toaster ; d'autres skins peuvent la lire (`ds-color(shadow, strong)`).
- **Critères d'acceptation** :
  - Valeur en place ; la liste des skins qui la lisent est vérifiée.
  - Parité : seules ces ombres changent ; CHANGELOG.

### B-078

**Noms des statuts `discount` et `new`**

- **Catégorie** : thème · **Taille** : XS · **Dépend de** : — · **Décision** : oui
- **Contexte** : La famille `status` a deux nuances au vocabulaire de boutique, `discount` et `new` (`scss/engine/variables/_palette.scss`), sans composant qui les lise dans la bibliothèque.
- **Critères d'acceptation** :
  - Décision : garder, renommer (rupture pour les thèmes qui les configurent) ou retirer.
  - Si changé : tests de tokens, README (Tokens) et CHANGELOG à jour.

### B-079

**Skin orphelin `.ds-toggler-item`**

- **Catégorie** : thème · **Taille** : XS · **Dépend de** : — · **Décision** : oui
- **Contexte** : `scss/themes/default/components/_toggler.scss` habille `.ds-toggler-item` (un titre avec plus et moins, et son contenu), qu'aucun composant ne rend : un reste de l'ancien thème, utile seulement à une page qui écrit ces classes ; `ds-panel` en accordéon couvre ce besoin.
- **Critères d'acceptation** :
  - Décision : retirer le skin (rupture pour une page qui l'utilise) ou le documenter comme classe de page.
  - Si retiré : CSS plus léger, test de feuille de style à jour, CHANGELOG.

### B-080

**ds-ajax : remplacer son indicateur par ds-loader**

- **Catégorie** : thème · **Taille** : S · **Dépend de** : — · **Décision** : non
- **Contexte** : `ds-ajax` dessine son propre indicateur (l'icône `arrows-cw` qui tourne dans son `::after`, `scss/themes/default/components/_ajax.scss`), pas un `ds-loader` (une `progressbar` nommée). Impact de parité : l'indicateur pendant un chargement (forme, taille, voile).
- **Critères d'acceptation** :
  - Pendant un chargement, `ds-ajax` montre un `ds-loader` (nommé, indéterminé) ; `aria-busy` est inchangé.
  - Tests unitaires et navigateur ; contrôle de parité limité à l'état de chargement ; CHANGELOG.

### B-081

**ds-ajax : afficher son erreur dans une ds-alert**

- **Catégorie** : thème · **Taille** : S · **Dépend de** : — · **Décision** : non
- **Contexte** : L'erreur de `ds-ajax` est un `p.ds-message.--error` avec `role="alert"` (`components/core/ajax/ajax.tsx`), pas une `ds-alert` (icône, préfixe, région live rendue avant son contenu). Impact de parité : le message d'erreur après un échec.
- **Critères d'acceptation** :
  - Un échec affiche une `ds-alert type="error"` annoncée une fois (région live avant le contenu).
  - Tests unitaires et navigateur ; contrôle de parité limité à l'erreur ; CHANGELOG (le balisage de l'erreur change).

### B-082

**Aligner le skin `.ds-message` sur celui de ds-alert**

- **Catégorie** : thème · **Taille** : S · **Dépend de** : [B-081](#b-081) · **Décision** : non
- **Contexte** : Le skin `.ds-message` (`scss/themes/default/components/_message.scss`) reste celui d'origine, avec une bordure physique ; `ds-alert` a sa bordure de début logique et ses propriétés personnalisées. Impact de parité : toute page qui écrit `.ds-message`.
- **Critères d'acceptation** :
  - `.ds-message` utilise les propriétés personnalisées et la bordure logique de `ds-alert` (ou est retiré si `ds-ajax` n'en a plus besoin, après décision).
  - Parité vérifiée de gauche à droite et de droite à gauche ; CHANGELOG.

### B-083

**ds-toaster : région live rendue avant son contenu, comme ds-alert**

- **Catégorie** : thème · **Taille** : S · **Dépend de** : — · **Décision** : non
- **Contexte** : `ds-alert` cache son contenu aux technologies d'assistance pendant `DS_ALERT_LIVE_DELAY` après le rendu de sa région ; `ds-toaster` écrit ses messages dans une région déjà là (`components/core/toaster/toaster.tsx`). Une logique commune « région avant contenu » éviterait deux variantes. Impact de parité : aucun visuel ; le moment de l'annonce peut changer.
- **Critères d'acceptation** :
  - Une fonction utilitaire commune sert aux deux composants, avec ses tests.
  - Les tests du toaster (région live, annonces) et de `ds-alert` restent verts.

### B-084

**Icônes : épaisseur du trait à 16 px**

- **Catégorie** : thème · **Taille** : S · **Dépend de** : — · **Décision** : oui
- **Contexte** : Les icônes Lucide sont des traits de 2 sur 24 : à 16 px, le trait fait 1,33 px, fin et flou sur un écran standard (`scss/engine/icons/README.md`). `scripts/build-icons.mjs` pourrait générer une variante plus épaisse.
- **Critères d'acceptation** :
  - Décision : garder, ou ajouter une option d'épaisseur (globale au build, ou par icône dans `scss/engine/icons/icons.json`).
  - Si ajoutée : `npm run build:icons -- --check` vert, tests des icônes (pixels) à jour, README (Icons).

### B-085

**Icônes pleines : détails intérieurs perdus**

- **Catégorie** : thème · **Taille** : S · **Dépend de** : — · **Décision** : non
- **Contexte** : Les variantes pleines (`heart`, `user`, `folder`, `chat`…) remplissent toute la forme : les détails intérieurs du dessin disparaissent (`scss/engine/icons/README.md`, colonne des icônes approchées).
- **Critères d'acceptation** :
  - Les détails intérieurs sont gardés en découpe (règle `evenodd` ou masque) pour les icônes pleines concernées, ou la liste des icônes concernées est documentée comme acceptée.
  - Captures des tests navigateur des icônes à jour.

### B-086

**Image d'une icône écrite deux fois (thème et feuille de page)**

- **Catégorie** : thème · **Taille** : S · **Dépend de** : — · **Décision** : oui
- **Contexte** : Une icône dessinée par le thème et par une feuille de page a son image écrite deux fois (`--ds-icons-<nom>` dans les deux feuilles, `ds-icon-tokens()`) : la feuille de page ne sait pas ce que le thème a écrit (`scss/engine/tools/_icons.scss`).
- **Critères d'acceptation** :
  - Décision : documenter (le coût est de quelques ko), ou permettre à une feuille de page d'exclure les icônes du thème (liste générée au build).
  - README (Icons, Page stylesheets) à jour.

## Outillage

### B-087

**Générateur de composant : script du squelette (`npm run new:component`)**

- **Catégorie** : outillage · **Taille** : S · **Dépend de** : — · **Décision** : non
- **Contexte** : Créer un composant demande les mêmes fichiers à chaque fois (README, sections Testing a new component et Styling a component) : `<nom>.tsx` (JSDoc, `@slot`), `<nom>.scss` (structure, annotations `@prop`), `<nom>.types.ts`, `<nom>.spec.tsx`, `<nom>.browser.ts`, `readme.md` avec ses sections Styling et Accessibility. `npm run generate` (Stencil) ne crée pas ce squelette.
- **Critères d'acceptation** :
  - `npm run new:component -- <nom>` crée le dossier `components/core/<nom>/` avec ces fichiers, et refuse un nom existant ou invalide.
  - Le composant généré compile (`npm run build`) et ses tests passent tels quels.

### B-088

**Générateur de composant : skin, `index.scss` et listes de `sass.spec.ts`**

- **Catégorie** : outillage · **Taille** : S · **Dépend de** : [B-087](#b-087) · **Décision** : non
- **Contexte** : Un composant a aussi son skin dans le thème (`scss/themes/default/components/_<nom>.scss`), chargé par `scss/themes/default/index.scss`, et ses propriétés personnalisées sont vérifiées par `components/sass.spec.ts`.
- **Critères d'acceptation** :
  - Le générateur ajoute le skin (propriétés personnalisées fixées depuis les tokens) et sa ligne `@use` dans `index.scss`.
  - `npm test` passe juste après la génération (contrat de style respecté).

### B-089

**Générateur de composant : test du générateur et documentation**

- **Catégorie** : outillage · **Taille** : XS · **Dépend de** : [B-088](#b-088) · **Décision** : non
- **Contexte** : Le générateur doit rester juste quand le contrat évolue.
- **Critères d'acceptation** :
  - Un test génère un composant dans un dossier temporaire et lance ses vérifications (ou la CI le fait).
  - README (npm scripts, Testing a new component) à jour.

### B-090

**Générateur de thème : script (`npm run new:theme`)**

- **Catégorie** : outillage · **Taille** : S · **Dépend de** : — · **Décision** : non
- **Contexte** : Créer un thème, c'est copier `scss/themes/default/` et l'ajouter à `themes` dans `dot-stash.config.mjs` (README, Creating a theme).
- **Critères d'acceptation** :
  - `npm run new:theme -- <nom>` copie le thème `default`, l'ajoute à la configuration, et `npm run build:css` produit `dist/css/<nom>.css`.
  - `npm test` passe avec le nouveau thème (tests de tokens génériques).

### B-091

**Générateur de thème : test et documentation**

- **Catégorie** : outillage · **Taille** : XS · **Dépend de** : [B-090](#b-090) · **Décision** : non
- **Contexte** : Suite du générateur de thème.
- **Critères d'acceptation** :
  - Un test du script (dossier temporaire).
  - README (Creating a theme, npm scripts) à jour.

### B-092

**Exporter les tokens en JSON (`dist/tokens/<thème>.json`)**

- **Catégorie** : outillage · **Taille** : S · **Dépend de** : — · **Décision** : non
- **Contexte** : Les tokens n'existent qu'en Sass et en propriétés personnalisées. Un export JSON par thème, écrit par `scripts/build-css.mjs`, servirait aux outils (contrastes) et au JavaScript.
- **Critères d'acceptation** :
  - `npm run build:css` écrit `dist/tokens/<thème>.json` (couleurs, tailles, points de rupture… références résolues).
  - Un test compare le JSON aux propriétés personnalisées du thème.

### B-093

**Remplacer les tables de points de rupture en double par l'export JSON**

- **Catégorie** : outillage · **Taille** : S · **Dépend de** : [B-092](#b-092) · **Décision** : non
- **Contexte** : Les valeurs de repli des points de rupture sont recopiées à la main : `DS_PAGINATION_BREAKPOINT_FALLBACKS` dans `components/core/pagination/pagination.constants.ts`, `DROP_DOWN_FALLBACK_WIDTH` (992) dans `components/core/nav/nav-item/nav-item.tsx`, 768 et 992 dans `components/utils/responsive.ts`.
- **Critères d'acceptation** :
  - Ces replis viennent d'un module généré depuis les tokens du thème `default` (une seule source).
  - Tests unitaires verts ; changer `$grid-md` change les replis au build suivant.

### B-094

**Documenter et exporter le JSON des tokens dans le paquet**

- **Catégorie** : outillage · **Taille** : XS · **Dépend de** : [B-092](#b-092) · **Décision** : non
- **Contexte** : Suite de l'export JSON.
- **Critères d'acceptation** :
  - `exports` donne accès au JSON (`dot-stash/dist/tokens/<thème>.json` est déjà couvert par `./dist/*` : à vérifier).
  - README (Build output, Theming) à jour.

### B-095

**Vérificateur de contrastes : script**

- **Catégorie** : outillage · **Taille** : S · **Dépend de** : [B-092](#b-092) · **Décision** : non
- **Contexte** : Aucun outil ne vérifie les contrastes du thème. Paires à couvrir : texte et fond (4,5:1), composants d'interface (3:1) ; page courante de `ds-pagination`, état désactivé (exempté par WCAG mais à rendre lisible), badges par type, anneau de focus contre le fond, pistes et boutons des toggles, points du slider.
- **Critères d'acceptation** :
  - Un script lit les couleurs (JSON des tokens ou thème compilé) et vérifie la liste de paires, en sortant le ratio de chacune.
  - La liste des paires est dans un fichier de configuration commenté.

### B-096

**Vérificateur de contrastes : dans `npm test` et la CI**

- **Catégorie** : outillage · **Taille** : XS · **Dépend de** : [B-095](#b-095) · **Décision** : non
- **Contexte** : Suite du vérificateur de contrastes.
- **Critères d'acceptation** :
  - Le script tourne dans `npm test` (ou une étape de CI) et échoue sous les seuils.
  - Les paires qui échouent aujourd'hui sont listées comme connues jusqu'à leur correction.

### B-097

**Corriger les paires de contraste en échec**

- **Catégorie** : outillage · **Taille** : S · **Dépend de** : [B-096](#b-096), [B-074](#b-074) · **Décision** : non
- **Contexte** : Les paires connues en échec (par exemple bouton activé contre la piste des interrupteurs, 1,6:1) dépendent des nouvelles valeurs des tokens.
- **Critères d'acceptation** :
  - Toutes les paires passent ; la liste des échecs connus est vide.
  - Parité limitée aux couleurs corrigées ; CHANGELOG.

### B-098

**Page de parité générée depuis les exemples des readmes**

- **Catégorie** : outillage · **Taille** : S · **Dépend de** : — · **Décision** : non
- **Contexte** : Pour la 0.1.0, la parité a été vérifiée avec une page écrite à la main (dans un dossier de travail supprimé ensuite). Les exemples HTML des readmes couvrent les composants et leurs états.
- **Critères d'acceptation** :
  - Un script extrait les blocs ```html des readmes (et du README) dans une page de parité.
  - La page charge le build et le thème sans erreur de console ni requête en échec.

### B-099

**Script de parité (`npm run parity -- <ref>`)**

- **Catégorie** : outillage · **Taille** : S · **Dépend de** : [B-098](#b-098) · **Décision** : non
- **Contexte** : Comparer le rendu d'un commit de référence et de l'arbre de travail : boîtes et styles calculés (éléments, `::before`, `::after`), animations et transitions figées, à 375, 800 et 1280 px.
- **Critères d'acceptation** :
  - `npm run parity -- <ref>` crée un worktree de `<ref>`, construit les deux, capture dans Chromium (Playwright, déjà en devDependency) et liste les différences par élément.
  - Aucune différence entre deux constructions du même commit (déterministe).

### B-100

**Script de parité : documentation et nettoyage**

- **Catégorie** : outillage · **Taille** : XS · **Dépend de** : [B-099](#b-099) · **Décision** : non
- **Contexte** : Suite du script de parité.
- **Critères d'acceptation** :
  - README (npm scripts, Tests) explique quand l'utiliser.
  - Le worktree et les fichiers temporaires sont supprimés à la fin, y compris en cas d'erreur.

### B-101

**Page de développement : décider de la réintroduire (pour le développement seulement)**

- **Catégorie** : outillage · **Taille** : XS · **Dépend de** : — · **Décision** : oui
- **Contexte** : Vous aviez demandé de retirer la démo (archivée sur `archive/propal`). Les passes manuelles d'accessibilité et le contrôle de parité ont pourtant besoin d'une page qui montre les composants. Proposition : une page générée depuis les exemples des readmes, servie par `npm start`, jamais publiée (ni dans `dist/` ni dans le paquet).
- **Critères d'acceptation** :
  - Décision prise : oui (page de développement générée) ou non (page de test écrite à la main hors dépôt).

### B-102

**Page de développement : génération depuis les exemples**

- **Catégorie** : outillage · **Taille** : S · **Dépend de** : [B-101](#b-101), [B-098](#b-098) · **Décision** : non
- **Contexte** : `components/index.html` (servie par `npm start`) est vide. La page de parité peut servir de base.
- **Critères d'acceptation** :
  - `npm start` sert une page par groupe de composants, générée depuis les exemples des readmes, régénérée quand un readme change.
  - `npm pack --dry-run` ne la contient pas.

### B-103

**Page de développement : documentation**

- **Catégorie** : outillage · **Taille** : XS · **Dépend de** : [B-102](#b-102) · **Décision** : non
- **Contexte** : Suite de la page de développement.
- **Critères d'acceptation** :
  - README (Tooling) décrit la page et comment ajouter un exemple.

## Tests

### B-104

**npm 10 ne peut pas ajouter de dépendance de test**

- **Catégorie** : tests · **Taille** : XS · **Dépend de** : — · **Décision** : oui
- **Contexte** : Le lockfile est fait avec npm 11 ; avec npm 10, ajouter une dépendance de test échoue sur les dépendances pairs optionnelles de Vitest (README, Requirements). `npm ci` fonctionne avec les deux.
- **Critères d'acceptation** :
  - Décision : exiger npm 11 (`engines.npm`, `packageManager`) ou documenter seulement (fait dans le README).
  - Si exigé : CI et `.nvmrc` cohérents.

### B-105

**npm audit : 10 alertes modérées (minimatch d'ESLint)**

- **Catégorie** : tests · **Taille** : XS · **Dépend de** : — · **Décision** : non
- **Contexte** : `npm audit` signale 10 vulnérabilités modérées, toutes dans `minimatch` tiré par ESLint et typescript-eslint (dépendances de développement seulement, rien dans le paquet). Le correctif proposé (`npm audit fix --force`) installerait des versions incompatibles.
- **Critères d'acceptation** :
  - Quand ESLint et typescript-eslint publient une version avec un `minimatch` corrigé : mise à jour, `npm audit` sans alerte, tous les contrôles verts.

### B-106

**Revérifier les contournements de `test/setup/` à chaque mise à jour**

- **Catégorie** : tests · **Taille** : XS · **Dépend de** : — · **Décision** : non
- **Contexte** : Le plugin de build de `@stencil/vitest` est expérimental, et quatre contournements d'environnement vivent dans `test/setup/` : les drapeaux de build du runtime, les propriétés `on…` et les méthodes d'écouteurs de la fenêtre simulée (`test/setup/unit.ts`), et le pointeur ramené dans un coin après chaque test navigateur (`test/setup/browser.ts`).
- **Critères d'acceptation** :
  - À chaque mise à jour de Stencil, `@stencil/vitest`, Vitest ou Playwright : retirer chaque contournement à tour de rôle, garder ceux dont les tests ont encore besoin, et noter le résultat dans le message de commit.

### B-107

**Tests navigateur fondés sur des durées**

- **Catégorie** : tests · **Taille** : S · **Dépend de** : — · **Décision** : non
- **Contexte** : Quelques tests attendent une durée fixe ou comparent des durées avec une marge : `components/core/toaster/toaster.browser.ts` (1200 et 300 ms), `components/core/tooltip/tooltip.browser.ts` (`TOOLTIP_HIDE_DELAY - 20`), `components/core/alert/alert.browser.ts` (`DS_ALERT_LIVE_DELAY + 100`), `components/core/field/field.browser.ts` (`DS_FIELD_COUNTER_DELAY`). Ils ont passé trois fois de suite en 0.1.0, mais restent sensibles à une machine lente.
- **Critères d'acceptation** :
  - Ces tests utilisent des horloges simulées (`vi.useFakeTimers()` côté page quand c'est possible) ou attendent des événements, sans durée fixe.
  - Trois passes de suite vertes en local et en CI.

### B-108

**Tester ds-slider vertical (`orientation: vtc`)**

- **Catégorie** : tests · **Taille** : S · **Dépend de** : — · **Décision** : non
- **Contexte** : Le mode vertical de `ds-slider` (`params.orientation: 'vtc'`) n'est couvert par aucun test navigateur (`components/core/slider/slider.tsx`).
- **Critères d'acceptation** :
  - Tests navigateur : défilement, diapositives inertes, `params.index`, boutons, avec et sans boucle, en vertical.
  - Les bugs trouvés deviennent des tâches.

## Documentation

### B-109

**Documenter les `url()` relatives dans une surcharge d'icône**

- **Catégorie** : documentation · **Taille** : XS · **Dépend de** : — · **Décision** : non
- **Contexte** : Une icône remplacée en CSS par `--ds-icons-<nom>: url("…")` avec une URL relative se résout mal : la propriété personnalisée est substituée dans la feuille du thème, pas dans celle qui la déclare (README, Icons, Replacing or adding an icon).
- **Critères d'acceptation** :
  - Le README dit d'utiliser une URI de données ou une URL absolue, avec un exemple.

### B-110

**Readmes générés : colonne « attribut » des propriétés en lecture seule**

- **Catégorie** : documentation · **Taille** : S · **Dépend de** : — · **Décision** : non
- **Contexte** : Les readmes générés listent un attribut pour les propriétés en lecture seule `validationMessage` et `willValidate` (par exemple `validation-message` dans `components/core/toggle/readme.md`), qui n'en ont pas.
- **Critères d'acceptation** :
  - Ces propriétés ne montrent plus d'attribut (déclaration Stencil adaptée, ou retouche du readme après le build vérifiée par un test).
  - Readmes régénérés.

### B-111

**Décrire les props sans description : mise en page et texte**

- **Catégorie** : documentation · **Taille** : XS · **Dépend de** : — · **Décision** : non
- **Contexte** : Une soixantaine de props, événements et méthodes publics n'ont pas de description dans les readmes générés. Ici : `ds-block`, `ds-title`, `ds-text`, `ds-heading`, `ds-title-bar`.
- **Critères d'acceptation** :
  - Chaque prop, événement et méthode publics de ces composants a une description JSDoc ; readmes régénérés.

### B-112

**Décrire les props sans description : navigation et divulgation**

- **Catégorie** : documentation · **Taille** : XS · **Dépend de** : — · **Décision** : non
- **Contexte** : Composants : `ds-slider`, `ds-slider-menu`, `ds-panel`, `ds-panel-group`, `ds-nav`, `ds-nav-item`, `ds-rsp`.
- **Critères d'acceptation** :
  - Chaque prop, événement et méthode publics de ces composants a une description JSDoc ; readmes régénérés.

### B-113

**Décrire les props sans description : superpositions et formulaires**

- **Catégorie** : documentation · **Taille** : XS · **Dépend de** : — · **Décision** : non
- **Contexte** : Composants : `ds-modal`, `ds-sidebar`, `ds-tooltip`, `ds-toaster` (événements, `show()`, `hide()`), `ds-toggle`, `ds-select`, `ds-combo`.
- **Critères d'acceptation** :
  - Chaque prop, événement et méthode publics de ces composants a une description JSDoc ; readmes régénérés.

### B-114

**Test : toute API publique a une description**

- **Catégorie** : documentation · **Taille** : XS · **Dépend de** : [B-111](#b-111), [B-112](#b-112), [B-113](#b-113) · **Décision** : non
- **Contexte** : Comme `components/core/slots.spec.ts` pour les slots, un test empêcherait une prop, un événement ou une méthode publics sans description.
- **Critères d'acceptation** :
  - Un test lit les readmes générés (ou `components/components.d.ts`) et échoue sur une description vide.

### B-115

**README : une section des limites connues**

- **Catégorie** : documentation · **Taille** : XS · **Dépend de** : — · **Décision** : non
- **Contexte** : Les limites sont dispersées (README Forms > Restore, readmes de `ds-field` (Limits), `ds-grid`, `ds-toaster`, Browser support).
- **Critères d'acceptation** :
  - Une section courte du README les liste, avec un lien vers chaque readme et vers ce backlog.

## Release

### B-117

**Poser le tag `v0.1.0` sur le commit de fusion de la 0.1.0**

- **Catégorie** : release · **Taille** : XS · **Dépend de** : — · **Décision** : oui (action de votre part)
- **Contexte** : La pull request de la 0.1.0 est fusionnée dans `main` (commit `3d9e2de`, « Release 0.1.0 (#1) »). Les liens de bas de page du CHANGELOG (`[0.1.0]`, `[Unreleased]`) visent le tag `v0.1.0`, qui n'existe pas encore : la session de travail ne peut pousser que sa branche, pas de tag. À faire de votre côté, depuis un clone à jour : `git tag -a v0.1.0 3d9e2de -m "dot-stash 0.1.0"` puis `git push origin v0.1.0` (ou une release GitHub créée sur ce commit avec ce tag).
- **Critères d'acceptation** :
  - Le tag `v0.1.0` existe sur `3d9e2de` ; les liens du CHANGELOG fonctionnent.

### B-119

**Installer depuis git : script `prepare` ou fichiers construits attachés à une release**

- **Catégorie** : release · **Taille** : S · **Dépend de** : — · **Décision** : oui
- **Contexte** : Une dépendance git (`npm install github:jezoock/dot-stash`) n'installe pas `dist/` ni `loader/`, construits et non versionnés (README, In another project). Deux options : un script `prepare` (npm construit le paquet à l'installation : Node 22 et toutes les devDependencies chez le projet consommateur, installation lente), ou une archive construite attachée à une release GitHub (voir le workflow de release).
- **Critères d'acceptation** :
  - Décision prise et notée dans le README ; si `prepare` : installation depuis git testée dans un projet vierge (import du loader, feuille du thème, types).

### B-120

**Workflow de release : tag → build → archive attachée à une release GitHub**

- **Catégorie** : release · **Taille** : S · **Dépend de** : [B-119](#b-119), [B-117](#b-117) · **Décision** : oui
- **Contexte** : Aujourd'hui, un projet prend la bibliothèque d'un clone construit. Un workflow sur les tags `v*` pourrait construire, tester et attacher l'archive de `npm pack` à une release GitHub, installable par URL.
- **Critères d'acceptation** :
  - Un tag `v*` crée une release avec l'archive `dot-stash-<version>.tgz` et l'extrait du CHANGELOG.
  - Installation testée depuis l'URL de l'archive dans un projet vierge.

### B-121

**Publier sur un registre npm (public ou privé)**

- **Catégorie** : release · **Taille** : S · **Dépend de** : [B-120](#b-120) · **Décision** : oui
- **Contexte** : Le paquet n'est publié nulle part. Le nom `dot-stash` doit être disponible (ou porté par une portée `@…/dot-stash`).
- **Critères d'acceptation** :
  - Décision (registre, portée, visibilité) ; publication par le workflow de release, avec provenance ; README (Install) à jour.

### B-122

**Ajouter la cible `dist-custom-elements` (imports par composant)**

- **Catégorie** : release · **Taille** : S · **Dépend de** : — · **Décision** : oui (format des imports)
- **Contexte** : Le paquet donne le loader paresseux (`dot-stash/loader`) et le build navigateur ; un bundler ne peut pas importer un seul composant pour éliminer les autres. La cible Stencil `dist-custom-elements` produit un module par composant.
- **Critères d'acceptation** :
  - `stencil.config.ts` a la cible ; `exports` donne `dot-stash/components/<tag>` (à décider) avec ses types.
  - Le build et les tests restent verts ; la taille du paquet est notée.

### B-123

**Tester les imports par composant dans un projet consommateur**

- **Catégorie** : release · **Taille** : S · **Dépend de** : [B-122](#b-122) · **Décision** : non
- **Contexte** : Suite de la cible `dist-custom-elements`.
- **Critères d'acceptation** :
  - Dans un projet vierge (chemin local), un import par composant enregistre ce composant seul ; vérifié dans Chromium et avec `tsc`.
  - README (From the package) à jour.

## Sécurité et hors dépôt

### B-128

**Renommer le dossier d'administration exposé**

- **Catégorie** : sécurité/hors dépôt · **Taille** : XS · **Dépend de** : — · **Décision** : oui (action de votre part)
- **Contexte** : Le nom du dossier d'administration de la boutique figurait dans la page de développement avant la purge de l'historique.
- **Critères d'acceptation** :
  - Le dossier est renommé sur le serveur, les accès et favoris mis à jour ; l'ancien chemin répond 404.

### B-129

**Vérifier qu'aucun clone ni fork de l'ancien historique ne subsiste**

- **Catégorie** : sécurité/hors dépôt · **Taille** : S · **Dépend de** : — · **Décision** : oui (action de votre part)
- **Contexte** : L'historique a été réécrit pour purger les secrets ; un fork GitHub, un clone local, un cache de CI ou une archive peuvent encore contenir l'ancien.
- **Critères d'acceptation** :
  - Les forks du dépôt sont listés (GitHub) et supprimés ou réécrits ; les clones connus (postes, serveurs) sont recréés ; les caches et artefacts de CI anciens sont supprimés.
  - Une recherche des anciennes valeurs dans ces copies ne trouve rien.

## Idées

### B-130

**Reprendre `grade-star` (note de 0 à 5) avec `ds-rating-list`**

- **Catégorie** : idée · **Taille** : M · **Dépend de** : — · **Décision** : oui
- **Contexte** : `grade-star` (Propal) n'a pas été repris, et `ds-rating-list` (archivé) l'habille (`docs/propal-archive.md`, Status).
- **Critères d'acceptation** :
  - Décision de le faire ou non ; si oui, un composant au contrat du README (structure, skin, propriétés personnalisées, accessibilité, tests unitaires et navigateur, readme).

### B-131

**Reprendre `search-bar` et `search` en un composant de recherche générique**

- **Catégorie** : idée · **Taille** : M · **Dépend de** : — · **Décision** : oui
- **Contexte** : Recommandation « Recover » de `docs/propal-archive.md`, sans les paramètres d'un contrôleur de recherche externe.
- **Critères d'acceptation** :
  - Décision de le faire ou non ; si oui, un composant au contrat du README (structure, skin, propriétés personnalisées, accessibilité, tests unitaires et navigateur, readme).

### B-132

**Reprendre `app-menu` (coquille de menu responsive)**

- **Catégorie** : idée · **Taille** : M · **Dépend de** : — · **Décision** : oui
- **Contexte** : `ds-nav`, `ds-nav-item` et `ds-sidebar` en couvrent une partie (`docs/propal-archive.md`).
- **Critères d'acceptation** :
  - Décision de le faire ou non ; si oui, un composant au contrat du README (structure, skin, propriétés personnalisées, accessibilité, tests unitaires et navigateur, readme).

### B-133

**Un conteneur « affiché après défilement » générique**

- **Catégorie** : idée · **Taille** : M · **Dépend de** : — · **Décision** : oui
- **Contexte** : Idée de `sticky-cart-button` (`docs/propal-archive.md`), même logique que `ds-back-to-top`.
- **Critères d'acceptation** :
  - Décision de le faire ou non ; si oui, un composant au contrat du README (structure, skin, propriétés personnalisées, accessibilité, tests unitaires et navigateur, readme).

### B-134

**Une coquille de page minimale (blocage du défilement, ancres)**

- **Catégorie** : idée · **Taille** : M · **Dépend de** : — · **Décision** : oui
- **Contexte** : Idée de `page` (`docs/propal-archive.md`), sans le panier ni les adaptations au site.
- **Critères d'acceptation** :
  - Décision de le faire ou non ; si oui, un composant au contrat du README (structure, skin, propriétés personnalisées, accessibilité, tests unitaires et navigateur, readme).

### B-135

**ds-field : plusieurs contrôles par champ**

- **Catégorie** : idée · **Taille** : M · **Dépend de** : — · **Décision** : oui
- **Contexte** : Un champ n'améliore qu'un contrôle (`components/core/field/readme.md`, Limits). Un groupe de contrôles (date en trois parties, adresse) demanderait un composant de type `fieldset`.
- **Critères d'acceptation** :
  - Décision ; si oui, conception d'un `ds-fieldset` (légende, aide, erreur commune) avant le code.

### B-136

**Avertissement de Node à l'import ESM du loader**

- **Catégorie** : idée · **Taille** : XS · **Dépend de** : — · **Décision** : non
- **Contexte** : `import('dot-stash/loader')` dans Node (rendu serveur, tests) affiche `MODULE_TYPELESS_PACKAGE_JSON` : `loader/index.js` est un module ES dans un paquet sans `"type": "module"`. Ajouter ce type casserait `loader/index.cjs.js` (CommonJS en `.js`). Sans effet dans les navigateurs et les bundlers.
- **Critères d'acceptation** :
  - Vérifier si un usage serveur est visé ; si oui, une solution (fichiers `.mjs` et `.cjs` générés par un script après le build) testée en ESM et en CommonJS.

### B-137

**Préparer la migration vers Stencil 5**

- **Catégorie** : idée · **Taille** : M · **Dépend de** : — · **Décision** : non
- **Contexte** : Stencil 5 retire son exécuteur de tests intégré (déjà remplacé par Vitest) et peut changer le runtime des composants en DOM léger (emplacements, `formAssociated`).
- **Critères d'acceptation** :
  - Liste des changements de Stencil 5 qui touchent la bibliothèque, essai sur une branche, tâches créées pour chaque écart.

## Terminées

### B-116

**Relire et fusionner la pull request de la 0.1.0 dans `main`** — terminée le 10 novembre 2026 : pull request #1 fusionnée (commit `3d9e2de`, « Release 0.1.0 (#1) »), CI verte.

### B-118

**Retirer du README la mention de la branche de la 0.1.0** — terminée le 10 novembre 2026 : la section Install du README ne renvoie plus à la branche de travail ; le code se prend sur `main`.

### B-124

**Révoquer et remplacer la clé Google Maps** — terminée : révoquée par le propriétaire.

### B-125

**Révoquer et remplacer la clé du webservice PrestaShop** — terminée : révoquée par le propriétaire.

### B-126

**Révoquer et remplacer la clé TinyMCE** — terminée : révoquée par le propriétaire.

### B-127

**Révoquer le jeton d'administration** — terminée : révoqué par le propriétaire.

### B-138

**ds-range : une jauge sur un `<input type="range">` natif** — terminée le 11 novembre 2026, sur la branche `mire/composants-generiques` (pull request à relire) : `components/core/range/`, le skin `scss/themes/default/components/_range.scss`. L'input natif garde son rôle, son nom, son clavier et son formulaire ; le composant dessine la piste remplie jusqu'à la valeur (`--ds-range-fill`, posée par le composant) et, en option, jusqu'à `buffer` (`--ds-range-buffer`) ; il suit les événements, les attributs, un `fieldset` désactivé et la réinitialisation du formulaire, et `refresh()` après une valeur posée par un script ; `aria-valuetext` par gabarit traduisible (`labels.valueText`) ou par fonction (`formatter`). Tests unitaires et navigateur, readme, entrée du CHANGELOG. Reste à vérifier à la main : la lecture de `aria-valuetext` aux lecteurs d'écran (le protocole de Chromium ne la donne pas), Firefox et Safari (pseudo-éléments du curseur).

### B-139

**ds-thumb : une vignette à proportions fixes, avec un carton de remplacement** — terminée le 11 novembre 2026, sur la branche `mire/composants-generiques` (pull request à relire) : `components/core/thumb/`, le skin `scss/themes/default/components/_thumb.scss`. Image recadrée aux proportions de `ratio`, chargée en différé (`loading="lazy"`, `decoding="async"`), classes d'état `--loading`, `--loaded`, `--error` ; sans source ou en échec, les initiales de `label` sur une teinte tirée du texte (`--ds-thumb-hue`), saturation et luminosité du thème (contraste de 4,5:1 au moins sur toutes les teintes) ; nom par `alt` (sinon `label`), ou `decorative`. Tests unitaires et navigateur, readme, entrée du CHANGELOG. Reste à vérifier à la main : lecteurs d'écran, Firefox et Safari (unités `cqmin`).

### B-140

**ds-scroller : une rangée défilante qui suit le focus, sans rendre inerte** — terminée le 11 novembre 2026, sur la branche `mire/composants-generiques` (pull request à relire) : `components/core/scroller/`, le skin `scss/themes/default/components/_scroller.scss`. Défilement natif, horizontal ou vertical ; l'élément focalisé est gardé visible, au plus près, à `--ds-scroller-focus-margin` des bords (le `scroll-padding` du viewport), à partir de la position d'avant le défilement de Chromium (qui centre l'élément avant `focusin`) ; `snap` en option ; aucun élément rendu inerte ni masqué ; boutons précédent et suivant facultatifs (`controls`, `labels`), d'une page, masqués aux extrémités ; classes `--overflowing`, `--at-start`, `--at-end` ; région nommée par `label`. Tests unitaires et navigateur, readme, entrée du CHANGELOG. Reste à vérifier à la main : la navigation à la manette dans Mire, lecteurs d'écran, Firefox et Safari (leur défilement d'un élément focalisé diffère de celui de Chromium).
