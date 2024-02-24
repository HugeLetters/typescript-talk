namespace Variance {
  type Extends<A, B> = [A] extends [B] ? true : false;
  type CheckTypes<A, B, K extends [boolean, boolean] = [Extends<A, B>, Extends<B, A>]> = K extends [
    true,
    true
  ]
    ? "Equivalent"
    : K extends [true, false]
    ? "First extends second"
    : K extends [false, true]
    ? "Second extends first"
    : "Types are unrelated";

  //   investigate here - https://stackoverflow.com/a/66411491
  namespace Covariance {
    type Narrow = string;
    type Wide = string | number;
    type Before = CheckTypes<Narrow, Wide>;
    //    ^?
    namespace ObjectWithProperty {
      type WithA<T> = { a: T };
      type After = CheckTypes<WithA<Narrow>, WithA<Wide>>;
      //    ^?
    }
    namespace Array {
      type After = CheckTypes<Array<Narrow>, Array<Wide>>;
      //    ^?
      type After2 = CheckTypes<ReadonlyArray<Narrow>, ReadonlyArray<Wide>>;
      //    ^?

      type F = Array<Narrow>["unshift"];
      type S = Array<Wide>["unshift"];
      //   todo - this is equivalent because these are methods, not properties
      type R = CheckTypes<F, S>;
      //   ^?
    }
  }
  namespace Contravariance {}
  namespace Invariance {
    // array is a good example of this - it's considered covariant by TS but actually invariant
  }
  namespace Bivariance {
    namespace Method {
      let wide = { a(x: string) {} };
      let narrow = { a(x: string | number) {} };
      wide = narrow;
      narrow = wide;
    }
    namespace Property {
      let wide = { a: (x: string) => {} };
      let narrow = { a: (x: string | number) => {} };
      wide = narrow;
      narrow = wide;
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

// todo
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

namespace Assignability {
  type A = { a: number };
  type B = {};
}
