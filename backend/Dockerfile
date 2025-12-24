FROM node:20-alpine
WORKDIR /app
# Copy file quản lý thư viện trước để tận dụng cache của Docker
COPY package*.json ./
RUN npm install
# Copy toàn bộ code backend
COPY . .
EXPOSE 8080
CMD ["npm", "run", "dev"]