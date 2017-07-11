/**
 * This section should include all the dependencies for bot
 */

const restify =  require('restify'); // restify is needed for endpoint, alternatively express.js can also be used
const builder = require('botbuilder'); //botbuilder sdk - Mandatory lib
const config = require('./config/appConfig.json'); // chatbot configuration ex - LUIS url, Bing URL etc
const msgs  =  require("./config/chat_messages.json"); //Message array bot requires in demo.
const path = require('path');
const LOG = require("winston");

LOG.level = 'debug';

//LUIS Model to get the intents
let model = config.luisURL+config.luisPath+"?subscription-key="+config.luisSubcriptionKey+"&staging=true"+"&verbose=true+&spellCheck=true&q=";
//https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/6bace3f1-071d-482f-babe-0d1aaf00f4f8?subscription-key=6dd15f4efabe411596bfe18d6653e818&staging=true&verbose=true&timezoneOffset=0&spellCheck=true&q=
/*
 * This section will create a simple restify server to listen to messages recived by bot
 * Port will be taken from env variable.
 *
 */

let server = restify.createServer();
let port = process.env.port||process.env.PORT||3978;
server.listen(port,()=>{
     //console.info(Date() +"-"+ path.basename(__filename)+":"+"Bot Server Started  at port %d ", port);
    LOG.info(path.basename(__filename)+"server.listen Bot Server Started port "+port);
});



/*
 * This section is create a Universal chatbot using Microsoft Bot Builder framework Node JS SDK
 * Bot need an Microsoft APP ID and App Password.
 * App ID and password will be part of App Config
 */


let connectionConfiguration = new builder.ChatConnector({
    appId:config.appId,
    appPassword:config.appPassword,
    autoBatchDelay:200
});

//Create a new bot instance 
let bot =  new builder.UniversalBot(connectionConfiguration);

//create a new rest end point to listen the messages . 
server.post("/api/messages",connectionConfiguration.listen());



/*
 * Set Up recongizer using Microsoft BotFramework,
 * Set up all the waterfall dialog routers that matches the intents defined in LUIS
 *
 */

let recognizer = new builder.LuisRecognizer(model);

//create intent dialog
// let dialog = new builder.IntentDialog({
//     recognizers :[recognizer]
// });

bot.recognizer(recognizer);

// bot.dialog('/',dialog);


bot.dialog('INSTALLHELP', [
     (session,args,next)=>{
        session.sendTyping();
        session.send(msgs.welcomeMsg);
        next();
    },
    (session,args,next)=>{
        session.send(msgs.welcomeMsgTV);
        next();
    },
    (session,args,next)=>{
        session.send(msgs.videoHelp);
        next();
    },
    (session)=>{
        var msg = new builder.Message(session).addAttachment(createVedioCard(session));
        session.send(msg)
    }
]).triggerAction({
    matches:'INSTALLHELP'
});


bot.dialog('NOVEDIOHELP', [
    (session,next)=>{
        session.send("Apologies, I understand");
        session.sendTyping();
        session.send(msgs.connectionOk);
    }
]).triggerAction({
    matches:'NOVEDIOHELP'
});

bot.dialog('INPUTSOURCE',[
        (session)=>{
            session.send(msgs.homeTheaterOK1);
            session.sendTyping();
             setTimeout(()=>{
                session.send(msgs.homeTheaterOK2);
                session.sendTyping();
             },500);
             setTimeout(()=>{
                session.send(msgs.homeTheaterOK3);
                session.sendTyping();
            },1000);
            setTimeout(()=>{
                session.send(msgs.homeTheaterOK4);
            },1500);
        }
]).triggerAction({
    matches:'INPUTSOURCE'
})


bot.dialog('TRANSFERCALL',[
        (session)=>{
            session.send(msgs.agentTranfer);
            session.sendTyping();
            session.send(msgs.nextHelp);
        }
]).triggerAction({
    matches:'TRANSFERCALL'
});

bot.dialog("None",[
   (session)=>{
        session.send("Sorry I am not able to understand you");
   }
    
]).triggerAction({
    matches:'None'
});
bot.dialog("GoodBye",[
   (session)=>{
        session.send("Thank you, Good Bye");
        session.clearDialogStack();
   }
    
]).triggerAction({
    matches:'GoodBye'
});



/*
 * Dialog should be called when user return back  and profile is already stored in the
 * session data of conversation.
 * It should be called whenever LUIS is returning intent as "BeginConversation"
 */
// bot.dialog("/start", [
//     (session)=>{
//         console.log(session.recognizer);
//     // recognizer.recognize(session.toRecognizeContext(), (err, data)=> {
//     //         console.log(session);
//     //      });
//     },
//     (session,args,next)=>{
//         console.log(session.recognizer);
//         session.sendTyping();
//         session.send(msgs.welcomeMsg);
//         next();
//     },
//     (session,args)=>{
//         session.send(msgs.welcomeMsgTV);
//     }
// ]);








/*
 *  Create offer Card based on the input from Pointis/
 * 
 * 
 */ 

function createVedioCard(session) {

    let defaultCard = new builder.VideoCard(session)
        .title('Install TV Box')
        .subtitle('Link your 4K TV with nxt Box')
        .media([{
                profile:"",
                url:"https://www.youtube.com/watch?v=aieGL7cVnt4"
               }])
        ;
    
    return defaultCard;

}



