import express, { response } from "express";
import { database } from "./config.js";
import { set, ref, push, update, child, get } from "firebase/database";
import { sendEmailHtml } from "./emailer.js";
import bodyParser from "body-parser";

let app = new express()
app.use(express.json({limit:'10mb'}));

const teamHandler = async (response, key) => {
  const teamChoice = response.data.fields[31].value[0];
  const userEmail = response.data.fields[7].value;
  const userName = response.data.fields[4].value;  // Assuming field[4] has the user's first name

  let emailData = {
    name: userName
  };

  // Create team and email team ID
  if (teamChoice === "56968301-3579-49bc-a217-238b0bff8dc7") { // Create team
    let teamSlots = [];
    teamSlots.push(key);
    let teamKey = push(child(ref(database), "teams")).key;
    await set(ref(database, "teams/" + teamKey), teamSlots);
    
    // Add team-specific data to emailData
    emailData.teamCode = teamKey;

    // Send email with team ID using Handlebars template
    await sendEmailHtml(userEmail, "Your application team code", "teamTemplate", emailData);
    
    console.log(`Team creation email sent to ${userEmail} with team code: ${teamKey}`);
  }

  // Join team with team ID
  else if (teamChoice === "5ed29545-983a-4bf7-a9e9-6b0a4f992111") {
    console.log("User wants to join team");
    const teamID = response.data.fields[30].value;
    const teamRef = ref(database, "teams/" + teamID);
    
    try {
      const teamDoc = await get(teamRef);
      if (teamDoc.exists()) {
        let teamSlots = teamDoc.val() || [];
        teamSlots.push(key);
        await set(teamRef, teamSlots);

        // Add team ID to emailData
        emailData.teamCode = teamID;

        // Send email confirming team join
        await sendEmailHtml(userEmail, "You've joined a team", "teamJoinTemplate", emailData);
        
        console.log(`Team join email sent to ${userEmail} confirming team ID: ${teamID}`);
      } else {
        console.log("Team doesn't exist");

        // Send email stating that the team doesn't exist
        await sendEmailHtml(userEmail, "The team you tried joining does not exist", "teamNotExistTemplate", emailData);

        console.log(`Team not found email sent to ${userEmail}`);
      }
    } catch (err) {
      console.log("Error fetching or updating team:", err);
      // Optionally, send an email with error information.
    }
  }
};

app.post("/tallyHooker", async (req, res) => {
  console.log("Trying to update database...");

  try {
    let content = req.body;
    content["accepted"] = true;
    content["isTeam"] = true;

    console.log("Content received:", content);

    let responseKey = push(child(ref(database), "responses")).key;
    let userEmail = content.data.fields[7].value;
    let userName = content.data.fields[4].value; // Assuming the user's name is in field[4]

    // Create email data object for Handlebars
    let emailData = {
      name: userName,
    };

    // Send general confirmation email using Handlebars template
    await sendEmailHtml(userEmail, "We've received your application!", "generalConfirmation", emailData);

    // Handle team logic (create, join, or neither)
    await teamHandler(content, responseKey);

    // Store response in the database
    await set(ref(database, "responses/" + responseKey), content);

    res.status(200).send("Database updated and emails sent.");
    
  } catch (err) {
    console.log("Error:", err);
    res.status(500).send("Error storing data or sending emails.");
  }
});

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
