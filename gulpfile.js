'use strict';
require('dotenv').config();

// base gulp
var gulp = require('gulp');
const { watch, series } = require('gulp');
var rename = require('gulp-rename');
var replace = require('gulp-string-replace');
const zip = require('gulp-zip');



// sass 
var sass = require('gulp-dart-sass');
var concat = require('gulp-concat');
var cssminify = require('gulp-uglifycss');
var gulpsourcemaps = require('gulp-sourcemaps');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');

// JS pipeline
var jsminify = require('gulp-uglify');
var jshint = require('gulp-jshint');
const stylish = require('jshint-stylish');


// PHP pipeline
const phplint = require('gulp-phplint');
var replacements = {
    themeVersion: {
        find: '##gulpverupdate##',
        replace: process.env.themeVersion ? process.env.themeVersion : new Date().getTime()
    },
    themeNiceName: {
        find: '##themeNiceName##',
        replace: process.env.themeNiceName ? process.env.themeNiceName : 'Child Theme' // check .env file for themeName or use default
    },
    themeName: {
        find: '##themeName##',
        replace: process.env.themeName ? process.env.themeName : 'child-theme' // check .env file for themeName or use default
    },
    parentThemeName: {
        find: '##parentThemeName##',
        replace: process.env.parentThemeName ? process.env.parentThemeName : 'Parent Theme' // check .env file for parentThemeName or use default
    }
};

/* for each find/replace we will add: 
.pipe(replace(replacements.var.find, replacements.var.replace)

Our starter is: 
.pipe(replace(replacements.themeVersion.find, replacements.themeVersion.replace)
.pipe(replace(replacements.themeName.find, replacements.themeName.replace)
.pipe(replace(replacements.parentThemeName.find, replacements.parentThemeName.replace)
        

*/


var paths = {
    sass: ['./gulp/**/*.scss'],
    stylesheet: ['./gulp/scss/style.scss'],
    js: ['./gulp/js/**/*.js'],
    php: ['./gulp/**/*.php'],

    build: ['./build/'],

    build_scss: ['./build/css/'],
    build_js: ['./build/js/'],

    build_sync: ['./build/**/*.*'],

    dev: ['./dev/'],
    localSync: process.env.localSync
};
console.log(paths.localSync);



gulp.task('style', gulp.parallel(function () {
    return gulp
        .src(paths.stylesheet)
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([autoprefixer()]))
        .pipe(cssminify())
        .pipe(gulpsourcemaps.write())
        .pipe(replace(replacements.themeVersion.find, replacements.themeVersion.replace))
        .pipe(replace(replacements.themeName.find, replacements.themeName.replace))
        .pipe(replace(replacements.themeNiceName.find, replacements.themeNiceName.replace))
        .pipe(replace(replacements.parentThemeName.find, replacements.parentThemeName.replace))
        .pipe(gulp.dest(paths.build));
}));


gulp.task('sass', gulp.parallel(function () {
    return gulp
        .src(paths.sass)
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([autoprefixer()]))
        .pipe(cssminify())
        .pipe(
            rename({
                suffix: '.min',
                dirname: '/', // flatten all subfolders
            })
        )
        .pipe(gulpsourcemaps.write())
        .pipe(replace(replacements.themeVersion.find, replacements.themeVersion.replace))
        .pipe(replace(replacements.themeName.find, replacements.themeName.replace))
        .pipe(replace(replacements.themeNiceName.find, replacements.themeNiceName.replace))
        .pipe(replace(replacements.parentThemeName.find, replacements.parentThemeName.replace))
        .pipe(gulp.dest(paths.build_scss));
}));

gulp.task('watch_scss', function () {
    gulp.watch(paths.sass, gulp.parallel(['sass', 'style']));
});

gulp.task('minjs', gulp.parallel(function () {
    return gulp
        .src(paths.js)
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        // .pipe(jshint.reporter('fail'))
        .pipe(jsminify()) // Minify all custom js
        .pipe(
            rename({
                suffix: '.min', // minifier note
                // dirname: '/', // flatten all subfolders
            })
        )
        .pipe(replace(replacements.themeVersion.find, replacements.themeVersion.replace))
        .pipe(replace(replacements.themeName.find, replacements.themeName.replace))
        .pipe(replace(replacements.themeNiceName.find, replacements.themeNiceName.replace))
        .pipe(replace(replacements.parentThemeName.find, replacements.parentThemeName.replace))

        .pipe(gulp.dest(paths.build_js));
}));



gulp.task('watch_js', function () {
    gulp.watch(paths.js, gulp.parallel(['minjs']));
});




gulp.task('php-lint', gulp.parallel(function () {
    return gulp
        .src(paths.php)
        .pipe(replace(replacements.themeVersion.find, replacements.themeVersion.replace))
        .pipe(replace(replacements.themeName.find, replacements.themeName.replace))
        .pipe(replace(replacements.parentThemeName.find, replacements.parentThemeName.replace))
        .pipe(phplint())
        .pipe(gulp.dest(paths.build));
}));


gulp.task('watch_php', function () {
    gulp.watch('gulp/**/*.php', gulp.parallel(['php-lint']));
});


// filesync removed. The gulp watch did not follow as expected.
// gulp.task('sync-local', function () {
//     gulp.watch(paths.build,
//         function () {
//             // fileSync(paths.build[0], paths.localSync, { recursive: true });
//         });
// });


gulp.task('sync-local', function () {
    return gulp
        .src(paths.build_sync)
        .pipe(gulp.dest(paths.localSync));
});

gulp.task('watch-local', function () {
    gulp.watch(paths.build_sync + '*', gulp.parallel(['sync-local']));
});


gulp.task('build',
    gulp.series([
        'sass',
        'style',
        'php-lint',
        'minjs'
    ])
);

gulp.task('sync-work', gulp.series(
    "build",
    gulp.parallel([
        'watch_scss',
        'watch_js',
        'watch_php',
        'sync-local'
    ])
));

gulp.task('default', gulp.series(
    'build'
));

// added build task to default, no longer need export on build task. 
// exports.default = () => (
//     gulp.src('build/*')
//         .pipe(zip(replacements.themeName.replace + '.zip'))
//         .pipe(gulp.dest('dist'))
// );

exports.build = () => (
    gulp.src('build/*')
        .pipe(zip(replacements.themeName.replace + '.zip'))
        .pipe(gulp.dest('dist'))
);
