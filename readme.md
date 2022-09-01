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

| Variable                | Default                             | Description                                                                                         |
| ----------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------- |
| PHOTOPRISM_SITE_URL     | <code>http://localhost:2342/</code> | The URL of your PhotoPrism instance.                                                                |
| HOSTPORT                | <code>2343</code>                   | The port the helper is hosted on.                                                                   |
| PHOTOPRISM_USERNAME     | <code>admin</code>                  | The PhotoPrism username you want the helper to use for access.                                      |
| PHOTOPRISM_PASSWORD     | <code></code>                       | The PhotoPrism password associated with the username.                                               |
| APIKEY                  | <code>testkey</code>                | The API key you'll use to query the helper API.                                                     |
| TIMEZONE                | <code>Melbourne/Australia</code>    | The timezone of your instance.                                                                      |
| IMPORT_TIMEOUT          | <code>300000</code>                 | The number of milliseconds the import function should wait for a success message before timing out. |
| MOVE_ON_IMPORT          | <code>false</code>                  | Enable/Disable moving files on import.                                                              |
| AUTO_IMPORT             | <code>false</code>                  | Enable/Disable the auto-import feature.                                                             |
| AUTO_IMPORT_CRON        | <code>0 0 4 \* \* \* \*</code>      | The [cron expression](https://www.npmjs.com/package/node-cron) for when to run auto-import.         |
| INDEX_AFTER_AUTO_IMPORT | <code>false</code>                  | Enable/Disable the index after auto-importing feature.                                              |
| INDEX_TIMEOUT           | <code>300000</code>                 | The number of milliseconds the index function should wait for a success message before timing out.  |
| INDEX_RESCAN            | <code>false</code>                  | Enable/Disable rescanining when indexing (From PhotoPrism settings).                                |
| INDEX_SKIP_ARCHIVED     | <code>false</code>                  | Enable/Disable skipping archive (From PhotoPrism settings).                                         |
| AUTO_INDEX              | <code>false</code>                  | Enable/Disable the auto-index feature.                                                              |
| AUTO_INDEX_CRON         | <code>0 0 6 \* \* \* \*</code>      | The [cron expression](https://www.npmjs.com/package/node-cron) for when to run auto-index.          |
| LOGFILE_PATH            | <code>logs/local.log</code>         | The logging file path.                                                                              |
| LOGLEVEL_CONSOLE        | <code>info</code>                   | The log level to apply to the console log.                                                          |
| LOGLEVEL_FILE           | <code>error</code>                  | The log level to apply to the file log.                                                             |
| SEND_ERRORS             | <code>true</code>                   | Enable/Disable sending errors/exceptions to the dev.                                                |
| ERROR_LOG_URL           | <code></code>                       | The URL to send errors to. (Don't change unless you're running your own fork of the helper)         |
| ERROR_LOG_KEY           | <code></code>                       | The API key sent with error logs to the external server.                                            |
| ERROR_LOG_ANONYMISE     | <code>false</code>                  | Enable/Disable anonymising externally sent error logs.                                              |
| ERROR_LOG_OPTIONS       | <code>true</code>                   | Enable/Disable sending your configuration options with externally sent errors.                      |
| EXTERNAL_LOG            | <code>false</code>                  | Enable/Disable sending logs to an external log server.                                              |
| EXTERNAL_LOG_DEPTH      | <code>info</code>                   | The log level to apply to the external log.                                                         |
| EXTERNAL_LOG_URL        | <code></code>                       | The URL of the external log server.                                                                 |
| EXTERNAL_LOG_KEY        | <code></code>                       | The API key sent with logs sent to the external log server.                                         |
| EXTERNAL_LOG_ANONYMISE  | <code>false</code>                  | Enable/Disable anonymising externally sent logs.                                                    |
| EXTERNAL_LOG_OPTIONS    | <code>true</code>                   | Enable/Disable sending your configuration options with externally sent logs.                        |

If enabled, the configuration options sent with externally sent errors and logs are:

TBD

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
