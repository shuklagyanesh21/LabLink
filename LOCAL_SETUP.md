# Running SharmaG_omics Lab Management System Locally

## Prerequisites

Make sure you have the following installed on your Linux machine:

1. **Node.js** (version 18 or higher)
   ```bash
   # Check if Node.js is installed
   node --version
   npm --version
   
   # If not installed, install using your package manager:
   # Ubuntu/Debian:
   sudo apt update
   sudo apt install nodejs npm
   
   # Or install the latest LTS version using NodeSource:
   curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

## Installation Steps

1. **Download and Extract**
   - Download the project as a zip file from Replit
   - Extract it to your desired location:
   ```bash
   unzip project.zip
   cd your-project-folder
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Application**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - Open your web browser and go to: `http://localhost:5000`
   - The application will be running with all features available

## Important Notes

- **Data Storage**: The app uses in-memory storage with JSON file persistence
- **No Database Setup**: No PostgreSQL setup required - the app will create `lab-data.json` for data persistence
- **Admin Mode**: Use the toggle switch in the top navigation to enable/disable admin controls
- **Timezone**: All times are displayed in IST (Indian Standard Time)

## Available Features

- Dashboard with upcoming meetings and presentation rotation
- Calendar view (Week/Month toggle)
- Member management (in admin mode)
- Meeting scheduling with conflict detection
- Presentation rotation system
- Announcements with expiration dates
- Data export/import functionality
- Audit logging

## Troubleshooting

- **Port 5000 in use**: If port 5000 is occupied, the app will automatically try other ports
- **Permission issues**: Make sure the application has write permissions to create `lab-data.json`
- **Node.js version**: Ensure you're using Node.js version 18 or higher

## Development Mode

The app runs in development mode with hot reloading enabled. Any changes you make to the code will automatically refresh the browser.