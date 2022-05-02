FROM node:lts-alpine
ENV NODE_ENV=production
ENV USER_NAME="zcarpenter"
ENV PSWD="Delete"
ENV HOST="18.188.252.52"
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
EXPOSE 3001
RUN chown -R node /usr/src/app
USER node
CMD ["node", "server/index.js"]
