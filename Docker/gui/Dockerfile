FROM node:22-alpine AS builder
RUN mkdir -p /home/node/pgst && chown -R node:node /home/node/pgst
WORKDIR /home/node/pgst
COPY --chown=node:node ../../ .
RUN npm i
RUN npm run build -w packages/gui

FROM node:22-alpine
WORKDIR /home/node/pgst
COPY --from=builder /home/node/pgst .
EXPOSE 3000
CMD ["npm", "run", "start", "-w", "packages/gui"]