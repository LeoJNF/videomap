# VideoMap no GCP

Este backend agora aceita dois modos:

- `sqljs` para teste local rapido
- `postgres` para banco real, incluindo Cloud SQL no GCP

## 1. Ambiente local

Use o arquivo `backend/.env.local` como esta hoje:

```env
DB_TYPE=sqljs
SQLJS_LOCATION=videomap-local.sqlite
SEED_DEMO_DATA=true
LOCAL_DEMO_MODE=true
```

## 2. Ambiente no GCP com Cloud SQL

Use `backend/.env.gcp.example` como base.

### Exemplo com socket do Cloud SQL

```env
DB_TYPE=postgres
DATABASE_URL=postgresql://DB_USER:DB_PASSWORD@/videomap?host=/cloudsql/SEU_PROJETO:southamerica-east1:sua-instancia
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
DB_SYNCHRONIZE=false
DB_LOGGING=false
```

### Exemplo com host e porta

```env
DB_TYPE=postgres
DB_HOST=SEU_HOST
DB_PORT=5432
DB_USER=SEU_USUARIO
DB_PASSWORD=SUA_SENHA
DB_NAME=videomap
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
DB_SYNCHRONIZE=false
DB_LOGGING=false
```

### Certificado CA opcional

Se quiser usar certificado CA:

```env
DB_CA_CERT_PATH=certs/server-ca.pem
```

## 3. Mercado Pago

O fluxo do app ja esta preparado para assinatura com 30 dias gratis.
Para ligar o backend depois, deixe estes campos prontos:

```env
MERCADO_PAGO_PUBLIC_KEY=APP_USR-SEU_PUBLIC_KEY
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-SEU_ACCESS_TOKEN
MERCADO_PAGO_PLAN_ID=videomap-pro
MERCADO_PAGO_WEBHOOK_SECRET=troque-este-segredo
```

## 4. Recomendacao de deploy

Para GCP, o caminho mais direto e:

1. Backend no Cloud Run
2. Banco no Cloud SQL Postgres
3. Segredos no Secret Manager
4. Arquivos de midia em Cloud Storage

Assim voce mantem o app pronto para crescer sem perder a simplicidade local.
