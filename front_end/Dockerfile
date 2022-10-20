FROM node:lts-buster-slim

ARG WORKDIR="~/"

ENV HOME=${WORKDIR}
WORKDIR ${HOME}
# USER node
COPY ./src/package.json ./
RUN npm install