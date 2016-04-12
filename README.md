# Angular Warp Scroll
Simple directive for scrolling into the website and add dots navigation automatically. Currently under development.

<img src="https://raw.githubusercontent.com/nextlevelshit/angular-warp-scroll/master/preview.gif" alt="Preview" />


# Requirements

- AngularJS 1.5+
- jQuery 2.2+ (still)

# Installation 

You have two ways to get this module running. Choose this one you feel most comfortable with.

## Installation without Package Manager

### 1) Download

Download `angular-scroll-watch` from [https://github.com/nextlevelshit/angular-warp-scroll/archive/master.zip](https://github.com/nextlevelshit/angular-warp-scroll/archive/master.zip) and unzip.

### 2) Solve dependencies

Include `jQuery` and `AngularJS` from CDN or download the main script files to your folder.

### 3) ADd files to your website

```html
<link rel="stylesheet" type="text/css" href="[PATH-TO-YOUR-DOWNLOAD-FOLDER]/build/styles.min.css">
<script src="[PATH-TO-YOUR-DOWNLOAD-FOLDER]/build/angular-warp-scroll.min.js"></script>

<script src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.5.3/angular.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.2.3/jquery.min.js"></script>

```

Please do not forget to specify the folder to the downloaded files. Replace `[PATH-TO-YOUR-DOWNLOAD-FOLDER]` with your path to the downloaded files.


## Installation with npm

### 1) Check if you got node.js already running

```sh
node -v
```

If you get no result please download and install `node.js` from [https://docs.npmjs.com/getting-started/installing-node](https://docs.npmjs.com/getting-started/installing-node)

### 2) Install `angular-warp-scroll`

```sh
npm install angular-warp-scroll
```

### 3) Install dependencies `jquery` and `angular`

```sh
npm install jquery
npm install angular
```

### 3) Add all necessary files to your website

Put this lines into `<head>` of your website.

```html
<script src="node_modules/jquery/dist/jquery.min.js"></script>
<script src="node_modules/angular/angular.min.js"></script>
<script src="node_modules/angular-warp-scroll/build/angular-warp-scroll.min.js"></script>
```

It is also  recommended to use the delivered styles, but they are not necessary.

```html
<link rel="stylesheet" href="node_modules/angular-warp-scroll/build/styles.min.css">
```

### 4) Initialize the script

Specify the angular app in the `<html>` tag.

```html
<html ng-app="app">
```

Load `angular-warp-scroll` controller in the `<body>` tag.

```html
<body ng-controller="scrollCtrl">
```


# Documentation

After you have followed all steps above, you are now free to use this module. Take a look at the [example.html](https://github.com/nextlevelshit/angular-warp-scroll/blob/master/example.html) to see all features.

## Features

### Dots navigation

```html
<aside>
    <div class="flex flex--center">
        <div class="flex__item">
            <dots status="scrollStatus"></dots>
        </div>
    </div>
</aside>
```

The navigation is rendered automatically from the amount of slides, which are declared by `class="slide"`.
Adding the attribute `data-title` specifies the displayed navigation point.

### Adding slides

Add element with class `slide` to a wrapper.

```html
<div class="slide__wrapper">
    <div class="slide" data-title="First slide">
        <div class="flex flex--center">
            <div>
                <h1>Slide #1</h1>
            </div>
        </div>
    </div>

    <div class="slide" data-title="Second slide">
        <div class="flex flex--center">
            <div>
                <h1>Slide #2</h1>
            </div>
        </div>
    </div>
</div>
```

