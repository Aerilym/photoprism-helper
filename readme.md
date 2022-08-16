# PhotoPrism Helper

[![Build](https://github.com/Aerilym/photoprism-helper/actions/workflows/build.yml/badge.svg)](https://github.com/Aerilym/photoprism-helper/actions/workflows/build.yml)
[![CodeQL](https://github.com/Aerilym/photoprism-helper/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/Aerilym/photoprism-helper/actions/workflows/codeql-analysis.yml)
[![Publish Docker image](https://github.com/Aerilym/photoprism-helper/actions/workflows/docker-image.yml/badge.svg)](https://github.com/Aerilym/photoprism-helper/actions/workflows/docker-image.yml)
[![CodeFactor](https://www.codefactor.io/repository/github/aerilym/photoprism-helper/badge)](https://www.codefactor.io/repository/github/aerilym/photoprism-helper)
[![Known Vulnerabilities](https://snyk.io/test/github/aerilym/photoprism-helper/badge.svg)](https://snyk.io/test/github/aerilym/photoprism-helper)

PhotoPrism Helper is an unofficial companion tool created for use alongside [PhotoPrism](https://www.github.com/photoprism/photoprism). This project isn't associated with the PhotoPrism project, it's just a companion tool created to extend the functionality of PhotoPrism.

## Feature Overview

- Middleware API
- Web Interface
- Automation of PhotoPrism features

The current main features are API endpoints for importing and indexing content, as well as setting up cron tasks to enable automated importing and indexing.

## Getting Started

The application is designed to be used in a docker container or hosted on any local machine. After cloning the repository you can set up, build, and run the project by doing the following:

Start by installing all the dependencies:

```bash
npm install
```

[Build the project](#building-a-local-install):

```bash
npm run build
```

or

[Build the docker image](#docker):

```bash
docker build -t aerilym/photoprism-helper .
```

### Environment Variables

A list of possible environment variables is available: [.env.template](.env.template)

- `PHOTOPRISM_SITE_URL` - The URL of your PhotoPrism instance. (default: `http://192.168.1.113:2342/`)
- `PHOTOPRISM_USERNAME` - The PhotoPrism username you want the helper to use for access.
- `PHOTOPRISM_PASSWORD` - The PhotoPrism password associated with the username.
- `APIKEY` - The API key you'll use to query the helper API.
- `ISDOCKER` - Tells the helper instance if it is running in a Docker container. (This is a temporary fix and is planned to be removed)
- `TIMEZONE` - The Time zone of your instance. (default: `Melbourne/Australia`)
- `IMPORT_TIMEOUT` - The number of milliseconds the import function should wait for a success message before timing out. (default `300000`)
- `AUTO_IMPORT` - Enable/Disable the auto-import feature. (default: `false`)
- `AUTO_IMPORT_CRON` - The [cron expression](https://www.npmjs.com/package/node-cron) for when to run auto-import. (default: `0 0 5 * * * *`)
- `INDEX_AFTER_AUTO_IMPORT` - Enable/Disable the index after auto-importing feature. (default: `false`)

### Building a Local Install

Create a `.env` file, based on the `.env.template` file and fill it with your options.

At a minimum, the `USER` AND `PASS` environment variables need to be set, but `BASEURL` will be required if your PhotoPrism instance isn't available on `localhost:2342`. [Read more about environment variables](#Environment-Variables).

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

The container can be created using the [Dockerfile](Dockerfile) available, or by using the container available as a [GitHub Package](https://github.com/Aerilym?tab=packages&repo_name=photoprism-helper) or [DockerHub](https://hub.docker.com/repository/docker/aerilym/photoprism-helper/).

The container can be easily built from the source code by running:

```bash
npm run build:docker
```

## API Documentation

### Authentication

All requests must contain an authorization header with a set API key as such:

```bash
Authorization: "Bearer <APIKEY>"
```

### Endpoints

#### Import

POST /import

#### Index

POST /index

#### Stats

GET /stats
