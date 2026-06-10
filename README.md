# Health Dashboard

MVP de um aplicativo de acompanhamento de saúde. O usuário se cadastra, registra
biomarcadores diários (horas de sono, nível de glicose e variabilidade cardíaca/HRV) e
recebe, por meio de uma IA, uma interpretação dos dados e recomendações de hábitos
contextualizadas pelo seu perfil. Inclui ainda uma feature de geração de um
plano alimentar por IA.

O projeto é dividido em dois módulos:

| Módulo | Pasta | Stack | Detalhes |
|--------|-------|-------|----------|
| **Backend (API)** | [`backend/`](./backend) | PHP 8.4 · Laravel 12 · MySQL · Docker | [README do backend](./backend/README.md) |
| **Frontend (Mobile)** | [`frontend/`](./frontend) | Expo SDK 54 · React Native · TypeScript | [README do frontend](./frontend/README.md) |

---

## Visão geral da arquitetura

- Backend RESTful em arquitetura de camadas (`Controller → Service → Repository`),
  com princípios SOLID, autenticação **JWT** e documentação OpenAPI (Scramble).
- Frontend organizado por responsabilidade (`api`, `context`, `hooks`, `components`,
  `screens`), com cliente HTTP tipado, token JWT persistido com segurança e logout
  automático.
- A IA é o núcleo do produto e está isolada atrás de interfaces no backend, sendo
  acionada em dois fluxos (interpretação de biomarcadores e plano alimentar).

```
teste tecsa/
├── backend/     # API Laravel + Docker (porta 9000)
└── frontend/    # App Expo / React Native
```

---

## Como executar (resumo)

### Opção 1 — Tudo com um comando (Docker, na raiz)
Sobe a API e o app na versão web:
```bash
# defina a chave da OpenAI em backend/laravel-app/.env (OPENAI_API_KEY=...)
docker compose up -d --build
```
- API: **http://localhost:9000**
- App (web): **http://localhost:8081**
- Documentação da API: **http://localhost:9000/docs/api**

### Opção 2 — App no celular/emulador (fluxo mobile)
Para rodar no Expo Go / emulador
Android, use o Metro no host (o backend pode continuar no Docker):
```bash
cd frontend
npm install
npm start        # pressione "a" (Android) ou escaneie o QR no Expo Go
```


> Também existe um `docker-compose.yml` dentro de `backend/` para subir apenas o
> backend. Use um ou o outro (ambos publicam a porta 9000).

---

## Funcionalidades

- Cadastro/login com **JWT** (nome, e-mail, senha, idade, peso e altura) e edição de perfil.
- Registro de biomarcadores com validação.
- **Dashboard** com visualizadores dos dados enviados e das recomendações da IA, além de histórico.
- **Plano alimentar** de um dia gerado por IA (feature diferencial).
- **Documentação da API** interativa em `http://localhost:9000/docs/api` (Scramble / OpenAPI 3.1).

---

# Relatório: uso de IA no projeto

Esta seção descreve como a IA é utilizada, tanto como parte ativa
do produto quanto no processo de desenvolvimento.

## 1. IA como parte do produto (OpenAI)

A IA é consumida via API da OpenAI (endpoint *Chat Completions*), sempre com
`response_format: json_object` para garantir respostas estruturadas e parseáveis. O modelo
é configurável por variável de ambiente (`OPENAI_MODEL`).

### Onde a IA atua

**a) Interpretação de biomarcadores + recomendações**
- Quando o usuário registra um conjunto de biomarcadores, o backend monta um prompt com
  esses dados **e o perfil do usuário** (idade, peso, altura) e pede à IA:
  - uma **interpretação** curta e amigável dos indicadores;
  - exatamente **3 recomendações** de hábitos diários.
- A resposta é persistida (interpretação + recomendações) e exibida no dashboard.

**b) Plano alimentar** (requisito 3.4)
- A partir do perfil e dos biomarcadores mais recentes do usuário, a IA gera um
  plano alimentar de um dia (refeições, itens, calorias estimadas e um resumo).

### Dados enviados à IA
Apenas os dados estritamente necessários para a tarefa: os biomarcadores informados e o
perfil (idade/peso/altura).

### Como a integração foi desenhada
- **Desacoplamento por interface:** a IA fica atrás de contratos
  (`HealthInsightProvider`, `MealPlanProvider`). A implementação concreta usa a OpenAI
  (`OpenAiHealthInsightProvider`, `OpenAiMealPlanProvider`), mas poderia ser trocada por
  outro provedor (ou um mock) sem alterar a regra de negócio. As implementações são
  injetadas via (`AppServiceProvider`).
- **Camada de serviço:** os services reúnem perfil + dados, chamam o provedor
  de IA e persistem o resultado quando aplicável — mantendo controllers sem lógica.
- **Prompts:** um *system prompt* define o papel ("assistente de saúde"), reforça que o conteúdo é educativo e não substitui um profissional, e fixa o formato JSON de saída.
- **Robustez:** respostas malformadas ou falhas de conexão lançam exceções de domínio
  (`HealthInsightException` / `MealPlanException`), traduzidas para **HTTP 502** com
  mensagem clara, em vez de quebrar a requisição.

## 2. IA no desenvolvimento

O desenvolvimento contou com o apoio do Claude Code na escrita de código, testes e documentação. Foi utilizado toolkits como spartan-ai-toolkit e caveman, que aprimoram a qualidade do código e a eficiência no gasto de tokens. Todas as decisões de arquitetura, revisões de código e validações foram conferidas e ajustadas manualmente.

---

## Documentação e testes

- **API (OpenAPI 3.1):** `http://localhost:9000/docs/api`
- **Testes do backend:** `docker compose exec app php artisan test`
