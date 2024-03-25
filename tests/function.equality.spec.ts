it('compares objects with functions', () => {
  const a = {
    a: 1,
    b: {
      c: undefined,
    },
    someFn: function () {},
  };
  const b = {
    a: 1,
    b: {
      c: undefined,
    },
    someFn: function () {},
  };
  expect(a).toEqual(b);
});

it('detects if functions are not equal', () => {
  const a = {
    a: 1,
    b: {
      c: undefined,
    },
    someFn: function () {},
  };
  const b = {
    a: 1,
    b: {
      c: undefined,
    },
    someFn: function () {
      return 1;
    },
  };
  expect(a).not.toEqual(b);
});

it('compares functions when calling toMatchObject', () => {
  const a = {
    a: 1,
    b: {
      c: 2,
    },
    d: false,
    e: () => {},
  };
  const b = {
    a: 1,
    b: {
      c: 2,
    },
    e: () => {},
  };
  expect(a).toMatchObject(b);
});

it('works with toHaveBeenCalledWith', () => {
  const mock = jest.fn();
  mock({ a: 1, b: 2, c: () => {}, d: function () {} });
  expect(mock).toHaveBeenCalledWith(expect.objectContaining({ a: 1, b: 2 }));
  expect(mock).toHaveBeenCalledWith(
    expect.objectContaining({
      a: 1,
      b: 2,
      c: () => {},
    })
  );
});
