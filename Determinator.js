 var builder = require('botbuilder');
 var restify = require('restify');

 var inMemoryStorage = new builder.MemoryBotStorage();

 var server = restify.createServer();
 server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url); 
 });

 // Create chat connector for communicating with the Bot Framework Service
 var connector = new builder.ChatConnector({
     appId: process.env.MicrosoftAppId,
     appPassword: process.env.MicrosoftAppPassword
 });

 server.post('/api/messages', connector.listen());

 var bot = new builder.UniversalBot(connector, [
     function (session) {
         session.send("Welcome to **Determinator**. The most *predictible* way to determine your future...");
         session.beginDialog('rootMenu');
     },
     function (session, results) {
         session.endConversation("Until next time...**peace out**!");
     }
 ]).set('storage', inMemoryStorage);  


 bot.dialog('rootMenu', [
     function (session) {
         builder.Prompts.choice(session, "Choose a prediction method:", 'Flip a Coin|Enchanted Octaball|Quit', { listStyle: builder.ListStyle.button });
     },
     function (session, results) {
         switch (results.response.index) {
             case 0:
                 session.beginDialog('flipCoinDialog');
                 break;            
             case 1:
                 session.beginDialog('enchantedOctaballDialog');
                 break;
             default:
                 session.endDialog();
                 break;
         }
     },
     function (session) {
         session.replaceDialog('rootMenu');
     }
 ]).reloadAction('showMenu', null, { matches: /^(menu|back)/i });

 // Flip a coin
 bot.dialog('flipCoinDialog', [
     function (session, args) {
         builder.Prompts.choice(session, "Choose **heads** or **tails**...", "heads|tails", { listStyle: builder.ListStyle.button })
     },
     function (session, results) {
         var flip = Math.random() > 0.5 ? 'heads' : 'tails';
         if (flip == results.response.entity) {
             var msg = new builder.Message(session)
             .textFormat(builder.TextFormat.xml)
             .attachments([
                 new builder.HeroCard(session)
                 .title(flip.toUpperCase() + ". YOU WIN!")
                     .subtitle("The outcome was " + flip.toUpperCase())
                     .text("The historical origin of coin flipping is the interpretation of a chance outcome as the expression of divine will. Coin flipping was known to the Romans as *navia aut caput* ('ship or head'), as some coins had a ship on one side and the head of the emperor on the other. In England, this was referred to as *cross and pile*.")
                     .images([
                         builder.CardImage.create(session, "https://traininglabs.blob.core.windows.net/bot-images/"+flip+"_image.png"),
                         builder.CardImage.create(session, "https://traininglabs.blob.core.windows.net/bot-images/win_image.png")
                     ])                   
             ]);
             session.send(msg);
             session.endDialog();
         } else {

             var msg = new builder.Message(session)
             .textFormat(builder.TextFormat.xml)
             .attachments([
                 new builder.HeroCard(session)
                     .title(flip.toUpperCase() + ". YOU LOSE!")
                     .subtitle("The outcome was " + flip.toUpperCase())
                     .text("The historical origin of coin flipping is the interpretation of a chance outcome as the expression of divine will. Coin flipping was known to the Romans as *navia aut caput* ('ship or head'), as some coins had a ship on one side and the head of the emperor on the other. In England, this was referred to as *cross and pile*.")
                     .images([
                         builder.CardImage.create(session, "https://traininglabs.blob.core.windows.net/bot-images/"+flip+"_image.png"),
                         builder.CardImage.create(session, "https://traininglabs.blob.core.windows.net/bot-images/lose_image.png")
                     ])                   
             ]);
             session.send(msg);
             session.endDialog();
         }
     }
 ]);

 // Enchanted Octaball
 bot.dialog('enchantedOctaballDialog', [
     function (session, args) {
         builder.Prompts.text(session, "What is your question?");
     },
     function (session, results) {         

         var msg = new builder.Message(session)
         .textFormat(builder.TextFormat.xml)
         .attachments([
             new builder.HeroCard(session)
                 .title(enchantedAnswers)    
                 .subtitle(results.response)	               
                 .images([
                     builder.CardImage.create(session, "https://traininglabs.blob.core.windows.net/bot-images/8ball_image.png"),                    
                 ])                   
         ]);
         session.send(msg);
         session.endDialog();
     }
 ]);

 var enchantedAnswers = [
     "It is certain",
     "It is decidedly so",
     "Without a doubt",
     "Yes, definitely",
     "You may rely on it",
     "As I see it, yes",
     "Most likely",
     "Outlook good",
     "Yes",
     "Signs point to yes",
     "Reply hazy try again",
     "Ask again later",
     "Better not tell you now",
     "Cannot predict now",
     "Concentrate and ask again",
     "Don't count on it",
     "My reply is no",
     "My sources say no",
     "Outlook not so good",
     "Very doubtful"
 ];
