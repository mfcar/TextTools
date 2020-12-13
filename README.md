<p align="center">
  <a href="https://mfcar.github.io/TextTools/">
    <img src="docs/images/TextToolsExample.png" alt="Text Tools Example">
  </a>
</p>

<h3 align="center">Text Tools</h3>

<p align="center">
  Useful tools to manage your strings quickly.
</p>

## Status
[![Build Status](https://travis-ci.com/mfcar/TextTools.svg?branch=main)](https://travis-ci.com/mfcar/TextTools)

## Contributing

To add your scripts
1. Clone this project.
2. Run `npm install` to install the Node.js dependencies.
3. Run `ng g s scripts/<your script name>`.
4. Open the generated service file in your editor, add implements IScript and implement `transform(text: string, parameters?: any[]): string {}` method.
5. Edit `shared/scriptsList.ts` and add your script properties.

## Thanks

Thanks to [Angular](https://angular.io/), [Lodash](https://lodash.com/), [Boop](https://boop.okat.best/) and many other authors for providing the libs, references, knowledge for this project happens.

