"use strict";

import _ from "lodash";

export default function bodyParserMaybe (ignoredPaths, fn) {
    return function (req, res, next) {
        // Don"t body parse ignored paths
        if (ignoredPaths && ignoredPaths.length && !!_.find(ignoredPaths, function (path) { return path.test(req.path); })) {
            next();
        } else {
            fn(req, res, next);
        }
    };
}
