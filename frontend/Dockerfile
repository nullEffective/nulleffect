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
EXPOSE 8080
RUN sed -i 's/listen       80;/listen       8080;/' /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]
