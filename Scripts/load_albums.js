var http = require('http'), fs = require('fs');
    
// Loads list of albums 
function load_album_list(callback){
    // reads directory contents from specified path 
    fs.readdir("albums", function(err, files){ 
       if(err){
           callback(err); 
           return; 
       } 
       
       // List only folders - skip other files in the same directory as albums
       // We expect only folders, if file is found between folders than it should be skipped. 
       // In current implementation someNotNeededFileInFolder.txt should be skipped in this way.  
       var only_dirs = []; 
       
       // Instead of regular loop, special form of iteration has to be used
       // Anonymous function - self-invoking 
       (function iterator(index){
           if(index == files.length){ // NOTE: length is lowercase
               callback(null, only_dirs);
               return; 
           }
           
           // Check if file or directory
           fs.stat("albums/" + files[index], 
            function(err, stats){
                if(err){
                    //callback(err);
                    callback(make_error("file_error", JSON.stringify(err))); 
                    return; 
                }
                
                if(stats.isDirectory()){
                    var obj = {name: files[index]};
                    only_dirs.push(obj);
                }
               
               iterator(index + 1);
           });
       })(0); 
       
       // This is not valid after applying iterator
       //callback(null, files); 
    });
}    

// Loads single album 
function load_album(album_name, callback){
    fs.readdir("albums/" + album_name, function(err, files){
        if(err){
            if(err.code == "ENOENT"){
                callback(no_such_album());
            }
            else{
                callback(make_error("file_error", JSON.stringify(err)));
            }
        }  
       
       var only_files = []; 
       var path = "albums/" + album_name + "/";
       
       (function iterator(index){
           if(index == files.length){
                var obj = {
                    short_name: album_name,
                    photos: only_files
                };         
                
                callback(null, obj); 
                return; 
           }
           
           fs.stat(path + files[index], function(err, stats){
              if(err){
                  if(err){
                      callback(make_error("file_error", JSON.stringify(err)));
                      return; 
                  }
              } 
              
              if(stats.isFile()){
                  var obj = { filename: files[index], 
                              description: files[index]};
                  
                  only_files.push(obj);
              }
              
              iterator(index + 1);
           });
       })(0); 
    });
}
    
function handle_incoming_request(req, res){
    console.log("INCOMING REQUEST: " + req.method + " " + req.url);
    
    // handle multiple requests
    if(req.url == '/albums.json'){
        // list all albums
        handle_list_albums(req, res);
    }
    else if (req.url.substr(0, 7) == '/albums' && req.url.substr(req.url.length - 5) == '.json'){
        // list all items in single album 
        handle_get_album(req, res);   
    }
    else{
        send_failure(res, 404, invalid_resource());    
    }
}

function handle_list_albums(req, res){
    load_album_list(function(err, albums){
        if(err){
            send_failure(res, 503, err);
            return; 
        }
        
        send_success(res, {albums: albums});
    }); 
}
  
function handle_get_album(req, res){
    var album_name = req.url.substr(7, req.url.length - 12); 
    
    load_album(album_name, function(err, album_contents){
       if(err && err.code == "no_such_album"){
           send_failure(res, 404, err);
       } 
       else if(err){
           send_failure(res, 500, err);  
       }
       else{
           send_success(res, {album_data: album_contents});
       }
    });
}

function make_error(err, msg){
    var e = new Error(msg);
    e.code = err; 
    
    return e;     
}

function invalid_resource(){
    return make_error("invalid_resource", "the requested resource does not exist");
}

function send_failure(res, code, err){
    //var code = (err.code) ? err.code : err.name; 
    res.writeHead(code, {"Content-Type": "application/json"}); 
    res.end(JSON.stringify({error: code, message: err.message}) + "\n");
}

function send_success(res, data){
    res.writeHead(200, {"Content-Type": "application/json"}); 
    var output = {error: null, data: data}; 
    res.end(JSON.stringify(output) + "\n");
}

function no_such_album(){
    return make_error("no_such_album", "the specified album does not exist");
}

var s = http.createServer(handle_incoming_request);
s.listen(8080);