FROM node:20-alpine AS build
WORKDIR /ui
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /ui
RUN npm install -g serve
COPY --from=build /ui/dist ./dist
CMD ["serve", "-s", "dist", "-l", "3000"]
