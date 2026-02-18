FROM node:20-alpine AS build
WORKDIR /ui
COPY siem-ui-build/package*.json ./
RUN npm install --legacy-peer-deps
COPY siem-ui-build .
RUN npm run build

FROM node:20-alpine
WORKDIR /ui
COPY --from=build /ui/.next ./.next
COPY --from=build /ui/node_modules ./node_modules
COPY --from=build /ui/package*.json ./
EXPOSE 3000
CMD ["npm", "start"]
