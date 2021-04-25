//Storage variables:
//RecordedTest - тест прохождение которого записывается, что бы отправить на сервер
//RecordedLogin - последний сохраненный логин(для оптимизации запросов)
//ServerUrl - url для связи с сервером
//LastTest - последний загруженный тест, для того что бы не слать запрос на сервер на каждом вопросе
class BackendWorker {
    
    constructor() {        
        if(!localStorage.getItem('ServerUrl'))
        {    
            localStorage.setItem('ServerUrl', 'https://stormy-refuge-88605.herokuapp.com/')
        }
    }
    
    //Получает ответы
    async GetTestResult(id)
    {
        console.log("Receive test data");
        try{        
        var test=this.GetLocalSavedTest(id);          
        if(test)
        {
            console.log("Here is data saved before");
            return test.Result;
        }
        console.log("Getting data from server");
        var TestGetUrl=localStorage.getItem('ServerUrl')+'gettestdata?TestId='+id;
        var result=await fetch(TestGetUrl)
        result=JSON.parse(await result.text()); 
        console.log(result);
        var TestData={
            TestId:id,
            Result:[]
        };
        localStorage.setItem('RecordedTest', ClearJson(JSON.stringify(TestData)));        
        TestData.Result=result;
        localStorage.setItem('LastTest', ClearJson(JSON.stringify(TestData)));
        return TestData.Result;
        }catch(ex){}
    }

    ClearJson(s)
    {
        // preserve newlines, etc - use valid JSON
        s = s.replaceAll(/\\n/g, "")  
        .replaceAll(/\\'/g, "\\'")
        .replaceAll(/\\"/g, '\\"')
        .replaceAll(/\\&/g, "\\&")
        .replaceAll(/\\r/g, "\\r")
        .replaceAll(/\\t/g, "\\t")
        .replaceAll(/\\b/g, "\\b")
        .replaceAll(/\\f/g, "\\f");
        // remove non-printable and other non-valid JSON chars
        s = s.replaceAll(/[\u0000-\u0019]+/g,"");        
        s=s.replaceAll("'", "");
        s=s.replaceAll("\n\n", "\n");
        return s;
    }
    //Шлет логин на сервер
    SendLogIn(login)
    {
        try{
            var log=localStorage.getItem('RecordedLogin');

            if(log==login)
            {                
                return;
            }
            localStorage.setItem('RecordedLogin', login);
            var LoginSendUrl=localStorage.getItem('ServerUrl')+'logininfo';
            var xhr = new XMLHttpRequest();            
            xhr.open("POST", LoginSendUrl, true);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");            
            xhr.send(login);

            
        }catch(ex){}        
    }
    //Шлёт ответы на сервер, 
    SendAnswers(jsonAnswers, id, rating)
    {        
        console.log("check send data");
        if(jsonAnswers)
        {
            var lastTest=localStorage.getItem('LastTest');        
            if(lastTest==jsonAnswers)
            {
                console.log("Data won't be sent")
                return;
            }
            localStorage.setItem('LastTest', jsonAnswers);
            localStorage.setItem('RecordedTest', '');
            var TestSendUrl=localStorage.getItem('ServerUrl')+'psottestdata';
            console.log("review data will be sent");
            var xhr = new XMLHttpRequest();            
            xhr.open("POST", TestSendUrl, true);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");            
            xhr.send(jsonAnswers);
            console.log("data sent");
        }
        else{
            
            var res;
            try{            
                res=JSON.parse(localStorage.getItem('RecordedTest'));
            }catch{return;}
            if(res.TestId==id)
            {
                res.Result.forEach(element => {
                    element.rating=rating;
                });
                res.Result = res.Result.filter(function(value, index, self) {        
                    return self.findIndex(el=>{return el.questiontext==value.questiontext}) === index;
                  });
                var TestSendUrl=localStorage.getItem('ServerUrl')+'psottestdata';            
                localStorage.setItem('RecordedTest', '');
                console.log("recorded data will be sent");
                var xhr = new XMLHttpRequest();            
                xhr.open("POST", TestSendUrl, true);
                xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");            
                xhr.send( ClearJson(JSON.stringify(res.Result)));
                console.log("recorded data was sent");
                
            }
        }
    }

    //сохранение конкретного ответа к ответам теста
    RecordQuestionLocal(Test)
    {
        console.log("recording current answer");
        try{        
        let obj= localStorage.getItem('RecordedTest')
        obj=JSON.parse(obj);

        obj.Result.push(Test);
        obj.Result = obj.Result.filter(function(value, index, self) {        
            return self.findIndex(el=>{return el.questiontext==value.questiontext}) === index;
          });  
        
        localStorage.setItem('RecordedTest', ClearJson(JSON.stringify(obj)));
        }catch(ex){}
    }
    GetRecordedTest(id)
    {
        let obj= localStorage.getItem('RecordedTest')
        if(obj)
        {
            obj=JSON.parse(obj);
            if(obj.TestId==id)
            {
                return obj;
            }
        }
        return null;
    }
    //Проверяет был ли сохранен тест локально
    GetLocalSavedTest(id)
    {
        let obj= localStorage.getItem('LastTest')
        if(obj)
        {
            obj=JSON.parse(obj);
            if(obj.TestId==id)
            {
                return obj;
            }
        }
        return null;
    }
}