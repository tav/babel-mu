import * as t from "../../types";

export default function build(node, buildBody) {
  var self = node.blocks.shift();
  if (!self) return;

  var child = build(node, buildBody);
  if (!child) {
    // last item
    child = buildBody();

    // add a filter as this is our final stop
    if (node.filter) {
      child = t.ifStatement(node.filter, t.blockStatement([child]));
    }
  }

  if (self.cType === "in") {
    return t.forInStatement(
      t.variableDeclaration("var", [t.variableDeclarator(self.left)]),
      self.right,
      t.blockStatement([child])
    );
  }

  return t.forOfStatement(
    t.variableDeclaration("var", [t.variableDeclarator(self.left)]),
    self.right,
    t.blockStatement([child])
  );
}
