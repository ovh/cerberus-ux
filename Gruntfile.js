// Generated on 2016-01-28 using generator-ovh-stack 0.0.0
"use strict";

module.exports = function (grunt) {

    var localConfig;
    try {
        localConfig = require("./server/config/local.env");
    } catch(e) {
        localConfig = {};
    }

    // Load grunt tasks automatically, when needed
    require("jit-grunt")(grunt, {
        express                 : "grunt-express-server",
        useminPrepare           : "grunt-usemin",
        ngtemplates             : "grunt-angular-templates",
        protractor              : "grunt-protractor-runner",
        istanbul_check_coverage : "grunt-mocha-istanbul",
        ngconstant              : "grunt-ng-constant",
        "bump-only"             : "grunt-bump",
        "bump-commit"           : "grunt-bump"
    });

    // Load custom tasks
    // grunt.loadTasks("./tasks");

    // Time how long tasks take. Can help when optimizing build times
    require("time-grunt")(grunt);

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        mode: "development",
        pkg: grunt.file.readJSON("package.json"),
        yeoman: {
            // configurable paths
            client: require("./bower.json").appPath || "client",
            server: "server",
            dist: "dist"
        },
        express: {
            options: {
                port: process.env.PORT || 9000
            },
            dev: {
                options: {
                    script: "<%= yeoman.server %>",
                    debug: true
                }
            },
            prod: {
                options: {
                    script: "<%= yeoman.dist %>/<%= yeoman.server %>"
                }
            }
        },
        open: {
            server: {
                url: "http://localhost:<%= express.options.port %>"
            }
        },
        watch: {
            tpl_less: {
                files: ["<%= yeoman.client %>/app/app.tpl.less"],
                tasks: ["copy:tpl_less"]
            },
            tpl_index: {
                files: ["<%= yeoman.client %>/index.tpl.html"],
                tasks: ["ejs:dev", "wiredep:client", "injector:scripts", "injector:css"]
            },
            tpl_karma: {
                files: ["karma.conf.tpl.js"],
                tasks: ["copy:tpl_karma", "wiredep:test"]
            },
            injectJS: {
                files: [
                    "<%= yeoman.client %>/{app,components}/**/!(*.spec|*.mock).js",
                    "!<%= yeoman.client %>/app/app.js"
                ],
                tasks: ["injector:scripts"]
            },
            injectCss: {
                files: ["<%= yeoman.client %>/{app,components,assets}/**/*.css"],
                tasks: ["injector:css"]
            },
            mochaTest: {
                files: ["<%= yeoman.server %>/**/*.{spec,integration}.js"],
                tasks: ["env:test", "mochaTest"]
            },
            jsTest: {
                files: ["<%= yeoman.client %>/{app,components}/**/*.{spec,mock}.js"],
                tasks: ["newer:jshint:all", "wiredep:test", "karma"]
            },
            injectLess: {
                files: [
                    "<%= yeoman.client %>/{app,components,assets}/**/*.less",
                    "!<%= yeoman.client %>/app/app.tpl.less"
                ],
                tasks: ["injector:less"]
            },
            less: {
                files: [
                    "<%= yeoman.client %>/{app,components,assets}/**/*.less",
                    "!<%= yeoman.client %>/app/app.tpl.less"
                ],
                tasks: ["less", "postcss"]
            },
            gruntfile: {
                files: ["Gruntfile.js"]
            },
            livereload: {
                files: [
                    "<%= yeoman.client %>/index.html",
                    "{.tmp,<%= yeoman.client %>}/{app,components}/**/*.{css,html}",
                    "{.tmp,<%= yeoman.client %>}/{app,components}/**/!(*.spec|*.mock).js",
                    "<%= yeoman.client %>/assets/images/{,*//*}*.{png,jpg,jpeg,gif,webp,svg}"
                ],
                options: {
                    livereload: true
                }
            },
            express: {
                files: ["<%= yeoman.server %>/**/*.{js,json}"],
                tasks: ["express:dev", "wait"],
                options: {
                    livereload: true,
                    spawn: false //Without this option specified express won"t be reloaded
                }
            },
            bower: {
                files: ["bower.json"],
                tasks: ["wiredep"]
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: "<%= yeoman.client %>/.jshintrc",
                reporter: require("jshint-stylish")
            },
            server: {
                options: {
                    jshintrc: "<%= yeoman.server %>/.jshintrc"
                },
                src: ["<%= yeoman.server %>/**/!(*.spec|*.integration).js"]
            },
            serverTest: {
                options: {
                    jshintrc: "<%= yeoman.server %>/.jshintrc-spec"
                },
                src: ["<%= yeoman.server %>/**/*.{spec,integration}.js"]
            },
            all: ["<%= yeoman.client %>/{app,components}/**/!(*.spec|*.mock).js"],
            test: {
                src: ["<%= yeoman.client %>/{app,components}/**/*.{spec,mock}.js"]
            }
        },

        // Javascript Code Style check
        jscs: {
            options: {
                config: ".jscsrc"
            },
            main: {
                files: {
                    src: [
                        "<%= yeoman.client %>/app/**/*.js",
                        "<%= yeoman.server %>/**/*.js"
                    ]
                }
            }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        ".tmp",
                        "<%= yeoman.dist %>/!(.git*|Procfile)**"
                    ]
                }]
            },
            server: ".tmp"
        },

        // Add vendor prefixed styles
        postcss: {
            options: {
                map: false,
                processors: [
                    require("autoprefixer")({browsers: ["last 2 version", "ie >= 9"]})
                ]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: ".tmp/",
                    src: "{,*/}*.css",
                    dest: ".tmp/"
                }]
            }
        },

        // Debugging with node inspector
        "node-inspector": {
            custom: {
                options: {
                    "web-host": "localhost"
                }
            }
        },

        // Use nodemon to run server in debug mode with an initial breakpoint
        nodemon: {
            debug: {
                script: "<%= yeoman.server %>",
                options: {
                    nodeArgs: ["--debug-brk"],
                    env: {
                        PORT: process.env.PORT || 9000
                    },
                    callback: function (nodemon) {
                        nodemon.on("log", function (event) {
                            console.log(event.colour);
                        });

                        // opens browser on initial server start
                        nodemon.on("config:update", function () {
                            setTimeout(function () {
                                require("open")("http://localhost:8080/debug?port=5858");
                            }, 500);
                        });
                    }
                }
            }
        },

        ejs: {
            dev: {
                options: {
                    baseUrl: '/'
                },
                src: ['<%= yeoman.client %>/index.tpl.html'],                
                dest: '<%= yeoman.client %>/index.html'
            },
            prod: {
                options: {
                    baseUrl: '/'
                },
                src: ['<%= yeoman.client %>/index.tpl.html'],
                dest: '<%= yeoman.client %>/index.html'
            }
        },

        // Automatically inject Bower components into the app and karma.conf.js
        wiredep: {
            options: {
                exclude: [
                    "/json3/",
                    "/es5-shim/",
                    /font-awesome\.css/
                ]
            },
            client: {
                src: "<%= yeoman.client %>/index.html",
                ignorePath: "<%= yeoman.client %>/"
            },
            test: {
                src: "./karma.conf.js",
                devDependencies: true
            }
        },

        // Renames files for browser caching purposes
        filerev: {
            dist: {
                src: [
                    "<%= yeoman.dist %>/<%= yeoman.client %>/!(bower_components){,*/}*.{js,css}",
                    "<%= yeoman.dist %>/<%= yeoman.client %>/assets/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}",           // à checker
                    "<%= yeoman.dist %>/<%= yeoman.client %>/assets/fonts/*"
                ]
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            html: ["<%= yeoman.client %>/index.html"],
            options: {
                dest: "<%= yeoman.dist %>/<%= yeoman.client %>"
            }
        },

        // Performs rewrites based on rev and the useminPrepare configuration
        usemin: {
            html: ["<%= yeoman.dist %>/<%= yeoman.client %>/{,!(bower_components)/**/}*.html"],        // à checker for inject
            css: ["<%= yeoman.dist %>/<%= yeoman.client %>/!(bower_components){,*/}*.css"],
            js: ["<%= yeoman.dist %>/<%= yeoman.client %>/!(bower_components){,*/}*.js"],
            options: {
                assetsDirs: [
                    "<%= yeoman.dist %>/<%= yeoman.client %>",
                    "<%= yeoman.dist %>/<%= yeoman.client %>/assets/images"
                ],
                // This is so we update image references in our ng-templates
                patterns: {
                    js: [
                        [/(assets\/images\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm, "Update the JS to reference our revved images"]
                    ]
                }
            }
        },

        // -------DEBUG-------
        // You can use this option to build a "dist" with a JS not minified.
        // uglify: {
        //   options : {
        //     compress : false,
        //     mangle   : false,
        //     beautify : true
        //   }
        // },

        // The following *-min tasks produce minified files in the dist folder
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: "<%= yeoman.client %>/assets/images",
                    src: "**/*.{png,jpg,jpeg,gif,svg}",
                    dest: "<%= yeoman.dist %>/<%= yeoman.client %>/assets/images"
                }]
            }
        },

        // Allow the use of non-minsafe AngularJS files. Automatically makes it
        // minsafe compatible so Uglify does not destroy the ng references
        ngAnnotate: {
            dist: {
                files: [{
                    expand: true,
                    cwd: ".tmp/concat",
                    src: "**/*.js",
                    dest: ".tmp/concat"
                }]
            }
        },

        // Dynamically generate angular constants
        ngconstant: {
            custom: {
                options: {
                    name: "abuseApp",
                    deps: false,
                    wrap: "/*jshint quotmark:false*/\n\n\"use strict\";\n\n{%= __ngModule %}",
                    dest: "<%= yeoman.client %>/app/config/custom.constants.js"
                },
                constants: {
                    VERSION: "<%= pkg.version %>"
                }
            }
        },

        // Package all the html partials into a single javascript payload
        ngtemplates: {
            options: {
                // This should be the name of your apps angular module
                module: "abuseApp",
                htmlmin: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeEmptyAttributes: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true
                },
                usemin: "app/app.js"
            },
            main: {
                cwd: "<%= yeoman.client %>",
                src: ["components/**/*.html"],
                dest: ".tmp/templates.js"
            },
            tmp: {
                cwd: ".tmp",
                src: ["components/**/*.html"],
                dest: ".tmp/tmp-templates.js"
            }
        },

        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: "<%= yeoman.client %>",
                    dest: "<%= yeoman.dist %>/<%= yeoman.client %>",
                    src: [
                        "*.{ico,png,txt}",
                        ".htaccess",
                        "app/**/!(*.tpl).html",
                        "assets/images/{,*/}*.{webp}",
                        "assets/fonts/**/*",
                        "bower_components/**/*.{ttf,woff,woff2,svg,eot}",
                        "index.html"
                    ]
                }, {
                    expand: true,
                    cwd: ".tmp/images",
                    dest: "<%= yeoman.dist %>/<%= yeoman.client %>/assets/images",
                    src: ["generated/*"]
                }, {
                    expand: true,
                    dest: "<%= yeoman.dist %>",
                    src: [
                        "package.json",
                        "<%= yeoman.server %>/**/*"
                    ]
                }]
            },
            styles: {
                expand: true,
                cwd: "<%= yeoman.client %>",
                dest: ".tmp/",
                src: ["{app,components}/**/*.css"]
            },
            tpl_less: {
                src: "<%= yeoman.client %>/app/app.tpl.less",
                dest: "<%= yeoman.client %>/app/app.less"
            },/*,
            tpl_index: {
                src: "<%= yeoman.client %>/index.tpl.html",
                dest: "<%= yeoman.client %>/index.html"
            }*/
            tpl_karma: {
                src: "karma.conf.tpl.js",
                dest: "karma.conf.js"
            }
        },

        // Run some tasks in parallel to speed up the build process
        concurrent: {
            templates: [
                "copy:tpl_less",
                //"copy:tpl_index",
                "copy:tpl_karma"
            ],
            pre: [
                "injector:less",
            ],
            server: [
                "less",
            ],
            test: [
                "less",
            ],
            debug: {
                tasks: [
                    "nodemon",
                    "node-inspector"
                ],
                options: {
                    logConcurrentOutput: true
                }
            },
            dist: [
                "less",
                "imagemin"
            ]
        },

        // Test settings
        karma: {
            unit: {
                configFile: "karma.conf.js",
                singleRun: true
            }
        },

        mochaTest: {
            options: {
                reporter: "spec",
                require: "mocha.conf.js",
                timeout: 5000 // set default mocha spec timeout
            },
            unit: {
                src: ["<%= yeoman.server %>/**/*.spec.js"]
            },
            integration: {
                src: ["<%= yeoman.server %>/**/*.integration.js"]
            }
        },

        mocha_istanbul: {
            unit: {
                options: {
                    excludes: ["**/*.{spec,mock,integration}.js"],
                    reporter: "spec",
                    require: ["mocha.conf.js"],
                    mask: "**/*.spec.js",
                    coverageFolder: "coverage/server/unit"
                },
                src: "<%= yeoman.server %>"
            },
            integration: {
                options: {
                    excludes: ["**/*.{spec,mock,integration}.js"],
                    reporter: "spec",
                    require: ["mocha.conf.js"],
                    mask: "**/*.integration.js",
                    coverageFolder: "coverage/server/integration"
                },
                src: "<%= yeoman.server %>"
            }
        },

        istanbul_check_coverage: {
            default: {
                options: {
                    coverageFolder: "coverage/**",
                    check: {
                        lines: 80,
                        statements: 80,
                        branches: 80,
                        functions: 80
                    }
                }
            }
        },

        protractor: {
            options: {
                configFile: "protractor.conf.js"
            },
            chrome: {
                options: {
                    args: {
                        browser: "chrome"
                    }
                }
            }
        },

        env: {
            test: {
                NODE_ENV: "test"
            },
            prod: {
                NODE_ENV: "production"
            },
            all: localConfig
        },

        // Compiles ES6 to JavaScript using Babel
        babel: {
            options: {
                sourceMap: true,
                optional: [
                    "es7.classProperties"
                ]
            },
            server: {
                options: {
                    optional: ["runtime"]
                },
                files: [{
                    expand: true,
                    cwd: "<%= yeoman.server %>",
                    src: ["**/*.{js,json}"],
                    dest: "<%= yeoman.dist %>/<%= yeoman.server %>"
                }]
            }
        },

        // Compiles Less to CSS
        less: {
            server: {
                files: {
                    ".tmp/app/app.css" : "<%= yeoman.client %>/app/app.less"
                }
            }
        },

        injector: {
            options: {

            },
            // Inject application script files into index.html (doesn"t include bower)
            scripts: {
                options: {
                    transform: function(filePath) {
                        var yoClient = grunt.config.get("yeoman.client");
                        filePath = filePath.replace("/" + yoClient + "/", "");
                        filePath = filePath.replace("/.tmp/", "");
                        return "<script src=\"" + filePath + "\"></script>";
                    },
                    sort: function(a, b) {
                        var module = /\.module\.js$/;
                        var aMod = module.test(a);
                        var bMod = module.test(b);
                        // inject *.module.js first
                        return (aMod === bMod) ? 0 : (aMod ? -1 : 1);
                    },
                    starttag: "<!-- injector:js -->",
                    endtag: "<!-- endinjector -->"
                },
                files: {
                    "<%= yeoman.client %>/index.html":
                        [
                            "{.tmp,<%= yeoman.client %>}/{app,components}/**/!(*.spec|*.mock).js",
                            "!<%= yeoman.client %>/app/config/**/*.js",
                            "<%= yeoman.client %>/app/config/environment/<%= mode %>.constants.js",
                            "<%= yeoman.client %>/app/config/*.js",
                            "!{.tmp,<%= yeoman.client %>}/app/app.js"
                        ]
                }
            },

            // Inject component less into app.less
            less: {
                options: {
                    transform: function(filePath) {
                        var yoClient = grunt.config.get("yeoman.client");
                        filePath = filePath.replace("/" + yoClient + "/app/", "");
                        filePath = filePath.replace("/" + yoClient + "/components/", "../components/");
                        return "@import \"" + filePath + "\";";
                    },
                    starttag: "// injector",
                    endtag: "// endinjector"
                },
                files: {
                    "<%= yeoman.client %>/app/app.less": [
                        "<%= yeoman.client %>/{app,components}/**/*.less",
                        "!<%= yeoman.client %>/app/{app,app.tpl}.less"
                    ]
                }
            },

            // Inject component css into index.html
            css: {
                options: {
                    transform: function(filePath) {
                        var yoClient = grunt.config.get("yeoman.client");
                        filePath = filePath.replace("/" + yoClient + "/", "");
                        filePath = filePath.replace("/.tmp/", "");
                        return "<link rel=\"stylesheet\" href=\"" + filePath + "\">";
                    },
                    starttag: "<!-- injector:css -->",
                    endtag: "<!-- endinjector -->"
                },
                files: {
                    "<%= yeoman.client %>/index.html": [
                        "<%= yeoman.client %>/{app,components}/**/*.css"
                    ]
                }
            }
        },

        // Bump version
        bump : {
            options : {
                pushTo        : "origin",
                files         : ["package.json", "bower.json"],
                updateConfigs : ["pkg"],
                commitFiles   : ["-a"]
            }
        }

    });

    // Update version.txt
    grunt.registerTask("updateVersionTxt", function () {
        var file = grunt.config("yeoman").client + "/version.txt";
        grunt.log.ok("Write version " + grunt.config("pkg").version);
        grunt.file.write(file, grunt.config("pkg").version);
    });

    // Used for delaying livereload until after server has restarted
    grunt.registerTask("wait", function () {
        grunt.log.ok("Waiting for server reload...");

        var done = this.async();

        setTimeout(function () {
            grunt.log.writeln("Done waiting!");
            done();
        }, 1500);
    });

    grunt.registerTask("express-keepalive", "Keep grunt running", function() {
        this.async();
    });

    grunt.registerTask("serve", function (target) {
        grunt.config.set("mode", "development");

        if (target === "dist") {
            grunt.config.set("mode", "production");
            return grunt.task.run(["build", "env:all", "env:prod", "express:prod", "wait", "open", "express-keepalive"]);
        }

        if (target === "debug") {
            return grunt.task.run([
                "clean:server",
                "env:all",
                "ejs:dev",
                "ngconstant",
                "concurrent:templates",
                "concurrent:pre",
                "concurrent:server",
                "injector",
                "wiredep:client",
                "postcss",
                "concurrent:debug"
            ]);
        }

        grunt.task.run([
            "clean:server",
            "env:all",
            "ejs:dev",
            "ngconstant",
            "concurrent:templates",
            "concurrent:pre",
            "concurrent:server",
            "injector",
            "wiredep:client",
            "postcss",
            "express:dev",
            "wait",
            "open",
            "watch"
        ]);
    });

    grunt.registerTask("server", function () {
        grunt.log.warn("The `server` task has been deprecated. Use `grunt serve` to start a server.");
        grunt.task.run(["serve"]);
    });

    grunt.registerTask("test", function(target, option) {
        grunt.config.set("mode", "test");

        if (target === "server") {
            return grunt.task.run([
                "env:all",
                "env:test",
                "mochaTest:unit",
                "mochaTest:integration"
            ]);
        }

        else if (target === "client") {
            return grunt.task.run([
                "clean:server",
                "env:all",
                "ejs:dev",
                "ngconstant",
                "concurrent:templates",
                "concurrent:pre",
                "concurrent:test",
                "injector",
                "postcss",
                "wiredep:test",
                "karma",
                "jshint",
                "jscs"
            ]);
        }

        else if (target === "e2e") {

            if (option === "prod") {
                grunt.config.set("mode", "production");
                return grunt.task.run([
                    "ejs:prod",
                    "ngconstant",
                    "build",
                    "env:all",
                    "env:prod",
                    "express:prod",
                    "protractor"
                ]);
            }

            else {
                return grunt.task.run([
                    "clean:server",
                    "env:all",
                    "env:test",
                    "ejs:dev",
                    "ngconstant",
                    "concurrent:templates",
                    "concurrent:pre",
                    "concurrent:test",
                    "injector",
                    "wiredep:client",
                    "postcss",
                    "express:dev",
                    "protractor"
                ]);
            }
        }

        else if (target === "coverage") {

            if (option === "unit") {
                return grunt.task.run([
                    "env:all",
                    "env:test",
                    "mocha_istanbul:unit"
                ]);
            }

            else if (option === "integration") {
                return grunt.task.run([
                    "env:all",
                    "env:test",
                    "mocha_istanbul:integration"
                ]);
            }

            else if (option === "check") {
                return grunt.task.run([
                    "istanbul_check_coverage"
                ]);
            }

            else {
                return grunt.task.run([
                    "env:all",
                    "env:test",
                    "mocha_istanbul",
                    "istanbul_check_coverage"
                ]);
            }

        }

        else grunt.task.run([
            "test:server",
            "test:client"
        ]);
    });

    grunt.registerTask("build", [
        "clean:dist",
        "ejs:dev",
        "concurrent:templates",
        "concurrent:pre",
        "concurrent:dist",
        "injector",
        "wiredep:client",
        "useminPrepare",
        "postcss",
        "ngtemplates",
        "concat",
        "ngAnnotate",
        "copy:dist",
        "babel:server",
        "cssmin",
        "uglify",
        "filerev",
        "usemin"
    ]);

    // Increase version number. Type = minor|major|patch
    grunt.registerTask("release", "Release", function () {
        var type = grunt.option("type");

        if (type && ~["patch", "minor", "major"].indexOf(type)) {
            grunt.task.run(["bump-only:" + type, "updateVersionTxt", "ngconstant"]);
        } else {
            grunt.verbose.or.write("You try to release in a weird version type [" + type + "]").error();
            grunt.fail.warn("Please try with --type=patch|minor|major");
        }
    });

    grunt.registerTask("default", [
        "newer:jshint",
        "test",
        "build"
    ]);
};
