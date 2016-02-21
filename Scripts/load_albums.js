var http = require('http'), fs = require('fs');
    
function load_album_list(callback){
    // reads directory contents from specified path 
    fs.readdir("albums", function(err, files){ 
       if(err){
           callback(err); 
           return; 
       } 
       
       callback(null, files); 
    });
}    
    
function handle_incoming_request(req, res){
    console.log("INCOMING REQUEST: " + req.method + " " + req.url);
    load_album_list(function(err, albums){
        if(err){
            res.writeHead(503, {"Content-Type": "application/json"});
            res.end(JSON.stringify(err) + "\n");
            return; 
        }
       
        // proceed with albums
        var result = {
            error: null, 
            data : {
                albums: albums
            }    
        };
        
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(result) + "\n");
    });
}
  
 var s = http.createServer(handle_incoming_request);
 s.listen(8080);