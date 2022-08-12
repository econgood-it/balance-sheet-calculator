FROM ubuntu:20.04
RUN rm /bin/sh && ln -s /bin/bash /bin/sh
RUN apt-get update && apt-get install -y openssh-client
RUN apt-get install -y python3
RUN apt-get install -y curl
RUN apt-get install libssl-dev
RUN apt-get install -y build-essential

RUN useradd -m user
RUN mkdir -p /home/user/.ssh
RUN chown -R user:user /home/user/.ssh
RUN echo "Host *.hostsharing.net\n\tStrictHostKeyChecking no\n" >> /home/user/.ssh/config
USER user

ENV NVM_DIR /home/user/nvm
ENV NODE_VERSION 18.7.0
RUN mkdir -p $NVM_DIR

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="${NVM_DIR}/versions/node/v${NODE_VERSION}/bin/:${PATH}"


ADD . /balance-sheet-calculator
WORKDIR /balance-sheet-calculator

CMD ["/bin/bash", "-c", "python3 deploy_to_server.py test"]
