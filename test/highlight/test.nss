void main(){};
// <- type
//    ^ identifier

struct Quaternion{
// <- keyword
//       ^ identifier
  int i;
// ^ type
//    ^ identifier
  int j;
  int k;
  int w;
};

for(int i = 0; i < 12; i++){}
//<- @keyword
//  ^ type
//      ^ identifier
//        ^ operator
//          ^ number
//               ^ operator
