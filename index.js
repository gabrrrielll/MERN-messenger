const express = require("express");
const cors = require("cors");
const parser = require("body-parser");
const CONTROLLER = require("./controller/index");
const CONFIG = require("./config");
const routes = require("./routes/index");
const path = require( 'path' );

CONFIG.app.use(cors());
CONFIG.app.use(parser.json());
CONFIG.app.use('/', routes);
console.log("process.env:" , process.env )

if ( process.env.NODE_ENV === 'production' ){
      CONFIG.app.use( express.static( 'client/build' ) );
      CONFIG.app.get("*", (req, res) => {
        res.sendFile( path.join(__dirname, 'client', 'build', 'index.html') ); //relative path
    });
    console.log("relative path:", path.join(__dirname, 'client', 'build', 'index.html') )
}
CONFIG.server.listen(CONFIG.PORT, () => console.log("Server stared on " + CONFIG.PORT));



CONTROLLER.loadSocket();
