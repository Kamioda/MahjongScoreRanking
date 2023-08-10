FROM ubuntu:22.04
ARG UserName="mahjongranking"
ARG InstallRoot="/home/"${UserName}"/"
ARG PageDir=${InstallRoot}"wwwroot/"
EXPOSE 8080

RUN apt-get update && \
    apt-get install -y curl && \
    useradd -m mahjongranking && \
    chmod -R 774 ${InstallRoot}

USER ${UserName}
SHELL [ "/bin/bash" ]
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash && \
    source ~/.profile && \
    nvm install --lts

COPY ["APIServer", ${InstallRoot}]
COPY ["Page/build/", ${PageDir}]
WORKDIR ${InstallRoot}
CMD ["npm start"]
