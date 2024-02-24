namespace Covariance {}
namespace Bivariance {
  // todo - this is a wrong explanation, VARIANCE IS ABOUT TYPE TRANSFORMATION, NOT TYPE ITSELF!!!!
  //   investigate here - https://stackoverflow.com/a/66411491
}

namespace SubtypeWeirdness {
  // When bi-extension doesn't mean equivalence
  type BiExtended<A, B> = [A extends B ? true : false, B extends A ? true : false];
  type A = BiExtended<{}, { a?: string }>; // wrong
  //   ^?
  type B = BiExtended<{ a?: string }, { b?: string }>;
  //   ^?
  type B2 = BiExtended<{ a?: string; c: string }, { b?: string; c: string }>; // wrong
  //   ^?
  type C = BiExtended<Record<never, unknown>, { b?: string }>; // wrong
  //   ^?
  type D = BiExtended<Record<PropertyKey, unknown>, { b?: string }>; // wrong
  //   ^?
  type E = BiExtended<{ b: string }, { a?: string; b: string }>; // wrong
  //   ^?

  /** Рассказать про сложности с index/never ключами - работают они не так же как конкретные ключи, тк не требуют их наличия */
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
