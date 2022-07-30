const express = require('express');
const cors = require('cors');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
const app = express();
app.use(cors());


//integrating CLARIFAI API 
const {ClarifaiStub, grpc} = require("clarifai-nodejs-grpc");
const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();
metadata.set("authorization", "Key b0990c79a69641e7a6efbd2e3ee6ee0b");          //My CLARIFAI API Key



app.set('view engine', 'pug');
app.set('views', './views');

// for parsing application/json
app.use(bodyParser.json()); 

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded

// for parsing multipart/form-data
app.use(upload.array()); 
app.use(express.static('public'));


app.get('/ans',(req,res)=>{
    stub.PostModelOutputs(
        {
            // This is the model ID of Image Moderation Model from CLARIFAI API
            model_id: "d16f390eb32cad478c7ae150069bd2c6",
            inputs: [{data: {image: {url: req.query.URL}}}]
        },
        metadata,
        (err, response) => {
            if (err) {
                console.log("Error: " + err);
                return;
            }
    
            if (response.status.code !== 10000) {
                console.log("Received failed status: " + response.status.description + "\n" + response.status.details);
                return;
            }



            const apianswer=[];
            console.log("Predicted concepts, with confidence values:");

            for (const c of response.outputs[0].data.concepts) {
                console.log(c.name + ": " + c.value);
                apianswer.push(c);
            }

            let finalAns = [];

            for(let i=0; i<apianswer.length; i++){
                finalAns.push(apianswer[i].name);
                finalAns.push((apianswer[i].value*100).toString());
            }


            for(let i = 1; i<=9; i+=2){
                if(finalAns[i].includes('e')){
                    finalAns[i] = '0.000';
                }
            }

            for(let i=1; i<=9; i+=2){
                if(finalAns[i].length==3){
                    finalAns[i]+=' ';
                }
                
            }

            res.writeHead(200, {
                'Content-Type': 'text/html',
              });
              

            //HTML code for the iframe present in the form tag of frontend (The final Result)
            res.end(`<!DOCTYPE html>
            <html>
            <head>
            <style>
            ol {
              background: #ff9999;
              padding: 20px;
            }
            
            ol li {
              background: #ffe5e5;
              color: darkred;
              padding: 5px;
              margin-left: 35px;
            }
            
            </style>
            </head>
            <body>
            
            
            <ol>
              <li>${finalAns[0]} : ${finalAns[1][0]}${finalAns[1][1]}${finalAns[1][2]}${finalAns[1][3]}%</li>
              <li>${finalAns[2]} : ${finalAns[3][0]}${finalAns[3][1]}${finalAns[3][2]}${finalAns[3][3]}%</li>
              <li>${finalAns[4]} : ${finalAns[5][0]}${finalAns[5][1]}${finalAns[5][2]}${finalAns[5][3]}%</li>
              <li>${finalAns[6]} : ${finalAns[7][0]}${finalAns[7][1]}${finalAns[7][2]}${finalAns[7][3]}%</li>
              <li>${finalAns[8]} : ${finalAns[9][0]}${finalAns[9][1]}${finalAns[9][2]}${finalAns[9][3]}%</li>
            </ol>
            
            
            </body>
            </html>
            
            
            `)
        }
    );
})


app.listen(3001, ()=>{
    console.log("Server is running !"); 
})

