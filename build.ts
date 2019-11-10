import ts from 'typescript';
import prettier from 'prettier';
import prettierrc from '@whatasoda/eslint-config/.prettierrc.json';
import { spec } from './package.json';

const targets = ['Int8', 'Uint8', 'Uint8Clamped', 'Int16', 'Uint16', 'Int32', 'Uint32', 'Float32', 'Float64'];
const NAME_LIST = ['BaseTuples', 'Tuples', 'TupleLength', 'NumericTuples', 'N2S'] as const;

const NAMES = (() => {
  return NAME_LIST.reduce<Record<string, typeof NAME_LIST[number]>>((acc, name) => {
    acc[name] = name;
    return acc;
  }, {}) as { [K in typeof NAME_LIST[number]]: K };
})();

const ZERO = () => ts.createLiteralTypeNode(ts.createNumericLiteral('0'));
const T = () => ts.createTypeReferenceNode('T', undefined);
const TextendsOneOfSupportedLength = () => {
  return ts.createTypeParameterDeclaration('T', ts.createTypeReferenceNode(NAMES.TupleLength, undefined));
};

const main = () => {
  const [headerPath, outpath] = process.argv.slice(2);
  const outfile = ts.createSourceFile('index.ts', '', ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
  const printer = ts.createPrinter();

  const header = ts.sys.readFile(headerPath, 'utf-8');
  const content = printer.printList(
    ts.ListFormat.SourceFileStatements,
    ts.createNodeArray(build(spec.MAX_TUPLE_LENGTH, targets)),
    outfile,
  );

  const result = prettier
    .format(`${header}\n${content}`, {
      parser: 'typescript',
      ...(prettierrc as any),
    })
    .replace(/(?<=\n)\/\/\sprettier-ignore\n/g, '')
    .replace(/(?<=0,) (?=0)/g, '');
  ts.sys.writeFile(outpath, result);
};

const build = (length: number, targets: string[]): ts.Statement[] => {
  length++;
  const base = createBaseTuples(undefined, undefined, NAMES.BaseTuples, length);
  const tuples = ts.createInterfaceDeclaration(
    undefined,
    undefined,
    NAMES.Tuples,
    undefined,
    [
      ts.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
        ts.createExpressionWithTypeArguments(undefined, ts.createIdentifier(NAMES.BaseTuples)),
      ]),
    ],
    [],
  );
  const extensions = createTypedArrayExtensions(targets);

  return [tuples, extensions, ...base];
};

type CreateTypeAliasDeclaration = Parameters<typeof ts.createTypeAliasDeclaration>;
const createBaseTuples = (
  decorators: CreateTypeAliasDeclaration[0],
  modifiers: CreateTypeAliasDeclaration[1],
  name: CreateTypeAliasDeclaration[2],
  length: number,
) => {
  const order = `${length}`.length;
  const items = Array.from({ length }).map((_, i) => {
    const identifier = ts.createIdentifier('BT' + `${i}`.padStart(order, '0'));
    const reference = ts.createTypeReferenceNode(ts.getMutableClone(identifier), undefined);
    return [identifier, reference] as const;
  });

  const statements = [
    ts.createTypeAliasDeclaration(
      decorators,
      modifiers,
      name,
      undefined,
      ts.createTupleTypeNode(items.map(([, reference]) => reference)),
    ),
    ...items.map<ts.Statement>(([identifier], i) =>
      ts.createTypeAliasDeclaration(
        undefined,
        undefined,
        identifier,
        undefined,
        ts.createTupleTypeNode(Array.from({ length: i }).map<ts.LiteralTypeNode>(ZERO)),
      ),
    ),
  ];

  statements.forEach((statement) => {
    ts.addSyntheticLeadingComment(statement, ts.SyntaxKind.SingleLineCommentTrivia, ' prettier-ignore', true);
  });
  return statements;
};

const createTypedArrayExtensions = (types: string[]) => {
  const contents = types.reduce<ts.Statement[]>((acc, type) => {
    const localNames = {
      XXXTuple: `${type}Tuple`,
      XXXArray: `${type}Array`,
      XXXArrayConstructor: `${type}ArrayConstructor`,
    };

    const createTuple = (param: ts.TypeNode) => ts.createTypeReferenceNode(localNames.XXXTuple, [param]);
    // type XXXTuple<T extends OneOfSupportedLength> = Omit<XXXArray, number> & NumericTuples[N2S<T>];
    const XXXTuple = ts.createTypeAliasDeclaration(
      undefined,
      undefined,
      localNames.XXXTuple,
      [TextendsOneOfSupportedLength()],
      ts.createIntersectionTypeNode([
        ts.createTypeReferenceNode(localNames.XXXArray, undefined),
        ts.createIndexedAccessTypeNode(
          ts.createTypeReferenceNode(NAMES.NumericTuples, undefined),
          ts.createTypeReferenceNode(NAMES.N2S, [T()]),
        ),
      ]),
    );

    const XXXArrayConstructor = ts.createInterfaceDeclaration(
      undefined,
      undefined,
      localNames.XXXArrayConstructor,
      undefined,
      undefined,
      [
        ts.createConstructSignature(undefined, [], createTuple(ZERO())),
        ts.createConstructSignature(
          [TextendsOneOfSupportedLength()],
          [ts.createParameter(undefined, undefined, undefined, 'length', undefined, T(), undefined)],
          createTuple(T()),
        ),
      ],
    );

    acc.push(XXXTuple, XXXArrayConstructor);
    return acc;
  }, []);

  return ts.createModuleDeclaration(
    undefined,
    [ts.createModifier(ts.SyntaxKind.DeclareKeyword)],
    ts.createIdentifier('global'),
    ts.createModuleBlock(contents),
    ts.NodeFlags.GlobalAugmentation,
  );
};

if (process.mainModule === module) {
  main();
}
