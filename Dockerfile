FROM node:12 as CLI
WORKDIR /app
COPY ./cli .
RUN yarn install
RUN yarn build-prod

FROM maven:3.6.1-jdk-11
WORKDIR /app
COPY ./server .
RUN mkdir -p ./src/main/resources/static/spa
COPY --from=CLI /app/dist ./src/main/resources/static/spa
RUN mvn -q clean install
ENTRYPOINT java -jar target/ynab-0.0.1.jar
