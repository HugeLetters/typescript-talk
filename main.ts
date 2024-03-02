namespace Hierarchy {
  namespace Graph {
    type _ = CheckTypes<any, unknown>;
    //   ^?
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
  namespace Any {}
  namespace Unknown {}
  namespace Never {
    // mention keyof never = PropertyKey
    // never is not a null type, it's an everything type - it implemenets everything
    // so when you do string & number - it DOES give an intersection of those types
    // show this doesn't error
    type A = never["a"]["b"]["c"];
  }
}

namespace Variance {
  type Narrow = string;
  type Wide = string | number;

  //   investigate here - https://stackoverflow.com/a/66411491
  namespace Covariance {
    type Before = CheckTypes<Narrow, Wide>;
    //    ^?
    type WithA<T> = { a: T };
    type After1 = CheckTypes<WithA<Narrow>, WithA<Wide>>;
    //    ^?

    type After2 = CheckTypes<Array<Narrow>, Array<Wide>>;
    //    ^?
    // Mention that this is wrong becuase see Invariance -> Array
    type After3 = CheckTypes<ReadonlyArray<Narrow>, ReadonlyArray<Wide>>;
    //    ^?
    // this one is correct though - due to the nature of operations permitted on readonly array
  }
  namespace Contravariance {
    type Normal = { a: string };
    type Narrow = { a: string } & { b: string };
    type Wide = { a: string } | { b: string };

    type _ = CheckTypes<Narrow, Normal>;
    //   ^?
    type _ = CheckTypes<Narrow, Wide>;
    //   ^?
    type _ = CheckTypes<Normal, Wide>;
    //   ^?

    type Narrowkey = keyof Narrow;
    //   ^?
    type NormalKey = keyof Normal;
    //   ^?
    type WideKey = keyof Wide;
    //   ^?

    type _ = CheckTypes<Narrowkey, NormalKey>;
    //   ^?
    type _ = CheckTypes<Narrowkey, WideKey>;
    //   ^?
    type _ = CheckTypes<NormalKey, WideKey>;
    //   ^?
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
  }
  namespace Bivariance {
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

namespace Footguns {
  namespace IntersectionsAndUnions {
    // todo - tell about how contravariance works along with & and |
    // basic example is this
    declare const first: (value: string) => void;
    declare const second: (value: number) => void;
    const mapper = [first, second].map(fn => fn());
    //                                        ^?
  }
  namespace WhatIsEmptyObject {
    // What is {}
    const object: {} = { a: 5 };
    const string: {} = "string";
    const number: {} = 12345;
    const array: {} = [];
    const NULL: {} = null;
  }

  namespace WhatIsObject {
    // What is object
    const object: object = { a: 5 };
    const array: object = [];
    const date: object = new Date();
    const string: object = "string";
  }

  namespace WhatIsFunction {
    // What is Function
    const func: Function = () => 1;
    const CLASS: Function = class {};
  }
}

// todo - I wanna display how nested generics fall back to their constraint which breaks inference
namespace BreaksInference {
  type Base = string | number;
  function first<G extends Base[]>(value: G): G[0] | undefined {
    return value[0];
  }
  function second<G extends { a: Base[] }>(value: G) {
    return first(value.a);
  }

  const init = [3 as const];
  const v1 = first(init);
  //    ^?
  const v2 = second({ a: init });
  //    ^?
}

type Extends<A, B> = [A] extends [B] ? true : false;
type CheckTypes<A, B, K extends [boolean, boolean] = [Extends<A, B>, Extends<B, A>]> = K extends [true, true]
  ? "Equivalent"
  : K extends [true, false]
  ? "First extends second"
  : K extends [false, true]
  ? "Second extends first"
  : "Types are unrelated";
