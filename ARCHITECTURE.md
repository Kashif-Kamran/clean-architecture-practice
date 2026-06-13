# Bike Book — Clean Architecture Reference

## The One Rule

**Dependencies point inward only.**

```
  infrastructure  ──▶  application  ──▶  domain
```

- **Domain** knows nothing. No NestJS, no TypeORM, no HTTP. It is pure
  TypeScript. You can run it in a browser, a CLI, or a test with zero setup.

- **Application** knows domain only. It defines the *contracts* (ports/interfaces)
  that it needs from the outside world, and it orchestrates domain objects.
  It never calls TypeORM or Express directly.

- **Infrastructure** knows everything inward. It implements the contracts,
  wires NestJS decorators, writes SQL, and handles HTTP. It is allowed to
  import from application and domain, but neither of those layers imports back.

If you ever find an import going the wrong way — e.g., a domain entity
importing from `@nestjs/common`, or a use case importing a TypeORM entity —
that is a bug, not a style preference.

---

## Catalog Slice — Layer Diagram

```
┌────────────────────────────────────────────────────────────────┐
│  src/modules/catalog/                                          │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  INFRASTRUCTURE                                          │  │
│  │                                                          │  │
│  │  http/controllers/   ──calls──▶  application/use-cases  │  │
│  │  http/dtos/          (validates input, maps output)      │  │
│  │                                                          │  │
│  │  persistence/entities/    (TypeORM @Entity classes)      │  │
│  │  persistence/mappers/     (domain ↔ ORM translation)     │  │
│  │  persistence/repositories/ ──implements──▶  app/ports   │  │
│  │                                                          │  │
│  │  catalog.module.ts   (binds ports to adapters via DI)    │  │
│  │                                                          │  │
│  │         │ depends on ▼                                   │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  APPLICATION                                             │  │
│  │                                                          │  │
│  │  ports/   (interfaces — contracts the app defines)       │  │
│  │  use-cases/  (orchestrate domain + call ports)           │  │
│  │                                                          │  │
│  │         │ depends on ▼                                   │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  DOMAIN                                                  │  │
│  │                                                          │  │
│  │  entities/   (Make, Model, Variant — plain TS classes)   │  │
│  │  errors/     (DomainError, InvalidVariantError, …)       │  │
│  │                                                          │  │
│  │  knows about NOTHING outside this box                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

---

## Full Request Trace: `POST /variants`

This is the most important section. Follow one HTTP request from socket
to database and back. Every hop maps to a file in `src/`.

### Request body
```json
{
  "modelId": "abc-123",
  "name": "CBR650R Standard 2024",
  "year": 2024,
  "engineCc": 649,
  "priceMsrp": 9499.00
}
```

---

### Step 1 — NestJS routes to `VariantController.create()`

File: `infrastructure/http/controllers/variant.controller.ts`

NestJS parses the request and instantiates a `CreateVariantDto` from
the JSON body. Before the controller method runs, the global
`ValidationPipe` executes `class-validator` on the DTO:

- `@IsUUID()` checks `modelId`
- `@IsInt() @Min(1)` checks `engineCc`
- `@IsNumber() @Min(0)` checks `priceMsrp`

If any check fails, a `400 Bad Request` is returned immediately —
the controller never runs.

```typescript
// variant.controller.ts
@Post()
async create(@Body() dto: CreateVariantDto): Promise<VariantResponseDto> {
  const variant = await this.createVariant.execute({ ... });
  return VariantResponseDto.fromDomain(variant);
}
```

The controller's only jobs: receive a typed DTO, call one use case,
map the result. No `if` statements, no business logic.

---

### Step 2 — Controller calls `CreateVariantUseCase.execute()`

File: `application/use-cases/create-variant.use-case.ts`

The use case is a plain TypeScript class injected by NestJS via a
factory provider (see `catalog.module.ts`). It receives a plain input
object — no HTTP types, no DTOs.

```typescript
// create-variant.use-case.ts
async execute(input: CreateVariantInput): Promise<Variant> {
  // Step 2a — orchestration: ensure the model exists
  const model = await this.modelRepo.findById(input.modelId);
  if (!model) throw new NotFoundError('Model', input.modelId);

  // Step 2b — instantiate domain entity (business rules enforced here)
  const variant = new Variant(
    randomUUID(),
    input.modelId,
    input.name,
    input.year,
    input.engineCc,   // ← domain throws if <= 0
    input.priceMsrp,  // ← domain throws if < 0
  );

  // Step 2c — persist through the port
  await this.variantRepo.save(variant);
  return variant;
}
```

`this.modelRepo` and `this.variantRepo` are typed as `ModelRepositoryPort`
and `VariantRepositoryPort` — *interfaces defined in this same layer*.
The use case has absolutely no idea that TypeORM exists.

---

### Step 3 — `new Variant(...)` enforces invariants

File: `domain/entities/variant.entity.ts`

The `Variant` constructor runs three guard clauses.
If `engineCc` is `0`, execution stops here:

```typescript
// variant.entity.ts
if (engineCc <= 0) {
  throw new InvalidVariantError('engineCc', `must be > 0, got ${engineCc}`);
}
```

`InvalidVariantError` extends `DomainError` which carries
`isDomainError = true` and `statusCode = 400`.

No database has been touched yet. The rule is enforced in memory,
by pure TypeScript, with no framework involvement.

---

### Step 4 — `InvalidVariantError` propagates to the global filter

File: `shared/filters/domain-exception.filter.ts`

Because the use case does not catch the error, it bubbles up through
NestJS's pipeline to the global `DomainExceptionFilter`:

```typescript
// domain-exception.filter.ts
if (isDomainError(exception)) {
  response.status(exception.statusCode).json({
    statusCode: 400,
    error: 'InvalidVariantError',
    message: 'Invalid variant — engineCc: must be > 0, got 0',
    path: '/variants',
  });
}
```

The filter checks the `isDomainError` flag (a plain boolean on the
error object) rather than `instanceof` — so it never imports the
specific error subclass, avoiding an upward dependency.

The client receives a `400` with a clear human-readable message.
The business rule stayed entirely in the domain.

---

### Step 5 (happy path) — `variantRepo.save(variant)` calls the adapter

File: `infrastructure/persistence/repositories/variant.typeorm-repository.ts`

`variantRepo` is the `VariantTypeOrmRepository`, but the use case
only ever sees the `VariantRepositoryPort` interface. The actual
binding happens in `catalog.module.ts`:

```typescript
// catalog.module.ts
{ provide: VARIANT_REPOSITORY, useClass: VariantTypeOrmRepository }
```

Inside the repository:

```typescript
// variant.typeorm-repository.ts
async save(variant: Variant): Promise<void> {
  await this.ormRepo.save(VariantMapper.toOrm(variant));
}
```

---

### Step 6 — `VariantMapper.toOrm()` translates domain → ORM

File: `infrastructure/persistence/mappers/variant.mapper.ts`

```typescript
// variant.mapper.ts
static toOrm(domain: Variant): VariantOrmEntity {
  const orm = new VariantOrmEntity();
  orm.id        = domain.id;
  orm.modelId   = domain.modelId;
  orm.name      = domain.name;
  orm.year      = domain.year;
  orm.engineCc  = domain.engineCc;
  orm.priceMsrp = domain.priceMsrp;
  return orm;
}
```

The `VariantOrmEntity` is a TypeORM `@Entity` class — a dumb table
mapping. The domain `Variant` has never seen it, and never will.

---

### Step 7 — TypeORM issues the SQL

```sql
INSERT INTO variants (id, model_id, name, year, engine_cc, price_msrp)
VALUES ($1, $2, $3, $4, $5, $6);
```

TypeORM serialises the `VariantOrmEntity` into parameters and sends
it to PostgreSQL. The `synchronize: true` flag in `app.module.ts`
ensures the table exists (dev only).

---

### Step 8 — The response flows back

1. `variantRepo.save()` resolves (no return value).
2. The use case returns the domain `Variant` object to the controller.
3. The controller calls `VariantResponseDto.fromDomain(variant)`.
4. NestJS serialises the DTO to JSON and sends `201 Created`.

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "modelId": "abc-123",
  "name": "CBR650R Standard 2024",
  "year": 2024,
  "engineCc": 649,
  "priceMsrp": 9499
}
```

---

## "Where Does X Go?" Table

| Concern                              | Layer          | File location example                             |
|--------------------------------------|----------------|---------------------------------------------------|
| Business rule (engineCc > 0)         | **Domain**     | `domain/entities/variant.entity.ts`               |
| Domain error type                    | **Domain**     | `domain/errors/invalid-variant.error.ts`          |
| Repository contract (interface)      | **Application**| `application/ports/variant-repository.port.ts`    |
| Orchestration (does model exist?)    | **Application**| `application/use-cases/create-variant.use-case.ts`|
| HTTP routing, param parsing          | **Infra/HTTP** | `infrastructure/http/controllers/variant.controller.ts` |
| Input validation (class-validator)   | **Infra/HTTP** | `infrastructure/http/dtos/create-variant.dto.ts`  |
| SQL / TypeORM queries                | **Infra/DB**   | `infrastructure/persistence/repositories/…`       |
| ORM table mapping (@Entity)          | **Infra/DB**   | `infrastructure/persistence/entities/…`           |
| Domain ↔ ORM translation             | **Infra/DB**   | `infrastructure/persistence/mappers/…`            |
| DI wiring (port → adapter)           | **Infra/Module**| `catalog.module.ts`                              |
| Cross-cutting HTTP error mapping     | **Infra/Shared**| `shared/filters/domain-exception.filter.ts`      |

---

## Quick Start

```bash
# 1. Start the database
docker compose up -d

# 2. Copy env (already done if .env exists)
cp .env.example .env

# 3. Start the API in watch mode
npm run start:dev

# 4. Create a Make
curl -s -X POST http://localhost:3000/makes \
  -H 'Content-Type: application/json' \
  -d '{"name":"Honda","countryOfOrigin":"Japan"}' | jq

# 5. Create a Model (use the id from step 4)
curl -s -X POST http://localhost:3000/models \
  -H 'Content-Type: application/json' \
  -d '{"makeId":"<MAKE_ID>","name":"CBR650R","bodyType":"Sport","yearIntroduced":2019}' | jq

# 6. Create a Variant (use model id from step 5)
curl -s -X POST http://localhost:3000/variants \
  -H 'Content-Type: application/json' \
  -d '{"modelId":"<MODEL_ID>","name":"CBR650R Standard 2024","year":2024,"engineCc":649,"priceMsrp":9499}' | jq

# 7. Trigger a domain rule violation — engineCc = 0
curl -s -X POST http://localhost:3000/variants \
  -H 'Content-Type: application/json' \
  -d '{"modelId":"<MODEL_ID>","name":"Bad","year":2024,"engineCc":0,"priceMsrp":100}' | jq
# → 400 InvalidVariantError: domain rule enforced in variant.entity.ts

# 8. Get a variant
curl -s http://localhost:3000/variants/<VARIANT_ID> | jq

# 9. List variants for a model
curl -s http://localhost:3000/models/<MODEL_ID>/variants | jq
```
