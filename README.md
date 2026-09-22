# randevu frontend

Fresha-inspired Turkish appointment marketplace (Vite + React + TypeScript + Tailwind).

## Run

```bash
# backend must be up on :8080
cd ../randevu && docker compose up -d
cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# frontend
cd ../randevu-frontend
cp .env.example .env   # if needed
npm install
npm run dev
```

Open http://localhost:5173

### Seed logins (backend `dev`)

| Email | Password | Role |
|-------|----------|------|
| customer@randevu.local | Password123! | CUSTOMER |
| provider@randevu.local | Password123! | PROVIDER |

## Spec

See `docs/superpowers/specs/2026-09-22-randevu-frontend-design.md`
