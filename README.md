# sentient-dashboard

Ce projet est l'interface 'manager' d'un ERP


## Conventions

### Upload de fichier

Le label des fichiers uploader **`<module>:<section>[.<type>]`**, tout en **minuscules** :

- **`<module>`** : module pour lequel l'upload est effectué (ex. `blogging`, `identity`, `restaurant`, `crm`…).
- **`<section>`** : catégorisation du fichier parmi `document`, `image`, `video`, `audio` et `autre`. La section est **déduite automatiquement** du type MIME et de l'extension par `MediaLabelService.sectionFor()`.
- **`<type>`** : sous-catégorie optionnelle ajoutée par le développeur (ex. `cover`, `avatar`, `user`).

#### Interface : 
```typescript
export interface MediaUploadOptions {
    section?: string;
    module?: string;
    type?: string;
    isDocument?: boolean; // Si le fichier est un document, sinon laissez vide pour une detection automatique
}
```


Exemples :

| Appel | Libellé généré           |
|-------|--------------------------|
| `resolve('blogging', {type: 'image/png'})` | `blogging:image`         |
| `resolve('blogging', {type: 'image/png'}, 'cover')` | `blogging:image.cover`   |
| `resolve('identity', {type: 'application/pdf'}, 'user')` | `identity:document.user` |
| `resolve('restaurant', {type: 'video/mp4'})` | `restaurant:video`       |
| `build('crm', 'document')` | `crm:document`           |

Les flux `POST /storages/upload` et `PUT /storages/:id` exposent les paramètres `module` (obligatoire pour la génération automatique) et `type` (optionnel). Un `label` explicite transmis par le client reste prioritaire.


### Commits

Les commits doivent être des commits logiques séparés par domaine, par fonctionnalité ou par objectif dans l'ordre de modifications des fichiers. 
Utiliser les préfixes suivants :

| Préfixe          | Usage |
|------------------|-------|
| `feat`           | Nouvelle fonctionnalité |
| `fix`            | Correction de bug |
| `breaking change`| Changement cassant (rétro-incompatible) |
| `release`        | Préparation de release |
| `upgrade`        | Mise à jour de dépendances |
| `update`         | Mise à jour de code existant (sans ajout de fonctionnalité) |
| `add`            | Ajout de code mineur (logs, helpers, fichiers de config) |
| `refactor`       | Refactoring sans changement de comportement |
| `chore`          | Tâches internes (build, config, CI, workspace) |
| `docs`           | Documentation uniquement |
| `remove`         | Suppression de code ou de fichiers |
| `deprecate`      | Marquage d'une fonctionnalité comme dépréciée |

Executer ```bun run version:sync``` pour mettre à jour la version de l'application automatiquement


### Documentation
*   **Mise à jour** : Tout ajout ou modification de fonctionnalité doit être accompagné de la mise à jour de la documentation appropriée dans ce dossier `./docs`.

## Serveur API
voir le fichier `./openapi.json`
