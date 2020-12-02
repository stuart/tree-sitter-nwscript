void main(){};
// <- type.builtin
//    ^ identifier

struct Quaternion{
// <- keyword
//       ^ identifier
  int i;
// ^ type.builtin
//    ^ identifier
  int j;
  int k;
  int w;
};

for(int i = 0; i < 12; i++){}
//<- @keyword
//  ^ type.builtin
//      ^ identifier
//        ^ operator
//          ^ number
//               ^ operator

#include "my_inc_file"
// ^ preprocessor
