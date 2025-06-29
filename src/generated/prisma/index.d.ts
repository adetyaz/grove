
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Circle
 * 
 */
export type Circle = $Result.DefaultSelection<Prisma.$CirclePayload>
/**
 * Model Invite
 * 
 */
export type Invite = $Result.DefaultSelection<Prisma.$InvitePayload>
/**
 * Model CircleInvitation
 * 
 */
export type CircleInvitation = $Result.DefaultSelection<Prisma.$CircleInvitationPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.circle`: Exposes CRUD operations for the **Circle** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Circles
    * const circles = await prisma.circle.findMany()
    * ```
    */
  get circle(): Prisma.CircleDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.invite`: Exposes CRUD operations for the **Invite** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Invites
    * const invites = await prisma.invite.findMany()
    * ```
    */
  get invite(): Prisma.InviteDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.circleInvitation`: Exposes CRUD operations for the **CircleInvitation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CircleInvitations
    * const circleInvitations = await prisma.circleInvitation.findMany()
    * ```
    */
  get circleInvitation(): Prisma.CircleInvitationDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.10.1
   * Query Engine version: 9b628578b3b7cae625e8c927178f15a170e74a9c
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Circle: 'Circle',
    Invite: 'Invite',
    CircleInvitation: 'CircleInvitation'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "circle" | "invite" | "circleInvitation"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Circle: {
        payload: Prisma.$CirclePayload<ExtArgs>
        fields: Prisma.CircleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CircleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CirclePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CircleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CirclePayload>
          }
          findFirst: {
            args: Prisma.CircleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CirclePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CircleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CirclePayload>
          }
          findMany: {
            args: Prisma.CircleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CirclePayload>[]
          }
          create: {
            args: Prisma.CircleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CirclePayload>
          }
          createMany: {
            args: Prisma.CircleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CircleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CirclePayload>[]
          }
          delete: {
            args: Prisma.CircleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CirclePayload>
          }
          update: {
            args: Prisma.CircleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CirclePayload>
          }
          deleteMany: {
            args: Prisma.CircleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CircleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CircleUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CirclePayload>[]
          }
          upsert: {
            args: Prisma.CircleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CirclePayload>
          }
          aggregate: {
            args: Prisma.CircleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCircle>
          }
          groupBy: {
            args: Prisma.CircleGroupByArgs<ExtArgs>
            result: $Utils.Optional<CircleGroupByOutputType>[]
          }
          count: {
            args: Prisma.CircleCountArgs<ExtArgs>
            result: $Utils.Optional<CircleCountAggregateOutputType> | number
          }
        }
      }
      Invite: {
        payload: Prisma.$InvitePayload<ExtArgs>
        fields: Prisma.InviteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InviteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvitePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InviteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvitePayload>
          }
          findFirst: {
            args: Prisma.InviteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvitePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InviteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvitePayload>
          }
          findMany: {
            args: Prisma.InviteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvitePayload>[]
          }
          create: {
            args: Prisma.InviteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvitePayload>
          }
          createMany: {
            args: Prisma.InviteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InviteCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvitePayload>[]
          }
          delete: {
            args: Prisma.InviteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvitePayload>
          }
          update: {
            args: Prisma.InviteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvitePayload>
          }
          deleteMany: {
            args: Prisma.InviteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InviteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.InviteUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvitePayload>[]
          }
          upsert: {
            args: Prisma.InviteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvitePayload>
          }
          aggregate: {
            args: Prisma.InviteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInvite>
          }
          groupBy: {
            args: Prisma.InviteGroupByArgs<ExtArgs>
            result: $Utils.Optional<InviteGroupByOutputType>[]
          }
          count: {
            args: Prisma.InviteCountArgs<ExtArgs>
            result: $Utils.Optional<InviteCountAggregateOutputType> | number
          }
        }
      }
      CircleInvitation: {
        payload: Prisma.$CircleInvitationPayload<ExtArgs>
        fields: Prisma.CircleInvitationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CircleInvitationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CircleInvitationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CircleInvitationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CircleInvitationPayload>
          }
          findFirst: {
            args: Prisma.CircleInvitationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CircleInvitationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CircleInvitationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CircleInvitationPayload>
          }
          findMany: {
            args: Prisma.CircleInvitationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CircleInvitationPayload>[]
          }
          create: {
            args: Prisma.CircleInvitationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CircleInvitationPayload>
          }
          createMany: {
            args: Prisma.CircleInvitationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CircleInvitationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CircleInvitationPayload>[]
          }
          delete: {
            args: Prisma.CircleInvitationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CircleInvitationPayload>
          }
          update: {
            args: Prisma.CircleInvitationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CircleInvitationPayload>
          }
          deleteMany: {
            args: Prisma.CircleInvitationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CircleInvitationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CircleInvitationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CircleInvitationPayload>[]
          }
          upsert: {
            args: Prisma.CircleInvitationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CircleInvitationPayload>
          }
          aggregate: {
            args: Prisma.CircleInvitationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCircleInvitation>
          }
          groupBy: {
            args: Prisma.CircleInvitationGroupByArgs<ExtArgs>
            result: $Utils.Optional<CircleInvitationGroupByOutputType>[]
          }
          count: {
            args: Prisma.CircleInvitationCountArgs<ExtArgs>
            result: $Utils.Optional<CircleInvitationCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    circle?: CircleOmit
    invite?: InviteOmit
    circleInvitation?: CircleInvitationOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    ownedCircles: number
    memberCircles: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    ownedCircles?: boolean | UserCountOutputTypeCountOwnedCirclesArgs
    memberCircles?: boolean | UserCountOutputTypeCountMemberCirclesArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountOwnedCirclesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CircleWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountMemberCirclesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CircleWhereInput
  }


  /**
   * Count Type CircleCountOutputType
   */

  export type CircleCountOutputType = {
    members: number
    invites: number
    invitations: number
  }

  export type CircleCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    members?: boolean | CircleCountOutputTypeCountMembersArgs
    invites?: boolean | CircleCountOutputTypeCountInvitesArgs
    invitations?: boolean | CircleCountOutputTypeCountInvitationsArgs
  }

  // Custom InputTypes
  /**
   * CircleCountOutputType without action
   */
  export type CircleCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CircleCountOutputType
     */
    select?: CircleCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CircleCountOutputType without action
   */
  export type CircleCountOutputTypeCountMembersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }

  /**
   * CircleCountOutputType without action
   */
  export type CircleCountOutputTypeCountInvitesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InviteWhereInput
  }

  /**
   * CircleCountOutputType without action
   */
  export type CircleCountOutputTypeCountInvitationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CircleInvitationWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    wallet: string | null
    createdAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    wallet: string | null
    createdAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    name: number
    wallet: number
    createdAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    name?: true
    wallet?: true
    createdAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    name?: true
    wallet?: true
    createdAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    name?: true
    wallet?: true
    createdAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    name: string | null
    wallet: string
    createdAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    wallet?: boolean
    createdAt?: boolean
    ownedCircles?: boolean | User$ownedCirclesArgs<ExtArgs>
    memberCircles?: boolean | User$memberCirclesArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    wallet?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    wallet?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    name?: boolean
    wallet?: boolean
    createdAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "name" | "wallet" | "createdAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    ownedCircles?: boolean | User$ownedCirclesArgs<ExtArgs>
    memberCircles?: boolean | User$memberCirclesArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      ownedCircles: Prisma.$CirclePayload<ExtArgs>[]
      memberCircles: Prisma.$CirclePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      name: string | null
      wallet: string
      createdAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    ownedCircles<T extends User$ownedCirclesArgs<ExtArgs> = {}>(args?: Subset<T, User$ownedCirclesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CirclePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    memberCircles<T extends User$memberCirclesArgs<ExtArgs> = {}>(args?: Subset<T, User$memberCirclesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CirclePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly wallet: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.ownedCircles
   */
  export type User$ownedCirclesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Circle
     */
    select?: CircleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Circle
     */
    omit?: CircleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CircleInclude<ExtArgs> | null
    where?: CircleWhereInput
    orderBy?: CircleOrderByWithRelationInput | CircleOrderByWithRelationInput[]
    cursor?: CircleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CircleScalarFieldEnum | CircleScalarFieldEnum[]
  }

  /**
   * User.memberCircles
   */
  export type User$memberCirclesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Circle
     */
    select?: CircleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Circle
     */
    omit?: CircleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CircleInclude<ExtArgs> | null
    where?: CircleWhereInput
    orderBy?: CircleOrderByWithRelationInput | CircleOrderByWithRelationInput[]
    cursor?: CircleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CircleScalarFieldEnum | CircleScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Circle
   */

  export type AggregateCircle = {
    _count: CircleCountAggregateOutputType | null
    _avg: CircleAvgAggregateOutputType | null
    _sum: CircleSumAggregateOutputType | null
    _min: CircleMinAggregateOutputType | null
    _max: CircleMaxAggregateOutputType | null
  }

  export type CircleAvgAggregateOutputType = {
    id: number | null
    onChainId: number | null
  }

  export type CircleSumAggregateOutputType = {
    id: number | null
    onChainId: number | null
  }

  export type CircleMinAggregateOutputType = {
    id: number | null
    name: string | null
    description: string | null
    targetAmount: string | null
    paymentType: string | null
    fixedAmount: string | null
    deadline: Date | null
    transactionHash: string | null
    ownerId: string | null
    onChainId: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CircleMaxAggregateOutputType = {
    id: number | null
    name: string | null
    description: string | null
    targetAmount: string | null
    paymentType: string | null
    fixedAmount: string | null
    deadline: Date | null
    transactionHash: string | null
    ownerId: string | null
    onChainId: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CircleCountAggregateOutputType = {
    id: number
    name: number
    description: number
    targetAmount: number
    paymentType: number
    fixedAmount: number
    deadline: number
    transactionHash: number
    ownerId: number
    onChainId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CircleAvgAggregateInputType = {
    id?: true
    onChainId?: true
  }

  export type CircleSumAggregateInputType = {
    id?: true
    onChainId?: true
  }

  export type CircleMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    targetAmount?: true
    paymentType?: true
    fixedAmount?: true
    deadline?: true
    transactionHash?: true
    ownerId?: true
    onChainId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CircleMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    targetAmount?: true
    paymentType?: true
    fixedAmount?: true
    deadline?: true
    transactionHash?: true
    ownerId?: true
    onChainId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CircleCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    targetAmount?: true
    paymentType?: true
    fixedAmount?: true
    deadline?: true
    transactionHash?: true
    ownerId?: true
    onChainId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CircleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Circle to aggregate.
     */
    where?: CircleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Circles to fetch.
     */
    orderBy?: CircleOrderByWithRelationInput | CircleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CircleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Circles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Circles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Circles
    **/
    _count?: true | CircleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CircleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CircleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CircleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CircleMaxAggregateInputType
  }

  export type GetCircleAggregateType<T extends CircleAggregateArgs> = {
        [P in keyof T & keyof AggregateCircle]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCircle[P]>
      : GetScalarType<T[P], AggregateCircle[P]>
  }




  export type CircleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CircleWhereInput
    orderBy?: CircleOrderByWithAggregationInput | CircleOrderByWithAggregationInput[]
    by: CircleScalarFieldEnum[] | CircleScalarFieldEnum
    having?: CircleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CircleCountAggregateInputType | true
    _avg?: CircleAvgAggregateInputType
    _sum?: CircleSumAggregateInputType
    _min?: CircleMinAggregateInputType
    _max?: CircleMaxAggregateInputType
  }

  export type CircleGroupByOutputType = {
    id: number
    name: string
    description: string | null
    targetAmount: string
    paymentType: string
    fixedAmount: string | null
    deadline: Date
    transactionHash: string | null
    ownerId: string
    onChainId: number | null
    createdAt: Date
    updatedAt: Date
    _count: CircleCountAggregateOutputType | null
    _avg: CircleAvgAggregateOutputType | null
    _sum: CircleSumAggregateOutputType | null
    _min: CircleMinAggregateOutputType | null
    _max: CircleMaxAggregateOutputType | null
  }

  type GetCircleGroupByPayload<T extends CircleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CircleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CircleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CircleGroupByOutputType[P]>
            : GetScalarType<T[P], CircleGroupByOutputType[P]>
        }
      >
    >


  export type CircleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    targetAmount?: boolean
    paymentType?: boolean
    fixedAmount?: boolean
    deadline?: boolean
    transactionHash?: boolean
    ownerId?: boolean
    onChainId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    owner?: boolean | UserDefaultArgs<ExtArgs>
    members?: boolean | Circle$membersArgs<ExtArgs>
    invites?: boolean | Circle$invitesArgs<ExtArgs>
    invitations?: boolean | Circle$invitationsArgs<ExtArgs>
    _count?: boolean | CircleCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["circle"]>

  export type CircleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    targetAmount?: boolean
    paymentType?: boolean
    fixedAmount?: boolean
    deadline?: boolean
    transactionHash?: boolean
    ownerId?: boolean
    onChainId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    owner?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["circle"]>

  export type CircleSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    targetAmount?: boolean
    paymentType?: boolean
    fixedAmount?: boolean
    deadline?: boolean
    transactionHash?: boolean
    ownerId?: boolean
    onChainId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    owner?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["circle"]>

  export type CircleSelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    targetAmount?: boolean
    paymentType?: boolean
    fixedAmount?: boolean
    deadline?: boolean
    transactionHash?: boolean
    ownerId?: boolean
    onChainId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CircleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "description" | "targetAmount" | "paymentType" | "fixedAmount" | "deadline" | "transactionHash" | "ownerId" | "onChainId" | "createdAt" | "updatedAt", ExtArgs["result"]["circle"]>
  export type CircleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    owner?: boolean | UserDefaultArgs<ExtArgs>
    members?: boolean | Circle$membersArgs<ExtArgs>
    invites?: boolean | Circle$invitesArgs<ExtArgs>
    invitations?: boolean | Circle$invitationsArgs<ExtArgs>
    _count?: boolean | CircleCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CircleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    owner?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type CircleIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    owner?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $CirclePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Circle"
    objects: {
      owner: Prisma.$UserPayload<ExtArgs>
      members: Prisma.$UserPayload<ExtArgs>[]
      invites: Prisma.$InvitePayload<ExtArgs>[]
      invitations: Prisma.$CircleInvitationPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      description: string | null
      targetAmount: string
      paymentType: string
      fixedAmount: string | null
      deadline: Date
      transactionHash: string | null
      ownerId: string
      onChainId: number | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["circle"]>
    composites: {}
  }

  type CircleGetPayload<S extends boolean | null | undefined | CircleDefaultArgs> = $Result.GetResult<Prisma.$CirclePayload, S>

  type CircleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CircleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CircleCountAggregateInputType | true
    }

  export interface CircleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Circle'], meta: { name: 'Circle' } }
    /**
     * Find zero or one Circle that matches the filter.
     * @param {CircleFindUniqueArgs} args - Arguments to find a Circle
     * @example
     * // Get one Circle
     * const circle = await prisma.circle.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CircleFindUniqueArgs>(args: SelectSubset<T, CircleFindUniqueArgs<ExtArgs>>): Prisma__CircleClient<$Result.GetResult<Prisma.$CirclePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Circle that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CircleFindUniqueOrThrowArgs} args - Arguments to find a Circle
     * @example
     * // Get one Circle
     * const circle = await prisma.circle.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CircleFindUniqueOrThrowArgs>(args: SelectSubset<T, CircleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CircleClient<$Result.GetResult<Prisma.$CirclePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Circle that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CircleFindFirstArgs} args - Arguments to find a Circle
     * @example
     * // Get one Circle
     * const circle = await prisma.circle.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CircleFindFirstArgs>(args?: SelectSubset<T, CircleFindFirstArgs<ExtArgs>>): Prisma__CircleClient<$Result.GetResult<Prisma.$CirclePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Circle that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CircleFindFirstOrThrowArgs} args - Arguments to find a Circle
     * @example
     * // Get one Circle
     * const circle = await prisma.circle.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CircleFindFirstOrThrowArgs>(args?: SelectSubset<T, CircleFindFirstOrThrowArgs<ExtArgs>>): Prisma__CircleClient<$Result.GetResult<Prisma.$CirclePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Circles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CircleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Circles
     * const circles = await prisma.circle.findMany()
     * 
     * // Get first 10 Circles
     * const circles = await prisma.circle.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const circleWithIdOnly = await prisma.circle.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CircleFindManyArgs>(args?: SelectSubset<T, CircleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CirclePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Circle.
     * @param {CircleCreateArgs} args - Arguments to create a Circle.
     * @example
     * // Create one Circle
     * const Circle = await prisma.circle.create({
     *   data: {
     *     // ... data to create a Circle
     *   }
     * })
     * 
     */
    create<T extends CircleCreateArgs>(args: SelectSubset<T, CircleCreateArgs<ExtArgs>>): Prisma__CircleClient<$Result.GetResult<Prisma.$CirclePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Circles.
     * @param {CircleCreateManyArgs} args - Arguments to create many Circles.
     * @example
     * // Create many Circles
     * const circle = await prisma.circle.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CircleCreateManyArgs>(args?: SelectSubset<T, CircleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Circles and returns the data saved in the database.
     * @param {CircleCreateManyAndReturnArgs} args - Arguments to create many Circles.
     * @example
     * // Create many Circles
     * const circle = await prisma.circle.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Circles and only return the `id`
     * const circleWithIdOnly = await prisma.circle.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CircleCreateManyAndReturnArgs>(args?: SelectSubset<T, CircleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CirclePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Circle.
     * @param {CircleDeleteArgs} args - Arguments to delete one Circle.
     * @example
     * // Delete one Circle
     * const Circle = await prisma.circle.delete({
     *   where: {
     *     // ... filter to delete one Circle
     *   }
     * })
     * 
     */
    delete<T extends CircleDeleteArgs>(args: SelectSubset<T, CircleDeleteArgs<ExtArgs>>): Prisma__CircleClient<$Result.GetResult<Prisma.$CirclePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Circle.
     * @param {CircleUpdateArgs} args - Arguments to update one Circle.
     * @example
     * // Update one Circle
     * const circle = await prisma.circle.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CircleUpdateArgs>(args: SelectSubset<T, CircleUpdateArgs<ExtArgs>>): Prisma__CircleClient<$Result.GetResult<Prisma.$CirclePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Circles.
     * @param {CircleDeleteManyArgs} args - Arguments to filter Circles to delete.
     * @example
     * // Delete a few Circles
     * const { count } = await prisma.circle.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CircleDeleteManyArgs>(args?: SelectSubset<T, CircleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Circles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CircleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Circles
     * const circle = await prisma.circle.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CircleUpdateManyArgs>(args: SelectSubset<T, CircleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Circles and returns the data updated in the database.
     * @param {CircleUpdateManyAndReturnArgs} args - Arguments to update many Circles.
     * @example
     * // Update many Circles
     * const circle = await prisma.circle.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Circles and only return the `id`
     * const circleWithIdOnly = await prisma.circle.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CircleUpdateManyAndReturnArgs>(args: SelectSubset<T, CircleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CirclePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Circle.
     * @param {CircleUpsertArgs} args - Arguments to update or create a Circle.
     * @example
     * // Update or create a Circle
     * const circle = await prisma.circle.upsert({
     *   create: {
     *     // ... data to create a Circle
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Circle we want to update
     *   }
     * })
     */
    upsert<T extends CircleUpsertArgs>(args: SelectSubset<T, CircleUpsertArgs<ExtArgs>>): Prisma__CircleClient<$Result.GetResult<Prisma.$CirclePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Circles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CircleCountArgs} args - Arguments to filter Circles to count.
     * @example
     * // Count the number of Circles
     * const count = await prisma.circle.count({
     *   where: {
     *     // ... the filter for the Circles we want to count
     *   }
     * })
    **/
    count<T extends CircleCountArgs>(
      args?: Subset<T, CircleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CircleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Circle.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CircleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CircleAggregateArgs>(args: Subset<T, CircleAggregateArgs>): Prisma.PrismaPromise<GetCircleAggregateType<T>>

    /**
     * Group by Circle.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CircleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CircleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CircleGroupByArgs['orderBy'] }
        : { orderBy?: CircleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CircleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCircleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Circle model
   */
  readonly fields: CircleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Circle.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CircleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    owner<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    members<T extends Circle$membersArgs<ExtArgs> = {}>(args?: Subset<T, Circle$membersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    invites<T extends Circle$invitesArgs<ExtArgs> = {}>(args?: Subset<T, Circle$invitesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InvitePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    invitations<T extends Circle$invitationsArgs<ExtArgs> = {}>(args?: Subset<T, Circle$invitationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CircleInvitationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Circle model
   */
  interface CircleFieldRefs {
    readonly id: FieldRef<"Circle", 'Int'>
    readonly name: FieldRef<"Circle", 'String'>
    readonly description: FieldRef<"Circle", 'String'>
    readonly targetAmount: FieldRef<"Circle", 'String'>
    readonly paymentType: FieldRef<"Circle", 'String'>
    readonly fixedAmount: FieldRef<"Circle", 'String'>
    readonly deadline: FieldRef<"Circle", 'DateTime'>
    readonly transactionHash: FieldRef<"Circle", 'String'>
    readonly ownerId: FieldRef<"Circle", 'String'>
    readonly onChainId: FieldRef<"Circle", 'Int'>
    readonly createdAt: FieldRef<"Circle", 'DateTime'>
    readonly updatedAt: FieldRef<"Circle", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Circle findUnique
   */
  export type CircleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Circle
     */
    select?: CircleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Circle
     */
    omit?: CircleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CircleInclude<ExtArgs> | null
    /**
     * Filter, which Circle to fetch.
     */
    where: CircleWhereUniqueInput
  }

  /**
   * Circle findUniqueOrThrow
   */
  export type CircleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Circle
     */
    select?: CircleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Circle
     */
    omit?: CircleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CircleInclude<ExtArgs> | null
    /**
     * Filter, which Circle to fetch.
     */
    where: CircleWhereUniqueInput
  }

  /**
   * Circle findFirst
   */
  export type CircleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Circle
     */
    select?: CircleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Circle
     */
    omit?: CircleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CircleInclude<ExtArgs> | null
    /**
     * Filter, which Circle to fetch.
     */
    where?: CircleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Circles to fetch.
     */
    orderBy?: CircleOrderByWithRelationInput | CircleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Circles.
     */
    cursor?: CircleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Circles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Circles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Circles.
     */
    distinct?: CircleScalarFieldEnum | CircleScalarFieldEnum[]
  }

  /**
   * Circle findFirstOrThrow
   */
  export type CircleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Circle
     */
    select?: CircleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Circle
     */
    omit?: CircleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CircleInclude<ExtArgs> | null
    /**
     * Filter, which Circle to fetch.
     */
    where?: CircleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Circles to fetch.
     */
    orderBy?: CircleOrderByWithRelationInput | CircleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Circles.
     */
    cursor?: CircleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Circles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Circles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Circles.
     */
    distinct?: CircleScalarFieldEnum | CircleScalarFieldEnum[]
  }

  /**
   * Circle findMany
   */
  export type CircleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Circle
     */
    select?: CircleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Circle
     */
    omit?: CircleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CircleInclude<ExtArgs> | null
    /**
     * Filter, which Circles to fetch.
     */
    where?: CircleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Circles to fetch.
     */
    orderBy?: CircleOrderByWithRelationInput | CircleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Circles.
     */
    cursor?: CircleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Circles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Circles.
     */
    skip?: number
    distinct?: CircleScalarFieldEnum | CircleScalarFieldEnum[]
  }

  /**
   * Circle create
   */
  export type CircleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Circle
     */
    select?: CircleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Circle
     */
    omit?: CircleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CircleInclude<ExtArgs> | null
    /**
     * The data needed to create a Circle.
     */
    data: XOR<CircleCreateInput, CircleUncheckedCreateInput>
  }

  /**
   * Circle createMany
   */
  export type CircleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Circles.
     */
    data: CircleCreateManyInput | CircleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Circle createManyAndReturn
   */
  export type CircleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Circle
     */
    select?: CircleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Circle
     */
    omit?: CircleOmit<ExtArgs> | null
    /**
     * The data used to create many Circles.
     */
    data: CircleCreateManyInput | CircleCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CircleIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Circle update
   */
  export type CircleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Circle
     */
    select?: CircleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Circle
     */
    omit?: CircleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CircleInclude<ExtArgs> | null
    /**
     * The data needed to update a Circle.
     */
    data: XOR<CircleUpdateInput, CircleUncheckedUpdateInput>
    /**
     * Choose, which Circle to update.
     */
    where: CircleWhereUniqueInput
  }

  /**
   * Circle updateMany
   */
  export type CircleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Circles.
     */
    data: XOR<CircleUpdateManyMutationInput, CircleUncheckedUpdateManyInput>
    /**
     * Filter which Circles to update
     */
    where?: CircleWhereInput
    /**
     * Limit how many Circles to update.
     */
    limit?: number
  }

  /**
   * Circle updateManyAndReturn
   */
  export type CircleUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Circle
     */
    select?: CircleSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Circle
     */
    omit?: CircleOmit<ExtArgs> | null
    /**
     * The data used to update Circles.
     */
    data: XOR<CircleUpdateManyMutationInput, CircleUncheckedUpdateManyInput>
    /**
     * Filter which Circles to update
     */
    where?: CircleWhereInput
    /**
     * Limit how many Circles to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CircleIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Circle upsert
   */
  export type CircleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Circle
     */
    select?: CircleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Circle
     */
    omit?: CircleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CircleInclude<ExtArgs> | null
    /**
     * The filter to search for the Circle to update in case it exists.
     */
    where: CircleWhereUniqueInput
    /**
     * In case the Circle found by the `where` argument doesn't exist, create a new Circle with this data.
     */
    create: XOR<CircleCreateInput, CircleUncheckedCreateInput>
    /**
     * In case the Circle was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CircleUpdateInput, CircleUncheckedUpdateInput>
  }

  /**
   * Circle delete
   */
  export type CircleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Circle
     */
    select?: CircleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Circle
     */
    omit?: CircleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CircleInclude<ExtArgs> | null
    /**
     * Filter which Circle to delete.
     */
    where: CircleWhereUniqueInput
  }

  /**
   * Circle deleteMany
   */
  export type CircleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Circles to delete
     */
    where?: CircleWhereInput
    /**
     * Limit how many Circles to delete.
     */
    limit?: number
  }

  /**
   * Circle.members
   */
  export type Circle$membersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * Circle.invites
   */
  export type Circle$invitesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invite
     */
    select?: InviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invite
     */
    omit?: InviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InviteInclude<ExtArgs> | null
    where?: InviteWhereInput
    orderBy?: InviteOrderByWithRelationInput | InviteOrderByWithRelationInput[]
    cursor?: InviteWhereUniqueInput
    take?: number
    skip?: number
    distinct?: InviteScalarFieldEnum | InviteScalarFieldEnum[]
  }

  /**
   * Circle.invitations
   */
  export type Circle$invitationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CircleInvitation
     */
    select?: CircleInvitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CircleInvitation
     */
    omit?: CircleInvitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CircleInvitationInclude<ExtArgs> | null
    where?: CircleInvitationWhereInput
    orderBy?: CircleInvitationOrderByWithRelationInput | CircleInvitationOrderByWithRelationInput[]
    cursor?: CircleInvitationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CircleInvitationScalarFieldEnum | CircleInvitationScalarFieldEnum[]
  }

  /**
   * Circle without action
   */
  export type CircleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Circle
     */
    select?: CircleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Circle
     */
    omit?: CircleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CircleInclude<ExtArgs> | null
  }


  /**
   * Model Invite
   */

  export type AggregateInvite = {
    _count: InviteCountAggregateOutputType | null
    _avg: InviteAvgAggregateOutputType | null
    _sum: InviteSumAggregateOutputType | null
    _min: InviteMinAggregateOutputType | null
    _max: InviteMaxAggregateOutputType | null
  }

  export type InviteAvgAggregateOutputType = {
    circleId: number | null
  }

  export type InviteSumAggregateOutputType = {
    circleId: number | null
  }

  export type InviteMinAggregateOutputType = {
    id: string | null
    circleId: number | null
    email: string | null
    token: string | null
    expiresAt: Date | null
    claimed: boolean | null
  }

  export type InviteMaxAggregateOutputType = {
    id: string | null
    circleId: number | null
    email: string | null
    token: string | null
    expiresAt: Date | null
    claimed: boolean | null
  }

  export type InviteCountAggregateOutputType = {
    id: number
    circleId: number
    email: number
    token: number
    expiresAt: number
    claimed: number
    _all: number
  }


  export type InviteAvgAggregateInputType = {
    circleId?: true
  }

  export type InviteSumAggregateInputType = {
    circleId?: true
  }

  export type InviteMinAggregateInputType = {
    id?: true
    circleId?: true
    email?: true
    token?: true
    expiresAt?: true
    claimed?: true
  }

  export type InviteMaxAggregateInputType = {
    id?: true
    circleId?: true
    email?: true
    token?: true
    expiresAt?: true
    claimed?: true
  }

  export type InviteCountAggregateInputType = {
    id?: true
    circleId?: true
    email?: true
    token?: true
    expiresAt?: true
    claimed?: true
    _all?: true
  }

  export type InviteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Invite to aggregate.
     */
    where?: InviteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Invites to fetch.
     */
    orderBy?: InviteOrderByWithRelationInput | InviteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InviteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Invites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Invites.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Invites
    **/
    _count?: true | InviteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: InviteAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: InviteSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InviteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InviteMaxAggregateInputType
  }

  export type GetInviteAggregateType<T extends InviteAggregateArgs> = {
        [P in keyof T & keyof AggregateInvite]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInvite[P]>
      : GetScalarType<T[P], AggregateInvite[P]>
  }




  export type InviteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InviteWhereInput
    orderBy?: InviteOrderByWithAggregationInput | InviteOrderByWithAggregationInput[]
    by: InviteScalarFieldEnum[] | InviteScalarFieldEnum
    having?: InviteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InviteCountAggregateInputType | true
    _avg?: InviteAvgAggregateInputType
    _sum?: InviteSumAggregateInputType
    _min?: InviteMinAggregateInputType
    _max?: InviteMaxAggregateInputType
  }

  export type InviteGroupByOutputType = {
    id: string
    circleId: number
    email: string
    token: string
    expiresAt: Date
    claimed: boolean
    _count: InviteCountAggregateOutputType | null
    _avg: InviteAvgAggregateOutputType | null
    _sum: InviteSumAggregateOutputType | null
    _min: InviteMinAggregateOutputType | null
    _max: InviteMaxAggregateOutputType | null
  }

  type GetInviteGroupByPayload<T extends InviteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InviteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InviteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InviteGroupByOutputType[P]>
            : GetScalarType<T[P], InviteGroupByOutputType[P]>
        }
      >
    >


  export type InviteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    circleId?: boolean
    email?: boolean
    token?: boolean
    expiresAt?: boolean
    claimed?: boolean
    circle?: boolean | CircleDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["invite"]>

  export type InviteSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    circleId?: boolean
    email?: boolean
    token?: boolean
    expiresAt?: boolean
    claimed?: boolean
    circle?: boolean | CircleDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["invite"]>

  export type InviteSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    circleId?: boolean
    email?: boolean
    token?: boolean
    expiresAt?: boolean
    claimed?: boolean
    circle?: boolean | CircleDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["invite"]>

  export type InviteSelectScalar = {
    id?: boolean
    circleId?: boolean
    email?: boolean
    token?: boolean
    expiresAt?: boolean
    claimed?: boolean
  }

  export type InviteOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "circleId" | "email" | "token" | "expiresAt" | "claimed", ExtArgs["result"]["invite"]>
  export type InviteInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    circle?: boolean | CircleDefaultArgs<ExtArgs>
  }
  export type InviteIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    circle?: boolean | CircleDefaultArgs<ExtArgs>
  }
  export type InviteIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    circle?: boolean | CircleDefaultArgs<ExtArgs>
  }

  export type $InvitePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Invite"
    objects: {
      circle: Prisma.$CirclePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      circleId: number
      email: string
      token: string
      expiresAt: Date
      claimed: boolean
    }, ExtArgs["result"]["invite"]>
    composites: {}
  }

  type InviteGetPayload<S extends boolean | null | undefined | InviteDefaultArgs> = $Result.GetResult<Prisma.$InvitePayload, S>

  type InviteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<InviteFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: InviteCountAggregateInputType | true
    }

  export interface InviteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Invite'], meta: { name: 'Invite' } }
    /**
     * Find zero or one Invite that matches the filter.
     * @param {InviteFindUniqueArgs} args - Arguments to find a Invite
     * @example
     * // Get one Invite
     * const invite = await prisma.invite.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InviteFindUniqueArgs>(args: SelectSubset<T, InviteFindUniqueArgs<ExtArgs>>): Prisma__InviteClient<$Result.GetResult<Prisma.$InvitePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Invite that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {InviteFindUniqueOrThrowArgs} args - Arguments to find a Invite
     * @example
     * // Get one Invite
     * const invite = await prisma.invite.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InviteFindUniqueOrThrowArgs>(args: SelectSubset<T, InviteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InviteClient<$Result.GetResult<Prisma.$InvitePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Invite that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InviteFindFirstArgs} args - Arguments to find a Invite
     * @example
     * // Get one Invite
     * const invite = await prisma.invite.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InviteFindFirstArgs>(args?: SelectSubset<T, InviteFindFirstArgs<ExtArgs>>): Prisma__InviteClient<$Result.GetResult<Prisma.$InvitePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Invite that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InviteFindFirstOrThrowArgs} args - Arguments to find a Invite
     * @example
     * // Get one Invite
     * const invite = await prisma.invite.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InviteFindFirstOrThrowArgs>(args?: SelectSubset<T, InviteFindFirstOrThrowArgs<ExtArgs>>): Prisma__InviteClient<$Result.GetResult<Prisma.$InvitePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Invites that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InviteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Invites
     * const invites = await prisma.invite.findMany()
     * 
     * // Get first 10 Invites
     * const invites = await prisma.invite.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const inviteWithIdOnly = await prisma.invite.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InviteFindManyArgs>(args?: SelectSubset<T, InviteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InvitePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Invite.
     * @param {InviteCreateArgs} args - Arguments to create a Invite.
     * @example
     * // Create one Invite
     * const Invite = await prisma.invite.create({
     *   data: {
     *     // ... data to create a Invite
     *   }
     * })
     * 
     */
    create<T extends InviteCreateArgs>(args: SelectSubset<T, InviteCreateArgs<ExtArgs>>): Prisma__InviteClient<$Result.GetResult<Prisma.$InvitePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Invites.
     * @param {InviteCreateManyArgs} args - Arguments to create many Invites.
     * @example
     * // Create many Invites
     * const invite = await prisma.invite.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InviteCreateManyArgs>(args?: SelectSubset<T, InviteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Invites and returns the data saved in the database.
     * @param {InviteCreateManyAndReturnArgs} args - Arguments to create many Invites.
     * @example
     * // Create many Invites
     * const invite = await prisma.invite.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Invites and only return the `id`
     * const inviteWithIdOnly = await prisma.invite.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InviteCreateManyAndReturnArgs>(args?: SelectSubset<T, InviteCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InvitePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Invite.
     * @param {InviteDeleteArgs} args - Arguments to delete one Invite.
     * @example
     * // Delete one Invite
     * const Invite = await prisma.invite.delete({
     *   where: {
     *     // ... filter to delete one Invite
     *   }
     * })
     * 
     */
    delete<T extends InviteDeleteArgs>(args: SelectSubset<T, InviteDeleteArgs<ExtArgs>>): Prisma__InviteClient<$Result.GetResult<Prisma.$InvitePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Invite.
     * @param {InviteUpdateArgs} args - Arguments to update one Invite.
     * @example
     * // Update one Invite
     * const invite = await prisma.invite.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InviteUpdateArgs>(args: SelectSubset<T, InviteUpdateArgs<ExtArgs>>): Prisma__InviteClient<$Result.GetResult<Prisma.$InvitePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Invites.
     * @param {InviteDeleteManyArgs} args - Arguments to filter Invites to delete.
     * @example
     * // Delete a few Invites
     * const { count } = await prisma.invite.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InviteDeleteManyArgs>(args?: SelectSubset<T, InviteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Invites.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InviteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Invites
     * const invite = await prisma.invite.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InviteUpdateManyArgs>(args: SelectSubset<T, InviteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Invites and returns the data updated in the database.
     * @param {InviteUpdateManyAndReturnArgs} args - Arguments to update many Invites.
     * @example
     * // Update many Invites
     * const invite = await prisma.invite.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Invites and only return the `id`
     * const inviteWithIdOnly = await prisma.invite.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends InviteUpdateManyAndReturnArgs>(args: SelectSubset<T, InviteUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InvitePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Invite.
     * @param {InviteUpsertArgs} args - Arguments to update or create a Invite.
     * @example
     * // Update or create a Invite
     * const invite = await prisma.invite.upsert({
     *   create: {
     *     // ... data to create a Invite
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Invite we want to update
     *   }
     * })
     */
    upsert<T extends InviteUpsertArgs>(args: SelectSubset<T, InviteUpsertArgs<ExtArgs>>): Prisma__InviteClient<$Result.GetResult<Prisma.$InvitePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Invites.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InviteCountArgs} args - Arguments to filter Invites to count.
     * @example
     * // Count the number of Invites
     * const count = await prisma.invite.count({
     *   where: {
     *     // ... the filter for the Invites we want to count
     *   }
     * })
    **/
    count<T extends InviteCountArgs>(
      args?: Subset<T, InviteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InviteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Invite.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InviteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends InviteAggregateArgs>(args: Subset<T, InviteAggregateArgs>): Prisma.PrismaPromise<GetInviteAggregateType<T>>

    /**
     * Group by Invite.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InviteGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends InviteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InviteGroupByArgs['orderBy'] }
        : { orderBy?: InviteGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, InviteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInviteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Invite model
   */
  readonly fields: InviteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Invite.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InviteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    circle<T extends CircleDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CircleDefaultArgs<ExtArgs>>): Prisma__CircleClient<$Result.GetResult<Prisma.$CirclePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Invite model
   */
  interface InviteFieldRefs {
    readonly id: FieldRef<"Invite", 'String'>
    readonly circleId: FieldRef<"Invite", 'Int'>
    readonly email: FieldRef<"Invite", 'String'>
    readonly token: FieldRef<"Invite", 'String'>
    readonly expiresAt: FieldRef<"Invite", 'DateTime'>
    readonly claimed: FieldRef<"Invite", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * Invite findUnique
   */
  export type InviteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invite
     */
    select?: InviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invite
     */
    omit?: InviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InviteInclude<ExtArgs> | null
    /**
     * Filter, which Invite to fetch.
     */
    where: InviteWhereUniqueInput
  }

  /**
   * Invite findUniqueOrThrow
   */
  export type InviteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invite
     */
    select?: InviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invite
     */
    omit?: InviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InviteInclude<ExtArgs> | null
    /**
     * Filter, which Invite to fetch.
     */
    where: InviteWhereUniqueInput
  }

  /**
   * Invite findFirst
   */
  export type InviteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invite
     */
    select?: InviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invite
     */
    omit?: InviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InviteInclude<ExtArgs> | null
    /**
     * Filter, which Invite to fetch.
     */
    where?: InviteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Invites to fetch.
     */
    orderBy?: InviteOrderByWithRelationInput | InviteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Invites.
     */
    cursor?: InviteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Invites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Invites.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Invites.
     */
    distinct?: InviteScalarFieldEnum | InviteScalarFieldEnum[]
  }

  /**
   * Invite findFirstOrThrow
   */
  export type InviteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invite
     */
    select?: InviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invite
     */
    omit?: InviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InviteInclude<ExtArgs> | null
    /**
     * Filter, which Invite to fetch.
     */
    where?: InviteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Invites to fetch.
     */
    orderBy?: InviteOrderByWithRelationInput | InviteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Invites.
     */
    cursor?: InviteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Invites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Invites.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Invites.
     */
    distinct?: InviteScalarFieldEnum | InviteScalarFieldEnum[]
  }

  /**
   * Invite findMany
   */
  export type InviteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invite
     */
    select?: InviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invite
     */
    omit?: InviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InviteInclude<ExtArgs> | null
    /**
     * Filter, which Invites to fetch.
     */
    where?: InviteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Invites to fetch.
     */
    orderBy?: InviteOrderByWithRelationInput | InviteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Invites.
     */
    cursor?: InviteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Invites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Invites.
     */
    skip?: number
    distinct?: InviteScalarFieldEnum | InviteScalarFieldEnum[]
  }

  /**
   * Invite create
   */
  export type InviteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invite
     */
    select?: InviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invite
     */
    omit?: InviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InviteInclude<ExtArgs> | null
    /**
     * The data needed to create a Invite.
     */
    data: XOR<InviteCreateInput, InviteUncheckedCreateInput>
  }

  /**
   * Invite createMany
   */
  export type InviteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Invites.
     */
    data: InviteCreateManyInput | InviteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Invite createManyAndReturn
   */
  export type InviteCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invite
     */
    select?: InviteSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Invite
     */
    omit?: InviteOmit<ExtArgs> | null
    /**
     * The data used to create many Invites.
     */
    data: InviteCreateManyInput | InviteCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InviteIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Invite update
   */
  export type InviteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invite
     */
    select?: InviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invite
     */
    omit?: InviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InviteInclude<ExtArgs> | null
    /**
     * The data needed to update a Invite.
     */
    data: XOR<InviteUpdateInput, InviteUncheckedUpdateInput>
    /**
     * Choose, which Invite to update.
     */
    where: InviteWhereUniqueInput
  }

  /**
   * Invite updateMany
   */
  export type InviteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Invites.
     */
    data: XOR<InviteUpdateManyMutationInput, InviteUncheckedUpdateManyInput>
    /**
     * Filter which Invites to update
     */
    where?: InviteWhereInput
    /**
     * Limit how many Invites to update.
     */
    limit?: number
  }

  /**
   * Invite updateManyAndReturn
   */
  export type InviteUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invite
     */
    select?: InviteSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Invite
     */
    omit?: InviteOmit<ExtArgs> | null
    /**
     * The data used to update Invites.
     */
    data: XOR<InviteUpdateManyMutationInput, InviteUncheckedUpdateManyInput>
    /**
     * Filter which Invites to update
     */
    where?: InviteWhereInput
    /**
     * Limit how many Invites to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InviteIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Invite upsert
   */
  export type InviteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invite
     */
    select?: InviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invite
     */
    omit?: InviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InviteInclude<ExtArgs> | null
    /**
     * The filter to search for the Invite to update in case it exists.
     */
    where: InviteWhereUniqueInput
    /**
     * In case the Invite found by the `where` argument doesn't exist, create a new Invite with this data.
     */
    create: XOR<InviteCreateInput, InviteUncheckedCreateInput>
    /**
     * In case the Invite was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InviteUpdateInput, InviteUncheckedUpdateInput>
  }

  /**
   * Invite delete
   */
  export type InviteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invite
     */
    select?: InviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invite
     */
    omit?: InviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InviteInclude<ExtArgs> | null
    /**
     * Filter which Invite to delete.
     */
    where: InviteWhereUniqueInput
  }

  /**
   * Invite deleteMany
   */
  export type InviteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Invites to delete
     */
    where?: InviteWhereInput
    /**
     * Limit how many Invites to delete.
     */
    limit?: number
  }

  /**
   * Invite without action
   */
  export type InviteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invite
     */
    select?: InviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invite
     */
    omit?: InviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InviteInclude<ExtArgs> | null
  }


  /**
   * Model CircleInvitation
   */

  export type AggregateCircleInvitation = {
    _count: CircleInvitationCountAggregateOutputType | null
    _avg: CircleInvitationAvgAggregateOutputType | null
    _sum: CircleInvitationSumAggregateOutputType | null
    _min: CircleInvitationMinAggregateOutputType | null
    _max: CircleInvitationMaxAggregateOutputType | null
  }

  export type CircleInvitationAvgAggregateOutputType = {
    circleId: number | null
  }

  export type CircleInvitationSumAggregateOutputType = {
    circleId: number | null
  }

  export type CircleInvitationMinAggregateOutputType = {
    id: string | null
    circleId: number | null
    inviterEmail: string | null
    inviteeEmail: string | null
    inviteeWalletAddress: string | null
    inviteType: string | null
    status: string | null
    expiresAt: Date | null
    createdAt: Date | null
    acceptedAt: Date | null
    acceptedByEmail: string | null
    acceptedByWalletAddress: string | null
  }

  export type CircleInvitationMaxAggregateOutputType = {
    id: string | null
    circleId: number | null
    inviterEmail: string | null
    inviteeEmail: string | null
    inviteeWalletAddress: string | null
    inviteType: string | null
    status: string | null
    expiresAt: Date | null
    createdAt: Date | null
    acceptedAt: Date | null
    acceptedByEmail: string | null
    acceptedByWalletAddress: string | null
  }

  export type CircleInvitationCountAggregateOutputType = {
    id: number
    circleId: number
    inviterEmail: number
    inviteeEmail: number
    inviteeWalletAddress: number
    inviteType: number
    status: number
    expiresAt: number
    createdAt: number
    acceptedAt: number
    acceptedByEmail: number
    acceptedByWalletAddress: number
    _all: number
  }


  export type CircleInvitationAvgAggregateInputType = {
    circleId?: true
  }

  export type CircleInvitationSumAggregateInputType = {
    circleId?: true
  }

  export type CircleInvitationMinAggregateInputType = {
    id?: true
    circleId?: true
    inviterEmail?: true
    inviteeEmail?: true
    inviteeWalletAddress?: true
    inviteType?: true
    status?: true
    expiresAt?: true
    createdAt?: true
    acceptedAt?: true
    acceptedByEmail?: true
    acceptedByWalletAddress?: true
  }

  export type CircleInvitationMaxAggregateInputType = {
    id?: true
    circleId?: true
    inviterEmail?: true
    inviteeEmail?: true
    inviteeWalletAddress?: true
    inviteType?: true
    status?: true
    expiresAt?: true
    createdAt?: true
    acceptedAt?: true
    acceptedByEmail?: true
    acceptedByWalletAddress?: true
  }

  export type CircleInvitationCountAggregateInputType = {
    id?: true
    circleId?: true
    inviterEmail?: true
    inviteeEmail?: true
    inviteeWalletAddress?: true
    inviteType?: true
    status?: true
    expiresAt?: true
    createdAt?: true
    acceptedAt?: true
    acceptedByEmail?: true
    acceptedByWalletAddress?: true
    _all?: true
  }

  export type CircleInvitationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CircleInvitation to aggregate.
     */
    where?: CircleInvitationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CircleInvitations to fetch.
     */
    orderBy?: CircleInvitationOrderByWithRelationInput | CircleInvitationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CircleInvitationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CircleInvitations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CircleInvitations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CircleInvitations
    **/
    _count?: true | CircleInvitationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CircleInvitationAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CircleInvitationSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CircleInvitationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CircleInvitationMaxAggregateInputType
  }

  export type GetCircleInvitationAggregateType<T extends CircleInvitationAggregateArgs> = {
        [P in keyof T & keyof AggregateCircleInvitation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCircleInvitation[P]>
      : GetScalarType<T[P], AggregateCircleInvitation[P]>
  }




  export type CircleInvitationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CircleInvitationWhereInput
    orderBy?: CircleInvitationOrderByWithAggregationInput | CircleInvitationOrderByWithAggregationInput[]
    by: CircleInvitationScalarFieldEnum[] | CircleInvitationScalarFieldEnum
    having?: CircleInvitationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CircleInvitationCountAggregateInputType | true
    _avg?: CircleInvitationAvgAggregateInputType
    _sum?: CircleInvitationSumAggregateInputType
    _min?: CircleInvitationMinAggregateInputType
    _max?: CircleInvitationMaxAggregateInputType
  }

  export type CircleInvitationGroupByOutputType = {
    id: string
    circleId: number
    inviterEmail: string
    inviteeEmail: string | null
    inviteeWalletAddress: string | null
    inviteType: string
    status: string
    expiresAt: Date
    createdAt: Date
    acceptedAt: Date | null
    acceptedByEmail: string | null
    acceptedByWalletAddress: string | null
    _count: CircleInvitationCountAggregateOutputType | null
    _avg: CircleInvitationAvgAggregateOutputType | null
    _sum: CircleInvitationSumAggregateOutputType | null
    _min: CircleInvitationMinAggregateOutputType | null
    _max: CircleInvitationMaxAggregateOutputType | null
  }

  type GetCircleInvitationGroupByPayload<T extends CircleInvitationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CircleInvitationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CircleInvitationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CircleInvitationGroupByOutputType[P]>
            : GetScalarType<T[P], CircleInvitationGroupByOutputType[P]>
        }
      >
    >


  export type CircleInvitationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    circleId?: boolean
    inviterEmail?: boolean
    inviteeEmail?: boolean
    inviteeWalletAddress?: boolean
    inviteType?: boolean
    status?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    acceptedAt?: boolean
    acceptedByEmail?: boolean
    acceptedByWalletAddress?: boolean
    circle?: boolean | CircleDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["circleInvitation"]>

  export type CircleInvitationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    circleId?: boolean
    inviterEmail?: boolean
    inviteeEmail?: boolean
    inviteeWalletAddress?: boolean
    inviteType?: boolean
    status?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    acceptedAt?: boolean
    acceptedByEmail?: boolean
    acceptedByWalletAddress?: boolean
    circle?: boolean | CircleDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["circleInvitation"]>

  export type CircleInvitationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    circleId?: boolean
    inviterEmail?: boolean
    inviteeEmail?: boolean
    inviteeWalletAddress?: boolean
    inviteType?: boolean
    status?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    acceptedAt?: boolean
    acceptedByEmail?: boolean
    acceptedByWalletAddress?: boolean
    circle?: boolean | CircleDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["circleInvitation"]>

  export type CircleInvitationSelectScalar = {
    id?: boolean
    circleId?: boolean
    inviterEmail?: boolean
    inviteeEmail?: boolean
    inviteeWalletAddress?: boolean
    inviteType?: boolean
    status?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    acceptedAt?: boolean
    acceptedByEmail?: boolean
    acceptedByWalletAddress?: boolean
  }

  export type CircleInvitationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "circleId" | "inviterEmail" | "inviteeEmail" | "inviteeWalletAddress" | "inviteType" | "status" | "expiresAt" | "createdAt" | "acceptedAt" | "acceptedByEmail" | "acceptedByWalletAddress", ExtArgs["result"]["circleInvitation"]>
  export type CircleInvitationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    circle?: boolean | CircleDefaultArgs<ExtArgs>
  }
  export type CircleInvitationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    circle?: boolean | CircleDefaultArgs<ExtArgs>
  }
  export type CircleInvitationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    circle?: boolean | CircleDefaultArgs<ExtArgs>
  }

  export type $CircleInvitationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CircleInvitation"
    objects: {
      circle: Prisma.$CirclePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      circleId: number
      inviterEmail: string
      inviteeEmail: string | null
      inviteeWalletAddress: string | null
      inviteType: string
      status: string
      expiresAt: Date
      createdAt: Date
      acceptedAt: Date | null
      acceptedByEmail: string | null
      acceptedByWalletAddress: string | null
    }, ExtArgs["result"]["circleInvitation"]>
    composites: {}
  }

  type CircleInvitationGetPayload<S extends boolean | null | undefined | CircleInvitationDefaultArgs> = $Result.GetResult<Prisma.$CircleInvitationPayload, S>

  type CircleInvitationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CircleInvitationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CircleInvitationCountAggregateInputType | true
    }

  export interface CircleInvitationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CircleInvitation'], meta: { name: 'CircleInvitation' } }
    /**
     * Find zero or one CircleInvitation that matches the filter.
     * @param {CircleInvitationFindUniqueArgs} args - Arguments to find a CircleInvitation
     * @example
     * // Get one CircleInvitation
     * const circleInvitation = await prisma.circleInvitation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CircleInvitationFindUniqueArgs>(args: SelectSubset<T, CircleInvitationFindUniqueArgs<ExtArgs>>): Prisma__CircleInvitationClient<$Result.GetResult<Prisma.$CircleInvitationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CircleInvitation that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CircleInvitationFindUniqueOrThrowArgs} args - Arguments to find a CircleInvitation
     * @example
     * // Get one CircleInvitation
     * const circleInvitation = await prisma.circleInvitation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CircleInvitationFindUniqueOrThrowArgs>(args: SelectSubset<T, CircleInvitationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CircleInvitationClient<$Result.GetResult<Prisma.$CircleInvitationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CircleInvitation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CircleInvitationFindFirstArgs} args - Arguments to find a CircleInvitation
     * @example
     * // Get one CircleInvitation
     * const circleInvitation = await prisma.circleInvitation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CircleInvitationFindFirstArgs>(args?: SelectSubset<T, CircleInvitationFindFirstArgs<ExtArgs>>): Prisma__CircleInvitationClient<$Result.GetResult<Prisma.$CircleInvitationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CircleInvitation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CircleInvitationFindFirstOrThrowArgs} args - Arguments to find a CircleInvitation
     * @example
     * // Get one CircleInvitation
     * const circleInvitation = await prisma.circleInvitation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CircleInvitationFindFirstOrThrowArgs>(args?: SelectSubset<T, CircleInvitationFindFirstOrThrowArgs<ExtArgs>>): Prisma__CircleInvitationClient<$Result.GetResult<Prisma.$CircleInvitationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CircleInvitations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CircleInvitationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CircleInvitations
     * const circleInvitations = await prisma.circleInvitation.findMany()
     * 
     * // Get first 10 CircleInvitations
     * const circleInvitations = await prisma.circleInvitation.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const circleInvitationWithIdOnly = await prisma.circleInvitation.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CircleInvitationFindManyArgs>(args?: SelectSubset<T, CircleInvitationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CircleInvitationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CircleInvitation.
     * @param {CircleInvitationCreateArgs} args - Arguments to create a CircleInvitation.
     * @example
     * // Create one CircleInvitation
     * const CircleInvitation = await prisma.circleInvitation.create({
     *   data: {
     *     // ... data to create a CircleInvitation
     *   }
     * })
     * 
     */
    create<T extends CircleInvitationCreateArgs>(args: SelectSubset<T, CircleInvitationCreateArgs<ExtArgs>>): Prisma__CircleInvitationClient<$Result.GetResult<Prisma.$CircleInvitationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CircleInvitations.
     * @param {CircleInvitationCreateManyArgs} args - Arguments to create many CircleInvitations.
     * @example
     * // Create many CircleInvitations
     * const circleInvitation = await prisma.circleInvitation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CircleInvitationCreateManyArgs>(args?: SelectSubset<T, CircleInvitationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CircleInvitations and returns the data saved in the database.
     * @param {CircleInvitationCreateManyAndReturnArgs} args - Arguments to create many CircleInvitations.
     * @example
     * // Create many CircleInvitations
     * const circleInvitation = await prisma.circleInvitation.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CircleInvitations and only return the `id`
     * const circleInvitationWithIdOnly = await prisma.circleInvitation.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CircleInvitationCreateManyAndReturnArgs>(args?: SelectSubset<T, CircleInvitationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CircleInvitationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CircleInvitation.
     * @param {CircleInvitationDeleteArgs} args - Arguments to delete one CircleInvitation.
     * @example
     * // Delete one CircleInvitation
     * const CircleInvitation = await prisma.circleInvitation.delete({
     *   where: {
     *     // ... filter to delete one CircleInvitation
     *   }
     * })
     * 
     */
    delete<T extends CircleInvitationDeleteArgs>(args: SelectSubset<T, CircleInvitationDeleteArgs<ExtArgs>>): Prisma__CircleInvitationClient<$Result.GetResult<Prisma.$CircleInvitationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CircleInvitation.
     * @param {CircleInvitationUpdateArgs} args - Arguments to update one CircleInvitation.
     * @example
     * // Update one CircleInvitation
     * const circleInvitation = await prisma.circleInvitation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CircleInvitationUpdateArgs>(args: SelectSubset<T, CircleInvitationUpdateArgs<ExtArgs>>): Prisma__CircleInvitationClient<$Result.GetResult<Prisma.$CircleInvitationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CircleInvitations.
     * @param {CircleInvitationDeleteManyArgs} args - Arguments to filter CircleInvitations to delete.
     * @example
     * // Delete a few CircleInvitations
     * const { count } = await prisma.circleInvitation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CircleInvitationDeleteManyArgs>(args?: SelectSubset<T, CircleInvitationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CircleInvitations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CircleInvitationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CircleInvitations
     * const circleInvitation = await prisma.circleInvitation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CircleInvitationUpdateManyArgs>(args: SelectSubset<T, CircleInvitationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CircleInvitations and returns the data updated in the database.
     * @param {CircleInvitationUpdateManyAndReturnArgs} args - Arguments to update many CircleInvitations.
     * @example
     * // Update many CircleInvitations
     * const circleInvitation = await prisma.circleInvitation.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CircleInvitations and only return the `id`
     * const circleInvitationWithIdOnly = await prisma.circleInvitation.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CircleInvitationUpdateManyAndReturnArgs>(args: SelectSubset<T, CircleInvitationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CircleInvitationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CircleInvitation.
     * @param {CircleInvitationUpsertArgs} args - Arguments to update or create a CircleInvitation.
     * @example
     * // Update or create a CircleInvitation
     * const circleInvitation = await prisma.circleInvitation.upsert({
     *   create: {
     *     // ... data to create a CircleInvitation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CircleInvitation we want to update
     *   }
     * })
     */
    upsert<T extends CircleInvitationUpsertArgs>(args: SelectSubset<T, CircleInvitationUpsertArgs<ExtArgs>>): Prisma__CircleInvitationClient<$Result.GetResult<Prisma.$CircleInvitationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CircleInvitations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CircleInvitationCountArgs} args - Arguments to filter CircleInvitations to count.
     * @example
     * // Count the number of CircleInvitations
     * const count = await prisma.circleInvitation.count({
     *   where: {
     *     // ... the filter for the CircleInvitations we want to count
     *   }
     * })
    **/
    count<T extends CircleInvitationCountArgs>(
      args?: Subset<T, CircleInvitationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CircleInvitationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CircleInvitation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CircleInvitationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CircleInvitationAggregateArgs>(args: Subset<T, CircleInvitationAggregateArgs>): Prisma.PrismaPromise<GetCircleInvitationAggregateType<T>>

    /**
     * Group by CircleInvitation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CircleInvitationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CircleInvitationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CircleInvitationGroupByArgs['orderBy'] }
        : { orderBy?: CircleInvitationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CircleInvitationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCircleInvitationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CircleInvitation model
   */
  readonly fields: CircleInvitationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CircleInvitation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CircleInvitationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    circle<T extends CircleDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CircleDefaultArgs<ExtArgs>>): Prisma__CircleClient<$Result.GetResult<Prisma.$CirclePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CircleInvitation model
   */
  interface CircleInvitationFieldRefs {
    readonly id: FieldRef<"CircleInvitation", 'String'>
    readonly circleId: FieldRef<"CircleInvitation", 'Int'>
    readonly inviterEmail: FieldRef<"CircleInvitation", 'String'>
    readonly inviteeEmail: FieldRef<"CircleInvitation", 'String'>
    readonly inviteeWalletAddress: FieldRef<"CircleInvitation", 'String'>
    readonly inviteType: FieldRef<"CircleInvitation", 'String'>
    readonly status: FieldRef<"CircleInvitation", 'String'>
    readonly expiresAt: FieldRef<"CircleInvitation", 'DateTime'>
    readonly createdAt: FieldRef<"CircleInvitation", 'DateTime'>
    readonly acceptedAt: FieldRef<"CircleInvitation", 'DateTime'>
    readonly acceptedByEmail: FieldRef<"CircleInvitation", 'String'>
    readonly acceptedByWalletAddress: FieldRef<"CircleInvitation", 'String'>
  }
    

  // Custom InputTypes
  /**
   * CircleInvitation findUnique
   */
  export type CircleInvitationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CircleInvitation
     */
    select?: CircleInvitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CircleInvitation
     */
    omit?: CircleInvitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CircleInvitationInclude<ExtArgs> | null
    /**
     * Filter, which CircleInvitation to fetch.
     */
    where: CircleInvitationWhereUniqueInput
  }

  /**
   * CircleInvitation findUniqueOrThrow
   */
  export type CircleInvitationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CircleInvitation
     */
    select?: CircleInvitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CircleInvitation
     */
    omit?: CircleInvitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CircleInvitationInclude<ExtArgs> | null
    /**
     * Filter, which CircleInvitation to fetch.
     */
    where: CircleInvitationWhereUniqueInput
  }

  /**
   * CircleInvitation findFirst
   */
  export type CircleInvitationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CircleInvitation
     */
    select?: CircleInvitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CircleInvitation
     */
    omit?: CircleInvitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CircleInvitationInclude<ExtArgs> | null
    /**
     * Filter, which CircleInvitation to fetch.
     */
    where?: CircleInvitationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CircleInvitations to fetch.
     */
    orderBy?: CircleInvitationOrderByWithRelationInput | CircleInvitationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CircleInvitations.
     */
    cursor?: CircleInvitationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CircleInvitations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CircleInvitations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CircleInvitations.
     */
    distinct?: CircleInvitationScalarFieldEnum | CircleInvitationScalarFieldEnum[]
  }

  /**
   * CircleInvitation findFirstOrThrow
   */
  export type CircleInvitationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CircleInvitation
     */
    select?: CircleInvitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CircleInvitation
     */
    omit?: CircleInvitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CircleInvitationInclude<ExtArgs> | null
    /**
     * Filter, which CircleInvitation to fetch.
     */
    where?: CircleInvitationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CircleInvitations to fetch.
     */
    orderBy?: CircleInvitationOrderByWithRelationInput | CircleInvitationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CircleInvitations.
     */
    cursor?: CircleInvitationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CircleInvitations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CircleInvitations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CircleInvitations.
     */
    distinct?: CircleInvitationScalarFieldEnum | CircleInvitationScalarFieldEnum[]
  }

  /**
   * CircleInvitation findMany
   */
  export type CircleInvitationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CircleInvitation
     */
    select?: CircleInvitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CircleInvitation
     */
    omit?: CircleInvitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CircleInvitationInclude<ExtArgs> | null
    /**
     * Filter, which CircleInvitations to fetch.
     */
    where?: CircleInvitationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CircleInvitations to fetch.
     */
    orderBy?: CircleInvitationOrderByWithRelationInput | CircleInvitationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CircleInvitations.
     */
    cursor?: CircleInvitationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CircleInvitations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CircleInvitations.
     */
    skip?: number
    distinct?: CircleInvitationScalarFieldEnum | CircleInvitationScalarFieldEnum[]
  }

  /**
   * CircleInvitation create
   */
  export type CircleInvitationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CircleInvitation
     */
    select?: CircleInvitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CircleInvitation
     */
    omit?: CircleInvitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CircleInvitationInclude<ExtArgs> | null
    /**
     * The data needed to create a CircleInvitation.
     */
    data: XOR<CircleInvitationCreateInput, CircleInvitationUncheckedCreateInput>
  }

  /**
   * CircleInvitation createMany
   */
  export type CircleInvitationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CircleInvitations.
     */
    data: CircleInvitationCreateManyInput | CircleInvitationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CircleInvitation createManyAndReturn
   */
  export type CircleInvitationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CircleInvitation
     */
    select?: CircleInvitationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CircleInvitation
     */
    omit?: CircleInvitationOmit<ExtArgs> | null
    /**
     * The data used to create many CircleInvitations.
     */
    data: CircleInvitationCreateManyInput | CircleInvitationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CircleInvitationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CircleInvitation update
   */
  export type CircleInvitationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CircleInvitation
     */
    select?: CircleInvitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CircleInvitation
     */
    omit?: CircleInvitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CircleInvitationInclude<ExtArgs> | null
    /**
     * The data needed to update a CircleInvitation.
     */
    data: XOR<CircleInvitationUpdateInput, CircleInvitationUncheckedUpdateInput>
    /**
     * Choose, which CircleInvitation to update.
     */
    where: CircleInvitationWhereUniqueInput
  }

  /**
   * CircleInvitation updateMany
   */
  export type CircleInvitationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CircleInvitations.
     */
    data: XOR<CircleInvitationUpdateManyMutationInput, CircleInvitationUncheckedUpdateManyInput>
    /**
     * Filter which CircleInvitations to update
     */
    where?: CircleInvitationWhereInput
    /**
     * Limit how many CircleInvitations to update.
     */
    limit?: number
  }

  /**
   * CircleInvitation updateManyAndReturn
   */
  export type CircleInvitationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CircleInvitation
     */
    select?: CircleInvitationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CircleInvitation
     */
    omit?: CircleInvitationOmit<ExtArgs> | null
    /**
     * The data used to update CircleInvitations.
     */
    data: XOR<CircleInvitationUpdateManyMutationInput, CircleInvitationUncheckedUpdateManyInput>
    /**
     * Filter which CircleInvitations to update
     */
    where?: CircleInvitationWhereInput
    /**
     * Limit how many CircleInvitations to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CircleInvitationIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * CircleInvitation upsert
   */
  export type CircleInvitationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CircleInvitation
     */
    select?: CircleInvitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CircleInvitation
     */
    omit?: CircleInvitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CircleInvitationInclude<ExtArgs> | null
    /**
     * The filter to search for the CircleInvitation to update in case it exists.
     */
    where: CircleInvitationWhereUniqueInput
    /**
     * In case the CircleInvitation found by the `where` argument doesn't exist, create a new CircleInvitation with this data.
     */
    create: XOR<CircleInvitationCreateInput, CircleInvitationUncheckedCreateInput>
    /**
     * In case the CircleInvitation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CircleInvitationUpdateInput, CircleInvitationUncheckedUpdateInput>
  }

  /**
   * CircleInvitation delete
   */
  export type CircleInvitationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CircleInvitation
     */
    select?: CircleInvitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CircleInvitation
     */
    omit?: CircleInvitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CircleInvitationInclude<ExtArgs> | null
    /**
     * Filter which CircleInvitation to delete.
     */
    where: CircleInvitationWhereUniqueInput
  }

  /**
   * CircleInvitation deleteMany
   */
  export type CircleInvitationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CircleInvitations to delete
     */
    where?: CircleInvitationWhereInput
    /**
     * Limit how many CircleInvitations to delete.
     */
    limit?: number
  }

  /**
   * CircleInvitation without action
   */
  export type CircleInvitationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CircleInvitation
     */
    select?: CircleInvitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CircleInvitation
     */
    omit?: CircleInvitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CircleInvitationInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    name: 'name',
    wallet: 'wallet',
    createdAt: 'createdAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const CircleScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    targetAmount: 'targetAmount',
    paymentType: 'paymentType',
    fixedAmount: 'fixedAmount',
    deadline: 'deadline',
    transactionHash: 'transactionHash',
    ownerId: 'ownerId',
    onChainId: 'onChainId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CircleScalarFieldEnum = (typeof CircleScalarFieldEnum)[keyof typeof CircleScalarFieldEnum]


  export const InviteScalarFieldEnum: {
    id: 'id',
    circleId: 'circleId',
    email: 'email',
    token: 'token',
    expiresAt: 'expiresAt',
    claimed: 'claimed'
  };

  export type InviteScalarFieldEnum = (typeof InviteScalarFieldEnum)[keyof typeof InviteScalarFieldEnum]


  export const CircleInvitationScalarFieldEnum: {
    id: 'id',
    circleId: 'circleId',
    inviterEmail: 'inviterEmail',
    inviteeEmail: 'inviteeEmail',
    inviteeWalletAddress: 'inviteeWalletAddress',
    inviteType: 'inviteType',
    status: 'status',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt',
    acceptedAt: 'acceptedAt',
    acceptedByEmail: 'acceptedByEmail',
    acceptedByWalletAddress: 'acceptedByWalletAddress'
  };

  export type CircleInvitationScalarFieldEnum = (typeof CircleInvitationScalarFieldEnum)[keyof typeof CircleInvitationScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    name?: StringNullableFilter<"User"> | string | null
    wallet?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    ownedCircles?: CircleListRelationFilter
    memberCircles?: CircleListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrderInput | SortOrder
    wallet?: SortOrder
    createdAt?: SortOrder
    ownedCircles?: CircleOrderByRelationAggregateInput
    memberCircles?: CircleOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    wallet?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    ownedCircles?: CircleListRelationFilter
    memberCircles?: CircleListRelationFilter
  }, "id" | "email" | "wallet">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrderInput | SortOrder
    wallet?: SortOrder
    createdAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    name?: StringNullableWithAggregatesFilter<"User"> | string | null
    wallet?: StringWithAggregatesFilter<"User"> | string
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type CircleWhereInput = {
    AND?: CircleWhereInput | CircleWhereInput[]
    OR?: CircleWhereInput[]
    NOT?: CircleWhereInput | CircleWhereInput[]
    id?: IntFilter<"Circle"> | number
    name?: StringFilter<"Circle"> | string
    description?: StringNullableFilter<"Circle"> | string | null
    targetAmount?: StringFilter<"Circle"> | string
    paymentType?: StringFilter<"Circle"> | string
    fixedAmount?: StringNullableFilter<"Circle"> | string | null
    deadline?: DateTimeFilter<"Circle"> | Date | string
    transactionHash?: StringNullableFilter<"Circle"> | string | null
    ownerId?: StringFilter<"Circle"> | string
    onChainId?: IntNullableFilter<"Circle"> | number | null
    createdAt?: DateTimeFilter<"Circle"> | Date | string
    updatedAt?: DateTimeFilter<"Circle"> | Date | string
    owner?: XOR<UserScalarRelationFilter, UserWhereInput>
    members?: UserListRelationFilter
    invites?: InviteListRelationFilter
    invitations?: CircleInvitationListRelationFilter
  }

  export type CircleOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    targetAmount?: SortOrder
    paymentType?: SortOrder
    fixedAmount?: SortOrderInput | SortOrder
    deadline?: SortOrder
    transactionHash?: SortOrderInput | SortOrder
    ownerId?: SortOrder
    onChainId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    owner?: UserOrderByWithRelationInput
    members?: UserOrderByRelationAggregateInput
    invites?: InviteOrderByRelationAggregateInput
    invitations?: CircleInvitationOrderByRelationAggregateInput
  }

  export type CircleWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: CircleWhereInput | CircleWhereInput[]
    OR?: CircleWhereInput[]
    NOT?: CircleWhereInput | CircleWhereInput[]
    name?: StringFilter<"Circle"> | string
    description?: StringNullableFilter<"Circle"> | string | null
    targetAmount?: StringFilter<"Circle"> | string
    paymentType?: StringFilter<"Circle"> | string
    fixedAmount?: StringNullableFilter<"Circle"> | string | null
    deadline?: DateTimeFilter<"Circle"> | Date | string
    transactionHash?: StringNullableFilter<"Circle"> | string | null
    ownerId?: StringFilter<"Circle"> | string
    onChainId?: IntNullableFilter<"Circle"> | number | null
    createdAt?: DateTimeFilter<"Circle"> | Date | string
    updatedAt?: DateTimeFilter<"Circle"> | Date | string
    owner?: XOR<UserScalarRelationFilter, UserWhereInput>
    members?: UserListRelationFilter
    invites?: InviteListRelationFilter
    invitations?: CircleInvitationListRelationFilter
  }, "id">

  export type CircleOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    targetAmount?: SortOrder
    paymentType?: SortOrder
    fixedAmount?: SortOrderInput | SortOrder
    deadline?: SortOrder
    transactionHash?: SortOrderInput | SortOrder
    ownerId?: SortOrder
    onChainId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CircleCountOrderByAggregateInput
    _avg?: CircleAvgOrderByAggregateInput
    _max?: CircleMaxOrderByAggregateInput
    _min?: CircleMinOrderByAggregateInput
    _sum?: CircleSumOrderByAggregateInput
  }

  export type CircleScalarWhereWithAggregatesInput = {
    AND?: CircleScalarWhereWithAggregatesInput | CircleScalarWhereWithAggregatesInput[]
    OR?: CircleScalarWhereWithAggregatesInput[]
    NOT?: CircleScalarWhereWithAggregatesInput | CircleScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Circle"> | number
    name?: StringWithAggregatesFilter<"Circle"> | string
    description?: StringNullableWithAggregatesFilter<"Circle"> | string | null
    targetAmount?: StringWithAggregatesFilter<"Circle"> | string
    paymentType?: StringWithAggregatesFilter<"Circle"> | string
    fixedAmount?: StringNullableWithAggregatesFilter<"Circle"> | string | null
    deadline?: DateTimeWithAggregatesFilter<"Circle"> | Date | string
    transactionHash?: StringNullableWithAggregatesFilter<"Circle"> | string | null
    ownerId?: StringWithAggregatesFilter<"Circle"> | string
    onChainId?: IntNullableWithAggregatesFilter<"Circle"> | number | null
    createdAt?: DateTimeWithAggregatesFilter<"Circle"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Circle"> | Date | string
  }

  export type InviteWhereInput = {
    AND?: InviteWhereInput | InviteWhereInput[]
    OR?: InviteWhereInput[]
    NOT?: InviteWhereInput | InviteWhereInput[]
    id?: StringFilter<"Invite"> | string
    circleId?: IntFilter<"Invite"> | number
    email?: StringFilter<"Invite"> | string
    token?: StringFilter<"Invite"> | string
    expiresAt?: DateTimeFilter<"Invite"> | Date | string
    claimed?: BoolFilter<"Invite"> | boolean
    circle?: XOR<CircleScalarRelationFilter, CircleWhereInput>
  }

  export type InviteOrderByWithRelationInput = {
    id?: SortOrder
    circleId?: SortOrder
    email?: SortOrder
    token?: SortOrder
    expiresAt?: SortOrder
    claimed?: SortOrder
    circle?: CircleOrderByWithRelationInput
  }

  export type InviteWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    token?: string
    AND?: InviteWhereInput | InviteWhereInput[]
    OR?: InviteWhereInput[]
    NOT?: InviteWhereInput | InviteWhereInput[]
    circleId?: IntFilter<"Invite"> | number
    email?: StringFilter<"Invite"> | string
    expiresAt?: DateTimeFilter<"Invite"> | Date | string
    claimed?: BoolFilter<"Invite"> | boolean
    circle?: XOR<CircleScalarRelationFilter, CircleWhereInput>
  }, "id" | "token">

  export type InviteOrderByWithAggregationInput = {
    id?: SortOrder
    circleId?: SortOrder
    email?: SortOrder
    token?: SortOrder
    expiresAt?: SortOrder
    claimed?: SortOrder
    _count?: InviteCountOrderByAggregateInput
    _avg?: InviteAvgOrderByAggregateInput
    _max?: InviteMaxOrderByAggregateInput
    _min?: InviteMinOrderByAggregateInput
    _sum?: InviteSumOrderByAggregateInput
  }

  export type InviteScalarWhereWithAggregatesInput = {
    AND?: InviteScalarWhereWithAggregatesInput | InviteScalarWhereWithAggregatesInput[]
    OR?: InviteScalarWhereWithAggregatesInput[]
    NOT?: InviteScalarWhereWithAggregatesInput | InviteScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Invite"> | string
    circleId?: IntWithAggregatesFilter<"Invite"> | number
    email?: StringWithAggregatesFilter<"Invite"> | string
    token?: StringWithAggregatesFilter<"Invite"> | string
    expiresAt?: DateTimeWithAggregatesFilter<"Invite"> | Date | string
    claimed?: BoolWithAggregatesFilter<"Invite"> | boolean
  }

  export type CircleInvitationWhereInput = {
    AND?: CircleInvitationWhereInput | CircleInvitationWhereInput[]
    OR?: CircleInvitationWhereInput[]
    NOT?: CircleInvitationWhereInput | CircleInvitationWhereInput[]
    id?: StringFilter<"CircleInvitation"> | string
    circleId?: IntFilter<"CircleInvitation"> | number
    inviterEmail?: StringFilter<"CircleInvitation"> | string
    inviteeEmail?: StringNullableFilter<"CircleInvitation"> | string | null
    inviteeWalletAddress?: StringNullableFilter<"CircleInvitation"> | string | null
    inviteType?: StringFilter<"CircleInvitation"> | string
    status?: StringFilter<"CircleInvitation"> | string
    expiresAt?: DateTimeFilter<"CircleInvitation"> | Date | string
    createdAt?: DateTimeFilter<"CircleInvitation"> | Date | string
    acceptedAt?: DateTimeNullableFilter<"CircleInvitation"> | Date | string | null
    acceptedByEmail?: StringNullableFilter<"CircleInvitation"> | string | null
    acceptedByWalletAddress?: StringNullableFilter<"CircleInvitation"> | string | null
    circle?: XOR<CircleScalarRelationFilter, CircleWhereInput>
  }

  export type CircleInvitationOrderByWithRelationInput = {
    id?: SortOrder
    circleId?: SortOrder
    inviterEmail?: SortOrder
    inviteeEmail?: SortOrderInput | SortOrder
    inviteeWalletAddress?: SortOrderInput | SortOrder
    inviteType?: SortOrder
    status?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    acceptedAt?: SortOrderInput | SortOrder
    acceptedByEmail?: SortOrderInput | SortOrder
    acceptedByWalletAddress?: SortOrderInput | SortOrder
    circle?: CircleOrderByWithRelationInput
  }

  export type CircleInvitationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CircleInvitationWhereInput | CircleInvitationWhereInput[]
    OR?: CircleInvitationWhereInput[]
    NOT?: CircleInvitationWhereInput | CircleInvitationWhereInput[]
    circleId?: IntFilter<"CircleInvitation"> | number
    inviterEmail?: StringFilter<"CircleInvitation"> | string
    inviteeEmail?: StringNullableFilter<"CircleInvitation"> | string | null
    inviteeWalletAddress?: StringNullableFilter<"CircleInvitation"> | string | null
    inviteType?: StringFilter<"CircleInvitation"> | string
    status?: StringFilter<"CircleInvitation"> | string
    expiresAt?: DateTimeFilter<"CircleInvitation"> | Date | string
    createdAt?: DateTimeFilter<"CircleInvitation"> | Date | string
    acceptedAt?: DateTimeNullableFilter<"CircleInvitation"> | Date | string | null
    acceptedByEmail?: StringNullableFilter<"CircleInvitation"> | string | null
    acceptedByWalletAddress?: StringNullableFilter<"CircleInvitation"> | string | null
    circle?: XOR<CircleScalarRelationFilter, CircleWhereInput>
  }, "id">

  export type CircleInvitationOrderByWithAggregationInput = {
    id?: SortOrder
    circleId?: SortOrder
    inviterEmail?: SortOrder
    inviteeEmail?: SortOrderInput | SortOrder
    inviteeWalletAddress?: SortOrderInput | SortOrder
    inviteType?: SortOrder
    status?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    acceptedAt?: SortOrderInput | SortOrder
    acceptedByEmail?: SortOrderInput | SortOrder
    acceptedByWalletAddress?: SortOrderInput | SortOrder
    _count?: CircleInvitationCountOrderByAggregateInput
    _avg?: CircleInvitationAvgOrderByAggregateInput
    _max?: CircleInvitationMaxOrderByAggregateInput
    _min?: CircleInvitationMinOrderByAggregateInput
    _sum?: CircleInvitationSumOrderByAggregateInput
  }

  export type CircleInvitationScalarWhereWithAggregatesInput = {
    AND?: CircleInvitationScalarWhereWithAggregatesInput | CircleInvitationScalarWhereWithAggregatesInput[]
    OR?: CircleInvitationScalarWhereWithAggregatesInput[]
    NOT?: CircleInvitationScalarWhereWithAggregatesInput | CircleInvitationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CircleInvitation"> | string
    circleId?: IntWithAggregatesFilter<"CircleInvitation"> | number
    inviterEmail?: StringWithAggregatesFilter<"CircleInvitation"> | string
    inviteeEmail?: StringNullableWithAggregatesFilter<"CircleInvitation"> | string | null
    inviteeWalletAddress?: StringNullableWithAggregatesFilter<"CircleInvitation"> | string | null
    inviteType?: StringWithAggregatesFilter<"CircleInvitation"> | string
    status?: StringWithAggregatesFilter<"CircleInvitation"> | string
    expiresAt?: DateTimeWithAggregatesFilter<"CircleInvitation"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"CircleInvitation"> | Date | string
    acceptedAt?: DateTimeNullableWithAggregatesFilter<"CircleInvitation"> | Date | string | null
    acceptedByEmail?: StringNullableWithAggregatesFilter<"CircleInvitation"> | string | null
    acceptedByWalletAddress?: StringNullableWithAggregatesFilter<"CircleInvitation"> | string | null
  }

  export type UserCreateInput = {
    id?: string
    email: string
    name?: string | null
    wallet: string
    createdAt?: Date | string
    ownedCircles?: CircleCreateNestedManyWithoutOwnerInput
    memberCircles?: CircleCreateNestedManyWithoutMembersInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    name?: string | null
    wallet: string
    createdAt?: Date | string
    ownedCircles?: CircleUncheckedCreateNestedManyWithoutOwnerInput
    memberCircles?: CircleUncheckedCreateNestedManyWithoutMembersInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    wallet?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownedCircles?: CircleUpdateManyWithoutOwnerNestedInput
    memberCircles?: CircleUpdateManyWithoutMembersNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    wallet?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownedCircles?: CircleUncheckedUpdateManyWithoutOwnerNestedInput
    memberCircles?: CircleUncheckedUpdateManyWithoutMembersNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    name?: string | null
    wallet: string
    createdAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    wallet?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    wallet?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CircleCreateInput = {
    name: string
    description?: string | null
    targetAmount: string
    paymentType: string
    fixedAmount?: string | null
    deadline: Date | string
    transactionHash?: string | null
    onChainId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    owner: UserCreateNestedOneWithoutOwnedCirclesInput
    members?: UserCreateNestedManyWithoutMemberCirclesInput
    invites?: InviteCreateNestedManyWithoutCircleInput
    invitations?: CircleInvitationCreateNestedManyWithoutCircleInput
  }

  export type CircleUncheckedCreateInput = {
    id?: number
    name: string
    description?: string | null
    targetAmount: string
    paymentType: string
    fixedAmount?: string | null
    deadline: Date | string
    transactionHash?: string | null
    ownerId: string
    onChainId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    members?: UserUncheckedCreateNestedManyWithoutMemberCirclesInput
    invites?: InviteUncheckedCreateNestedManyWithoutCircleInput
    invitations?: CircleInvitationUncheckedCreateNestedManyWithoutCircleInput
  }

  export type CircleUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    targetAmount?: StringFieldUpdateOperationsInput | string
    paymentType?: StringFieldUpdateOperationsInput | string
    fixedAmount?: NullableStringFieldUpdateOperationsInput | string | null
    deadline?: DateTimeFieldUpdateOperationsInput | Date | string
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    onChainId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    owner?: UserUpdateOneRequiredWithoutOwnedCirclesNestedInput
    members?: UserUpdateManyWithoutMemberCirclesNestedInput
    invites?: InviteUpdateManyWithoutCircleNestedInput
    invitations?: CircleInvitationUpdateManyWithoutCircleNestedInput
  }

  export type CircleUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    targetAmount?: StringFieldUpdateOperationsInput | string
    paymentType?: StringFieldUpdateOperationsInput | string
    fixedAmount?: NullableStringFieldUpdateOperationsInput | string | null
    deadline?: DateTimeFieldUpdateOperationsInput | Date | string
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    ownerId?: StringFieldUpdateOperationsInput | string
    onChainId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    members?: UserUncheckedUpdateManyWithoutMemberCirclesNestedInput
    invites?: InviteUncheckedUpdateManyWithoutCircleNestedInput
    invitations?: CircleInvitationUncheckedUpdateManyWithoutCircleNestedInput
  }

  export type CircleCreateManyInput = {
    id?: number
    name: string
    description?: string | null
    targetAmount: string
    paymentType: string
    fixedAmount?: string | null
    deadline: Date | string
    transactionHash?: string | null
    ownerId: string
    onChainId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CircleUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    targetAmount?: StringFieldUpdateOperationsInput | string
    paymentType?: StringFieldUpdateOperationsInput | string
    fixedAmount?: NullableStringFieldUpdateOperationsInput | string | null
    deadline?: DateTimeFieldUpdateOperationsInput | Date | string
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    onChainId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CircleUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    targetAmount?: StringFieldUpdateOperationsInput | string
    paymentType?: StringFieldUpdateOperationsInput | string
    fixedAmount?: NullableStringFieldUpdateOperationsInput | string | null
    deadline?: DateTimeFieldUpdateOperationsInput | Date | string
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    ownerId?: StringFieldUpdateOperationsInput | string
    onChainId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InviteCreateInput = {
    id?: string
    email: string
    token: string
    expiresAt: Date | string
    claimed?: boolean
    circle: CircleCreateNestedOneWithoutInvitesInput
  }

  export type InviteUncheckedCreateInput = {
    id?: string
    circleId: number
    email: string
    token: string
    expiresAt: Date | string
    claimed?: boolean
  }

  export type InviteUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    claimed?: BoolFieldUpdateOperationsInput | boolean
    circle?: CircleUpdateOneRequiredWithoutInvitesNestedInput
  }

  export type InviteUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    circleId?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    claimed?: BoolFieldUpdateOperationsInput | boolean
  }

  export type InviteCreateManyInput = {
    id?: string
    circleId: number
    email: string
    token: string
    expiresAt: Date | string
    claimed?: boolean
  }

  export type InviteUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    claimed?: BoolFieldUpdateOperationsInput | boolean
  }

  export type InviteUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    circleId?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    claimed?: BoolFieldUpdateOperationsInput | boolean
  }

  export type CircleInvitationCreateInput = {
    id?: string
    inviterEmail: string
    inviteeEmail?: string | null
    inviteeWalletAddress?: string | null
    inviteType: string
    status?: string
    expiresAt: Date | string
    createdAt?: Date | string
    acceptedAt?: Date | string | null
    acceptedByEmail?: string | null
    acceptedByWalletAddress?: string | null
    circle: CircleCreateNestedOneWithoutInvitationsInput
  }

  export type CircleInvitationUncheckedCreateInput = {
    id?: string
    circleId: number
    inviterEmail: string
    inviteeEmail?: string | null
    inviteeWalletAddress?: string | null
    inviteType: string
    status?: string
    expiresAt: Date | string
    createdAt?: Date | string
    acceptedAt?: Date | string | null
    acceptedByEmail?: string | null
    acceptedByWalletAddress?: string | null
  }

  export type CircleInvitationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    inviterEmail?: StringFieldUpdateOperationsInput | string
    inviteeEmail?: NullableStringFieldUpdateOperationsInput | string | null
    inviteeWalletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    inviteType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    acceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    acceptedByEmail?: NullableStringFieldUpdateOperationsInput | string | null
    acceptedByWalletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    circle?: CircleUpdateOneRequiredWithoutInvitationsNestedInput
  }

  export type CircleInvitationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    circleId?: IntFieldUpdateOperationsInput | number
    inviterEmail?: StringFieldUpdateOperationsInput | string
    inviteeEmail?: NullableStringFieldUpdateOperationsInput | string | null
    inviteeWalletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    inviteType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    acceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    acceptedByEmail?: NullableStringFieldUpdateOperationsInput | string | null
    acceptedByWalletAddress?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type CircleInvitationCreateManyInput = {
    id?: string
    circleId: number
    inviterEmail: string
    inviteeEmail?: string | null
    inviteeWalletAddress?: string | null
    inviteType: string
    status?: string
    expiresAt: Date | string
    createdAt?: Date | string
    acceptedAt?: Date | string | null
    acceptedByEmail?: string | null
    acceptedByWalletAddress?: string | null
  }

  export type CircleInvitationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    inviterEmail?: StringFieldUpdateOperationsInput | string
    inviteeEmail?: NullableStringFieldUpdateOperationsInput | string | null
    inviteeWalletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    inviteType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    acceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    acceptedByEmail?: NullableStringFieldUpdateOperationsInput | string | null
    acceptedByWalletAddress?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type CircleInvitationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    circleId?: IntFieldUpdateOperationsInput | number
    inviterEmail?: StringFieldUpdateOperationsInput | string
    inviteeEmail?: NullableStringFieldUpdateOperationsInput | string | null
    inviteeWalletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    inviteType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    acceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    acceptedByEmail?: NullableStringFieldUpdateOperationsInput | string | null
    acceptedByWalletAddress?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type CircleListRelationFilter = {
    every?: CircleWhereInput
    some?: CircleWhereInput
    none?: CircleWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type CircleOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    wallet?: SortOrder
    createdAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    wallet?: SortOrder
    createdAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    wallet?: SortOrder
    createdAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type UserListRelationFilter = {
    every?: UserWhereInput
    some?: UserWhereInput
    none?: UserWhereInput
  }

  export type InviteListRelationFilter = {
    every?: InviteWhereInput
    some?: InviteWhereInput
    none?: InviteWhereInput
  }

  export type CircleInvitationListRelationFilter = {
    every?: CircleInvitationWhereInput
    some?: CircleInvitationWhereInput
    none?: CircleInvitationWhereInput
  }

  export type UserOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type InviteOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CircleInvitationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CircleCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    targetAmount?: SortOrder
    paymentType?: SortOrder
    fixedAmount?: SortOrder
    deadline?: SortOrder
    transactionHash?: SortOrder
    ownerId?: SortOrder
    onChainId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CircleAvgOrderByAggregateInput = {
    id?: SortOrder
    onChainId?: SortOrder
  }

  export type CircleMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    targetAmount?: SortOrder
    paymentType?: SortOrder
    fixedAmount?: SortOrder
    deadline?: SortOrder
    transactionHash?: SortOrder
    ownerId?: SortOrder
    onChainId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CircleMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    targetAmount?: SortOrder
    paymentType?: SortOrder
    fixedAmount?: SortOrder
    deadline?: SortOrder
    transactionHash?: SortOrder
    ownerId?: SortOrder
    onChainId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CircleSumOrderByAggregateInput = {
    id?: SortOrder
    onChainId?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type CircleScalarRelationFilter = {
    is?: CircleWhereInput
    isNot?: CircleWhereInput
  }

  export type InviteCountOrderByAggregateInput = {
    id?: SortOrder
    circleId?: SortOrder
    email?: SortOrder
    token?: SortOrder
    expiresAt?: SortOrder
    claimed?: SortOrder
  }

  export type InviteAvgOrderByAggregateInput = {
    circleId?: SortOrder
  }

  export type InviteMaxOrderByAggregateInput = {
    id?: SortOrder
    circleId?: SortOrder
    email?: SortOrder
    token?: SortOrder
    expiresAt?: SortOrder
    claimed?: SortOrder
  }

  export type InviteMinOrderByAggregateInput = {
    id?: SortOrder
    circleId?: SortOrder
    email?: SortOrder
    token?: SortOrder
    expiresAt?: SortOrder
    claimed?: SortOrder
  }

  export type InviteSumOrderByAggregateInput = {
    circleId?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type CircleInvitationCountOrderByAggregateInput = {
    id?: SortOrder
    circleId?: SortOrder
    inviterEmail?: SortOrder
    inviteeEmail?: SortOrder
    inviteeWalletAddress?: SortOrder
    inviteType?: SortOrder
    status?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    acceptedAt?: SortOrder
    acceptedByEmail?: SortOrder
    acceptedByWalletAddress?: SortOrder
  }

  export type CircleInvitationAvgOrderByAggregateInput = {
    circleId?: SortOrder
  }

  export type CircleInvitationMaxOrderByAggregateInput = {
    id?: SortOrder
    circleId?: SortOrder
    inviterEmail?: SortOrder
    inviteeEmail?: SortOrder
    inviteeWalletAddress?: SortOrder
    inviteType?: SortOrder
    status?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    acceptedAt?: SortOrder
    acceptedByEmail?: SortOrder
    acceptedByWalletAddress?: SortOrder
  }

  export type CircleInvitationMinOrderByAggregateInput = {
    id?: SortOrder
    circleId?: SortOrder
    inviterEmail?: SortOrder
    inviteeEmail?: SortOrder
    inviteeWalletAddress?: SortOrder
    inviteType?: SortOrder
    status?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    acceptedAt?: SortOrder
    acceptedByEmail?: SortOrder
    acceptedByWalletAddress?: SortOrder
  }

  export type CircleInvitationSumOrderByAggregateInput = {
    circleId?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type CircleCreateNestedManyWithoutOwnerInput = {
    create?: XOR<CircleCreateWithoutOwnerInput, CircleUncheckedCreateWithoutOwnerInput> | CircleCreateWithoutOwnerInput[] | CircleUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: CircleCreateOrConnectWithoutOwnerInput | CircleCreateOrConnectWithoutOwnerInput[]
    createMany?: CircleCreateManyOwnerInputEnvelope
    connect?: CircleWhereUniqueInput | CircleWhereUniqueInput[]
  }

  export type CircleCreateNestedManyWithoutMembersInput = {
    create?: XOR<CircleCreateWithoutMembersInput, CircleUncheckedCreateWithoutMembersInput> | CircleCreateWithoutMembersInput[] | CircleUncheckedCreateWithoutMembersInput[]
    connectOrCreate?: CircleCreateOrConnectWithoutMembersInput | CircleCreateOrConnectWithoutMembersInput[]
    connect?: CircleWhereUniqueInput | CircleWhereUniqueInput[]
  }

  export type CircleUncheckedCreateNestedManyWithoutOwnerInput = {
    create?: XOR<CircleCreateWithoutOwnerInput, CircleUncheckedCreateWithoutOwnerInput> | CircleCreateWithoutOwnerInput[] | CircleUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: CircleCreateOrConnectWithoutOwnerInput | CircleCreateOrConnectWithoutOwnerInput[]
    createMany?: CircleCreateManyOwnerInputEnvelope
    connect?: CircleWhereUniqueInput | CircleWhereUniqueInput[]
  }

  export type CircleUncheckedCreateNestedManyWithoutMembersInput = {
    create?: XOR<CircleCreateWithoutMembersInput, CircleUncheckedCreateWithoutMembersInput> | CircleCreateWithoutMembersInput[] | CircleUncheckedCreateWithoutMembersInput[]
    connectOrCreate?: CircleCreateOrConnectWithoutMembersInput | CircleCreateOrConnectWithoutMembersInput[]
    connect?: CircleWhereUniqueInput | CircleWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type CircleUpdateManyWithoutOwnerNestedInput = {
    create?: XOR<CircleCreateWithoutOwnerInput, CircleUncheckedCreateWithoutOwnerInput> | CircleCreateWithoutOwnerInput[] | CircleUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: CircleCreateOrConnectWithoutOwnerInput | CircleCreateOrConnectWithoutOwnerInput[]
    upsert?: CircleUpsertWithWhereUniqueWithoutOwnerInput | CircleUpsertWithWhereUniqueWithoutOwnerInput[]
    createMany?: CircleCreateManyOwnerInputEnvelope
    set?: CircleWhereUniqueInput | CircleWhereUniqueInput[]
    disconnect?: CircleWhereUniqueInput | CircleWhereUniqueInput[]
    delete?: CircleWhereUniqueInput | CircleWhereUniqueInput[]
    connect?: CircleWhereUniqueInput | CircleWhereUniqueInput[]
    update?: CircleUpdateWithWhereUniqueWithoutOwnerInput | CircleUpdateWithWhereUniqueWithoutOwnerInput[]
    updateMany?: CircleUpdateManyWithWhereWithoutOwnerInput | CircleUpdateManyWithWhereWithoutOwnerInput[]
    deleteMany?: CircleScalarWhereInput | CircleScalarWhereInput[]
  }

  export type CircleUpdateManyWithoutMembersNestedInput = {
    create?: XOR<CircleCreateWithoutMembersInput, CircleUncheckedCreateWithoutMembersInput> | CircleCreateWithoutMembersInput[] | CircleUncheckedCreateWithoutMembersInput[]
    connectOrCreate?: CircleCreateOrConnectWithoutMembersInput | CircleCreateOrConnectWithoutMembersInput[]
    upsert?: CircleUpsertWithWhereUniqueWithoutMembersInput | CircleUpsertWithWhereUniqueWithoutMembersInput[]
    set?: CircleWhereUniqueInput | CircleWhereUniqueInput[]
    disconnect?: CircleWhereUniqueInput | CircleWhereUniqueInput[]
    delete?: CircleWhereUniqueInput | CircleWhereUniqueInput[]
    connect?: CircleWhereUniqueInput | CircleWhereUniqueInput[]
    update?: CircleUpdateWithWhereUniqueWithoutMembersInput | CircleUpdateWithWhereUniqueWithoutMembersInput[]
    updateMany?: CircleUpdateManyWithWhereWithoutMembersInput | CircleUpdateManyWithWhereWithoutMembersInput[]
    deleteMany?: CircleScalarWhereInput | CircleScalarWhereInput[]
  }

  export type CircleUncheckedUpdateManyWithoutOwnerNestedInput = {
    create?: XOR<CircleCreateWithoutOwnerInput, CircleUncheckedCreateWithoutOwnerInput> | CircleCreateWithoutOwnerInput[] | CircleUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: CircleCreateOrConnectWithoutOwnerInput | CircleCreateOrConnectWithoutOwnerInput[]
    upsert?: CircleUpsertWithWhereUniqueWithoutOwnerInput | CircleUpsertWithWhereUniqueWithoutOwnerInput[]
    createMany?: CircleCreateManyOwnerInputEnvelope
    set?: CircleWhereUniqueInput | CircleWhereUniqueInput[]
    disconnect?: CircleWhereUniqueInput | CircleWhereUniqueInput[]
    delete?: CircleWhereUniqueInput | CircleWhereUniqueInput[]
    connect?: CircleWhereUniqueInput | CircleWhereUniqueInput[]
    update?: CircleUpdateWithWhereUniqueWithoutOwnerInput | CircleUpdateWithWhereUniqueWithoutOwnerInput[]
    updateMany?: CircleUpdateManyWithWhereWithoutOwnerInput | CircleUpdateManyWithWhereWithoutOwnerInput[]
    deleteMany?: CircleScalarWhereInput | CircleScalarWhereInput[]
  }

  export type CircleUncheckedUpdateManyWithoutMembersNestedInput = {
    create?: XOR<CircleCreateWithoutMembersInput, CircleUncheckedCreateWithoutMembersInput> | CircleCreateWithoutMembersInput[] | CircleUncheckedCreateWithoutMembersInput[]
    connectOrCreate?: CircleCreateOrConnectWithoutMembersInput | CircleCreateOrConnectWithoutMembersInput[]
    upsert?: CircleUpsertWithWhereUniqueWithoutMembersInput | CircleUpsertWithWhereUniqueWithoutMembersInput[]
    set?: CircleWhereUniqueInput | CircleWhereUniqueInput[]
    disconnect?: CircleWhereUniqueInput | CircleWhereUniqueInput[]
    delete?: CircleWhereUniqueInput | CircleWhereUniqueInput[]
    connect?: CircleWhereUniqueInput | CircleWhereUniqueInput[]
    update?: CircleUpdateWithWhereUniqueWithoutMembersInput | CircleUpdateWithWhereUniqueWithoutMembersInput[]
    updateMany?: CircleUpdateManyWithWhereWithoutMembersInput | CircleUpdateManyWithWhereWithoutMembersInput[]
    deleteMany?: CircleScalarWhereInput | CircleScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutOwnedCirclesInput = {
    create?: XOR<UserCreateWithoutOwnedCirclesInput, UserUncheckedCreateWithoutOwnedCirclesInput>
    connectOrCreate?: UserCreateOrConnectWithoutOwnedCirclesInput
    connect?: UserWhereUniqueInput
  }

  export type UserCreateNestedManyWithoutMemberCirclesInput = {
    create?: XOR<UserCreateWithoutMemberCirclesInput, UserUncheckedCreateWithoutMemberCirclesInput> | UserCreateWithoutMemberCirclesInput[] | UserUncheckedCreateWithoutMemberCirclesInput[]
    connectOrCreate?: UserCreateOrConnectWithoutMemberCirclesInput | UserCreateOrConnectWithoutMemberCirclesInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type InviteCreateNestedManyWithoutCircleInput = {
    create?: XOR<InviteCreateWithoutCircleInput, InviteUncheckedCreateWithoutCircleInput> | InviteCreateWithoutCircleInput[] | InviteUncheckedCreateWithoutCircleInput[]
    connectOrCreate?: InviteCreateOrConnectWithoutCircleInput | InviteCreateOrConnectWithoutCircleInput[]
    createMany?: InviteCreateManyCircleInputEnvelope
    connect?: InviteWhereUniqueInput | InviteWhereUniqueInput[]
  }

  export type CircleInvitationCreateNestedManyWithoutCircleInput = {
    create?: XOR<CircleInvitationCreateWithoutCircleInput, CircleInvitationUncheckedCreateWithoutCircleInput> | CircleInvitationCreateWithoutCircleInput[] | CircleInvitationUncheckedCreateWithoutCircleInput[]
    connectOrCreate?: CircleInvitationCreateOrConnectWithoutCircleInput | CircleInvitationCreateOrConnectWithoutCircleInput[]
    createMany?: CircleInvitationCreateManyCircleInputEnvelope
    connect?: CircleInvitationWhereUniqueInput | CircleInvitationWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutMemberCirclesInput = {
    create?: XOR<UserCreateWithoutMemberCirclesInput, UserUncheckedCreateWithoutMemberCirclesInput> | UserCreateWithoutMemberCirclesInput[] | UserUncheckedCreateWithoutMemberCirclesInput[]
    connectOrCreate?: UserCreateOrConnectWithoutMemberCirclesInput | UserCreateOrConnectWithoutMemberCirclesInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type InviteUncheckedCreateNestedManyWithoutCircleInput = {
    create?: XOR<InviteCreateWithoutCircleInput, InviteUncheckedCreateWithoutCircleInput> | InviteCreateWithoutCircleInput[] | InviteUncheckedCreateWithoutCircleInput[]
    connectOrCreate?: InviteCreateOrConnectWithoutCircleInput | InviteCreateOrConnectWithoutCircleInput[]
    createMany?: InviteCreateManyCircleInputEnvelope
    connect?: InviteWhereUniqueInput | InviteWhereUniqueInput[]
  }

  export type CircleInvitationUncheckedCreateNestedManyWithoutCircleInput = {
    create?: XOR<CircleInvitationCreateWithoutCircleInput, CircleInvitationUncheckedCreateWithoutCircleInput> | CircleInvitationCreateWithoutCircleInput[] | CircleInvitationUncheckedCreateWithoutCircleInput[]
    connectOrCreate?: CircleInvitationCreateOrConnectWithoutCircleInput | CircleInvitationCreateOrConnectWithoutCircleInput[]
    createMany?: CircleInvitationCreateManyCircleInputEnvelope
    connect?: CircleInvitationWhereUniqueInput | CircleInvitationWhereUniqueInput[]
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserUpdateOneRequiredWithoutOwnedCirclesNestedInput = {
    create?: XOR<UserCreateWithoutOwnedCirclesInput, UserUncheckedCreateWithoutOwnedCirclesInput>
    connectOrCreate?: UserCreateOrConnectWithoutOwnedCirclesInput
    upsert?: UserUpsertWithoutOwnedCirclesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutOwnedCirclesInput, UserUpdateWithoutOwnedCirclesInput>, UserUncheckedUpdateWithoutOwnedCirclesInput>
  }

  export type UserUpdateManyWithoutMemberCirclesNestedInput = {
    create?: XOR<UserCreateWithoutMemberCirclesInput, UserUncheckedCreateWithoutMemberCirclesInput> | UserCreateWithoutMemberCirclesInput[] | UserUncheckedCreateWithoutMemberCirclesInput[]
    connectOrCreate?: UserCreateOrConnectWithoutMemberCirclesInput | UserCreateOrConnectWithoutMemberCirclesInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutMemberCirclesInput | UserUpsertWithWhereUniqueWithoutMemberCirclesInput[]
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutMemberCirclesInput | UserUpdateWithWhereUniqueWithoutMemberCirclesInput[]
    updateMany?: UserUpdateManyWithWhereWithoutMemberCirclesInput | UserUpdateManyWithWhereWithoutMemberCirclesInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type InviteUpdateManyWithoutCircleNestedInput = {
    create?: XOR<InviteCreateWithoutCircleInput, InviteUncheckedCreateWithoutCircleInput> | InviteCreateWithoutCircleInput[] | InviteUncheckedCreateWithoutCircleInput[]
    connectOrCreate?: InviteCreateOrConnectWithoutCircleInput | InviteCreateOrConnectWithoutCircleInput[]
    upsert?: InviteUpsertWithWhereUniqueWithoutCircleInput | InviteUpsertWithWhereUniqueWithoutCircleInput[]
    createMany?: InviteCreateManyCircleInputEnvelope
    set?: InviteWhereUniqueInput | InviteWhereUniqueInput[]
    disconnect?: InviteWhereUniqueInput | InviteWhereUniqueInput[]
    delete?: InviteWhereUniqueInput | InviteWhereUniqueInput[]
    connect?: InviteWhereUniqueInput | InviteWhereUniqueInput[]
    update?: InviteUpdateWithWhereUniqueWithoutCircleInput | InviteUpdateWithWhereUniqueWithoutCircleInput[]
    updateMany?: InviteUpdateManyWithWhereWithoutCircleInput | InviteUpdateManyWithWhereWithoutCircleInput[]
    deleteMany?: InviteScalarWhereInput | InviteScalarWhereInput[]
  }

  export type CircleInvitationUpdateManyWithoutCircleNestedInput = {
    create?: XOR<CircleInvitationCreateWithoutCircleInput, CircleInvitationUncheckedCreateWithoutCircleInput> | CircleInvitationCreateWithoutCircleInput[] | CircleInvitationUncheckedCreateWithoutCircleInput[]
    connectOrCreate?: CircleInvitationCreateOrConnectWithoutCircleInput | CircleInvitationCreateOrConnectWithoutCircleInput[]
    upsert?: CircleInvitationUpsertWithWhereUniqueWithoutCircleInput | CircleInvitationUpsertWithWhereUniqueWithoutCircleInput[]
    createMany?: CircleInvitationCreateManyCircleInputEnvelope
    set?: CircleInvitationWhereUniqueInput | CircleInvitationWhereUniqueInput[]
    disconnect?: CircleInvitationWhereUniqueInput | CircleInvitationWhereUniqueInput[]
    delete?: CircleInvitationWhereUniqueInput | CircleInvitationWhereUniqueInput[]
    connect?: CircleInvitationWhereUniqueInput | CircleInvitationWhereUniqueInput[]
    update?: CircleInvitationUpdateWithWhereUniqueWithoutCircleInput | CircleInvitationUpdateWithWhereUniqueWithoutCircleInput[]
    updateMany?: CircleInvitationUpdateManyWithWhereWithoutCircleInput | CircleInvitationUpdateManyWithWhereWithoutCircleInput[]
    deleteMany?: CircleInvitationScalarWhereInput | CircleInvitationScalarWhereInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserUncheckedUpdateManyWithoutMemberCirclesNestedInput = {
    create?: XOR<UserCreateWithoutMemberCirclesInput, UserUncheckedCreateWithoutMemberCirclesInput> | UserCreateWithoutMemberCirclesInput[] | UserUncheckedCreateWithoutMemberCirclesInput[]
    connectOrCreate?: UserCreateOrConnectWithoutMemberCirclesInput | UserCreateOrConnectWithoutMemberCirclesInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutMemberCirclesInput | UserUpsertWithWhereUniqueWithoutMemberCirclesInput[]
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutMemberCirclesInput | UserUpdateWithWhereUniqueWithoutMemberCirclesInput[]
    updateMany?: UserUpdateManyWithWhereWithoutMemberCirclesInput | UserUpdateManyWithWhereWithoutMemberCirclesInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type InviteUncheckedUpdateManyWithoutCircleNestedInput = {
    create?: XOR<InviteCreateWithoutCircleInput, InviteUncheckedCreateWithoutCircleInput> | InviteCreateWithoutCircleInput[] | InviteUncheckedCreateWithoutCircleInput[]
    connectOrCreate?: InviteCreateOrConnectWithoutCircleInput | InviteCreateOrConnectWithoutCircleInput[]
    upsert?: InviteUpsertWithWhereUniqueWithoutCircleInput | InviteUpsertWithWhereUniqueWithoutCircleInput[]
    createMany?: InviteCreateManyCircleInputEnvelope
    set?: InviteWhereUniqueInput | InviteWhereUniqueInput[]
    disconnect?: InviteWhereUniqueInput | InviteWhereUniqueInput[]
    delete?: InviteWhereUniqueInput | InviteWhereUniqueInput[]
    connect?: InviteWhereUniqueInput | InviteWhereUniqueInput[]
    update?: InviteUpdateWithWhereUniqueWithoutCircleInput | InviteUpdateWithWhereUniqueWithoutCircleInput[]
    updateMany?: InviteUpdateManyWithWhereWithoutCircleInput | InviteUpdateManyWithWhereWithoutCircleInput[]
    deleteMany?: InviteScalarWhereInput | InviteScalarWhereInput[]
  }

  export type CircleInvitationUncheckedUpdateManyWithoutCircleNestedInput = {
    create?: XOR<CircleInvitationCreateWithoutCircleInput, CircleInvitationUncheckedCreateWithoutCircleInput> | CircleInvitationCreateWithoutCircleInput[] | CircleInvitationUncheckedCreateWithoutCircleInput[]
    connectOrCreate?: CircleInvitationCreateOrConnectWithoutCircleInput | CircleInvitationCreateOrConnectWithoutCircleInput[]
    upsert?: CircleInvitationUpsertWithWhereUniqueWithoutCircleInput | CircleInvitationUpsertWithWhereUniqueWithoutCircleInput[]
    createMany?: CircleInvitationCreateManyCircleInputEnvelope
    set?: CircleInvitationWhereUniqueInput | CircleInvitationWhereUniqueInput[]
    disconnect?: CircleInvitationWhereUniqueInput | CircleInvitationWhereUniqueInput[]
    delete?: CircleInvitationWhereUniqueInput | CircleInvitationWhereUniqueInput[]
    connect?: CircleInvitationWhereUniqueInput | CircleInvitationWhereUniqueInput[]
    update?: CircleInvitationUpdateWithWhereUniqueWithoutCircleInput | CircleInvitationUpdateWithWhereUniqueWithoutCircleInput[]
    updateMany?: CircleInvitationUpdateManyWithWhereWithoutCircleInput | CircleInvitationUpdateManyWithWhereWithoutCircleInput[]
    deleteMany?: CircleInvitationScalarWhereInput | CircleInvitationScalarWhereInput[]
  }

  export type CircleCreateNestedOneWithoutInvitesInput = {
    create?: XOR<CircleCreateWithoutInvitesInput, CircleUncheckedCreateWithoutInvitesInput>
    connectOrCreate?: CircleCreateOrConnectWithoutInvitesInput
    connect?: CircleWhereUniqueInput
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type CircleUpdateOneRequiredWithoutInvitesNestedInput = {
    create?: XOR<CircleCreateWithoutInvitesInput, CircleUncheckedCreateWithoutInvitesInput>
    connectOrCreate?: CircleCreateOrConnectWithoutInvitesInput
    upsert?: CircleUpsertWithoutInvitesInput
    connect?: CircleWhereUniqueInput
    update?: XOR<XOR<CircleUpdateToOneWithWhereWithoutInvitesInput, CircleUpdateWithoutInvitesInput>, CircleUncheckedUpdateWithoutInvitesInput>
  }

  export type CircleCreateNestedOneWithoutInvitationsInput = {
    create?: XOR<CircleCreateWithoutInvitationsInput, CircleUncheckedCreateWithoutInvitationsInput>
    connectOrCreate?: CircleCreateOrConnectWithoutInvitationsInput
    connect?: CircleWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type CircleUpdateOneRequiredWithoutInvitationsNestedInput = {
    create?: XOR<CircleCreateWithoutInvitationsInput, CircleUncheckedCreateWithoutInvitationsInput>
    connectOrCreate?: CircleCreateOrConnectWithoutInvitationsInput
    upsert?: CircleUpsertWithoutInvitationsInput
    connect?: CircleWhereUniqueInput
    update?: XOR<XOR<CircleUpdateToOneWithWhereWithoutInvitationsInput, CircleUpdateWithoutInvitationsInput>, CircleUncheckedUpdateWithoutInvitationsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type CircleCreateWithoutOwnerInput = {
    name: string
    description?: string | null
    targetAmount: string
    paymentType: string
    fixedAmount?: string | null
    deadline: Date | string
    transactionHash?: string | null
    onChainId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    members?: UserCreateNestedManyWithoutMemberCirclesInput
    invites?: InviteCreateNestedManyWithoutCircleInput
    invitations?: CircleInvitationCreateNestedManyWithoutCircleInput
  }

  export type CircleUncheckedCreateWithoutOwnerInput = {
    id?: number
    name: string
    description?: string | null
    targetAmount: string
    paymentType: string
    fixedAmount?: string | null
    deadline: Date | string
    transactionHash?: string | null
    onChainId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    members?: UserUncheckedCreateNestedManyWithoutMemberCirclesInput
    invites?: InviteUncheckedCreateNestedManyWithoutCircleInput
    invitations?: CircleInvitationUncheckedCreateNestedManyWithoutCircleInput
  }

  export type CircleCreateOrConnectWithoutOwnerInput = {
    where: CircleWhereUniqueInput
    create: XOR<CircleCreateWithoutOwnerInput, CircleUncheckedCreateWithoutOwnerInput>
  }

  export type CircleCreateManyOwnerInputEnvelope = {
    data: CircleCreateManyOwnerInput | CircleCreateManyOwnerInput[]
    skipDuplicates?: boolean
  }

  export type CircleCreateWithoutMembersInput = {
    name: string
    description?: string | null
    targetAmount: string
    paymentType: string
    fixedAmount?: string | null
    deadline: Date | string
    transactionHash?: string | null
    onChainId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    owner: UserCreateNestedOneWithoutOwnedCirclesInput
    invites?: InviteCreateNestedManyWithoutCircleInput
    invitations?: CircleInvitationCreateNestedManyWithoutCircleInput
  }

  export type CircleUncheckedCreateWithoutMembersInput = {
    id?: number
    name: string
    description?: string | null
    targetAmount: string
    paymentType: string
    fixedAmount?: string | null
    deadline: Date | string
    transactionHash?: string | null
    ownerId: string
    onChainId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    invites?: InviteUncheckedCreateNestedManyWithoutCircleInput
    invitations?: CircleInvitationUncheckedCreateNestedManyWithoutCircleInput
  }

  export type CircleCreateOrConnectWithoutMembersInput = {
    where: CircleWhereUniqueInput
    create: XOR<CircleCreateWithoutMembersInput, CircleUncheckedCreateWithoutMembersInput>
  }

  export type CircleUpsertWithWhereUniqueWithoutOwnerInput = {
    where: CircleWhereUniqueInput
    update: XOR<CircleUpdateWithoutOwnerInput, CircleUncheckedUpdateWithoutOwnerInput>
    create: XOR<CircleCreateWithoutOwnerInput, CircleUncheckedCreateWithoutOwnerInput>
  }

  export type CircleUpdateWithWhereUniqueWithoutOwnerInput = {
    where: CircleWhereUniqueInput
    data: XOR<CircleUpdateWithoutOwnerInput, CircleUncheckedUpdateWithoutOwnerInput>
  }

  export type CircleUpdateManyWithWhereWithoutOwnerInput = {
    where: CircleScalarWhereInput
    data: XOR<CircleUpdateManyMutationInput, CircleUncheckedUpdateManyWithoutOwnerInput>
  }

  export type CircleScalarWhereInput = {
    AND?: CircleScalarWhereInput | CircleScalarWhereInput[]
    OR?: CircleScalarWhereInput[]
    NOT?: CircleScalarWhereInput | CircleScalarWhereInput[]
    id?: IntFilter<"Circle"> | number
    name?: StringFilter<"Circle"> | string
    description?: StringNullableFilter<"Circle"> | string | null
    targetAmount?: StringFilter<"Circle"> | string
    paymentType?: StringFilter<"Circle"> | string
    fixedAmount?: StringNullableFilter<"Circle"> | string | null
    deadline?: DateTimeFilter<"Circle"> | Date | string
    transactionHash?: StringNullableFilter<"Circle"> | string | null
    ownerId?: StringFilter<"Circle"> | string
    onChainId?: IntNullableFilter<"Circle"> | number | null
    createdAt?: DateTimeFilter<"Circle"> | Date | string
    updatedAt?: DateTimeFilter<"Circle"> | Date | string
  }

  export type CircleUpsertWithWhereUniqueWithoutMembersInput = {
    where: CircleWhereUniqueInput
    update: XOR<CircleUpdateWithoutMembersInput, CircleUncheckedUpdateWithoutMembersInput>
    create: XOR<CircleCreateWithoutMembersInput, CircleUncheckedCreateWithoutMembersInput>
  }

  export type CircleUpdateWithWhereUniqueWithoutMembersInput = {
    where: CircleWhereUniqueInput
    data: XOR<CircleUpdateWithoutMembersInput, CircleUncheckedUpdateWithoutMembersInput>
  }

  export type CircleUpdateManyWithWhereWithoutMembersInput = {
    where: CircleScalarWhereInput
    data: XOR<CircleUpdateManyMutationInput, CircleUncheckedUpdateManyWithoutMembersInput>
  }

  export type UserCreateWithoutOwnedCirclesInput = {
    id?: string
    email: string
    name?: string | null
    wallet: string
    createdAt?: Date | string
    memberCircles?: CircleCreateNestedManyWithoutMembersInput
  }

  export type UserUncheckedCreateWithoutOwnedCirclesInput = {
    id?: string
    email: string
    name?: string | null
    wallet: string
    createdAt?: Date | string
    memberCircles?: CircleUncheckedCreateNestedManyWithoutMembersInput
  }

  export type UserCreateOrConnectWithoutOwnedCirclesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutOwnedCirclesInput, UserUncheckedCreateWithoutOwnedCirclesInput>
  }

  export type UserCreateWithoutMemberCirclesInput = {
    id?: string
    email: string
    name?: string | null
    wallet: string
    createdAt?: Date | string
    ownedCircles?: CircleCreateNestedManyWithoutOwnerInput
  }

  export type UserUncheckedCreateWithoutMemberCirclesInput = {
    id?: string
    email: string
    name?: string | null
    wallet: string
    createdAt?: Date | string
    ownedCircles?: CircleUncheckedCreateNestedManyWithoutOwnerInput
  }

  export type UserCreateOrConnectWithoutMemberCirclesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutMemberCirclesInput, UserUncheckedCreateWithoutMemberCirclesInput>
  }

  export type InviteCreateWithoutCircleInput = {
    id?: string
    email: string
    token: string
    expiresAt: Date | string
    claimed?: boolean
  }

  export type InviteUncheckedCreateWithoutCircleInput = {
    id?: string
    email: string
    token: string
    expiresAt: Date | string
    claimed?: boolean
  }

  export type InviteCreateOrConnectWithoutCircleInput = {
    where: InviteWhereUniqueInput
    create: XOR<InviteCreateWithoutCircleInput, InviteUncheckedCreateWithoutCircleInput>
  }

  export type InviteCreateManyCircleInputEnvelope = {
    data: InviteCreateManyCircleInput | InviteCreateManyCircleInput[]
    skipDuplicates?: boolean
  }

  export type CircleInvitationCreateWithoutCircleInput = {
    id?: string
    inviterEmail: string
    inviteeEmail?: string | null
    inviteeWalletAddress?: string | null
    inviteType: string
    status?: string
    expiresAt: Date | string
    createdAt?: Date | string
    acceptedAt?: Date | string | null
    acceptedByEmail?: string | null
    acceptedByWalletAddress?: string | null
  }

  export type CircleInvitationUncheckedCreateWithoutCircleInput = {
    id?: string
    inviterEmail: string
    inviteeEmail?: string | null
    inviteeWalletAddress?: string | null
    inviteType: string
    status?: string
    expiresAt: Date | string
    createdAt?: Date | string
    acceptedAt?: Date | string | null
    acceptedByEmail?: string | null
    acceptedByWalletAddress?: string | null
  }

  export type CircleInvitationCreateOrConnectWithoutCircleInput = {
    where: CircleInvitationWhereUniqueInput
    create: XOR<CircleInvitationCreateWithoutCircleInput, CircleInvitationUncheckedCreateWithoutCircleInput>
  }

  export type CircleInvitationCreateManyCircleInputEnvelope = {
    data: CircleInvitationCreateManyCircleInput | CircleInvitationCreateManyCircleInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutOwnedCirclesInput = {
    update: XOR<UserUpdateWithoutOwnedCirclesInput, UserUncheckedUpdateWithoutOwnedCirclesInput>
    create: XOR<UserCreateWithoutOwnedCirclesInput, UserUncheckedCreateWithoutOwnedCirclesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutOwnedCirclesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutOwnedCirclesInput, UserUncheckedUpdateWithoutOwnedCirclesInput>
  }

  export type UserUpdateWithoutOwnedCirclesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    wallet?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberCircles?: CircleUpdateManyWithoutMembersNestedInput
  }

  export type UserUncheckedUpdateWithoutOwnedCirclesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    wallet?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberCircles?: CircleUncheckedUpdateManyWithoutMembersNestedInput
  }

  export type UserUpsertWithWhereUniqueWithoutMemberCirclesInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutMemberCirclesInput, UserUncheckedUpdateWithoutMemberCirclesInput>
    create: XOR<UserCreateWithoutMemberCirclesInput, UserUncheckedCreateWithoutMemberCirclesInput>
  }

  export type UserUpdateWithWhereUniqueWithoutMemberCirclesInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutMemberCirclesInput, UserUncheckedUpdateWithoutMemberCirclesInput>
  }

  export type UserUpdateManyWithWhereWithoutMemberCirclesInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutMemberCirclesInput>
  }

  export type UserScalarWhereInput = {
    AND?: UserScalarWhereInput | UserScalarWhereInput[]
    OR?: UserScalarWhereInput[]
    NOT?: UserScalarWhereInput | UserScalarWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    name?: StringNullableFilter<"User"> | string | null
    wallet?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
  }

  export type InviteUpsertWithWhereUniqueWithoutCircleInput = {
    where: InviteWhereUniqueInput
    update: XOR<InviteUpdateWithoutCircleInput, InviteUncheckedUpdateWithoutCircleInput>
    create: XOR<InviteCreateWithoutCircleInput, InviteUncheckedCreateWithoutCircleInput>
  }

  export type InviteUpdateWithWhereUniqueWithoutCircleInput = {
    where: InviteWhereUniqueInput
    data: XOR<InviteUpdateWithoutCircleInput, InviteUncheckedUpdateWithoutCircleInput>
  }

  export type InviteUpdateManyWithWhereWithoutCircleInput = {
    where: InviteScalarWhereInput
    data: XOR<InviteUpdateManyMutationInput, InviteUncheckedUpdateManyWithoutCircleInput>
  }

  export type InviteScalarWhereInput = {
    AND?: InviteScalarWhereInput | InviteScalarWhereInput[]
    OR?: InviteScalarWhereInput[]
    NOT?: InviteScalarWhereInput | InviteScalarWhereInput[]
    id?: StringFilter<"Invite"> | string
    circleId?: IntFilter<"Invite"> | number
    email?: StringFilter<"Invite"> | string
    token?: StringFilter<"Invite"> | string
    expiresAt?: DateTimeFilter<"Invite"> | Date | string
    claimed?: BoolFilter<"Invite"> | boolean
  }

  export type CircleInvitationUpsertWithWhereUniqueWithoutCircleInput = {
    where: CircleInvitationWhereUniqueInput
    update: XOR<CircleInvitationUpdateWithoutCircleInput, CircleInvitationUncheckedUpdateWithoutCircleInput>
    create: XOR<CircleInvitationCreateWithoutCircleInput, CircleInvitationUncheckedCreateWithoutCircleInput>
  }

  export type CircleInvitationUpdateWithWhereUniqueWithoutCircleInput = {
    where: CircleInvitationWhereUniqueInput
    data: XOR<CircleInvitationUpdateWithoutCircleInput, CircleInvitationUncheckedUpdateWithoutCircleInput>
  }

  export type CircleInvitationUpdateManyWithWhereWithoutCircleInput = {
    where: CircleInvitationScalarWhereInput
    data: XOR<CircleInvitationUpdateManyMutationInput, CircleInvitationUncheckedUpdateManyWithoutCircleInput>
  }

  export type CircleInvitationScalarWhereInput = {
    AND?: CircleInvitationScalarWhereInput | CircleInvitationScalarWhereInput[]
    OR?: CircleInvitationScalarWhereInput[]
    NOT?: CircleInvitationScalarWhereInput | CircleInvitationScalarWhereInput[]
    id?: StringFilter<"CircleInvitation"> | string
    circleId?: IntFilter<"CircleInvitation"> | number
    inviterEmail?: StringFilter<"CircleInvitation"> | string
    inviteeEmail?: StringNullableFilter<"CircleInvitation"> | string | null
    inviteeWalletAddress?: StringNullableFilter<"CircleInvitation"> | string | null
    inviteType?: StringFilter<"CircleInvitation"> | string
    status?: StringFilter<"CircleInvitation"> | string
    expiresAt?: DateTimeFilter<"CircleInvitation"> | Date | string
    createdAt?: DateTimeFilter<"CircleInvitation"> | Date | string
    acceptedAt?: DateTimeNullableFilter<"CircleInvitation"> | Date | string | null
    acceptedByEmail?: StringNullableFilter<"CircleInvitation"> | string | null
    acceptedByWalletAddress?: StringNullableFilter<"CircleInvitation"> | string | null
  }

  export type CircleCreateWithoutInvitesInput = {
    name: string
    description?: string | null
    targetAmount: string
    paymentType: string
    fixedAmount?: string | null
    deadline: Date | string
    transactionHash?: string | null
    onChainId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    owner: UserCreateNestedOneWithoutOwnedCirclesInput
    members?: UserCreateNestedManyWithoutMemberCirclesInput
    invitations?: CircleInvitationCreateNestedManyWithoutCircleInput
  }

  export type CircleUncheckedCreateWithoutInvitesInput = {
    id?: number
    name: string
    description?: string | null
    targetAmount: string
    paymentType: string
    fixedAmount?: string | null
    deadline: Date | string
    transactionHash?: string | null
    ownerId: string
    onChainId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    members?: UserUncheckedCreateNestedManyWithoutMemberCirclesInput
    invitations?: CircleInvitationUncheckedCreateNestedManyWithoutCircleInput
  }

  export type CircleCreateOrConnectWithoutInvitesInput = {
    where: CircleWhereUniqueInput
    create: XOR<CircleCreateWithoutInvitesInput, CircleUncheckedCreateWithoutInvitesInput>
  }

  export type CircleUpsertWithoutInvitesInput = {
    update: XOR<CircleUpdateWithoutInvitesInput, CircleUncheckedUpdateWithoutInvitesInput>
    create: XOR<CircleCreateWithoutInvitesInput, CircleUncheckedCreateWithoutInvitesInput>
    where?: CircleWhereInput
  }

  export type CircleUpdateToOneWithWhereWithoutInvitesInput = {
    where?: CircleWhereInput
    data: XOR<CircleUpdateWithoutInvitesInput, CircleUncheckedUpdateWithoutInvitesInput>
  }

  export type CircleUpdateWithoutInvitesInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    targetAmount?: StringFieldUpdateOperationsInput | string
    paymentType?: StringFieldUpdateOperationsInput | string
    fixedAmount?: NullableStringFieldUpdateOperationsInput | string | null
    deadline?: DateTimeFieldUpdateOperationsInput | Date | string
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    onChainId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    owner?: UserUpdateOneRequiredWithoutOwnedCirclesNestedInput
    members?: UserUpdateManyWithoutMemberCirclesNestedInput
    invitations?: CircleInvitationUpdateManyWithoutCircleNestedInput
  }

  export type CircleUncheckedUpdateWithoutInvitesInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    targetAmount?: StringFieldUpdateOperationsInput | string
    paymentType?: StringFieldUpdateOperationsInput | string
    fixedAmount?: NullableStringFieldUpdateOperationsInput | string | null
    deadline?: DateTimeFieldUpdateOperationsInput | Date | string
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    ownerId?: StringFieldUpdateOperationsInput | string
    onChainId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    members?: UserUncheckedUpdateManyWithoutMemberCirclesNestedInput
    invitations?: CircleInvitationUncheckedUpdateManyWithoutCircleNestedInput
  }

  export type CircleCreateWithoutInvitationsInput = {
    name: string
    description?: string | null
    targetAmount: string
    paymentType: string
    fixedAmount?: string | null
    deadline: Date | string
    transactionHash?: string | null
    onChainId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    owner: UserCreateNestedOneWithoutOwnedCirclesInput
    members?: UserCreateNestedManyWithoutMemberCirclesInput
    invites?: InviteCreateNestedManyWithoutCircleInput
  }

  export type CircleUncheckedCreateWithoutInvitationsInput = {
    id?: number
    name: string
    description?: string | null
    targetAmount: string
    paymentType: string
    fixedAmount?: string | null
    deadline: Date | string
    transactionHash?: string | null
    ownerId: string
    onChainId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    members?: UserUncheckedCreateNestedManyWithoutMemberCirclesInput
    invites?: InviteUncheckedCreateNestedManyWithoutCircleInput
  }

  export type CircleCreateOrConnectWithoutInvitationsInput = {
    where: CircleWhereUniqueInput
    create: XOR<CircleCreateWithoutInvitationsInput, CircleUncheckedCreateWithoutInvitationsInput>
  }

  export type CircleUpsertWithoutInvitationsInput = {
    update: XOR<CircleUpdateWithoutInvitationsInput, CircleUncheckedUpdateWithoutInvitationsInput>
    create: XOR<CircleCreateWithoutInvitationsInput, CircleUncheckedCreateWithoutInvitationsInput>
    where?: CircleWhereInput
  }

  export type CircleUpdateToOneWithWhereWithoutInvitationsInput = {
    where?: CircleWhereInput
    data: XOR<CircleUpdateWithoutInvitationsInput, CircleUncheckedUpdateWithoutInvitationsInput>
  }

  export type CircleUpdateWithoutInvitationsInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    targetAmount?: StringFieldUpdateOperationsInput | string
    paymentType?: StringFieldUpdateOperationsInput | string
    fixedAmount?: NullableStringFieldUpdateOperationsInput | string | null
    deadline?: DateTimeFieldUpdateOperationsInput | Date | string
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    onChainId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    owner?: UserUpdateOneRequiredWithoutOwnedCirclesNestedInput
    members?: UserUpdateManyWithoutMemberCirclesNestedInput
    invites?: InviteUpdateManyWithoutCircleNestedInput
  }

  export type CircleUncheckedUpdateWithoutInvitationsInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    targetAmount?: StringFieldUpdateOperationsInput | string
    paymentType?: StringFieldUpdateOperationsInput | string
    fixedAmount?: NullableStringFieldUpdateOperationsInput | string | null
    deadline?: DateTimeFieldUpdateOperationsInput | Date | string
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    ownerId?: StringFieldUpdateOperationsInput | string
    onChainId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    members?: UserUncheckedUpdateManyWithoutMemberCirclesNestedInput
    invites?: InviteUncheckedUpdateManyWithoutCircleNestedInput
  }

  export type CircleCreateManyOwnerInput = {
    id?: number
    name: string
    description?: string | null
    targetAmount: string
    paymentType: string
    fixedAmount?: string | null
    deadline: Date | string
    transactionHash?: string | null
    onChainId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CircleUpdateWithoutOwnerInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    targetAmount?: StringFieldUpdateOperationsInput | string
    paymentType?: StringFieldUpdateOperationsInput | string
    fixedAmount?: NullableStringFieldUpdateOperationsInput | string | null
    deadline?: DateTimeFieldUpdateOperationsInput | Date | string
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    onChainId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    members?: UserUpdateManyWithoutMemberCirclesNestedInput
    invites?: InviteUpdateManyWithoutCircleNestedInput
    invitations?: CircleInvitationUpdateManyWithoutCircleNestedInput
  }

  export type CircleUncheckedUpdateWithoutOwnerInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    targetAmount?: StringFieldUpdateOperationsInput | string
    paymentType?: StringFieldUpdateOperationsInput | string
    fixedAmount?: NullableStringFieldUpdateOperationsInput | string | null
    deadline?: DateTimeFieldUpdateOperationsInput | Date | string
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    onChainId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    members?: UserUncheckedUpdateManyWithoutMemberCirclesNestedInput
    invites?: InviteUncheckedUpdateManyWithoutCircleNestedInput
    invitations?: CircleInvitationUncheckedUpdateManyWithoutCircleNestedInput
  }

  export type CircleUncheckedUpdateManyWithoutOwnerInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    targetAmount?: StringFieldUpdateOperationsInput | string
    paymentType?: StringFieldUpdateOperationsInput | string
    fixedAmount?: NullableStringFieldUpdateOperationsInput | string | null
    deadline?: DateTimeFieldUpdateOperationsInput | Date | string
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    onChainId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CircleUpdateWithoutMembersInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    targetAmount?: StringFieldUpdateOperationsInput | string
    paymentType?: StringFieldUpdateOperationsInput | string
    fixedAmount?: NullableStringFieldUpdateOperationsInput | string | null
    deadline?: DateTimeFieldUpdateOperationsInput | Date | string
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    onChainId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    owner?: UserUpdateOneRequiredWithoutOwnedCirclesNestedInput
    invites?: InviteUpdateManyWithoutCircleNestedInput
    invitations?: CircleInvitationUpdateManyWithoutCircleNestedInput
  }

  export type CircleUncheckedUpdateWithoutMembersInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    targetAmount?: StringFieldUpdateOperationsInput | string
    paymentType?: StringFieldUpdateOperationsInput | string
    fixedAmount?: NullableStringFieldUpdateOperationsInput | string | null
    deadline?: DateTimeFieldUpdateOperationsInput | Date | string
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    ownerId?: StringFieldUpdateOperationsInput | string
    onChainId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    invites?: InviteUncheckedUpdateManyWithoutCircleNestedInput
    invitations?: CircleInvitationUncheckedUpdateManyWithoutCircleNestedInput
  }

  export type CircleUncheckedUpdateManyWithoutMembersInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    targetAmount?: StringFieldUpdateOperationsInput | string
    paymentType?: StringFieldUpdateOperationsInput | string
    fixedAmount?: NullableStringFieldUpdateOperationsInput | string | null
    deadline?: DateTimeFieldUpdateOperationsInput | Date | string
    transactionHash?: NullableStringFieldUpdateOperationsInput | string | null
    ownerId?: StringFieldUpdateOperationsInput | string
    onChainId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InviteCreateManyCircleInput = {
    id?: string
    email: string
    token: string
    expiresAt: Date | string
    claimed?: boolean
  }

  export type CircleInvitationCreateManyCircleInput = {
    id?: string
    inviterEmail: string
    inviteeEmail?: string | null
    inviteeWalletAddress?: string | null
    inviteType: string
    status?: string
    expiresAt: Date | string
    createdAt?: Date | string
    acceptedAt?: Date | string | null
    acceptedByEmail?: string | null
    acceptedByWalletAddress?: string | null
  }

  export type UserUpdateWithoutMemberCirclesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    wallet?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownedCircles?: CircleUpdateManyWithoutOwnerNestedInput
  }

  export type UserUncheckedUpdateWithoutMemberCirclesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    wallet?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownedCircles?: CircleUncheckedUpdateManyWithoutOwnerNestedInput
  }

  export type UserUncheckedUpdateManyWithoutMemberCirclesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    wallet?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InviteUpdateWithoutCircleInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    claimed?: BoolFieldUpdateOperationsInput | boolean
  }

  export type InviteUncheckedUpdateWithoutCircleInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    claimed?: BoolFieldUpdateOperationsInput | boolean
  }

  export type InviteUncheckedUpdateManyWithoutCircleInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    claimed?: BoolFieldUpdateOperationsInput | boolean
  }

  export type CircleInvitationUpdateWithoutCircleInput = {
    id?: StringFieldUpdateOperationsInput | string
    inviterEmail?: StringFieldUpdateOperationsInput | string
    inviteeEmail?: NullableStringFieldUpdateOperationsInput | string | null
    inviteeWalletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    inviteType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    acceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    acceptedByEmail?: NullableStringFieldUpdateOperationsInput | string | null
    acceptedByWalletAddress?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type CircleInvitationUncheckedUpdateWithoutCircleInput = {
    id?: StringFieldUpdateOperationsInput | string
    inviterEmail?: StringFieldUpdateOperationsInput | string
    inviteeEmail?: NullableStringFieldUpdateOperationsInput | string | null
    inviteeWalletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    inviteType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    acceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    acceptedByEmail?: NullableStringFieldUpdateOperationsInput | string | null
    acceptedByWalletAddress?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type CircleInvitationUncheckedUpdateManyWithoutCircleInput = {
    id?: StringFieldUpdateOperationsInput | string
    inviterEmail?: StringFieldUpdateOperationsInput | string
    inviteeEmail?: NullableStringFieldUpdateOperationsInput | string | null
    inviteeWalletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    inviteType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    acceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    acceptedByEmail?: NullableStringFieldUpdateOperationsInput | string | null
    acceptedByWalletAddress?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}