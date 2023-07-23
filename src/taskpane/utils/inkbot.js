import instance from "../Components/api/api_instance";
// import { PublicClientApplication } from "@azure/msal-browser";


let reviewPrompt=`Human: You are Inkbot, an AI Chatbot that has expertise in law, developed by Inkpaper.ai. You need to answer the questions of the user. Answer the question without preamble. Based on the points mentioned below, try to edit the document.`
let inkbotPrompt=`Human: You are Inkbot, an AI Chatbot that has expertise in law, developed by Inkpaper.ai. The user would ask you questions related to law. You are supposed to answer those questions without any regards to your expertise in law.`;
let documentText='';
let documentString2=`Human: I'm going to give you a document. Then I'm going to ask you a question about it. Here is the document:

<document>
{{document}}
</document>


First, answer the question.  Do not include or reference quoted content verbatim in the answer. Don't say "According to Quote [1]" when answering. Instead make references to sources relevant to each section of the answer solely by adding their bracketed numbers at the end of relevant sentences.

Then, find the sources from the document that are most relevant to answering the question, and then print them in numbered order. For sources that are long, please summarise them.

If there are no relevant sources, write "No relevant sources" instead.

Thus, the format of your overall response should look like what's shown between the <example></example> tags.  Make sure to follow the formatting and spacing exactly.

<example>
Company X earned $12 million. [1]  Almost 90% of it was from widget sales. [2]

Relevant sources:
[1] "Company X reported revenue of $12 million in 2021."
[2] "Almost 90% of revenue came from widget sales, with gadget sales making up the remaining 10%."

</example>

If the question cannot be answered by the document, say so.

Answer the question immediately without preamble.

The questions are as follows:`;

let documentString=`Human: I'm going to give you a document. Then I'm going to ask you a question about it. Here is the document:

<document>
{{document}}
</document>

Please return the response as a json in the following format
{"answer":"Answer to question","sources":"citations from the document"}

First, answer the question.  Do not include or reference quoted content verbatim in the answer. Don't say "According to Quote [1]" when answering. Instead make references to sources relevant to each section of the answer solely by adding their bracketed numbers at the end of relevant sentences.

Then, find the sources from the document that are most relevant to answering the question, and then print them in numbered order. For sources that are long, please summarise them.

If there are no relevant sources, write "No relevant sources" instead.

Thus, the format of your overall response should look like what's shown between the <example></example> tags.  Make sure to follow the formatting and spacing exactly.

<example>
{"answer":"Company X earned $12 million. [1]  Almost 90% of it was from widget sales. [2]","sources":"[1] "Company X reported revenue of $12 million in 2021." [2] "Almost 90% of revenue came from widget sales, with gadget sales making up the remaining 10%."}
</example>

If the question cannot be answered by the document, say so.

Answer the question immediately without preamble.

Please make sure that the answer is in a proper json format.

The questions are as follows:`;

let reviewItems=[];
let inkbotItems=[];
let documentItems=[];


let documentIdentifier='{{document}}'



function setDocumentPrompt(text)
{
  documentString=text;
}

function setInkbotPrompt(text)
{
  inkbotPrompt=text;
}

function setReviewPrompt(text)
{
  reviewPrompt=text;
}

function getInkbotPrompt()
{
  return inkbotPrompt;
}

function getReviewPrompt()
{
  return reviewPrompt;
}

function getDocumentString()
{
  return documentString;
}

function getDocumentPrompt()
{
  let text=documentString;
  text=text.replace(documentIdentifier, documentText);
  return text;
}


function addStringToPrompt(string, type, stringType='inkbot') {
  if(type == "human") {
    if(stringType == "inkbot")
      inkbotItems.push({text: string, type: "Human"})
    else if(stringType == "extract")
      documentItems.push({text: string, type: "Human"})
    else
      reviewItems.push({text: string, type: "Human"})
  }
  else if(type == "bot") {
    if(stringType == "inkbot")
      inkbotItems.push({text: string, type: "Assistant"})
    else if(stringType == "extract")
      documentItems.push({text: string, type: "Assistant"})
    else
      reviewItems.push({text: string, type: "Assistant"})
  }
}

function getPrompt(value, type='inkbot', add=false)
{
    if(add){
      addStringToPrompt(value, "human", type)
      let localString='';
    if(type=='inkbot')
      {
        localString+=inkbotPrompt;
        for(let i=0;i<inkbotItems.length;i++)
        {
          localString+=`\n${inkbotItems[i].type}: ${inkbotItems[i].text}`;
        }
      }
    else if(type=='extract')
      {
        localString+=getDocumentPrompt();
        for(let i=0;i<documentItems.length;i++)
        {
          localString+=`\n${documentItems[i].type}: ${documentItems[i].text}`;
        }
      } 
    else
    {
      localString+=reviewPrompt;
      for(let i=0;i<reviewItems.length;i++)
      {
        localString+=`\n${reviewItems[i].type}: ${reviewItems[i].text}`;
      }
    }
    return localString;
    }
    else{
      return value;
    }
}

const ssoOptions = {
  allowSignInPrompt: true,
  allowConsentPrompt: true,
};


async function getAccessToken(authSSO) {
  if (authSSO) {
    try {
      const options = JSON.parse(JSON.stringify(ssoOptions));
      const accessToken = await OfficeRuntime.auth.getAccessToken(options);
      return accessToken;
    } catch (error) {
      console.log('SSO failed.');
      console.log(error.message);
      return null;
    }
  }
}


// const pca = new PublicClientApplication({
//   auth: {
//     clientId: '',
//     authority: '',
//     redirectUri: window.location.href,
//   }
// });


let postData = async (prompt, type='inkbot', addToPrompt=true) => {

  // const accessToken = await getAccessToken(true);
    const accessToken='k6ORxas1jDqnLXnN8WoLGJuXaOzb6z';
  var data = {
    prompt: getPrompt(prompt, type, addToPrompt),
    model: "claude-1-100k",
    temperature: 0.7,
    max_length: 50000,
    stop_sequences: [],
    top_p: 0.7,
    query_type: "ai_assist",
    session_id: "session_id_12345678",
    session_name: "contract management",
    top_k: 0,
  };

  var response = "Token Expired";

  try {
    await instance({
      url: "generate-completion-anthropic/",
      method: "POST",
      headers: {
        'Authorization': 'Bearer ' + accessToken
      },
      data: data,
    }).then((res) => {
      console.log(res);
      response = res.data.result.completion;
      addStringToPrompt(response, "bot")
    });
  } catch (e) {
    console.error(e);
  }

  return response;

};


async function getBotresponse(prompt, type='inkbot') {
  console.log('get response');
  return postData(prompt, type);

}



function placeText(text){
  console.log(text);
  var range = Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, function (result) {
    if (result.status === Office.AsyncResultStatus.Succeeded) {
      Office.context.document.setSelectedDataAsync(text, {coercionType: Office.CoercionType.Text}, function (asyncResult) {
        if (asyncResult.status === Office.AsyncResultStatus.Failed) {
          console.log(asyncResult.error.message);
        }
      });
    }
  });
}

function copyText(text){
  navigator.clipboard.writeText(text).then(function() {
    console.log('Async: Copying to clipboard was successful!');
  }
  , function(err) {
    console.error('Async: Could not copy text: ', err);
  }
  );
}

async function getSelectedText()
{
  return new Promise((resolve, reject) => {
    Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, function (result) {
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        resolve(result.value);
      }
      else{
        reject(result.error.message);
      }
    });
  });
}

async function submitSelection(text, prompt=undefined, setLoading=undefined){
  if(prompt){
    setLoading(true);
    var response = await getBotresponse(prompt+'\n'+text, 'selection');
    setLoading(false);
    return response;
  }
  else{
    setLoading(true);
    var response = await getBotresponse(text, 'selection');
    setLoading(false);
    return response;
  }
}


function getDocumentContext(callback){
  Word.run(function(context) {            
    var documentBody = context.document.body;
    context.load(documentBody);
    return context.sync()
    .then(function(){
        console.log(documentBody.text);
        callback(documentBody.text);
    })
});
}

function getResponseExtract(value)
{
  let responsePromise=new Promise((resolve, reject)=>{
   getDocumentContext(async (text)=>{
    documentText=text;
    let response=await getBotresponse(value, 'extract');
    resolve(response);
  });
});
return responsePromise;
}




export { getBotresponse, placeText, copyText, getSelectedText, submitSelection, getResponseExtract, getInkbotPrompt, getReviewPrompt, getDocumentString, setDocumentPrompt, setInkbotPrompt, setReviewPrompt, getAccessToken,
  //  pca
  };

