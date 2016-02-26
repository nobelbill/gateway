var http = require('http'),
    httpProxy = require('http-proxy'),
    sha1 =  require('sha1');


/**
 * Created by 1002097 on 16. 2. 25..
 */
var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');


var connection = mongoose.connect('mongodb://localhost/test');


autoIncrement.initialize(connection);


var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


var apiSchema = new Schema({
    url: { type: String },
    hash : { type : String},
    count: { type : Number},
    lastcall : {type : Date, default:Date.now}
});
apiSchema.plugin(autoIncrement.plugin, {
    model: 'Apis',
    field: 'count',
    startAt: 100,
    incrementBy: 1
});

var ApiModel =  mongoose.model('Apis', apiSchema);
var newApi = new ApiModel({
    url: { type: String },
    hash : { type : String,index: true},
    count: { type : Number, default:0},
    lastcall : {type : Date, default:Date.now}
});
//ApiModel.remove({}, function(err) {
//    if (err) {
//        console.log ('error deleting old data.');
//    }
//});


apiFindById =function (hash) {

    ApiModel.find({'hash' : hash}, function(err,docs){
        console.log('hash -aaa ' + hash);
    })
};



var checkExist = function(req) {

    ApiModel.count({'hash' : sha1(req.url)}, function(err,c){
    //ApiModel.find({'hash' : sha1(req.url)}, function(err,docs){

        if(c > 0) {
            console.log('checkExist : ok exist' );
            return true;
        }
        else {
            console.log('checkExist : not exist' );
            return false;
        }
    });


    //return -1;

    return true;


};


//
// Create your proxy server and set the target in the options.
//

var proxy = new httpProxy.createProxyServer({

});
http.createServer(function (req, res) {
    // This simulates an operation that takes 500ms to execute
    setTimeout(function () {
        proxy.web(req, res, {
            target: 'http://localhost:9011'
        });
    }, 0);


    if(checkExist(req) === true ) {
        console.log('find true');
        // count ++
        // lastUse update...
        ApiModel.findOne({hash: sha1(req.url)}, function (err, api) {
            if(err) {
                console.log('findOne error');
            }

            console.log('count ' +api);
            api.count = api.count;
            api.lastcall = new Date();

            api.save(function (err) {
                if(err) {
                    console.error('update error!');
                }
            });
        });


    } else {
        newApi.hash =  sha1(req.url);
        newApi.url =  req.url;
        newApi.count = 1;
        newApi.lastcall = new Date();

        newApi.save(function(err) {
            if(err) {
                console.log('error'+ err);
                //return handleError(err);
            }

            console.log('success post');
        });

        //console.log('Not Exist...');
    }
    //if(req.method == 'GET') {
    //
    //    newApi.hash =  sha1(req.url);
    //    newApi.url =  req.url;
    //    newApi.count = 1;
    //    newApi.lastcall = new Date();
    //
    //    newApi.save(function(err) {
    //        if(err) {
    //            console.log('error'+ err);
    //            //return handleError(err);
    //        }
    //
    //        console.log('success post'+ ApiModel.hash);
    //    });
    //    //ApiModel.find({'hash' : 'test'}, function(err,docs){
    //    //    console.log('hash -aaa ' + docs);
    //    //})
    //} else if( req.method == 'POST') {
    //    db.create()
    //}

    console.log(req.url);
}).listen(8100);
//
// Create your target server
//
