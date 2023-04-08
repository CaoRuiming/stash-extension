# Stash

This webextension allows for easy stashing of URLs to open later.

I created this extension so that I could manually check many webpages for updates. Normally, this would be the perfect use case for something like an RSS feed reader; however, sometimes subscribing to such feeds isn't an option. This extension fills that gap.

## What is the Stash?

The Stash is essentially a stack data structure containing webpage URLs. The most recently added URLs will be the first to be opened when the Stash is opened.

The Stash's purpose is to store a large number of URLs and open them later in batches on demand. Specifics on actions supported by the Stash are detailed in the [How to Use](#how-to-use) section of this README.

## Setup

You will need to have npm installed. A Unix-like environment with bash is expected.

To set up and install, run `build.sh` and then load the `extension` directory as an unpacked extension in a browser that supports webextensions. To build a Firefox-compatible version, run `./build.sh firefox`.

If you don't have npm or bash, just manually compile the TypeScript files in the `src` directory into ECMAScript 2021 (`ES2021`) or later with ECMAScript modules (`ESNEXT`). Transfer the resulting JavaScript files into the directory `extension/js`.

## How to Use

This extension has two main interfaces/pages:

- A popup containing primary functionality that appears when the extension icon is clicked in the browser toolbar.
- An options page that supports data import and export and some customization options. This is accessible through right clicking the extension icon in the browser toolbar and clicking "Options".

The main functionality of this extension can be broken down into several actions as described below.

### Stash Add

This action adds the URL of the active tab of the active browser window into the Stash. If the URL is already present in the Stash, it is moved to the front/top of the Stash.

### Stash Remove

This action removes the URL of the active tab of the the active browser window from the Stash. If the URL is not present in the Stash at the time of removal, an error is thrown.

### Stash Open

This action keeps track of its own version/copy of the Stash and does not sync up with the most up-to-date version of the Stash unless the beginning of the Stash is opened (i.e. batch 1 is opened). This is so that users will not face any data inconsistency if they modify the Stash as they traverse through the contents in batches.

Given a batch number (batch 1 is always the first batch), opens the first/top `n` URLs from the Stash in LIFO (last in first out) order. Note that this order may be altered by actions besides adding and removing. These URLs are opened into new tabs in the current browser window. `n` is the batch size as configured in the extension's options page. The default batch size is `40`, but this can be changed as necessary.

If no batch number is provided, an error will be thrown. If there are no URLs to open in the Stash or in a given batch, nothing will happen.

### Stash Bump

This action alters the position/index of the current active tab's URL in the Stash by some given integer `x`. If `x` is positive, the current URL will be moved `x` positions forward/upward in the Stash (i.e. the URL will be generally opened in earlier batches on Stash Open). If `x` is negative, the current URL will be moved `x` positions backward/downward in the Stash. All position adjustments will be capped by the ends of the Stash (e.g. if `x` is `-500` for a Stash of size `100`, the current URL will be moved to the back/bottom of the Stash).

If the current URL is not already present in the Stash, nothing will happen.

### Stash Import

This action takes a plain text file as input and replaces the current Stash with the contents of the file.

The imported file must contain newline-separated URLs. Non-URLs are allowed, but they will be filtered out automatically.

### Stash Export

This action takes the current Stash and exports it as a plain text file. This file can be imported again later through the [Stash Import](#stash-import) function.

## Project Philosophy

I built extension for personal use and prioritized simplicity and use of modern ECMAScript/TypeScript over importing external libraries and packages. The only real dependencies for this project are npm and TypeScript -- the ESLint packages are optional but nice to have.

I also don't care about backwards compatibility with older browsers for this project. Setting up transpiling to older versions of ECMAScript/JavaScript wouldn't have been that much more difficult, but I didn't want to transpile things if I didn't have to. I fully expect users of this extension (primarily myself) be running modern web browsers.

## Development

All of the commands listed below are to be run in the root project directory.

To install all dependencies (including `devDependencies`), run `npm install`.

Run `npm run build` to compile the TypeScript to JavaScript. The compiled files will automatically be added to the correct place in the `extension` directory.

Run `npm run lint` to lint the TypeScript files.

Run `npm run lint-fix` to fix automatically fixable lint issues.

Run `npm run format` to format source files in the project.
