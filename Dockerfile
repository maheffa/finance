FROM node:12 as CLI
ARG cli_path=finance_cli
WORKDIR /app
COPY $cli_path .
RUN yarn install
CMD ['yarn', 'build-prod']
