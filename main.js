import { configDotenv } from "dotenv";
import moment from "moment-timezone";
import axios from "axios";
import { readFileSync } from "fs";

// We import the .env file
configDotenv();

// Load the story map
const storyMap = JSON.parse(readFileSync("./storyMap.json", "utf-8"));

// Convert storyMap to a lookup object for easier access
const storyMapLookup = storyMap.reduce((acc, { jira, wakatime }) => {
  acc[wakatime] = jira;
  return acc;
}, {});

// Function to load your wakatime stats for today
async function getTodayStats(date = null) {
  const url = "https://wakatime.com/api/v1/users/current/summaries";
  const headers = {
    Authorization: `Basic ${Buffer.from(process.env.WAKATIME_API_KEY).toString("base64")}`,
  };

  const targetDate = date ? moment(date, "DD/MM/YYYY") : moment();
  const params = {
    start: targetDate.startOf("day").format("YYYY-MM-DDTHH:mm:ss"),
    end: targetDate.endOf("day").format("YYYY-MM-DDTHH:mm:ss"),
  };

  try {
    const response = await axios.get(url, { headers, params });
    const projects = response.data.data[0].projects;

    return projects
      .filter((project) => Object.keys(storyMapLookup).includes(project.name))
      .map((project) => ({
        name: project.name,
        total_seconds: project.total_seconds,
      }));
  } catch (error) {
    console.error("Error fetching Wakatime stats:", error);
    return null;
  }
}

// Function to update the Jira story with the time spent
async function updateJiraStory(jiraUrl, jiraKey, project, date = null) {
  const url = `${jiraUrl}/rest/api/3/issue/${jiraKey}/worklog`;
  const auth = Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString("base64");
  const headers = {
    Authorization: `Basic ${auth}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const targetDate = date ? moment(date, "DD/MM/YYYY") : moment();
  const startDate = targetDate
    .startOf("day")
    .add(8, "hours")
    .add(30, "minutes")
    .format("YYYY-MM-DD[T]HH:mm:ss.SSS[+0200]");

  const data = {
    timeSpentSeconds: Math.round(project.total_seconds),
    started: startDate,
    comment: {
      type: "doc",
      version: 1,
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Time logged from Wakatime uploaded by WakaJira :D",
            },
          ],
        },
      ],
    },
  };

  try {
    const response = await axios.post(url, data, { headers });
    console.log(`Updated Jira story ${jiraKey} with ${project.total_seconds} seconds`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Main function to run the script
async function main() {
  const targetDate = process.argv[2];
  const todayStats = await getTodayStats(targetDate);

  if (!todayStats) {
    console.error(`No Wakatime stats found for ${targetDate || "today"}.`);
    return;
  }

  for (const project of todayStats) {
    const jiraKey = storyMapLookup[project.name];

    if (jiraKey) {
      await updateJiraStory(process.env.JIRA_BASE_URL, jiraKey, project, targetDate);
      console.log(`Project ${project.name} has been updated with ${project.total_seconds} seconds`);
    } else {
      console.log(`No Jira key found for project ${project.name}`);
    }
  }
}

main().then(() => console.log("All done!"));
