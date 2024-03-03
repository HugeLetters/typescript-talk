namespace Hierarchy {
  namespace Graph {
    type _ = CheckTypes<any, unknown>;
    //   ^?

    // todo - write that part
    namespace WhatIsEmptyObject {
      const object: {} = { a: 5 };
      const string: {} = "string";
      const number: {} = 12345;
      const array: {} = [];
      const NULL: {} = null;
    }

    namespace WhatIsObject {
      const object: object = { a: 5 };
      const array: object = [];
      const date: object = new Date();
      const string: object = "string";
    }

    namespace WhatIsFunction {
      const func: Function = () => 1;
      const CLASS: Function = class {};
    }
  }

  namespace Venn {
    const a: "abcde" = "abcde";
    const b: string = "abcde";
    const c: unknown = "abcde";
  }

  namespace Insersection {
    const value = Math.random() > 0.5 ? "one" : "two";
    //    ^?
    const OK: string = value;
    const TOO_WIDE: string | number = value;
    const TOO_NARROW: "one" = value;
  }
}

namespace Assignability {
  namespace Nominal {
    type A = string;
    type B = string;
    type _ = CheckTypes<A, B>;
    //   ^?
  }

  namespace MinimalContract {
    const myObserver = {
      disconnect: () => {},
      observe: () => {},
      takeRecords: () => [],
      iCanAlsoLogAString: (message: string) => console.log(message),
    };
    declare const withObersver: (obs: MutationObserver) => void;
    withObersver(myObserver);

    type _ = CheckTypes<MutationObserver["observe"], typeof myObserver.observe>;
    //   ^?
  }

  namespace WhatIsToBeNarrower {
    type _1 = CheckTypes<{ a: string }, { a: string; b: string }>;
    //   ^?
    type _2 = CheckTypes<{ a: string }, { a: string | number; b: string }>;
    //   ^?
    type _3 = CheckTypes<{ a: string }, { a?: string }>;
    //   ^?
    type _4 = CheckTypes<{ a: string }, { readonly a: string }>;
    //   ^?

    type __1 = CheckTypes<() => void, (x: string) => void>;
    //   ^?
    type __2 = CheckTypes<(x?: unknown) => void, () => void>;
    //   ^?
  }

  namespace Never {
    type _1 = string & never;
    //   ^?
    type _2 = keyof never;
    //   ^?
    declare const NEVER: never;
    NEVER["A"]["B"]["C"];
  }
}

namespace Generics {
  namespace Types {
    type MyArray<T> = T[];
    type _ = CheckTypes<Array<number>, MyArray<number>>;
    //   ^?

    type Entries<K, V> = MyArray<[K, V]>;
    type _1 = Entries<string, number>;
    //   ^?
  }
}

namespace Variance {
  type Narrow = string;
  type Wide = string | number;

  namespace Covariance {
    type Before = CheckTypes<Narrow, Wide>;
    //    ^?
    type WithA<T> = { a: T };
    type After1 = CheckTypes<WithA<Narrow>, WithA<Wide>>;
    //    ^?

    type After2 = CheckTypes<Array<Narrow>, Array<Wide>>;
    //    ^?
    type After3 = CheckTypes<ReadonlyArray<Narrow>, ReadonlyArray<Wide>>;
    //    ^?

    const arr: number[] = [1, 2, 3];
    function push(arr: unknown[]) {
      arr.push(null);
    }
    push(arr);

    const obj = { a: 3 };
    function mut(obj: { a: unknown }) {
      obj.a = null;
    }
    mut(obj);
  }

  namespace Contravariance {
    namespace Keyof {
      type Normal = { a: string };
      type Narrow = { a: string } & { b: string };
      type Wide = { a: string } | { b: string };

      type _1 = CheckTypes<Narrow, Normal>;
      //   ^?
      type _2 = CheckTypes<Narrow, Wide>;
      //   ^?
      type _3 = CheckTypes<Normal, Wide>;
      //   ^?

      type Keyof<T> = keyof T;

      type Narrowkey = Keyof<Narrow>;
      //   ^?
      type NormalKey = Keyof<Normal>;
      //   ^?
      type WideKey = Keyof<Wide>;
      //   ^?

      type __1 = CheckTypes<Narrowkey, NormalKey>;
      //   ^?
      type __2 = CheckTypes<Narrowkey, WideKey>;
      //   ^?
      type __3 = CheckTypes<NormalKey, WideKey>;
      //   ^?
    }

    namespace Function {
      type NarrowFn = (x: Wide) => void;
      type WideFn = (x: Narrow) => void;
      type _ = CheckTypes<NarrowFn, WideFn>;
      //   ^?

      const narrow: WideFn = (x: Wide) => {};
      const wide: NarrowFn = (x: Narrow) => {};

      // todo - tell about how contravariance works along with & and |
      // basic example is this
      declare const first: (value: string) => void;
      declare const second: (value: number) => void;
      const mapper = [first, second].map(fn => fn());
      //                                        ^?
    }
  }

  namespace Invariance {
    // array is a good example of this - it's considered covariant by TS but actually invariant
    namespace Array {
      // I don't check methods on array themselves because of bivariance on methods
      type Push<T> = (...value: T[]) => number;
      type PushCheck = CheckTypes<Push<Narrow>, Push<Wide>>;
      //   ^?
      type Arr<T> = { [x: number]: T } & { push: Push<T> };
      type ArrCheck = CheckTypes<Arr<Narrow>, Arr<Wide>>;
      //   ^?
    }
    namespace Function {
      type NarrowFn = (x: Narrow) => Narrow;
      type WideFn = (x: Wide) => Wide;
      type _ = CheckTypes<NarrowFn, WideFn>;
      //   ^?
    }
  }

  namespace Bivariance {
    type Constant<T> = null;
    type _ = CheckTypes<Constant<Narrow>, Constant<Wide>>;
    //   ^?

    namespace Method {
      let narrow = { a(x: Wide) {} };
      let wide = { a(x: Narrow) {} };
      type Result = CheckTypes<typeof narrow, typeof wide>;
      //     ^?

      type NarrowObj = { a(x: Wide): void };
      type WideObj = { a(x: Narrow): void };
      type Result2 = CheckTypes<NarrowObj, WideObj>;
      //     ^?
    }

    namespace Property {
      let narrow = { a: (x: Wide) => {} };
      let wide = { a: (x: Narrow) => {} };
      type Result = CheckTypes<typeof narrow, typeof wide>;
      //     ^?

      type NarrowObj = { a: (x: Wide) => void };
      type WideObj = { a: (x: Narrow) => void };
      type Result2 = CheckTypes<NarrowObj, WideObj>;
      //     ^?
    }
  }

  namespace SubtypeWeirdness {
    // When bi-extension doesn't mean equivalence
    type A = CheckTypes<{}, { a?: string }>; // wrong
    //   ^?
    type B = CheckTypes<{ a?: string }, { b?: string }>;
    //   ^?
    type B2 = CheckTypes<{ a?: string; c: string }, { b?: string; c: string }>; // wrong
    //   ^?
    type C = CheckTypes<Record<never, unknown>, { b?: string }>; // wrong
    //   ^?
    type D = CheckTypes<Record<PropertyKey, unknown>, { b?: string }>; // wrong
    //   ^?
    type E = CheckTypes<{ b: string }, { a?: string; b: string }>; // wrong
    //   ^?

    /** Рассказать про сложности с index/never ключами - работают они не так же как конкретные ключи, тк не требуют их наличия */
  }
}

namespace MoreOnGenerics {
  namespace Bounds {
    type Prefix<S extends string, P extends string> = `${P}: ${S}`;
    type _1 = Prefix<"Eugene", "Name">;
    //   ^?

    type NamePrefix<Name extends string> = Prefix<Name, "Name">;
    type _2 = NamePrefix<"Natalia">;
    //   ^?
  }

  namespace Conditional {
    type StartsWithN<S extends string> = S extends `N${string}` ? true : false;
    type _ = StartsWithN<"Natalia">;
    //   ^?
    type _1 = StartsWithN<"Eugene">;
    //   ^?

    type OnlyWiderThanString<S> = string extends S ? S : never;
    type _2 = OnlyWiderThanString<string>;
    //   ^?
    type _3 = OnlyWiderThanString<"abcde">;
    //   ^?
    type _4 = OnlyWiderThanString<unknown>;
    //   ^?

    type _5 = any extends never ? true : false;
    //   ^?
  }

  namespace Infer {
    type GetFirstLetter<S> = S extends `${infer S}${string}` ? S : never;

    type _ = GetFirstLetter<"abc">;
    //   ^?

    type MyReturnType<F> = F extends () => infer R ? R : never;
    type __ = CheckTypes<MyReturnType<() => string>, ReturnType<() => string>>;
    //   ^?
  }

  namespace Distributivity {
    type IsNumber<T> = T extends number ? true : false;
    type _1 = IsNumber<string>;
    //   ^?
    type _2 = IsNumber<number>;
    //   ^?
    type _3 = IsNumber<number | string>;
    //   ^?

    type MyArray<T> = T extends T ? T[] : never;
    type _4 = MyArray<string | number>;
    //   ^?

    type IsNumberV2<T> = [T] extends [number] ? true : false;
    type _5 = IsNumberV2<number | string>;
    //   ^?
    type ___ = [string | number];
  }

  namespace Functions {
    namespace Inference {
      // todo - I wanna display how nested generics fall back to their constraint which breaks inference
      declare const init: ["abc"];
      namespace Breaks {
        function first<G extends string>(value: G[]) {
          return value.map(x => x);
        }

        function second<G extends string[]>(value: G) {
          return value.map(x => x);
        }

        const v1 = first(init);
        //    ^?
        const v2 = second(init);
        //    ^?
      }

      namespace Works {
        function first<G extends string>(value: G[]) {
          return { value };
        }

        function second<G extends string[]>(value: G) {
          return { value };
        }

        const v1 = first(init);
        //    ^?
        const v2 = second(init);
        //    ^?
      }
    }
  }
}

type Extends<A, B> = [A] extends [B] ? true : false;
type CheckTypes<A, B, K extends [boolean, boolean] = [Extends<A, B>, Extends<B, A>]> = K extends [true, true]
  ? "Equivalent"
  : K extends [true, false]
  ? "First extends second"
  : K extends [false, true]
  ? "Second extends first"
  : "Types are unrelated";
