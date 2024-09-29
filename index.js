import express, { response } from "express";
import { database } from "./config.js";
import { set, ref, push, update, child, get } from "firebase/database";
import { sendEmail,sendEmailHtml } from "./emailer.js";
import bodyParser from "body-parser";

let app = new express()
app.use(express.json({limit:'10mb'}));

const teamHandler = async (response, key) => {
  const teamChoice = response.data.fields[31].value[0];
  const userEmail = response.data.fields[7].value;
  console.log(userEmail)
  //create team and email team id
  if (teamChoice === "56968301-3579-49bc-a217-238b0bff8dc7") { //create team
    let teamSlots = [];
    teamSlots.push(key);
    let teamKey = push(child(ref(database), "teams")).key;
    await set(ref(database, "teams/" + teamKey), teamSlots);
    

    // TODO Send email with team ID.
    var textString = `Your team key is:\n${teamKey}\nSend this key to your other teammates so they can join your team.`
    const emailData = {name:response.data.fields[4] , code: teamKey}
    
    

    sendEmail(userEmail, "First name", "Your application team code", textString)
  }

  // join team with team id
  else if (teamChoice === "5ed29545-983a-4bf7-a9e9-6b0a4f992111") {
    console.log("User wants to join team");
    const teamID = response.data.fields[30].value;
    console.log(teamID);
    const teamRef = ref(database, "teams/" + teamID);
    
    try {
      const teamDoc = await get(teamRef);
      if (teamDoc.exists()) {
        let teamSlots = teamDoc.val() || [];
        teamSlots.push(key);
        await set(teamRef, teamSlots);


        // TODO send user email with team information
        var textString = `You've joined the following team: ${teamKey}.`
        sendEmail(userEmail, "First name", "You've joined a team", textString)
      } else {
        console.log("Team doesn't exist");

        // TODO Send email confirming email has been sent. 
        var textString = `No team has been found with ${teamKey}.`
        sendEmail(userEmail, "First name", "The team you tried joining does not exist", textString)


        // There needs to be a system to handle errors 
      }
    } catch (err) {
      console.log("Error fetching or updating team:", err);
      // TODO Send email with error that team has not been joined. 
    }
  }
};

app.post("/tallyHooker", async (req,res)=>{

    console.log("Trying to update database...");
  try {
    let content = req.body;
    console.log(content);
    content["accepted"] = true;
    content["isTeam"] = true;
    console.log(content);

    let responseKey = push(child(ref(database), "responses")).key;
    let userEmail = content.data.fields[1].value;

    // TODO Send email confirming data has been saved. 

    await teamHandler(content, responseKey);

    await set(ref(database, "responses/" + responseKey), content);

    res.status(200).send("Updated database");

    
    const htmlS = `
<html>
    <style>
    html {
    font-family: Arial, Helvetica, sans-serif;
    min-height: 250px;
    height: 100vh;
}

header, footer {
    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    font-size: larger;
    text-align: center;
    background: rgb(255, 163, 237);
    padding: 1rem;
}

footer {
    text-align: start;
}

body {
    margin: 8px;
    height: 100%;
    display: flex;
    flex-direction: column;
}

main {
    flex: auto;
}

p {
    text-indent: 2rem;
}

address {
    display: flex;
    flex-direction: row;

    & * {
        flex: auto;
    }
}

a:any-link {
    font-size: medium;
    font-style: normal;
}
    </style>
    <head>
        <title>Page</title>
    </head>
    <body>
        <header>
            
            Code Jams
        </header>
        <main>
            <p>
                We've received your application! We will begin accepting applications shortly.
            </p>
        </main>
        <footer>
            <address >
                <a href=https://discord.gg/P5PsDR6G7W>SF Hacks Discord</a>
                <a href=https://www.instagram.com/sf.hacks/?hl=en>Instagram</a>
                <a href=https://solo.to/sfhacks>More socials on Solo</a>
            </address>
        </footer>
    </body>


</html>
    `
    await sendEmailHtml(userEmail, "First name", "We've received your application!", htmlS)

    
  } catch (err) {
    console.log(err);
    res.status(500).send("error storing data");
  }

    


})

app.post('/rawJSONView', async (req,res)=>{

    try{

    let content = req.body

    let responseKey = push(child(ref(database),"responses")).key

    await set(ref(database , "responses/" + responseKey),content)
    res.status(200).send("Updated database")
    

    }
    catch{
        console.log('error updating database')
    }
    
})

app.listen(3000, () => {
  console.log("The server is running on port 3000");
});
