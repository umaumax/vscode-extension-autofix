# vscode-extension-autofix README

Automatically collecting typo at vscode

## Features
* auto reload `settings.json` config

### loadmap
* [x] enable with space pattern (v0.0.2)
  * e.g. `"; "` -> `": "`
* [ ] enable regex replace
  * e.g. `(.*) cout` -> `std::cout << \1 << std::endl;`
* [ ] cache build regex pattern

## Extension Settings

e.g.
`settings.json`
``` json
"autofix.dictionary": [
  {
    "languages": ["*"],
    "words": {
      "forcus": "focus"
    }
  }
  {
    "languages": ["rust"],
    "words": {
      ";;": "::",
      "\\+>": "=>"
    }
  }
],
```
