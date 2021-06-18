FROM node:14-buster as build
WORKDIR /usr/src/script
COPY . .
RUN npm ci --only=production

FROM node:14-buster-slim
COPY --from=build /usr/src/script /usr/src/script
WORKDIR /usr/src/script

# Make ports available to the world outside this container
EXPOSE 7000

ENV LOG_LEVEL=info
ENV NAME docker
ENV HOST 127.0.0.1
ENV PORT 7000

CMD node index.js ${NAME} ${HOST} ${PORT}
