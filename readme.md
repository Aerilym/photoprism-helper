# PhotoPrism Helper

PhotoPrism Helper is an unofficial companion tool created for use alongside [PhotoPrism](https://www.github.com/photoprism/photoprism).

## Feature Overview

- Middleware API
- Web Interface
- Automation of PhotoPrism features

The current main features are API endpoints for importing and indexing content, as well as setting up cron tasks to enable automated importing and indexing.

## Getting Started

The application is designed to be used in a docker container or hosted on any local machine.

### Building a Local Install

After cloning the repository you can set up, build, and run the project by doing the following:

Start by installing all the dependencies:

```bash
npm install
```

Create a `.env` file, based on the `.env.template` file and fill it with your options.

Run the following command to build the application from the source files:

```bash
npm run build
```

This will build the application and output the files to `build/`

Once the application is built, run the following command to start it:

```bash
npm run start:prd
```

The application will now run and be available at the address and port you specified in `.env`

If you're familiar with Node and TypeScript feel free to isolate the build folder to minimise the installation.

### Docker

The container can be created using the Dockerfile available or by using the Docker Image at LINKHERE.

## API Documentation

### Authentication

All requests must contain an authorization header with a set API key as such:

```JSON
Authorization: Bearer APIKEY
```

replacing APIKEY with your set API key.

### Endpoints

#### Import

POST /import

#### Index

POST /index

#### Stats

GET /stats
