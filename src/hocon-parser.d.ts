declare module "hocon-parser" {
  function parse(input: string): unknown;
  export = parse;
}
