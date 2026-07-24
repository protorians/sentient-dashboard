

## Architecture

Le projet suit les principes de la **Clean Architecture** et de l'**Architecture Hexagonale**.
Le projet respecte le principe de responsabilité unique (Single Responsibility Principle) pour chaque classe, fonction, type ou interface.


### Code
- **Classes** : `PascalCase` (ex: `SignInUseCase`).
- **Méthodes et Variables** : `camelCase` (ex: `execute()`, `userId`).
- **Interfaces** : Suffixe `Interface` recommandé (ex: `UserRepositoryInterface`).
- **Types** : Suffixe `Type` recommandé (ex: `UserRepositoryType`).


## Documentation
À chaque modification ou création de features, il faudrait mettre à jour la documentation.
- **Emplacement** : Toute documentation doit être placée dans le dossier `./docs/`.
- **Langue** : La documentation technique est rédigée en **Français**.
- **Sommaire** : Le fichier `docs/README.md` sert de point d'entrée principal.


## Stack Technique

- **Runtime** : Bun
- **Framework** : Next (Shadcn, ReUi)