// Test reading file from disk

var fs = require('fs');

//var file;
//var buffer = new Buffer(10000);

// fs.open('sample.txt', 'r', function(handle){
//   file = handle;
// });

// console.log("File opened");
//console.log(file); // file is undefined here becaus function returns immediately

// In node this has to be done like below
fs.open('sample.txt', 'r',
  function(err, handle){
    // errors handling logic 
    if(err){
        handleError(err); 
        return; 
    }
    
    var buf = new Buffer(10000);

    fs.read(handle, buf, 0, 10000, null,
      function(err, length){
          if(err){
              handleError(err); 
              return; 
          }
          
        console.log("Printing file:");
        console.log(buf.toString('utf8', 0, length));
        fs.close(handle, function(){/* don't care */})
      });
});

function handleError(err){
    console.log("Error: " + err.code + " ErrorMessage: " + err.message);
}