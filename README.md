<h1 align="center">Text Tools</h1>

<p align="center">
    <img src="docs/images/TextToolsExample.png" alt="Text Tools Example">
  <br>
  <i>Useful tools to manage your strings quickly.</i>
  <br>
</p>

<p align="center">
  <a href="https://mfcar.github.io/TextTools/"><strong>https://mfcar.github.io/TextTools/</strong></a>
  <br>
</p>

<p align="center">
  <a href="https://github.com/mfcar/TextTools/issues">Submit an Issue</a>
  <br>
  <br>
</p>

<p align="center">
  <a href="https://travis-ci.com/mfcar/TextTools">
    <img src="https://travis-ci.com/mfcar/TextTools.svg?branch=main" alt="Travis status" />
  </a>&nbsp;
  <a href="https://github.com/mfcar/TextTools/actions/workflows/main.yml">
    <img src="https://github.com/mfcar/TextTools/actions/workflows/main.yml/badge.svg" alt="Push to GitHub Pages" />
  </a>&nbsp;
  <a href="https://sonarcloud.io/summary/new_code?id=mfcar_TextTools">
    <img src="https://sonarcloud.io/api/project_badges/measure?project=mfcar_TextTools&metric=alert_status" alt="Quality Gate Status" />
  </a>&nbsp;
  <a href="https://github.com/mfcar/TextTools/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue" alt="License" />
  </a>
</p>

<hr>

## Contributing

To add your scripts

1. Clone this project.
2. Run `npm install` to install the Node.js dependencies.
3. Run `ng g s scripts/<your script name>`.
4. Open the generated service file in your editor, add implements IScript and
   implement `transform(text: string, parameters?: any[]): string {}` method.
5. Edit `shared/scriptsList.ts` and add your script properties.

## Thanks

Thanks to [Angular](https://angular.io/), [Lodash](https://lodash.com/), [Boop](https://boop.okat.best/)
, [CyberChef](https://gchq.github.io/CyberChef) and many other authors for providing the libs, references, knowledge for
this project happens.

