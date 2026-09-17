FROM node:22-alpine3.21 AS base
WORKDIR /app

# copy all needed package
COPY package*.json ./

#install package
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev" , "--", "--host", "0.0.0.0"]