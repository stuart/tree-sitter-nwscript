cmd_Release/tree_sitter_nwscript_binding.node := c++ -bundle -undefined dynamic_lookup -Wl,-no_pie -Wl,-search_paths_first -mmacosx-version-min=10.10 -arch x86_64 -L./Release -stdlib=libc++  -o Release/tree_sitter_nwscript_binding.node Release/obj.target/tree_sitter_nwscript_binding/src/parser.o Release/obj.target/tree_sitter_nwscript_binding/src/binding.o 
