FROM node:22.13.0

WORKDIR /app

# Copy only package files to install dependencies first (cache)
COPY package.json package-lock.json* ./

RUN npm install

# Copy the rest of your app source
COPY . .

# Build your app during image build (e.g., transpile TS, bundle React)
RUN npm run build

# Expose the port your app listens on
EXPOSE 3000

# Run the built app with 'npm start'
CMD ["npm", "start"]
