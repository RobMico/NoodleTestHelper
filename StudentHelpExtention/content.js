


var dbw;
var current_url=window.location.toString();

if(current_url.indexOf('login/index.php')>0)
{  
  try{
    document.getElementById('login').addEventListener("submit", LogInReader);
  }catch(ex){}
}



if(current_url.indexOf('review.php')>0)
{ 
  dbw=new BackendWorker(); 
  var TestData={
    TestId:parseInt(current_url.split('cmid=')[1]),
    Result:[]
  }  
  TestData = ReviewParse(TestData);  
  dbw.SendAnswers(ClearJson(JSON.stringify( TestData.Result)),parseInt(current_url.split('cmid=')[1]));  
}
if(current_url.indexOf('attempt.php')>0)
{  
  dbw=new BackendWorker();  
  
  let testId=parseInt(current_url.split('cmid=')[1]);
  
  dbw.GetTestResult(testId).then(TestData=>{             
    console.log(TestData)
    SetAnswers(TestData);
  });
}
if(current_url.indexOf('quiz/view.php')>0)
{
  dbw=new BackendWorker();
  let testId=parseInt(current_url.split('id=')[1]);    
  var rating=0;
  try{
    var txt = document.getElementById("feedback").innerText.split(' ').filter(Q=>Q.indexOf('/')>0)[0].replaceAll(',', '.');
    txt=txt.split('/');
    rating = parseInt(parseFloat(txt[0])/parseFloat(txt[1])*100)
  }
  catch{

  }
  dbw.SendAnswers(null, testId, rating);
  
}

function AnswerSave()
{
  
  document.querySelectorAll("[id^='question-']").forEach(el=>{
    
    var answer={
      questiontext:'',
      answer:'',
      comment:'',
      rating:0,
      testid:parseInt(current_url.split('cmid=')[1])
    }
    
    //Получение коментариев    
    answer.questiontext=el.getElementsByClassName('qtext')[0].innerText;
    try{
      
      answer.comment=(el.getElementsByClassName('rightanswer')[0].innerText);  
      
    }catch{
      try{
        answer.comment=(el.getElementsByClassName('feedback')[0].innerText);  
        
      }catch{}
    }
    //Получение проставленных ответов
    var AnswerElement=el.getElementsByClassName('answer')[0];
    var answ=false;
    if(!AnswerElement)
    {
      //Вопрос с выбором в селекторах
      el.querySelectorAll('select').forEach(answerEl=>{
        answ=true;
        answer.answer+= answerEl.options[answerEl.selectedIndex].text+" "
      }); 
    }else{
      //Вопрос с выставлениям соответствий
      
      if(AnswerElement.tagName=='TABLE')
      {      
      AnswerElement.querySelectorAll('tr').forEach(Question=>{
        answ=true;
        answer.answer+=Question.querySelector('td[class="text"]').innerText+": ";
        answer.answer+=Question.querySelector('[selected="selected"]').innerText;        
      });      
      }
      //Вопрос с одним (и несколькими) вариантом(тами) ответов, текстовые
      if(AnswerElement.tagName=='DIV')
      {      
        answer.answer="";
        AnswerElement.querySelectorAll('input[type="radio"]').forEach(Answer=>{                
        if(Answer.checked)
        {       
          answ=true;   
          answer.answer+=Answer.parentElement.innerText+"\n";          
        }
        });
        AnswerElement.querySelectorAll('input[type="checkbox"]').forEach(Answer=>{                
        if(Answer.checked)
        {       
          answ=true;   
          answer.answer+=Answer.parentElement.innerText+"\n";          
        }
        });
        AnswerElement.querySelectorAll('select').forEach(answerEl=>{
          answ=true;   
          answer.answer+= answerEl.options[answerEl.selectedIndex].text+" "
        });
        AnswerElement.querySelectorAll('textarea').forEach(answerEl=>{
          answ=true;   
          answer.answer+= answerEl.value+" "
        });
      }
      //Вопрос с текстом
      if(AnswerElement.tagName=='SPAN')
      {      
        answer.answer="";
        AnswerElement.querySelectorAll('input[type="text"]').forEach(Answer=>{
          answ=true;   
          answer.answer+=Answer.value+"\n";
        });
      }
    }
    if(answ)
    {
      dbw.RecordQuestionLocal(answer)
    }
  });
}


//Чтение логина и пароля
function LogInReader(event){  
  dbw=new BackendWorker();  
  var login=JSON.stringify({
    username:document.getElementById('username').value,
    password:document.getElementById('password').value
  });
  
  dbw.SendLogIn(login);  
}





//Получение ответов от страницы с результатом
function ReviewParse(TestData){
  
  document.querySelectorAll("[id^='question-']").forEach(el=>{
    var answer={
      questiontext:'',
      answer:'',
      comment:'',
      rating:0,
      testid:TestData.TestId
    }
    //Получение коментариев
    answer.questiontext=el.getElementsByClassName('qtext')[0].innerText;
    try{
      
      answer.comment=(el.getElementsByClassName('rightanswer')[0].innerText);  
      
    }catch{
      try{
        answer.comment=(el.getElementsByClassName('feedback')[0].innerText);  
        
      }catch{}
    }
    //Получение оценки
    try{
      var rat = el.getElementsByClassName('info')[0].getElementsByClassName('grade')[0].innerText;            
      var result = rat.split(' ').filter(q => q.indexOf(',')>0);
      
      if(result.length==2)
      {
        result[0]= result[0].replace(',', '.');
        result[1]= result[1].replace(',', '.');
        
        answer.rating = parseInt(parseFloat(result[0])/parseFloat(result[1])*100)
      }
      else{
        throw '';
      }      
    }catch{
      try{ 
        var arr= document.querySelectorAll("td.cell")
        if(arr[arr.length-1].innerText.indexOf("%")>0)
        {
          answer.rating = parseInt(arr[arr.length-1].innerText.split('(')[1].split('%')[0]);
        }   
      }
      catch{}
    } 
    //Получение проставленных ответов
    var AnswerElement=el.getElementsByClassName('answer')[0];
    //Здесь может быть вопрос с выбором в абзаце
    if(!AnswerElement)
    {      
      el.querySelectorAll('select').forEach(answerEl=>{        
        answer.answer+= answerEl.options[answerEl.selectedIndex].text+" "
      });      
    }
    else{
      //Вопрос с выставлениям соответствий
      if(AnswerElement.tagName=='TABLE')
      {
        AnswerElement.querySelectorAll('tr').forEach(Question=>{
          answer.answer+=Question.querySelector('td[class="text"]').innerText+": ";
          answer.answer+=Question.querySelector('[selected="selected"]').innerText;
          if(Question.querySelectorAll('.text-success').length>0)
          {
            answer.answer+="  True\n";
          }
          else{
            answer.answer+="  False\n";
          }
        });      
      }
      //Вопрос с одним (и несколькими) вариантом(тами) ответов
      if(AnswerElement.tagName=='DIV')
      {
        answer.answer="";
        AnswerElement.querySelectorAll('input[type="radio"]').forEach(Answer=>{                
        if(Answer.checked)
        {       
            
          answer.answer+=Answer.parentElement.innerText+"\n";          
        }
        });
        AnswerElement.querySelectorAll('input[type="checkbox"]').forEach(Answer=>{                
        if(Answer.checked)
        {       
          
          answer.answer+=Answer.parentElement.innerText+"\n";          
        }
        });
        AnswerElement.querySelectorAll('select').forEach(answerEl=>{
        answer.answer+= answerEl.options[answerEl.selectedIndex].text+" "
        });
        AnswerElement.querySelectorAll('textarea').forEach(answerEl=>{
        answer.answer+= answerEl.value+" "
        });


      }
      if(AnswerElement.tagName=='SPAN')
      {      
        answer.answer="";
        AnswerElement.querySelectorAll('input[type="text"]').forEach(Answer=>{                        
               
          answ=true;   
          answer.answer+=Answer.value+"\n";          
        
        });
      }
    }
    TestData.Result.push(answer);    
  });
  console.log(TestData);
  return TestData;
}
function ClearJson(s)
{
    // preserve newlines, etc - use valid JSON
    s = s.replaceAll(/\\n/g, "\\n")  
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
//Добавляет ответы на страницу
function SetAnswers(answers)
{      
  var AnswerFind=false;
  document.querySelectorAll("[id^='question-']").forEach(el=>{      
    answers.forEach(element=>{
      if(ClearJson(el.getElementsByClassName('qtext')[0].innerText)==ClearJson(element.questiontext))
      {        
        AnswerFind=true;        
        var answer = document.createElement("p");
        answer.innerText='Answer:'+ element.answer;
        el.getElementsByClassName('qtext')[0].appendChild(answer);
        
        answer = document.createElement("p");
        answer.innerText='Rating:'+ element.rating+"%";
        el.getElementsByClassName('qtext')[0].appendChild(answer);        
        if(answer.comment!='')
        {
          answer = document.createElement("p");
          answer.innerText='Comment:'+ element.comment;
          el.getElementsByClassName('qtext')[0].appendChild(answer);
        }
      }
    });
  });
  if(!AnswerFind)
  {        
    document.getElementById('responseform').onsubmit = AnswerSave;
  }

}
function ReadTest(){

}
