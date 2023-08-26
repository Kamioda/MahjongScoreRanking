FROM mariadb:latest
ARG UserName="mahjongranking"
ARG InstallRoot="/home/"${UserName}"/"
ARG PageDir=${InstallRoot}"wwwroot/"
EXPOSE 8080

COPY ["init.sql", "/root/"]

RUN apt-get update && \
    apt-get install -y curl && \
    useradd -m mahjongranking && \
    chmod -R 774 ${InstallRoot} && \
    mysql -u root -p${MARIADB_ROOT_PASSWORD} < /root/init.sql

USER ${UserName}
SHELL [ "/bin/bash" ]
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash && \
    source ~/.profile && \
    nvm install --lts

COPY ["APIServer", ${InstallRoot}]
COPY ["Page/build/", ${PageDir}]
WORKDIR ${InstallRoot}
CMD ["npm start"]
