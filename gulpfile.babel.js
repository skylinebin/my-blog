'use strict';

import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import runSequence from 'run-sequence';
import browserSync from 'browser-sync';
import wbBuild from 'workbox-build';

const $ = gulpLoadPlugins();
const GH_PAGES_DIR = 'xiaoiver.github.io';

// Minify the HTML.
gulp.task('minify-html', () => {
    return gulp.src('_site/**/*.html')
        .pipe($.htmlmin({
            removeComments: true,
            collapseWhitespace: true,
            collapseBooleanAttributes: true,
            removeAttributeQuotes: true,
            removeRedundantAttributes: true,
            removeEmptyAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            removeOptionalTags: true
        }))
        .pipe(gulp.dest('_site'));
});

// Concatenate, transpiles ES2015 code to ES5 and minify JavaScript.
gulp.task('scripts', () => {
    return gulp.src('dev/js/index.js')
        .pipe($.uglify())
        .pipe($.rename({suffix: '.min'}))
        .pipe(gulp.dest('assets/js'))
});

// Add triple-dashed lines
gulp.task('add-triple-dashes',  () => {
    return gulp.src([
            './assets/js/index.min.js'
        ])
        .pipe($.insert.prepend('---\n---\n'))
        .pipe(gulp.dest('assets/js'));
});

gulp.task('js', () => {
    runSequence(
        'scripts',
        'add-triple-dashes'
    )
});

gulp.task('css', function(){
    gulp.src('dev/sass/app.scss')
        .pipe($.sass())
        .pipe(gulp.dest('dev/sass'))
        .pipe($.cleanCSS())
        .pipe($.rename({suffix: '.min'}))
        .pipe(gulp.dest('assets/css'));
});

// gulp.task('bundle-sw', () => {
//     return wbBuild.generateSW({
//         globDirectory: './_site',
//         swDest: './_site/sw.js',
//         globPatterns: ['**\/*.{js,html,css,json}']
//     })
//     .then(() => {
//         console.log('Service worker generated.');
//     })
//     .catch((err) => {
//         console.log('[ERROR] This happened: ' + err);
//     });
// });

// Watch change in files.
gulp.task('serve', ['jekyll-build'], () => {
    browserSync.init({
        notify: false,
        // Run as an https by uncommenting 'https: true'
        // Note: this uses an unsigned certificate which on first access
        //       will present a certificate warning in the browser.
        // https: true,
        server: '_site',
        port: 3000
    });

    // Warch html changes.
    gulp.watch([
        'dev/sass/*.scss',
        'assets/**/*.js',
        'dev/js/*.js',
        '_includes/**/*.html',
        '_layouts/**/*.html',
        '_posts/**/*.md',
        'index.html',
        'tags.html'
    ], ['jekyll-build', browserSync.reload]);
});

// Build Jekyll.
gulp.task('jekyll-build', ['js'], $.shell.task(['jekyll build']));

/**
 * Do some additional work in production mode.
 * eg. minify html & css
 */
gulp.task('build', () =>
    runSequence(
        'jekyll-build',
        'minify-html',
        'css'
    )
);

// Copy files in _site directory to local git repo.
gulp.task('copy-sites', $.shell.task([
    `rm -r ../${GH_PAGES_DIR}/*`,
    `cp -r _site/* ../${GH_PAGES_DIR}/`
]));

// Deploy in production mode.
gulp.task('deploy', () => {
    runSequence(
        'build',
        'copy-sites'
    )
});