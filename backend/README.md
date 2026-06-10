# Health Dashboard — Backend (API)

API RESTful de um MVP de acompanhamento de saúde. O usuário registra biomarcadores
diários (sono, glicose e variabilidade cardíaca/HRV) e a API os envia a um modelo de
IA (OpenAI) que devolve uma interpretação e 3 recomendações de hábitos,
contextualizadas pelo perfil do usuário (idade, peso e altura).

---

## Destaques técnicos

- **Arquitetura em camadas** com responsabilidades bem separadas:
  `Controller → Service → Repository`, sem lógica de negócio no controller.
- **SOLID / Clean Code**: dependências programadas contra **interfaces**
  (`HealthMetricRepository`, `UserRepository`, `HealthInsightProvider`) e injetadas
  via container, o provedor de IA é desacoplado e facilmente substituível/testável.
- **Integração com IA isolada atrás de uma interface** (`HealthInsightProvider`),
  com implementação concreta para a OpenAI (`OpenAiHealthInsightProvider`).
- **Autenticação JWT** (`php-open-source-saver/jwt-auth`)
- **Documentação OpenAPI automática** via **Scramble** (gerada a partir do código)
- **Ambiente Docker completo** — sobe tudo com docker compose, acessível na porta `9000`.
- **Testes automatizados** cobrindo auth, escopo por usuário, validações e a
  integração com a IA.

---

## Stack

| Camada        | Tecnologia                          |
|---------------|-------------------------------------|
| Linguagem     | PHP 8.4                             |
| Framework     | Laravel 12                          |
| Banco         | MySQL 8.0                           |
| Servidor web  | Nginx + PHP-FPM                     |
| IA            | OpenAI (Chat Completions)           |
| Auth          | JWT (`php-open-source-saver/jwt-auth`) |
| Docs          | Scramble (OpenAPI 3.1)              |
| Testes        | PHPUnit + Mockery                   |

---

##  Organização do código (camadas)

```
app/
├── Http/
│   ├── Controllers/Api/        # Recebem a requisição, validam e delegam ao Service
│   │   ├── AuthController.php
│   │   └── HealthMetricController.php
│   ├── Requests/               # Validação de entrada (FormRequests)
│   └── Resources/              # Serialização padronizada da resposta (JSON)
├── Services/                   # Regra de negócio / orquestração
│   ├── AuthService.php
│   ├── HealthMetricService.php
│   └── AI/
│       ├── Contracts/HealthInsightProvider.php   # Interface da IA
│       └── OpenAiHealthInsightProvider.php        # Implementação OpenAI
├── Repositories/               # Acesso a dados isolado
│   ├── Contracts/              # Interfaces
│   └── Eloquent/               # Implementações Eloquent
├── DataTransferObjects/        # Objetos de transporte (ex.: HealthInsight)
├── Models/                     # Eloquent models
└── Providers/AppServiceProvider.php   # Bindings das interfaces + config do Scramble
```

**Fluxo de uma criação de métrica:**
`HealthMetricController::store` → `HealthMetricService::saveHealthMetricWithRecommendation`
(monta o perfil do usuário e chama a IA) → `OpenAiHealthInsightProvider` (prompt para a
OpenAI) → `HealthMetricRepository` (persiste as métricas e recomendações).

---

## Tabelas

| Tabela            | Descrição                                                                 |
|-------------------|---------------------------------------------------------------------------|
| `users`           | Usuários. Além de `name`/`email`/`password`, guarda **`age`**, **`weight`** (kg) e **`height`** (cm), usados como contexto para a IA. |
| `health_metrics`  | Indicadores enviados (`sleep_hours`, `glucose_level`, `heart_rate`), a `interpretation` da IA e o `user_id`. |
| `recommendations` | Recomendações geradas pela IA. |

**Relacionamentos:** `User 1—N HealthMetric 1—N Recommendation`.

---

## Rotas da API

Base: `http://localhost:9000/api`

### Públicas
| Método | Rota              | Descrição                                  |
|--------|-------------------|--------------------------------------------|
| `POST` | `/auth/register`  | Cadastro (nome, email, senha, idade, peso, altura) → retorna usuário + token JWT |
| `POST` | `/auth/login`     | Login → retorna usuário + token JWT        |

### Protegidas (`Authorization: Bearer <token>`)
| Método  | Rota                    | Descrição                                        |
|---------|-------------------------|--------------------------------------------------|
| `GET`   | `/auth/me`              | Dados do usuário autenticado                     |
| `PATCH` | `/auth/me`              | Edita o perfil (nome, idade, peso, altura)       |
| `POST`  | `/auth/logout`          | Invalida o token                                 |
| `GET`   | `/health-metrics`       | Lista as métricas do usuário (mais recentes primeiro) |
| `POST`  | `/health-metrics`       | Cria uma métrica → dispara a interpretação da IA |
| `GET`   | `/health-metrics/{id}`  | Detalha uma métrica do usuário                   |

**Padrões REST:** 
(`201` criação, `200` leitura, `401` não autenticado, `404` não encontrado,
`422` validação, `502` falha do provedor de IA).

---

## Documentação (Scramble)

Gerada automaticamente a partir do código (FormRequests, Resources e tipos):

- **UI interativa:** http://localhost:9000/docs/api
- **Spec OpenAPI 3.1 (JSON):** http://localhost:9000/docs/api.json

---

## Como rodar

### Pré-requisitos
- Docker + Docker Compose

### Passos
```bash
# 1. Na pasta do backend, crie o .env a partir do exemplo
cp laravel-app/.env.example laravel-app/.env

# 2. Defina sua chave da OpenAI no laravel-app/.env
#    OPENAI_API_KEY=sk-...

# 3. Suba toda a stack (app + nginx + mysql)
docker compose up -d --build
```

A API ficará disponível em **http://localhost:9000**.

O container já cuida automaticamente de: instalar dependências, gerar a
`APP_KEY` e o `JWT_SECRET` (se faltarem), aguardar o MySQL e rodar as **migrations**.

---

## Testes

```bash
docker compose exec app php artisan test
```

Cobrem, entre outros casos:
- **Auth:** cadastro (com perfil) + token, validações, email duplicado, login válido/inválido, `/auth/me` com Bearer, edição de perfil.
- **Health metrics:** criação com IA (mockada), validação de indicadores, **escopo por usuário** (um usuário não vê métricas de outro) e exigência de autenticação (`401`).
- **IA:** teste que intercepta a chamada HTTP e garante que **idade/peso/altura são enviados no prompt** à OpenAI.

---

## Variáveis de ambiente principais

| Variável          | Descrição                                  |
|-------------------|--------------------------------------------|
| `OPENAI_API_KEY`  | Chave da API da OpenAI |
| `OPENAI_MODEL`    | Modelo usado (ex.: `gpt-5.4-mini`)          |
| `DB_*`            | Conexão MySQL (já apontada para o serviço `db` do compose) |
| `JWT_SECRET`      | Secret do JWT (gerado automaticamente na subida) |

---

## Serviços do Docker

| Serviço | Imagem                  | Porta            |
|---------|-------------------------|------------------|
| `web`   | nginx                   | `9000` → `80`    |
| `app`   | PHP 8.4-FPM (custom)    | interno          |
| `db`    | mysql:8.0               | interno          |
