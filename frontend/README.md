# Health Dashboard — Frontend

Aplicativo mobile de acompanhamento de saúde. O usuário se autentica, registra
biomarcadores diários (sono, glicose e variabilidade cardíaca/HRV) e visualiza um
dashboard com os dados enviados e as recomendações geradas por IA no backend.

---

## Destaques técnicos

- **Arquitetura organizada por responsabilidade**: camadas de `api`, `context`,
  `hooks`, `components`, `screens`, `storage` e `types` — sem lógica de rede dentro
  das telas.
- **Cliente HTTP tipado e centralizado** (`api/client.ts`) que injeta o token JWT,
  normaliza erros (validação `422`, `401`, falha de IA `502`) e dispara **logout
  automático** ao receber `401`.
- **Autenticação com Context API** (`AuthContext`) e **token persistido com segurança**
  (`expo-secure-store` no mobile, `localStorage` no web).
- **TypeScript em todo o app**, com tipos compartilhados para usuário e indicadores.
- **UI consistente** via tema centralizado (`theme.ts`) — cores, espaçamentos e raios.

---

## Stack

| Item            | Tecnologia                          |
|-----------------|-------------------------------------|
| Framework       | Expo SDK 54                         |
| Base            | React Native 0.81 / React 19        |
| Linguagem       | TypeScript                          |

---

## Organização do código

```
src/
├── api/                    # Acesso à API (camada de rede)
│   ├── client.ts           # fetch tipado: Bearer token, erros, auto-logout
│   ├── auth.ts             # register / login / me / updateProfile / logout
│   └── healthMetrics.ts    # list / create de métricas
├── context/
│   └── AuthContext.tsx     # Sessão: signIn / signUp / updateProfile / signOut
├── hooks/
│   └── useHealthMetrics.ts # Estado das métricas (loading, erros, refresh, submit)
├── components/
│   ├── BiomarkerForm.tsx       # Entrada dos biomarcadores
│   ├── BiomarkerSummary.tsx    # Visualizador dos dados enviados (tiles)
│   ├── RecommendationsPanel.tsx# Visualizador das recomendações da IA
│   └── MetricCard.tsx          # Card de um registro do histórico
├── screens/
│   ├── AuthScreen.tsx      # Login / Cadastro (com idade, peso e altura)
│   ├── DashboardScreen.tsx# Form + visualizadores + histórico
│   └── ProfileScreen.tsx  # Edição de perfil
├── storage/authStorage.ts # Persistência do token
├── types/                 # Tipos (auth, health)
├── theme.ts               # Tema (cores, espaçamentos)
└── config.ts              # URL base da API
```

---

## Funcionalidades

- **Cadastro e login** com JWT; sessão restaurada automaticamente ao abrir o app.
- **Perfil** editável (nome, idade, peso, altura) por um menu no dashboard.
- **Registro de indicadores** (sono, glicose, HRV) com validação refletida do backend.
- **Dashboard** com dois visualizadores simples:
  - *Seus dados mais recentes* — tiles com valor, barra proporcional e status.
  - *Recomendações para hoje* — interpretação + as 3 recomendações da IA.
- **Histórico** de registros com pull-to-refresh.

---

## Como rodar

### Pré-requisitos
- Node.js **>= 20.19.4** (exigência do Expo SDK 54)
- App **Expo Go** no celular **ou** um emulador Android/iOS

### Passos
```bash
# 1. Instalar dependências
npm install

# 2. Iniciar o Metro / Expo
npm start
```

Depois: pressione `a` (Android), `i` (iOS) ou `w` (web), ou escaneie o QR Code com o
Expo Go.

### Apontar para o backend
A URL da API fica em `src/config.ts`:
- **Web / simulador iOS:** `localhost:9000`
- **Emulador Android:** `10.0.2.2:9000`
- **Celular físico:** troque o host pelo **IP da sua máquina** na rede local
  (ex.: `http://192.168.0.10:9000`) — o celular e o PC precisam estar na mesma rede.

---

