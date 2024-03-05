namespace Hierarchy {
  namespace Graph {
    type _ = CheckTypes<any, unknown>;
    //   ^?

    namespace EmptyObject {
      const object: {} = { a: 5 };
      const string: {} = "string";
      const number: {} = 12345;
      const array: {} = [];
      const NULL: {} = null;
    }

    namespace Object {
      const object: object = { a: 5 };
      const array: object = [];
      const date: object = new Date();
      const string: object = "string";
    }

    namespace Function {
      const func: Function = () => 1;
      const CLASS: Function = class {};
    }
  }

  namespace Venn {
    const a: "abcde" = "abcde";
    const b: string = "abcde";
    const c: unknown = "abcde";
  }

  namespace Intersection {
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
  type Before = CheckTypes<Narrow, Wide>;
  //    ^?

  namespace Covariance {
    type WithA<T> = { a: T };
    type _1 = CheckTypes<WithA<Narrow>, WithA<Wide>>;
    //    ^?

    type _2 = CheckTypes<Array<Narrow>, Array<Wide>>;
    //    ^?
    type _3 = CheckTypes<ReadonlyArray<Narrow>, ReadonlyArray<Wide>>;
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
    type Keyof<T> = keyof T;
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

    type Func<T> = (x: T) => void;
    namespace Function {
      type _ = CheckTypes<Func<Narrow>, Func<Wide>>;
      //   ^?

      function onlyStrings(value: string) {
        return value.length;
      }

      function stringsAndNumbers(value: string | number) {
        if (typeof value === "number") return 0;
        return value.length;
      }
    }

    namespace ContravarianceOnContravariance {
      type Func<T> = (x: (x: T) => void) => void;
      type _ = CheckTypes<Func<Narrow>, Func<Wide>>;
      //   ^?
    }

    namespace UnionAndIntersection {
      type AC = "a" | "c";
      type BC = "b" | "c";
      type ACRecord = Record<AC, null>;
      type BCRecord = Record<BC, null>;
      type _1 = CheckTypes<Keyof<ACRecord | BCRecord>, Keyof<ACRecord> & Keyof<BCRecord>>;
      //   ^?
      type _11 = Keyof<ACRecord> & Keyof<BCRecord>;
      //   ^?
      type _12 = Keyof<ACRecord | BCRecord>;
      //   ^?

      type _2 = CheckTypes<Func<AC | BC>, Func<AC> & Func<BC>>;
      //   ^?
      declare const fa: Func<AC | BC>;
      fa();
      //^?
      declare const fb: Func<AC> & Func<BC>;
      fb();
      //^?

      type _3 = CheckTypes<Keyof<ACRecord & BCRecord>, Keyof<ACRecord> | Keyof<BCRecord>>;
      //   ^?
      type _31 = Keyof<ACRecord & BCRecord>;
      //   ^?
      type _32 = Keyof<ACRecord> | Keyof<BCRecord>;
      //   ^?

      type _4 = CheckTypes<Func<AC & BC>, Func<AC> | Func<BC>>;
      //   ^?
      declare const f1: Func<AC & BC>;
      f1();
      //^?
      declare const f2: Func<AC> | Func<BC>;
      f2();
      //^?

      declare const strFn: (value: string) => void;
      declare const numFn: (value: number) => void;
      [strFn, numFn].map(fn => {
        return fn();
        //      ^?
      });
      declare const ACFn: (value: AC) => void;
      declare const BCFn: (value: BC) => void;
      const mapper = [ACFn, BCFn].map(fn => {
        return fn("c");
        //      ^?
      });
    }
  }

  namespace Invariance {
    namespace Function {
      type Identity<T> = (x: T) => T;
      type _ = CheckTypes<Identity<Narrow>, Identity<Wide>>;
      //   ^?
    }

    namespace Object {
      type SelfRecord<K extends PropertyKey> = Record<K, K>;
      type _ = CheckTypes<SelfRecord<"a">, SelfRecord<"a" | "b">>;
      //   ^?
    }

    namespace Array {
      type Push<T> = (...value: T[]) => number;
      type _1 = CheckTypes<Push<Narrow>, Push<Wide>>;
      //   ^?

      type MyArray<T> = { [x: number]: T } & { push: Push<T> };
      type _2 = CheckTypes<MyArray<Narrow>, MyArray<Wide>>;
      //   ^?
    }

    namespace ReadonlyArray {
      declare const arr: ReadonlyArray<number>;
      arr.concat("2", null);

      type Concat<T> = <R>(...x: Array<R | Array<R>>) => Array<T | R>;
      type MyReadonlyArray<T> = { [x: number]: T; concat: Concat<T> };
      declare const myarr: MyReadonlyArray<number>;
      const newarr = myarr.concat("2", null);
      //     ^?

      type _ = CheckTypes<MyReadonlyArray<Narrow>, MyReadonlyArray<Wide>>;
      //   ^?
    }
  }

  namespace Bivariance {
    namespace Constant {
      type Null<T> = null;
      type _ = CheckTypes<Null<Narrow>, Null<Wide>>;
      //   ^?
    }

    namespace Method {
      type Method<T> = { a(x: T): void };
      type _1 = CheckTypes<Method<Narrow>, Method<Wide>>;
      //     ^?

      const narrow = { a(x: Wide) {} };
      const wide = { a(x: Narrow) {} };
      type _2 = CheckTypes<typeof narrow, typeof wide>;
      //     ^?
    }

    namespace Property {
      type Property<T> = { a: (x: T) => void };
      type _1 = CheckTypes<Property<Wide>, Property<Narrow>>;
      //     ^?

      const narrow = { a: (x: Wide) => {} };
      const wide = { a: (x: Narrow) => {} };
      type _2 = CheckTypes<typeof narrow, typeof wide>;
      //     ^?
    }
  }

  // todo - is this needed?
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
type CheckTypes<A, B> = GetComparisonResult<[Extends<A, B>, Extends<B, A>]>;
type GetComparisonResult<C extends [boolean, boolean]> = C extends [true, true]
  ? "Equivalent"
  : C extends [true, false]
  ? "First extends second"
  : C extends [false, true]
  ? "Second extends first"
  : "Types are unrelated";

type FirstParameter<F> = [F] extends [(arg: infer A, ...args: never[]) => unknown] ? A : "Not a function";
