export type Option<A> = Some<A> | None<A>;

// 1. `abstract class` defines class that cannot be instantiated
abstract class OptionBase<A> {
  getOrElse(this: Option<A>, defaultValue: A): A {
    if (this.tag === "none") return defaultValue;
    return this.value;
  }
}

// 5. `extends` keyword creating inheritance relationship
export class Some<A> extends OptionBase<A> {
  readonly tag: "some" = "some";

  // 6. classes must call `super()` if they extend other classes
  constructor(readonly value: A) {
    super();
  }
}

export class None<A> extends OptionBase<A> {
  // 7. `never` is the "bottom type"
  // 8. `static` creates "class" property
  static readonly NONE: Option<never> = new None();

  readonly tag: "none" = "none";

  // 9. `private` prevents access by external code
  private constructor() {
    super();
  }
}

// 10. smart constructors for `None` and `Some`
export const none = <A>(): Option<A> => None.NONE;

export const some = <A>(a: A): Option<A> => new Some(a);
