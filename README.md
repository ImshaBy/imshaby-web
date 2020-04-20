![PROD env (imsha.by)](https://github.com/ImshaBy/imshaby-web/workflows/PROD%20env%20(imsha.by)/badge.svg)
![BETA env (beta.imsha.by)](https://github.com/ImshaBy/imshaby-web/workflows/BETA%20env%20(beta.imsha.by)/badge.svg)
![QA env (qa.imsha.by)](https://github.com/ImshaBy/imshaby-web/workflows/QA%20env%20(qa.imsha.by)/badge.svg)


# Development env : how to run


## Prerequisites

Install following tools:

* Node, version 10.15.1 - [link to download](https://nodejs.org/en/download/releases/)
* NPM, version 6.9.2
* Java 1.8u151 - [link to download](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)
* Git


## Install

1. Move to folder *imshaby-web* (let say it's ROOT folder)
2. Run following command: `npm ci`

## Run [mock-server](http://wiremock.org/docs/running-standalone/)

1. Navigate to ROOT/mock
2. Run `java -jar wiremock-standalone-2.12.0.jar --port 3000`

Result: [screen](https://www.screencast.com/t/w5dZb3pXPm4n)

*please note, that port 3000 should be available, in other scenario please run [wiremock](http://wiremock.org/docs/running-standalone/) with --port option*

## Development server
Run `npm run start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

Development server is working with mock-server.

## Build

1. Replace ```src/enviroments/enveroment.ts``` with following files:
* production environment: 
```src/enviroments/enveroment.prod.ts```
* qa environment: 
```src/enviroments/enveroment.qa.ts```
* beta environment: 
```src/enviroments/enveroment.beta.ts```


2. Run `npm run deploy` to build the project. The build artifacts will be stored in the `dist/` directory.


# CI/CD

__*Currently all build on qa, beta & prod envs are installed automatically based on `Triggers` (see details below)*__

## Prerequesites
Run appropriate server on the hosting (app.mycloud.by)

## Triggers

    _hook_ | _branch_  | _env_

    push | develop | qa.imsha.by
    push | master  | beta.imsha.by
    tag  | v.*     | imsha.by