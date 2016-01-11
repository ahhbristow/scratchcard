FROM node:5.4.0-onbuild
EXPOSE 4072
ENV MONGOLAB_URI mongodb://mongo/sessions
RUN npm install --unsafe-perm
