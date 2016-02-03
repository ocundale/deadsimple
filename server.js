'use strict';

var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    reader = require('./lib/reader'),
    parser = require('./lib/simpleparser'),
    PORT = process.env.PORT || 8888,
    header, footer;

//set up header and footer
function setup(done) {

    reader.read('./content/partials/header.html', function (err, data) {
        if(err) {
            console.error('error reading header.html');
        }

        header = data;
        done();
    });

    reader.read('./content/partials/footer.html', function (err, data) {
        if(err) {
            console.error('error reading footer.html');
        }

        footer = data;
        done();
    });
}

//functionality to serve image
function serveImage(res, req, extension) {
    var aTypes = {
        '.gif': 'image/gif',
        '.png': 'image/png',
        '.jpeg': 'image/jpeg'
    }

    var contentType = aTypes[extension];
    var filePath = path.join(__dirname, req.url);

    fs.exists(filePath, function (exists) {
        if (!exists) {
           // 404 missing files
           res.writeHead(404, {'Content-Type': 'text/plain' });
           res.end('404 Not Found');
           return;
        }
        res.writeHead(200, {'Content-Type': contentType });
        // stream the file
        var img = fs.readFileSync(filePath);
        res.end(img, 'binary');
    });
}

//functionality to serve image
function serveMarkup(res, req) {
    var options = {
        url: req.url,
        header: header,
        footer: footer
    };

    // otherwise parse markdown into html
    parser.parse(options, function (err, code, html) {
        if(err) console.error(err);
        res.writeHead(code, {'Content-Type': 'text/html' });

        if(html) {
            res.end(html, 'utf8');
        } else {
            res.end('404 Not Found');
        }
    });
}

function serve(req, res) {
    if(!req.url) return;

    //get extension and serve depending on type
    var extension = path.extname(req.url);
    if(!extension) {
        serveMarkup(res, req);
    } else {
        serveImage(res, req, extension);
    }

}

setup(function () {
    if (header && footer) {
        console.info('set up done! now serving files on ' + PORT);
        http.createServer(serve).listen(PORT);
    }
});
