FROM node:20-slim AS build
WORKDIR /app

# Accept build args
ARG VITE_API_BASE
ARG BUILD_TIME
ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_BUILD_TIME=$BUILD_TIME

COPY package.json /app/
RUN npm install
COPY . /app
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
