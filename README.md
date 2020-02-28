<p align="center">
    <img width="150" height="auto" src="assets/img/socialbot_logo.png">
</p>
<h1 align="center">SocialBot</h1>

**Chrome Extension that allows to perform repetitive actions for gaining followers on social networks**

**WARNING** - This extension is under active refactoring and should be counted as an experiment.

## Supported social networks

* Instagram
* ___500px - in progress___
* ___Flickr - in progress___

## Main features

* Like hashtag
* Like people that likes you
* Like dashboards
* Completely personalized settings in dedicated control panel

## Changelogs
* v2.0rc1 - in progress - v2 branch
    * Heavy refactoring and code update
    * Updated all libraries to latest versions + fixed compatibility issues
    * Added testing libraries and tests to all main functionalities
    * Redone settings UI for better experience
    * ___Inclusion of AI for images context recognition___
    * [Instagram] Inclusion of rate limiter
    * [Instagram] Added work hours in order to not clash with user

* v1 - Legacy version - master branch

## Build Setup

``` bash
# Install dependencies
npm install

# Run development with automatic recompilation of extension
npm run dev

# Build for production with minification
npm run build

# Perform tests to all main service and frontend modules
npm test
```
