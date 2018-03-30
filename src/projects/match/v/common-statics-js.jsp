---
entry: common
---



    [[ for (var chunk in htmlWebpackPlugin.files.chunks) { ]]
    [[if (chunk =='manifest'){ ]]
    <script src="{{ htmlWebpackPlugin.files.chunks[chunk].entry}}"></script>
    [[ } ]]
    [[ } ]]

    [[ for (var chunk in htmlWebpackPlugin.files.chunks) { ]]
    [[if (chunk =='vendor'){ ]]
    <script src="{{ htmlWebpackPlugin.files.chunks[chunk].entry}}"></script>
    [[ } ]]
    [[ } ]]

