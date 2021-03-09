const fs = require('fs');
const excluded = ['index'];
let App;

// Assumes routes folder contains subfolders (i.e. api) that hold route files (i.e auth.js)
function setUpRoutes (__dirname) {
    fs.readdirSync(__dirname).forEach(fileName => {
        if (fs.lstatSync(__dirname + '/' + fileName).isDirectory()) {
            // Recurse if current file is a folder
            setUpRoutes(__dirname + '/' + fileName)
        } else {
            // Get file name. For example: get 'auth' if fileName = 'auth.js'
            let basename = fileName.split('.')[0];
            // Skip specified files such as index
            if(excluded.includes(basename)) return;
            // Grab path following 'routes'. For example: get '/api' if _dirname = 'udemy_devconnector/routes/api'
            const route = __dirname.match(/routes(.*)/)[1];
            // Set up express routes. For example: app.use(/api/auth, require(./api/auth.js))
            // Goal is to set up express routes with endpoint: /folder/file or folder/subfolder/file
            App.use(route + '/' + basename, require('./' + route + '/' + fileName));
        }
    })
}

module.exports = function(app) {
    App = app;
    setUpRoutes(__dirname);
}