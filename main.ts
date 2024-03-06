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

  namespace Any {
    type _1 = unknown extends never ? true : false;
    //   ^?
    type _2 = never extends never ? true : false;
    //   ^?
    type _3 = any extends never ? true : false;
    //   ^?
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

    type __1 = CheckTypes<() => void, (x: string) => void>;
    //   ^?
    type __2 = CheckTypes<(x?: unknown) => void, () => void>;
    //   ^?
  }

  namespace Never {
    type _1 = string & number;
    //   ^?
    type _2 = keyof never;
    //   ^?
    declare const NEVER: never;
    NEVER["A"]["B"]["C"];
  }

  namespace PropertyModifiers {
    type _1 = CheckTypes<{ a: string }, { a?: string }>;
    //   ^?
    type _2 = CheckTypes<{ a: string }, { readonly a: string }>;
    //   ^?

    type _3 = CheckTypes<{}, { a?: string }>; // wrong
    //   ^?
    type _4 = CheckTypes<{ a?: string }, { b?: string }>;
    //   ^?
    type _5 = CheckTypes<{ a?: string; c: string }, { b?: string; c: string }>; // wrong
    //   ^?
    type _6 = CheckTypes<Record<never, unknown>, { b?: string }>; // wrong
    //   ^?
    type _7 = CheckTypes<Record<string, unknown>, { b?: string }>; // wrong
    //   ^?
    type _8 = CheckTypes<{ b: string }, { a?: string; b: string }>; // wrong
    //   ^?

    const ab: Record<"a" | "b", null> = { a: null, b: null };
    const record: Record<string, null> = { a: null, b: null };
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
      type _2 = CheckTypes<Method<string>, Method<number>>;
      //     ^?
      type __ = Array<number>["push"];

      const narrow = { a(x: Wide) {} };
      const wide = { a(x: Narrow) {} };
      type _3 = CheckTypes<typeof narrow, typeof wide>;
      //     ^?
    }

    namespace Property {
      type Property<T> = { a: (x: T) => void };
      type _1 = CheckTypes<Property<Narrow>, Property<Wide>>;
      //     ^?

      const narrow = { a: (x: Wide) => {} };
      const wide = { a: (x: Narrow) => {} };
      type _2 = CheckTypes<typeof narrow, typeof wide>;
      //     ^?
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
