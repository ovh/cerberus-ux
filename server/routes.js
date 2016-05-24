/**
 * Main application routes
 */

"use strict";

import path from "path";
import errors from "./components/errors";
import config from "./config/environment";

export default function (app) {

    // Insert routes below
    // You can uncomment this line to proxypass your /api requests to a remote machine
    // @doc: [URL]
    app.use("/api", require("./proxy/remote"));

    // All undefined asset or api routes should return a 404
    app.route("/:url(api|auth|components|app|bower_components|assets)/*").get(errors[404]);

    // All other routes should redirect to the index.html
    app.route("/*").get((req, res) => {
        res.sendFile(path.resolve(app.get("appPath") + "/index.html"));
    });
}
