# Stash

This webextension allows for easy stashing of URLs to open later.

## Setup

You will need to have npm installed. A Unix-like environment with bash is expected.

To set up and install, run `build.sh` and then load the `extension` directory as an unpacked extension in a browser that supports webextensions.

If you don't have npm or bash, just manually compile the TypeScript files in the `src` directory into ECMAScript 2021 (`ES2021`) or later with ECMAScript modules (`ESNEXT`). Transfer the resulting JavaScript files into the directory `extension/js`.

## Project Philosophy

I built extension for personal use and prioritized simplicity and use of modern ECMAScript over importing external libraries and packages. The only real dependencies for this project are npm and TypeScript -- the ESLint packages are optional but nice to have.

I also don't care about backwards compatibility with older browsers for this project. Setting up transpiling to older versions of ECMAScript/JavaScript wouldn't have been that much more difficult, but it would have complicated the configuration of the extension and made it more heavyweight than I was willing to maintain in the long term.

## Development

All of the commands listed below are to be run in the root project directory.

To install all dependencies (including `devDependencies`), run `npm install`.

Run `npm run build` to compile the TypeScript to JavaScript. The compiled files will automatically be added to the correct place in the `extension` directory.

Run `npm run lint` to lint the TypeScript files.

Run `npm run lint-fix` to fix automatically fixable lint issues.
