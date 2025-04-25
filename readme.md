# WakaJira

A simple Node.js application that syncs your WakaTime stats with Jira issues.

## Features

- Automatically tracks time spent on projects in WakaTime
- Maps WakaTime projects to Jira issues
- Uploads time logs to Jira worklogs with custom comments
- Configurable through environment variables and story mapping

## Setup

1. Clone the repository:
```sh
git clone https://github.com/AlexDeveloperUwU/wakajira.git
cd wakajira
```

2. Install dependencies:
```sh
npm install
```

3. Copy .env.example to .env and fill in your credentials:
```sh
WAKATIME_API_KEY=your_wakatime_api_key
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your_email
JIRA_API_TOKEN=your_jira_api_token
```

4. Configure your project mapping in storyMap.json:
```json
[
  {
    "jira": "PROJECT-123",
    "wakatime": "project_name"
  }
]
```

## Usage

Run the script to sync today's time logs:

```sh
node main.js
```

The script will:
- Fetch today's time stats from WakaTime
- Map the time to corresponding Jira issues
- Create worklogs in Jira with the tracked time

> ⚠️ **Important:** This script is designed to be run once daily via a cronjob/scheduled task, preferably at the end of your workday (e.g., 11:45 PM) to ensure all your daily time logs are captured and synced properly.

## Requirements

- Node.js
- WakaTime account and API key
- Jira account with API token access
- Active projects in WakaTime

## License

This project is licensed under the GNU Affero General Public License v3.0 - see the LICENSE file for details.

## Contributing

Feel free to open issues and submit pull requests to improve the project.