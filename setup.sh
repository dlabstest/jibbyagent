#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Setting up Jibby Agent Hub...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js is not installed. Please install Node.js v16 or later and try again.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo -e "${YELLOW}Node.js version 16 or later is required. Please upgrade your Node.js version.${NC}"
    exit 1
fi

# Install server dependencies
echo -e "\n${GREEN}Installing server dependencies...${NC}"
cd server
npm install

# Set up environment variables
if [ ! -f ".env" ]; then
    echo -e "\n${GREEN}Creating .env file for server...${NC}"
    cp ../.env.example .env
    echo -e "${YELLOW}Please update the .env file with your configuration.${NC}"
else
    echo -e "\n${GREEN}Server .env file already exists.${NC}"
fi

# Set up database
echo -e "\n${GREEN}Setting up database...${NC}"
npx prisma migrate dev --name init

# Install client dependencies
echo -e "\n${GREEN}Installing client dependencies...${NC}"
cd ../client
npm install

# Set up client environment
if [ ! -f ".env" ]; then
    echo -e "\n${GREEN}Creating .env file for client...${NC}"
    echo "REACT_APP_API_URL=http://localhost:3001" > .env
else
    echo -e "\n${GREEN}Client .env file already exists.${NC}"
fi

# Build the client
echo -e "\n${GREEN}Building the client...${NC}"
npm run build

cd ..

echo -e "\n${GREEN}✅ Setup complete!${NC}"
echo -e "\nTo start the application, run the following commands:"
echo -e "1. Start the server: ${YELLOW}cd server && npm run dev${NC}"
echo -e "2. In a new terminal, start the client: ${YELLOW}cd client && npm start${NC}"
echo -e "\nThen open your browser to: ${YELLOW}http://localhost:3000${NC}"
