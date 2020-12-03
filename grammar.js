module.exports = grammar({
	name: "nwscript",
 word: $ => $.identifier,

	rules: {
  source_file: $ => repeat($._external_declaration),

  _external_declaration: $ => choice(
    $.function_prototype,
    $.function_definition,
    $.declaration,
    $.struct_definition,
    $.comment,
    $.preprocessor_directive
  ),

  // EXPRESSIONS
  _primary_expression: $ => choice (
    $.identifier,
    $.float,
    $.integer,
    $.hex,
    $.string_const,
    $.object_self_const,
    $.object_invalid_const,
    $.true_const,
    $.false_const,
    seq('(', $.expression, ')'),
    '[]',
    '[', $.float, ']', //Vectors
    '[',  $.float,  $.float, ']',
    '[',  $.float,  $.float, $.float, ']',
  ),

  _postfix_expression: $ => prec(1, choice (
    $._primary_expression,
    $.function_call,
    seq($._postfix_expression, '.', $.identifier),
    seq($._postfix_expression, $.plusplus),
    seq($._postfix_expression, $.minusminus)
  )),

  function_call: $ => prec(3, seq(field('function', $.identifier), '(', optional($.argument_expression_list), ')')),

  argument_expression_list: $ =>
   repeat1(seq($._assignment_expression , optional(','))),

  _unary_expression: $ => choice(
    $._postfix_expression,
    seq($.plusplus, $._unary_expression),
    seq($.minusminus, $._unary_expression),
    seq('+', $._unary_expression),
    seq('-', $._unary_expression),
    seq('~', $._unary_expression),
    seq('!', $._unary_expression)
  ),

  _multiplicative_expression: $ => choice(
    $._unary_expression,
    seq($._multiplicative_expression, '*', $._unary_expression),
    seq($._multiplicative_expression, '/', $._unary_expression),
    seq($._multiplicative_expression, '%', $._unary_expression)
  ),

  _additive_expression: $ => choice(
    $._multiplicative_expression,
    seq($._additive_expression, '+', $._multiplicative_expression),
    seq($._additive_expression, '-', $._multiplicative_expression),
  ),

  _shift_expression: $ => prec(1, choice(
    $._additive_expression,
    seq($._shift_expression, $.sl, $._additive_expression),
    seq($._shift_expression, $.sr, $._additive_expression),
    seq($._shift_expression, $.usr, $._additive_expression),
  )),

  _relational_expression: $ => choice(
    $._shift_expression,
    seq($._relational_expression, '<', $._shift_expression),
    seq($._relational_expression, '>', $._shift_expression),
    seq($._relational_expression, $.lteq, $._shift_expression),
    seq($._relational_expression, $.gteq, $._shift_expression),
  ),

  _equality_expression: $ => choice(
    $._relational_expression,
    seq($._equality_expression, $.eq, $._relational_expression),
    seq($._equality_expression, $.noteq, $._relational_expression),
  ),

  _and_expression: $ => choice(
    $._equality_expression,
    seq($._and_expression, '&', $._equality_expression)
  ),

  _exclusive_or_expression: $ => choice(
    $._and_expression,
    seq($._exclusive_or_expression, '^', $._and_expression)
  ),

  _inclusive_or_expression: $ => choice(
    $._exclusive_or_expression,
    seq($._inclusive_or_expression, '|', $._exclusive_or_expression)
  ),

  _logical_and_expression: $ => choice(
    $._inclusive_or_expression,
    seq($._logical_and_expression, $.andand, $._inclusive_or_expression)
  ),

  _logical_or_expression: $ => choice(
    $._logical_and_expression,
    seq($._logical_or_expression, $.oror, $._logical_and_expression)
  ),

  _conditional_expression: $ => choice(
    $._logical_or_expression,
    seq($._logical_or_expression, '?', $.expression, ':', $._conditional_expression)
  ),

  _assignment_expression: $ => choice(
    $._conditional_expression,
    seq($._unary_expression, $.assignment_operator, $._assignment_expression)
  ),

  expression: $ => $._assignment_expression,
  constant_expression: $ => $._conditional_expression,

  // Comments
		comment: $ => token(choice(
      seq('//', /.*/),
      seq(
        '/*',
        repeat(choice(
          /[^\*]/,
          /\*[^\/]/,
        )),
        '*/'
      )
    )),

   // Type declarations
   _qualified_type_specifier: $ => choice(
     seq('const', $.type_specifier),
     $.type_specifier
   ),

   type_specifier: $ => choice(
     'command',
     'effect',
     'event',
     'float',
     'int',
     'itemproperty',
     'location',
     'object',
     'sqlquery',
     'string',
     'talent',
     'vector',
     'void',
     'action',
     'talent',
     seq('struct', $.identifier)
    ),

 // statements
 statement: $ => choice(
   $._non_blank_statement,
   $.comment,
   ';'
 ),

 statement_blank_error: $ => choice(
   $._non_blank_statement,
   ';'
 ),

 _non_blank_statement: $ => choice(
   $.labelled_statement,
   $.compound_statement,
   $.expression_statement,
   $.selection_statement,
   $.iteration_statement,
   $._jump_statement,
   $.declaration
 ),

 labelled_statement: $ => $.case_statement,
 case_statement: $ => choice(
  seq('case', $.constant_expression, ':'),
  seq('default', ':')
  ),

 compound_statement: $ => seq('{', optional($.statement_list), '}'),

 statement_list: $ => repeat1($.statement),

 expression_statement: $ => seq($.expression, ';'), // ?>>

 // if / switch
 selection_statement: $ => choice(
    seq($.if_start, $.statement_blank_error),
    seq($.if_else_start, $.statement_blank_error),
    seq($.switch_start, $.statement)
 ),

 if_else_start: $ => prec(1, seq($.if_start, $.statement_blank_error, 'else')),

 if_start: $ => seq('if', '(', $.expression ,')'),

 switch_start: $ => seq('switch', '(', $.expression, ')'),

 // iteration
 iteration_statement: $ => choice(
   seq($.while_start, $.statement),
   seq($.do_start, $.statement, 'while', '(', $.expression, ')'),
   seq($.for_start, $.statement)
 ),

 for_start: $ => prec.left(choice(
   seq($.for_start_start, ';', ';', ')'),
   seq($.for_start_start, $.expression, ';', ';'),
   seq($.for_start_start, ';', $.expression, ';'),
   seq($.for_start_start, $.expression, ';', $.expression, ';'),
   seq($.for_start_start, ';', ';', $.expression),
   seq($.for_start_start, $.expression, ';', ';', $.expression),
   seq($.for_start_start, ';', $.expression, ';', $.expression),
   seq($.for_start_start, $.expression, ';', $.expression, ';', $.expression),
 )),

 for_start_start: $ => seq('for', '('),

 while_start: $ => seq('while', '(', $.expression, ')'),

 do_start: $ => 'do',

 //Jump statements
 _jump_statement: $ => choice(
   seq('continue', ';'),
   seq('break', ';'),
   seq($.return_start, ';'),
   seq($.return_start, $.expression, ';')
 ),

 return_start: $ => $.return,

 // Declarations
 declaration: $ => seq($._qualified_type_specifier, $._init_declarator_list, ';'),

 _init_declarator_list: $ => choice(
   $._init_declarator,
   seq($._init_declarator_list, ',', $._init_declarator)
 ),

 _init_declarator: $ => choice(
   $._init_declarator_identifier,
   seq($._init_declarator_identifier, '=', $._assignment_expression)
 ),

 _init_declarator_identifier: $ => $.identifier,

 // Function definition
 function_definition: $ => seq($.function_declarator, $.compound_statement),

 function_prototype: $ => seq($.function_declarator, ';'),

 function_declarator: $ => choice(
   seq($._qualified_type_specifier, $.identifier, '(',
   $.function_parameter_list, ')'),
   seq($._qualified_type_specifier, $.identifier, '(', ')')
  ),

 function_parameter_list: $ => repeat1(
    seq($._function_parameter_declaration, optional(','))
 ),

 _function_parameter_declaration: $ => choice(
    seq($._qualified_type_specifier, $.identifier),
    seq($._qualified_type_specifier, $.identifier, '=', $._assignment_expression)
 ),

 //Structures
 struct_definition: $ => seq(
   'struct',
   $.identifier,
   '{' , $.struct_declaration_list, '}', ';'),

 struct_declaration_list: $ =>  seq(
  optional($.struct_declaration_list),
  $.struct_declaration
 ),

 struct_declaration: $ => seq(
  $._qualified_type_specifier, $.struct_declarator_list, ';'
 ),

 struct_declarator_list: $ => choice(
   $.identifier,
   seq($.struct_declarator_list, ',', $.identifier)
 ),

 // Tokens
 constant_identifier: $ => /[A-Z_]+/,

 identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

 hex: $ => /0[xX][a-fA-F0-9]+/,
 integer: $ => /[0-9]+/,
 float: $ => /[0-9]+\.[0-9]+[fF]?/,

 _number: $ => choice(
  $.hex,
  $.integer,
  $.float
 ),

 string_const: $ => /".*"/,

 // Operator tokens
 return: $ => 'return',

 assignment_operator: $ => choice(
   '=',
   $.addeq,
   $.subeq,
   $.muleq,
   $.modeq,
   $.xoreq,
   $.oreq,
   $.sleq,
   $.sreq,
   $.usreq
  ),

 addeq: $ => '+=',
 plusplus: $ => '++',
 subeq: $ => '-=',
 minusminus: $ => '--',
 muleq: $ => '*=',
 modeq: $ => '%=',
 xoreq: $ => '^=',
 andeq: $ => '&=',
 andand: $ => '&&',
 oreq: $ => '|=',
 oror: $ => '||',
 noteq: $ => '!=',
 eq: $ => '==',
 lteq: $ => '<=',
 sleq: $ => '<<=',
 sl: $ => '<<',
 gteq: $ => '>=',
 sr: $ => '>>',
 sreq: $ => '>>=',
 usreq: $ => '>>>=',
 usr: $ => '>>>',

 //Preprocessor tokens.
 pre_if: $ => '#if',
 pre_else: $ => '#else',
 pre_endif: $ => '#endif',
 pre_elif: $ => '#elif',
 pre_include: $ => '#include',
 pre_define: $ => '#define',
 pre_undef: $ => '#undef',
 pre_pragma: $ => '#pragma',
 pre_ifdef: $ => '#ifdef',
 pre_ifndef: $ => '#ifndef',
 pre_warning: $ => '#warning',
 pre_error: $ => '#error',

 preprocessor_directive: $ => choice(
   $._preprocessor_include,
   $._preprocessor_define
 ),

 _preprocessor_include: $ => seq($.pre_include, $.string_const),
 _preprocessor_define: $ => seq($.pre_define, $.identifier, $._primary_expression),

 // Predefined Constants
 predefined_constants: $ => choice(
   $.object_self_const,
   $.object_invalid_const,
   $.true_const,
   $.false_const
 ),

 object_self_const: $ => 'OBJECT_SELF',
 object_invalid_const: $ => 'OBJECT_INVALID',
 true_const: $ => 'TRUE',
 false_const: $ => 'FALSE'
},
})
