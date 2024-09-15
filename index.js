import express, { response } from "express";
import { database } from "./config.js";
import { set, ref, push, update, child, get } from "firebase/database";
import { sendEmail } from "./emailer.js";
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
