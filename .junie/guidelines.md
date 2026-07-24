

## Architecture

Le projet suit les principes de la **Clean Architecture** et de l'**Architecture Hexagonale**.
Le projet respecte le principe de responsabilité unique (Single Responsibility Principle) pour chaque classe, fonction, type ou interface.


### Code
- **Classes** : `PascalCase` (ex: `SignInUseCase`).
- **Méthodes et Variables** : `camelCase` (ex: `execute()`, `userId`).
- **Interfaces** : Suffixe `Interface` recommandé (ex: `UserRepositoryInterface`).
- **Types** : Suffixe `Type` recommandé (ex: `UserRepositoryType`).