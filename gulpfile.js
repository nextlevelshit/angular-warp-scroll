var gulp = require('gulp'),
    gutil = require('gulp-util');

var connect = require('gulp-connect'),
    livereload = require('gulp-livereload'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    changed = require('gulp-changed'),
    cache = require('gulp-cached'),
    rename = require('gulp-rename'),
    annotate = require('gulp-ng-annotate'),
    header = require('gulp-header'),
    sass = require('gulp-sass'),
    sitemap = require('gulp-sitemap'),
    realFavicon = require ('gulp-real-favicon'),
    fs = require('fs');

var pkg = require('./package.json');

var getTodayStr = function () {
    var date = new Date(),
        y = date.getFullYear(),
        m = date.getMonth() + 1,
        d = date.getDate();

    return y + '-' + m + '-' + d;
};

var config = {
    appRoot: '',
    src: 'src/angular-warp-scroll.js',
    scssDir: 'src/scss/*.scss',
    buildDir: 'build',
    banner: '/*! <%= pkg.name %>\n' +
    'version: <%= pkg.version %>\n' +
    'build date: <%= today %>\n' +
    'author: <%= pkg.author %>\n' +
    '<%= pkg.repository.url %> */\n'
};

gulp.task('build', ['lint'], function () {
    return gulp.src(config.src)
        .pipe(annotate())
        .pipe(header(config.banner, {pkg: pkg, today: getTodayStr()}))
        .pipe(gulp.dest(config.buildDir))
        // Minify js output
        .pipe(uglify())
        .pipe(rename({extname: '.min.js'}))
        .pipe(header(config.banner, {pkg: pkg, today: getTodayStr()}))
        .pipe(gulp.dest(config.buildDir));
});

gulp.task('lint', function () {
    return gulp.src(config.src)
        .pipe(cache('linting'))
        .pipe(jshint.extract('auto'))
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('watch', function () {
    gulp.watch(config.src, ['build']);
});

gulp.task('watch:sass', function () {
    gulp.watch(config.scssDir, ['sass']);
});

gulp.task('serve', function () {
    connect.server({
        root: config.appRoot,
        port: 9000
    });
});

gulp.task('sass', function () {
    return gulp.src('./src/scss/styles.scss')
        .pipe(changed('./', {extension: '.css'}))
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(config.buildDir))
        // Minify css output
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(rename({extname: '.min.css'}))
        .pipe(gulp.dest(config.buildDir))
});

gulp.task('sitemap', function () {
    gulp.src('index.html')
        .pipe(sitemap({
            siteUrl: 'http://www.dailysh.it'
        }))
        .pipe(gulp.dest('./'));
});

/**
 * Generate favicons
 **/
var FAVICON_DATA_FILE = 'faviconData.json';

gulp.task('generate-favicon', function(done) {
    realFavicon.generateFavicon({
        masterPicture: 'assets/favicon.png',
        dest: './build/favicons',
        iconsPath: '/',
        design: {
            ios: {
                pictureAspect: 'noChange'
            },
            desktopBrowser: {},
            windows: {
                pictureAspect: 'noChange',
                backgroundColor: '#cc0a4d',
                onConflict: 'override'
            },
            androidChrome: {
                pictureAspect: 'noChange',
                themeColor: '#ffffff',
                manifest: {
                    name: 'NLS',
                    display: 'browser',
                    orientation: 'notSet',
                    onConflict: 'override',
                    declared: true
                }
            },
            safariPinnedTab: {
                pictureAspect: 'blackAndWhite',
                threshold: 61.71875,
                themeColor: '#5bbad5'
            }
        },
        settings: {
            compression: 5,
            scalingAlgorithm: 'Mitchell',
            errorOnImageTooSmall: false
        },
        markupFile: FAVICON_DATA_FILE
    }, function() {
        done();
    });
});

gulp.task('inject-favicon-markups', function() {
    gulp.src('index.html')
        .pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
        .pipe(gulp.dest('./'));
});

gulp.task('check-for-favicon-update', function(done) {
    var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
    realFavicon.checkForUpdates(currentVersion, function(err) {
        if (err) {
            throw err;
        }
    });
});

gulp.task('default', ['build', 'sitemap']);
gulp.task('dev', ['build', 'sass', 'watch', 'watch:sass', 'serve']);
