var http = require('http'), fs = require('fs');
    
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
                    callback(err); 
                    return; 
                }
                
                if(stats.isDirectory()){
                    only_dirs.push(files[index]);
                }
               
               iterator(index + 1);
           });
       })(0); 
       
       // This is not valid after applying iterator
       //callback(null, files); 
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