var https = require('https');
var fs = require('fs');
var open = require('open');
var cheerio = require("cheerio");

var interval = 15 * 60 * 1000; // 15 минут

var url = "https://m.avito.ru/kazan/kvartiry/sdam/na_dlitelnyy_srok/1-komnatnye?i=1&pmax=15000&pmin=0&user=1&q=собственник";


function download(url, callback) {
    https.get(url, function(res) {
        var data = "";
        res.on('data', function(chunk) {
            data += chunk;
        });
        res.on("end", function() {
            console.log('data came')
            callback(data);
        });
    }).on("error", function() {
        callback(null);
    });
}
setInterval(function() {
download(url, function(data) {
    var exists = fs.readFileSync('exists.txt').toString().split("\n");
	if (data) {		
        var $ = cheerio.load(data);

        $('.b-item').each(function(i, e) {
            var id = $(this).attr('data-item-id');

            if (exists.indexOf(id) === -1) {
                var flat_url = "https://m.avito.ru" + $(this).find('.item-link').attr('href');
                var flat_date = $(this).find('.info-date').text();
                var flat_header = $(this).find('.header-text').text();
                var flat_price = $(this).find('.item-price').text();
                var flat_address = $(this).find('.info-address').text()

                var line = [flat_date, flat_header, flat_price, flat_address, '\n', flat_url].join('    ');



                fs.writeFile('flat_data.txt', line, {flag: 'a'});
                fs.writeFile('exists.txt', id + '\n', {flag: 'a'});
                console.log('!!! There is new flat: ' + line );
                open(flat_url);
            }
      
        });
    } else console.log("error");
});
}, interval);


// https.createServer(function(req, res) {
//     res.writeHead(200, {
//         'Content-Type': 'text/plain'
//     });
//     res.end('Hello World\n');
// }).listen(1337, '127.0.0.1');


// console.log('Server running at https://127.0.0.1:1337/');
