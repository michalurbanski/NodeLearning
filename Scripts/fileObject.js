var fs = require('fs');

function FileObject(){
    this.filename = ''; 
    
    this.fileExists = function(callback){
        var self = this; // required because of asynchronous events processing in node.js
                         // without this code won't work for file which doesn't exist 
        
        console.log("About to open file: " + self.filename);
        fs.open(self.filename, 'r', function(err, handle){
            if(err){
                console.log("Can't open: " + self.filename);
                callback(err); 
                return; 
            } 
            
            fs.close(handle, function(){});
            callback(null, true)
        });
    };
}

// Logic
var fo = new FileObject();
fo.filename = "sample.txt";
fo.fileExists(function(err, results){
    if(err){
        console.log("file does not exists: " + JSON.stringify(err));
        return; 
    } 
    
    console.log("File found");
});