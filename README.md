# Bike Book — Clean Architecture Reference Implementation

A production-shaped NestJS application built as a **learning reference for Clean Architecture**. Every pattern is intentional and explained. The domain is a motorcycle catalog (Makes → Models → Variants) with Bookings and JWT authentication — complex enough to show real cross-module concerns, simple enough to read in an afternoon.

---

## Table of Contents

- [What Is Clean Architecture?](#what-is-clean-architecture)
- [The Dependency Rule](#the-dependency-rule)
- [Project Structure](#project-structure)
- [The Three Layers](#the-three-layers)
- [Feature-First Vertical Slices](#feature-first-vertical-slices)
- [Ports and Adapters](#ports-and-adapters)
- [Dependency Injection with Symbol Tokens](#dependency-injection-with-symbol-tokens)
- [Domain Entities vs ORM Entities](#domain-entities-vs-orm-entities)
- [Read Models — Lightweight CQRS](#read-models--lightweight-cqrs)
- [Domain Errors and the Global Exception Filter](#domain-errors-and-the-global-exception-filter)
- [Cross-Module Dependencies](#cross-module-dependencies)
- [Module Ownership Map](#module-ownership-map)
- [Request Lifecycle Walkthrough](#request-lifecycle-walkthrough)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Tech Stack](#tech-stack)
- [Key Design Decisions](#key-design-decisions)
- [What This Project Intentionally Omits](#what-this-project-intentionally-omits)

---

## What Is Clean Architecture?

Clean Architecture (Robert C. Martin, 2017) organizes code so that **business logic is independent of frameworks, databases, and delivery mechanisms**. You can swap PostgreSQL for MongoDB, or HTTP for a CLI, without touching a single use case.

The architecture is visualized as concentric rings:

```
┌──────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE                       │  Express, TypeORM, bcrypt, JWT
│  ┌────────────────────────────────────────────────┐  │
│  │               APPLICATION                      │  │  Use Cases, Ports (interfaces)
│  │  ┌──────────────────────────────────────────┐  │  │
│  │  │               DOMAIN                     │  │  │  Entities, Business Rules, Errors
│  │  └──────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

Each ring can only import from rings **inward**. Domain knows nothing about the database. Application knows nothing about HTTP. Infrastructure knows about everything — and that is fine, because it is the outermost layer.

---

## The Dependency Rule

> Source code dependencies must point **inward only**. Nothing in an inner ring can know anything about something in an outer ring.

This is enforced by convention in every file. Each file opens with a comment block that states exactly what it may and must not import:

```typescript
// =============================================================================
// LAYER: Application (use case)
// MAY IMPORT: @Injectable/@Inject (DI metadata only), domain entities/errors,
//             application ports
// MUST NOT IMPORT: bcrypt, @nestjs/jwt, TypeORM, HTTP decorators
// =============================================================================
```

Violating these rules is an architecture violation — it couples an inner layer to an outer one and defeats the entire structure.

---

## Project Structure

```
src/
├── main.ts                          # Bootstrap: registers global pipe + exception filter
├── app.module.ts                    # Root module: wires TypeORM + all feature modules
│
├── shared/
│   └── filters/
│       └── domain-exception.filter.ts  # Translates DomainErrors → HTTP responses globally
│
└── modules/
    │
    ├── user/                        # Owns the User aggregate
    │   ├── domain/
    │   │   ├── entities/
    │   │   │   └── user.entity.ts
    │   │   └── errors/
    │   │       ├── user-domain.error.ts
    │   │       ├── invalid-email.error.ts
    │   │       └── user-not-found.error.ts
    │   ├── application/
    │   │   ├── ports/
    │   │   │   └── user-repository.port.ts
    │   │   └── use-cases/
    │   │       └── get-user-by-id.use-case.ts
    │   ├── infrastructure/
    │   │   └── persistence/
    │   │       ├── entities/user.orm-entity.ts
    │   │       ├── mappers/user.mapper.ts
    │   │       └── repositories/user.typeorm-repository.ts
    │   └── user.module.ts
    │
    ├── auth/                        # Authentication flows — imports UserModule
    │   ├── domain/
    │   │   └── errors/
    │   │       ├── auth-domain.error.ts
    │   │       ├── user-already-exists.error.ts
    │   │       └── invalid-credentials.error.ts
    │   ├── application/
    │   │   ├── ports/
    │   │   │   ├── password-hasher.port.ts
    │   │   │   └── token-service.port.ts
    │   │   └── use-cases/
    │   │       ├── register.use-case.ts
    │   │       ├── login.use-case.ts
    │   │       └── get-current-user.use-case.ts
    │   ├── infrastructure/
    │   │   ├── services/
    │   │   │   ├── bcrypt-password-hasher.ts
    │   │   │   └── jwt-token-service.ts
    │   │   └── http/
    │   │       ├── controllers/auth.controller.ts
    │   │       ├── dtos/
    │   │       ├── guards/jwt-auth.guard.ts
    │   │       ├── strategies/jwt.strategy.ts
    │   │       └── decorators/current-user.decorator.ts
    │   └── auth.module.ts
    │
    ├── catalog/                     # Make → Model → Variant hierarchy
    │   ├── domain/
    │   │   ├── entities/
    │   │   │   ├── make.entity.ts
    │   │   │   ├── model.entity.ts
    │   │   │   └── variant.entity.ts
    │   │   └── errors/
    │   │       ├── domain.error.ts
    │   │       ├── invalid-model.error.ts
    │   │       ├── invalid-variant.error.ts
    │   │       └── not-found.error.ts
    │   ├── application/
    │   │   ├── ports/
    │   │   │   ├── make-repository.port.ts
    │   │   │   ├── model-repository.port.ts
    │   │   │   └── variant-repository.port.ts   ← also holds VariantDetail read model
    │   │   └── use-cases/
    │   │       ├── create-make.use-case.ts
    │   │       ├── create-model.use-case.ts
    │   │       ├── create-variant.use-case.ts
    │   │       ├── get-variant-by-id.use-case.ts
    │   │       ├── get-variant-detail.use-case.ts
    │   │       └── list-variants-by-model.use-case.ts
    │   ├── infrastructure/
    │   │   ├── persistence/
    │   │   │   ├── entities/
    │   │   │   ├── mappers/
    │   │   │   └── repositories/
    │   │   └── http/
    │   │       ├── controllers/
    │   │       └── dtos/
    │   └── catalog.module.ts
    │
    └── bookings/                    # Depends on CatalogModule
        ├── domain/
        │   └── entities/booking.entity.ts
        ├── application/
        │   ├── ports/booking-repository.port.ts
        │   └── use-cases/create-booking.use-case.ts
        ├── infrastructure/
        │   ├── persistence/in-memory-booking.repository.ts
        │   └── http/
        │       ├── controllers/booking.controller.ts
        │       └── dtos/create-booking.dto.ts
        └── bookings.module.ts
```

---

## The Three Layers

### 1. Domain Layer

The innermost ring. Contains **business rules and nothing else**. Zero NestJS, zero TypeORM, zero `class-validator` — not even an import from those packages.

Entities enforce their own invariants in the constructor. If you pass bad data, you get a typed domain error — not a silent `undefined` or a generic `Error`:

```typescript
// catalog/domain/entities/variant.entity.ts
export class Variant {
  constructor(
    public readonly id: string,
    public readonly modelId: string,
    public readonly name: string,
    public readonly year: number,
    public readonly engineCc: number,
    public readonly priceMsrp: number,
  ) {
    if (engineCc <= 0)
      throw new InvalidVariantError('engineCc', `must be > 0, got ${engineCc}`);

    if (priceMsrp < 0)
      throw new InvalidVariantError('priceMsrp', `must be >= 0, got ${priceMsrp}`);

    const maxYear = new Date().getFullYear() + 2;
    if (year < 1885 || year > maxYear)
      throw new InvalidVariantError('year', `must be between 1885 and ${maxYear}`);
  }
}
```

These rules fire regardless of whether the call came from HTTP, a CLI script, or a unit test. There is no way to create an invalid `Variant`.

---

### 2. Application Layer

The middle ring. Orchestrates use cases by calling domain entities and ports. **Never talks to a database or HTTP directly** — it only calls interfaces (ports) and trusts infrastructure to fulfil them.

Each use case is a single class with a single `execute()` method:

```typescript
// catalog/application/use-cases/create-variant.use-case.ts
@Injectable()
export class CreateVariantUseCase {
  constructor(
    @Inject(MODEL_REPOSITORY)   private readonly modelRepo: ModelRepositoryPort,
    @Inject(VARIANT_REPOSITORY) private readonly variantRepo: VariantRepositoryPort,
  ) {}

  async execute(input: CreateVariantInput): Promise<Variant> {
    const model = await this.modelRepo.findById(input.modelId);
    if (!model) throw new NotFoundError('Model', input.modelId);

    // Domain constructor enforces all business rules
    const variant = new Variant(
      randomUUID(), input.modelId, input.name,
      input.year, input.engineCc, input.priceMsrp,
    );

    await this.variantRepo.save(variant);
    return variant;
  }
}
```

This class does **not** know: which SQL engine is running, what HTTP status code a missing model should return, or whether the caller is an HTTP request or a scheduled job.

---

### 3. Infrastructure Layer

The outermost ring. Everything that touches the real world: database, HTTP, third-party libraries. Infrastructure implements the interfaces (ports) defined in the application layer.

```typescript
// catalog/infrastructure/persistence/repositories/make.typeorm-repository.ts
@Injectable()
export class MakeTypeOrmRepository implements MakeRepositoryPort {
  constructor(
    @InjectRepository(MakeOrmEntity)
    private readonly ormRepo: Repository<MakeOrmEntity>,
  ) {}

  async save(make: Make): Promise<void> {
    await this.ormRepo.save(MakeMapper.toOrm(make));  // domain → ORM → SQL
  }

  async findById(id: string): Promise<Make | null> {
    const orm = await this.ormRepo.findOneBy({ id });
    return orm ? MakeMapper.toDomain(orm) : null;     // SQL → ORM → domain
  }
}
```

The application layer called `makeRepo.save(make)`. It had no idea SQL was involved.

---

## Feature-First Vertical Slices

Most Clean Architecture examples are **layer-first** (`controllers/`, `services/`, `repositories/` at the top level). This project is **feature-first**:

```
# Layer-first (common, harder to scale)        # Feature-first (this project)
src/                                            src/modules/
├── controllers/                                ├── catalog/
├── services/                                   │   ├── domain/
└── repositories/                               │   ├── application/
                                                │   └── infrastructure/
                                                └── bookings/
                                                    ├── domain/
                                                    ├── application/
                                                    └── infrastructure/
```

**Why feature-first?**

- All code for a feature lives in one folder — no hunting across four top-level directories.
- Adding a feature means adding one new folder. Deleting a feature is `rm -rf modules/feature`. No orphans left behind.
- NestJS modules map 1:1 to feature slices, making module boundaries obvious.
- Teams working on different features rarely create merge conflicts.

---

## Ports and Adapters

A **port** is an interface defined in the application layer that describes what the use case needs — without saying how it is done. An **adapter** is an infrastructure class that implements the port.

```
Application Layer                    Infrastructure Layer
──────────────────────               ────────────────────────────────
MakeRepositoryPort (interface)  ←──  MakeTypeOrmRepository (class)
PasswordHasherPort (interface)  ←──  BcryptPasswordHasher (class)
TokenServicePort   (interface)  ←──  JwtTokenService (class)
```

The arrow points **inward** — the adapter knows about the port, but the port knows nothing about the adapter. You can replace `BcryptPasswordHasher` with an `Argon2PasswordHasher` by changing one line in the module file. The use case that calls `hasher.hash(password)` never changes.

This pattern is also called **Hexagonal Architecture** and implements the **Dependency Inversion Principle** (the D in SOLID).

---

## Dependency Injection with Symbol Tokens

NestJS resolves class-based dependencies automatically via TypeScript metadata reflection. But ports are **interfaces** — interfaces are erased at compile time and cannot be used as runtime DI tokens.

The solution: pair each port with a `Symbol` token defined in the same file:

```typescript
// user/application/ports/user-repository.port.ts
export interface UserRepositoryPort {
  save(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
//                              ↑ survives at runtime, usable as a DI token
```

In the module, the Symbol is bound to a concrete adapter:

```typescript
// user.module.ts
providers: [
  { provide: USER_REPOSITORY, useClass: UserTypeOrmRepository },
]
```

In the use case, `@Inject(SYMBOL)` is required because NestJS cannot infer Symbol tokens from TypeScript metadata:

```typescript
@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)  private readonly userRepo: UserRepositoryPort,
    @Inject(PASSWORD_HASHER)  private readonly hasher: PasswordHasherPort,
    @Inject(TOKEN_SERVICE)    private readonly tokenService: TokenServicePort,
  ) {}
}
```

> **`import type` is required for interfaces in decorated constructors.**
> With `isolatedModules: true` and `emitDecoratorMetadata: true`, TypeScript requires
> the `type` modifier on interface imports to avoid an emit-time error:
> ```typescript
> import { USER_REPOSITORY, type UserRepositoryPort } from '../ports/user-repository.port';
> //                         ↑ type-only — erased before emit
> ```

---

## Domain Entities vs ORM Entities

There are **two separate classes** for every persisted concept:

| | Domain Entity | ORM Entity |
|---|---|---|
| **Purpose** | Enforces business rules | Maps columns to a TypeScript class |
| **Location** | `domain/entities/` | `infrastructure/persistence/entities/` |
| **Decorators** | None | `@Entity`, `@Column`, etc. |
| **Invariants** | Yes — constructor throws on bad data | No — TypeORM hydrates after construction |
| **Dependencies** | Only domain errors | TypeORM only |

A **mapper** is the only file that speaks both languages:

```typescript
// catalog/infrastructure/persistence/mappers/make.mapper.ts
export class MakeMapper {
  static toDomain(orm: MakeOrmEntity): Make {
    return new Make(orm.id, orm.name, orm.countryOfOrigin);
  }

  static toOrm(domain: Make): MakeOrmEntity {
    const orm = new MakeOrmEntity();
    orm.id = domain.id;
    orm.name = domain.name;
    orm.countryOfOrigin = domain.countryOfOrigin;
    return orm;
  }
}
```

**Why keep them separate?**

If you merge domain and ORM entities into one class, you get `@Column()` decorators sitting next to business rules — infrastructure coupling inside your domain. You can no longer unit-test domain logic without a database, and renaming a DB column becomes a domain-layer change.

---

## Read Models — Lightweight CQRS

Domain entities are optimized for **writes** — they carry invariants and represent a single aggregate root. But reads often need data joined across multiple aggregates. Navigating domain relationships for this is awkward and inefficient.

The solution: define a **read model** in the application layer — a plain data interface shaped for exactly one query. The repository implements it however it likes (a JOIN, a view, a cache).

```typescript
// catalog/application/ports/variant-repository.port.ts

// Read model: no behaviour, no invariants — just the shape the query returns
export interface VariantDetail {
  id: string;
  name: string;
  year: number;
  engineCc: number;
  priceMsrp: number;
  model: {
    id: string;
    name: string;
    bodyType: string;
    yearIntroduced: number;
    make: { id: string; name: string; countryOfOrigin: string };
  };
}

export interface VariantRepositoryPort {
  save(variant: Variant): Promise<void>;              // write path → domain entity
  findById(id: string): Promise<Variant | null>;      // read path  → domain entity
  findDetailById(id: string): Promise<VariantDetail | null>; // populated read → read model
}
```

The TypeORM adapter implements `findDetailById` as a single JOIN across three tables. The use case, controller, and response DTO all see only the flat `VariantDetail` interface — completely unaware that three tables are involved.

This is **CQRS at the repository level**: separate query paths for reads and writes, without a full event-sourced CQRS infrastructure.

---

## Domain Errors and the Global Exception Filter

Controllers in this project have **no `try/catch` blocks**. Instead:

1. Domain errors are thrown anywhere — use cases, domain entity constructors, anywhere.
2. A single global `DomainExceptionFilter` catches every thrown error and converts domain errors to HTTP responses.

```
UseCase throws NotFoundError (statusCode = 404)
              ↓
DomainExceptionFilter.catch()
              ↓
response.status(404).json({
  statusCode: 404,
  error: "NotFoundError",
  message: "Variant with id '...' was not found",
  path: "/variants/..."
})
```

The filter uses **duck typing** — it checks for the `isDomainError` boolean flag rather than `instanceof`. This means modules never need to share a base error class:

```typescript
// shared/filters/domain-exception.filter.ts
function isDomainError(err: unknown): err is CaughtDomainError {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as any).isDomainError === true  // duck-typing — no import coupling
  );
}
```

Each module defines its own error base class that sets `isDomainError = true`. The filter catches them all. `CatalogModule`'s `DomainError` and `AuthModule`'s `AuthDomainError` are completely independent classes — the filter catches both with zero knowledge of either.

---

## Cross-Module Dependencies

When one module needs something from another, it **imports the module and uses its exported use cases** — never its internal repositories or ORM entities.

### Example 1: Bookings depends on Catalog

`CreateBookingUseCase` needs to verify a variant exists before creating a booking. Rather than re-implementing the lookup, it imports the use case directly from `CatalogModule`:

```typescript
// bookings/application/use-cases/create-booking.use-case.ts
@Injectable()
export class CreateBookingUseCase {
  constructor(
    // Class token from CatalogModule's exports — no @Inject() needed
    private readonly getVariantById: GetVariantByIdUseCase,
    @Inject(BOOKING_REPOSITORY) private readonly bookingRepo: BookingRepositoryPort,
  ) {}

  async execute(input: CreateBookingInput): Promise<Booking> {
    // Throws NotFoundError if the variant does not exist — propagates to the filter
    await this.getVariantById.execute({ id: input.variantId });

    const booking = new Booking(randomUUID(), input.variantId, input.customerName, new Date());
    await this.bookingRepo.save(booking);
    return booking;
  }
}
```

```typescript
// bookings/bookings.module.ts
@Module({
  imports: [CatalogModule],  // ← GetVariantByIdUseCase becomes available here
  providers: [
    { provide: BOOKING_REPOSITORY, useClass: InMemoryBookingRepository },
    CreateBookingUseCase,
  ],
  controllers: [BookingController],
})
export class BookingsModule {}
```

### Example 2: Auth depends on User

`AuthModule` does not own the `User` aggregate. `UserModule` does. `AuthModule` imports `UserModule` and its use cases inject `USER_REPOSITORY` as normal — they just do not *provide* it themselves:

```typescript
// auth/auth.module.ts
@Global()
@Module({
  imports: [
    UserModule,      // ← provides USER_REPOSITORY; auth use cases can inject it
    PassportModule,
    JwtModule.registerAsync(...),
  ],
  providers: [
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: TOKEN_SERVICE,   useClass: JwtTokenService },
    RegisterUseCase,    // injects USER_REPOSITORY from UserModule
    LoginUseCase,       // injects USER_REPOSITORY from UserModule
    GetCurrentUserUseCase,
    JwtStrategy,
    JwtAuthGuard,
  ],
})
export class AuthModule {}
```

The auth use cases did not change at all when `UserModule` was extracted — only the import paths changed. This is the Dependency Inversion Principle at work: use cases depend on the port interface, not on where the binding comes from.

### The module dependency graph

```
AppModule
├── UserModule                             (no external deps)
├── AuthModule          ──imports──▶       UserModule
├── CatalogModule                          (no external deps)
└── BookingsModule      ──imports──▶       CatalogModule
```

Each arrow is a NestJS module import. No module reaches into another module's `domain/`, `application/`, or `infrastructure/` internals — only its exported providers.

---

## Module Ownership Map

| Module | Owns | Exports |
|---|---|---|
| **UserModule** | `User` entity, `UserRepositoryPort`, TypeORM persistence | `USER_REPOSITORY` binding, `GetUserByIdUseCase` |
| **AuthModule** | Register/Login use cases, `PasswordHasherPort`, `TokenServicePort`, bcrypt adapter, JWT adapter, guard, strategy | `JwtAuthGuard`, `GetCurrentUserUseCase` |
| **CatalogModule** | `Make`, `Model`, `Variant` entities + repositories + all catalog use cases | `GetVariantByIdUseCase`, `GetVariantDetailUseCase` |
| **BookingsModule** | `Booking` entity, in-memory booking repository, `CreateBookingUseCase` | — |

**Rule of thumb:** a module should be deletable without modifying any other module's internals — only the things that import it need updating.

---

## Request Lifecycle Walkthrough

`POST /auth/register { "email": "user@example.com", "password": "secret123" }` — end to end:

```
1. HTTP Request arrives
        │
        ▼
2. ValidationPipe (global, registered in main.ts)
   Runs @IsEmail() and @MinLength(8) on RegisterDto.
   Returns 400 immediately if validation fails — use case never runs.
        │
        ▼
3. AuthController.registerUser(dto: RegisterDto)
   Calls: register.execute({ email, password })
        │
        ▼
4. RegisterUseCase.execute()
   a. userRepo.findByEmail(email)          → calls UserRepositoryPort
   b. if exists → throw UserAlreadyExistsError    → jumps to step 6
   c. hasher.hash(password)                → calls PasswordHasherPort
   d. new User(uuid, email, hash, now)     → User constructor validates email format
   e. userRepo.save(user)                  → calls UserRepositoryPort
   f. tokenService.generate({ sub, email }) → calls TokenServicePort
   g. returns { token, user }
        │
        ▼
5. AuthController maps result
   AuthResponseDto.from(result)
        │
        ▼
6. HTTP Response 201
   { "accessToken": "eyJ...", "user": { "id": "...", "email": "..." } }

── Error path ─────────────────────────────────────────────────────────────────
   If UserAlreadyExistsError is thrown at step 4b:
        │
        ▼
   DomainExceptionFilter.catch()  (global, registered in main.ts)
        │
        ▼
   HTTP Response 409
   { "statusCode": 409, "error": "UserAlreadyExistsError", "message": "..." }
```

---

## API Reference

### Auth

| Method | Endpoint | Body | Auth | Description |
|---|---|---|---|---|
| `POST` | `/auth/register` | `{ email, password }` | — | Register; returns JWT |
| `POST` | `/auth/login` | `{ email, password }` | — | Login; returns JWT |
| `GET` | `/auth/me` | — | Bearer token | Get current user |

### Catalog

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/makes` | `{ name, countryOfOrigin }` | Create a make |
| `POST` | `/models` | `{ makeId, name, bodyType, yearIntroduced }` | Create a model |
| `POST` | `/variants` | `{ modelId, name, year, engineCc, priceMsrp }` | Create a variant |
| `GET` | `/variants/:id` | — | Get variant (flat) |
| `GET` | `/variants/:id/detail` | — | Get variant with nested model + make |
| `GET` | `/variants?modelId=:id` | — | List variants by model |

### Bookings

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/bookings` | `{ variantId, customerName }` | Create a booking (validates variant exists) |

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker

### 1. Clone and install

```bash
git clone <repo-url>
cd clean-code
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Default `.env` values:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=bikebook
PORT=3000

# Change JWT_SECRET to a long random string in production
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=7d
```

### 3. Start the database

```bash
docker compose up -d
```

### 4. Run the server

```bash
npm run start:dev
```

`synchronize: true` is enabled in development — TypeORM creates all tables automatically on first boot. **Never use this in production; use TypeORM migrations instead.**

### 5. Try it out

```bash
# Register a user
curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secret123"}' | jq

# Create a make
curl -s -X POST http://localhost:3000/makes \
  -H "Content-Type: application/json" \
  -d '{"name":"Honda","countryOfOrigin":"Japan"}' | jq

# Create a model (paste the make id from the response above)
curl -s -X POST http://localhost:3000/models \
  -H "Content-Type: application/json" \
  -d '{"makeId":"<make-id>","name":"CBR","bodyType":"Sport","yearIntroduced":1987}' | jq

# Create a variant
curl -s -X POST http://localhost:3000/variants \
  -H "Content-Type: application/json" \
  -d '{"modelId":"<model-id>","name":"CBR650R Standard","year":2024,"engineCc":649,"priceMsrp":9299}' | jq

# Get the variant with fully nested make and model
curl -s http://localhost:3000/variants/<variant-id>/detail | jq
```

---

## Tech Stack

| Concern | Library |
|---|---|
| Framework | NestJS 11 |
| Language | TypeScript 5 (strict mode) |
| ORM | TypeORM 1 |
| Database | PostgreSQL 16 |
| Auth | `@nestjs/jwt` + `passport-jwt` |
| Password hashing | bcrypt (12 rounds) |
| Validation | `class-validator` + `class-transformer` |
| Config | `@nestjs/config` |

---

## Key Design Decisions

### Why not share a `DomainError` base class across modules?

Each module defines its own base error (`UserDomainError`, `AuthDomainError`, `DomainError`). They are never imported across module boundaries. The global exception filter uses **duck typing** — it checks for `isDomainError === true` on the thrown object, not `instanceof DomainError`. This means modules are fully independent at the domain level. Sharing a base class would create a hard coupling between modules, making it harder to extract a module into its own service later.

### Why `@Injectable()` on use cases?

Strict Clean Architecture keeps use cases as plain classes with no framework decorators. This project accepts `@Injectable()` and `@Inject(TOKEN)` as a pragmatic tradeoff. The use cases still depend only on port interfaces — the coupling is limited to NestJS DI metadata and has no effect on runtime behavior. The benefit: `providers[]` in module files stay clean (just class names, no factory boilerplate), which makes the composition root easier to read.

### Why `autoLoadEntities: true` in AppModule?

Rather than manually listing every ORM entity in the root `TypeOrmModule.forRootAsync`, each feature module registers its own entities with `TypeOrmModule.forFeature([...])` and TypeORM picks them up automatically. Adding a new module never requires touching `app.module.ts`.

### Why is `BookingRepository` in-memory?

To demonstrate that swapping an adapter is a purely infrastructure concern. `CreateBookingUseCase` injects `BookingRepositoryPort` — it works identically whether the adapter is a `Map<string, Booking>` or a PostgreSQL table. Replacing it is a one-line change in `bookings.module.ts`.

### Why does `InvalidCredentialsError` cover both "user not found" and "wrong password"?

Returning different errors for these two cases leaks information — an attacker can enumerate which email addresses are registered. Both cases throw the same `InvalidCredentialsError("Invalid email or password")` with status 401.

### Why is `AuthModule` marked `@Global()`?

JWT authentication is a cross-cutting concern. Marking `AuthModule` global means `JwtStrategy` is registered with Passport once for the entire app. Any controller can use `@UseGuards(JwtAuthGuard)` without importing `AuthModule` in its own module file.

---

## What This Project Intentionally Omits

| Topic | Notes |
|---|---|
| **Database migrations** | `synchronize: true` is dev-only. Production uses `typeorm migration:generate` / `migration:run`. |
| **Unit tests** | The architecture makes them straightforward: inject a fake repository (a `Map<>` in memory) and the use case runs with no database. A natural next step. |
| **Refresh tokens** | JWT access tokens only. Extending to refresh tokens follows the same port/adapter pattern — add a `RefreshTokenRepositoryPort` and a new use case. |
| **Role-based access control** | `JwtAuthGuard` is in place. A `RolesGuard` + `@Roles()` decorator extends auth without touching domain code. |
| **Full CQRS / event sourcing** | The read-model pattern here is lightweight CQRS. A full command/query bus is the natural next step for larger systems. |
| **Pagination and filtering** | Repository ports can be extended with `findAll(options: PaginationOptions)` while the domain layer stays untouched. |
