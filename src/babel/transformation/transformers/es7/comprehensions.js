import buildComprehension from "../../helpers/build-comprehension";
import traverse from "../../../traversal";
import * as util from  "../../../util";
import * as t from "../../../types";

export var metadata = {
  experimental: true,
  optional: true
};

export function ComprehensionExpression(node, parent, scope, file) {
  var callback = array;
  if (node.generator) callback = generator;
  return callback(node, parent, scope, file);
}

export function ForInStatement(node, parent, scope, file) {
  var nodes = [];
  var right = node.right;

  if (!t.isIdentifier(right)) {
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

function generator(node) {
  var body = [];
  var container = t.functionExpression(null, [], t.blockStatement(body), true);
  container.shadow = true;

  body.push(buildComprehension(node, function () {
    return t.expressionStatement(t.yieldExpression(node.body));
  }));

  return t.callExpression(container, []);
}

function array(node, parent, scope, file) {
  var uid = scope.generateUidBasedOnNode(parent, file);

  var container = util.template("array-comprehension-container", {
    KEY: uid
  });
  container.callee.shadow = true;

  var block = container.callee.body;
  var body  = block.body;

  if (traverse.hasType(node, scope, "YieldExpression", t.FUNCTION_TYPES)) {
    container.callee.generator = true;
    container = t.yieldExpression(container, true);
  }

  var returnStatement = body.pop();

  body.push(buildComprehension(node, function () {
    return util.template("array-push", {
      STATEMENT: node.body,
      KEY:       uid
    }, true);
  }));
  body.push(returnStatement);

  return container;
}
