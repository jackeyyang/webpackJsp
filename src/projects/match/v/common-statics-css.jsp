---
entry: common
---

<link rel="shortcut icon" href="{{require('images/favicon.ico') }}">
[[ for (var css in htmlWebpackPlugin.files.css) { ]]
[[if (htmlWebpackPlugin.files.css[css].indexOf('vendor') > -1 ){ ]]
    <link href="{{htmlWebpackPlugin.files.css[css]}}" rel="stylesheet">
[[ } ]]
[[ } ]]