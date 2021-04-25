const express=require('express')
var bodyParser = require('body-parser')

var jsonParser = bodyParser.json()

const app=express();
const PORT=process.env.PORT || 81

const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL?process.env.DATABASE_URL:'postgres://qfpbnwkrtikzsw:bb910981392571f3a255484e97216e78c252f1b4236b48b7f32730f6fe6bb8ec@ec2-18-214-140-149.compute-1.amazonaws.com:5432/d4c4i2jckt6mpn',//'postgres://jdatsbrhnbbwvr:2483eb2bddb6546ffee343f4e5deab126c566360a3108e319aab03d0db2508de@ec2-18-204-101-137.compute-1.amazonaws.com:5432/delde6c4ofmbij',
    ssl: {
        rejectUnauthorized: false
    }
});


app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


// pool.connect().then((client)=>{    
// client.query("ALTER TABLE NoodleTests ADD CONSTRAINT constraint2 UNIQUE (QuestionText);").then( (res)=>{        
//     for (let row of res.rows) {
//         console.log(JSON.stringify(row));
//     }
// });
// });
// pool.connect().then((client)=>{    
// client.query("INSERT INTO NoodleTests(QuestionText, Answer, Comment, rating, testId)"+
//             " VALUES('QQQQQ', 'MyAnswer6', 'MyComment1', 60, 112),('QQQ', 'MyAnswer1', 'MyComment1', 40, 111)"+            
//             "ON CONFLICT ON CONSTRAINT constraint2 DO "+
//             "UPDATE SET Answer=EXCLUDED.Answer, Comment=EXCLUDED.Comment, rating=EXCLUDED.rating WHERE EXCLUDED.rating>NoodleTests.rating").then( (res)=>{        
//     for (let row of res.rows) {
//         console.log(JSON.stringify(row));
//     }
// });
// });
app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
//Save login
app.post('/logininfo',async (req, res)=>{
    try{    
    res.set('Content-Type', 'text/html;charset=UTF-8');
    
    var IncomeData=req.body;
    if(!req.body) return res.sendStatus(400);  
    var client=await pool.connect();  
    try{
        var str="INSERT INTO LoginInfo(username, password) VALUES ('"+IncomeData.username+"','"+IncomeData.password+"' );"
        await client.query(str);
        await client.end();
        res.end('Success');
    }
    catch(ex){
        console.log(ex.message);
        try{await client.end();}catch{}
        res.end(ex.message);
    }
    }catch(ex){
        console.error(ex.message);
        return res.sendStatus(400); 
    }
});
//Table output methods
app.get('/getlogindata',async (req, res)=>{
    
    res.set('Content-Type', 'application/json;charset=UTF-8');
    var client= await pool.connect();
    var result= await client.query("SELECT * FROM LoginInfo");
    var str=JSON.stringify(result.rows).replace('}', '}\n')
    res.end(str);    
});
app.get('/getallanswersdata',async (req, res)=>{
    res.set('Content-Type', 'application/json;charset=UTF-8');
    var client= await pool.connect();
    var result= await client.query("SELECT * FROM NoodleTests");
    var str=JSON.stringify(result.rows).replace('}', '}\n')
    res.end(str);    
});

//GetTest method
app.get('/gettestdata',async (req, res)=>{
    
    console.log("Strt test answers get");
    try{
    res.set('Content-Type', 'application/json;charset=UTF-8');
    console.log("1")
    var client= await pool.connect();
    console.log("2")
    var str="SELECT * FROM NoodleTests WHERE testId="+req.query.TestId+"";    
    console.log("3")
    var result= await client.query(str);
    
    console.log("End test answers get");    
    
    res.end(JSON.stringify(result.rows));
    }catch(ex){
        console.log("Fail test answers get "+ex.message);
        res.end(ex.message);
    }
    //console.log(req.query);
});

app.post('/psottestdata',async (req, res)=>{

    console.log("Start test answers post")
    try{    
    res.set('Content-Type', 'text/html;charset=UTF-8');
    
    var IncomeData=req.body;    
    if(!req.body) return res.sendStatus(400);  
    var client=await pool.connect();  
    try{
        
        var str="INSERT INTO NoodleTests(QuestionText, Answer, Comment, rating, testId) VALUES\n";
        req.body.forEach(element => {            
            str+="('"+element.questiontext+"', '"+element.answer+"', '"+element.comment+"', "+element.rating+", "+element.testid+"),"
        });

        str= str.slice(0, -1);
        str+=" ON CONFLICT ON CONSTRAINT constraint2 DO "+
        "UPDATE SET Answer=EXCLUDED.Answer, Comment=EXCLUDED.Comment, rating=EXCLUDED.rating WHERE EXCLUDED.rating>NoodleTests.rating";
        //console.log(str);
        await client.query(str);
        await client.end();
        console.log("End test answers post");
        res.end('Success');
    }
    catch(ex){
        console.log(ex.message);
        try{await client.end();}catch{}
        res.end(ex.message);
    }
    }catch(ex){
        console.error(ex.message);
        return res.sendStatus(400); 
    }
});

app.listen(PORT, ()=>{
    console.log("Serer has been started...");
});