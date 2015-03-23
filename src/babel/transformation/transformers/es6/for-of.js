import * as messages from "../../../messages";
import * as util from  "../../../util";
import * as t from "../../../types";

export var check = t.isForOfStatement;

export function ForOfStatement(node, parent, scope, file) {
  if (this.get("right").isArrayExpression()) {
    return _ForOfStatementArray.call(this, node, scope, file);
  }

  var build  = loose(node, parent, scope, file);
  var declar = build.declar;
  var loop   = build.loop;
  var block  = loop.body;

  // inherit comments from the original loop
  t.inheritsComments(loop, node);

  // ensure that it's a block so we can take all its statements
  t.ensureBlock(node);

  // add the value declaration to the new loop body
  if (declar) {
    block.body.push(declar);
  }

  // push the rest of the original loop body onto our new body
  block.body = block.body.concat(node.body.body);

  t.inherits(loop, node);

  if (build.replaceParent) this.parentPath.node = build.node;
  return build.node;
}

export function _ForOfStatementArray(node, scope, file) {
  var nodes = [];
  var right = node.right;

  if (!t.isIdentifier(right) || !scope.hasBinding(right.name)) {
    var uid = scope.generateUidIdentifier("arr");
    nodes.push(t.variableDeclaration("var", [
      t.variableDeclarator(uid, right)
    ]));
    right = uid;
  }

  var iterationKey = scope.generateUidIdentifier("i");

  var loop = util.template("for-of-array", {
    BODY: node.body,
    KEY:  iterationKey,
    ARR:  right
  });

  t.inherits(loop, node);
  t.ensureBlock(loop);

  var iterationValue = t.memberExpression(right, iterationKey, true);

  var left = node.left;
  if (t.isVariableDeclaration(left)) {
    left.declarations[0].init = iterationValue;
    loop.body.body.unshift(left);
  } else {
    loop.body.body.unshift(t.expressionStatement(t.assignmentExpression("=", left, iterationValue)));
  }

  nodes.push(loop);

  return nodes;
}

var loose = function (node, parent, scope, file) {
  var left = node.left;
  var declar, id, temp, tempID, tmpl = "for-of-loose";

  // for (i of test)
  if (t.isIdentifier(left)) {
    tmpl = "for-of-loose-no-id";
    id = left;
  // for ({ i } of test)
  } else if (t.isPattern(left) || t.isMemberExpression(left)) {
    id = scope.generateUidIdentifier("ref");
    declar = t.expressionStatement(t.assignmentExpression("=", left, id));
  } else if (t.isVariableDeclaration(left)) {
    // for (var i of test)
    if (left.kind === "var" && ((temp = left.declarations).length === 1) && ((tempID = temp[0].id).type === "Identifier")) {
      id = {type: "Identifier", name: tempID.name};
    // for (var { i } of test)
    } else {
      id = scope.generateUidIdentifier("ref");
      declar = t.variableDeclaration(left.kind, [
        t.variableDeclarator(left.declarations[0].id, id)
      ]);
    }
  } else {
    throw file.errorWithNode(left, messages.get("unknownForHead", left.type));
  }

  var iteratorKey = scope.generateUidIdentifier("iterator");
  var isArrayKey  = scope.generateUidIdentifier("isArray");

  var loop = util.template(tmpl, {
    LOOP_OBJECT:  iteratorKey,
    IS_ARRAY:     isArrayKey,
    OBJECT:       node.right,
    I_INDEX:      scope.generateUidIdentifier("i"),
    J_INDEX:      scope.generateUidIdentifier("j"),
    ID:           id
  });

  return {
    declar: declar,
    node:   loop,
    loop:   loop
  };
};
